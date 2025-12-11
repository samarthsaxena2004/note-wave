"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from "next-themes";
import { 
  FileText, Plus, Trash2, Moon, Sun, 
  Play, Pause, RefreshCw, ArrowUp, Loader2, 
  Bot, User, Sparkles, Mic, Headphones, UploadCloud, Github, Twitter, Book
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const { setTheme, theme } = useTheme();
  
  // HYDRATION FIX: Wait until mounted to render theme icons
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Data State
  const [documents, setDocuments] = useState<any[]>([]); 
  const [activeDoc, setActiveDoc] = useState<any>(null);
  
  // Chat State
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Podcast State
  const [podcastScript, setPodcastScript] = useState<any[]>([]);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState<number | null>(null);
  const scriptViewportRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopSignalRef = useRef(false);

  // Upload State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false); 

  // --- LOGIC: CHAT ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !activeDoc) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, fileId: activeDoc.name }),
      });

      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantMessage = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        assistantMessage += chunkValue;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = assistantMessage;
          return updated;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // --- LOGIC: UPLOAD ---
  async function processUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);

    try {
      const res = await fetch("/api/ingest", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      const newDoc = { id: Date.now(), name: data.filename, date: "Just now" };
      setDocuments(prev => [...prev, newDoc]);
      handleSwitchFile(newDoc);
      setIsUploadOpen(false);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsUploading(false);
      setIsDragging(false);
    }
  }

  async function handleUploadForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.files || e.currentTarget.files.files.length === 0) return;
    await processUpload(e.currentTarget.files.files[0]);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        processUpload(file);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  }

  // --- LOGIC: FILE OPS ---
  function handleSwitchFile(doc: any) {
    setActiveDoc(doc);
    setMessages([]); 
    setPodcastScript([]);
    setCurrentLineIndex(null);
    stopAudio();
  }

  async function handleDeleteFile(e: React.MouseEvent, docId: number, filename: string) {
    e.stopPropagation();
    if (!confirm(`Delete ${filename}?`)) return;
    try {
      await fetch("/api/delete", { method: "POST", body: JSON.stringify({ filename }) });
      const newDocs = documents.filter(d => d.id !== docId);
      setDocuments(newDocs);
      if (activeDoc?.id === docId) {
        if (newDocs.length > 0) handleSwitchFile(newDocs[0]);
        else setActiveDoc(null);
      }
    } catch (err) { alert("Failed to delete."); }
  }

  // --- LOGIC: PODCAST ---
  async function handleGenerateScript() {
    stopAudio();
    setIsGeneratingScript(true);
    setPodcastScript([]); 
    try {
      const res = await fetch("/api/podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: activeDoc.name }),
      });
      const data = await res.json();
      if (data.script) setPodcastScript(data.script);
    } catch (err) { console.error(err); } finally { setIsGeneratingScript(false); }
  }

  function stopAudio() {
    stopSignalRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }

  async function playScriptLoop(startIndex: number) {
    setIsPlaying(true);
    stopSignalRef.current = false;
    for (let i = startIndex; i < podcastScript.length; i++) {
      if (stopSignalRef.current) break;
      setCurrentLineIndex(i); 
      const line = podcastScript[i];
      try {
        const res = await fetch("/api/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: line.text, speaker: line.speaker }),
        });
        if (!res.ok) throw new Error("Audio failed");
        if (stopSignalRef.current) break;
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audioRef.current = audio;
        await new Promise((resolve) => {
          audio.onended = resolve;
          audio.play().catch(e => console.log("Playback interrupted"));
        });
      } catch (err) { break; }
    }
    if (!stopSignalRef.current) {
      setIsPlaying(false);
      setCurrentLineIndex(null);
    }
  }

  function togglePlayback() {
    if (isPlaying) {
      stopAudio();
    } else {
      const startFrom = currentLineIndex === null || currentLineIndex >= podcastScript.length - 1 ? 0 : currentLineIndex;
      playScriptLoop(startFrom);
    }
  }

  useEffect(() => {
    if (currentLineIndex !== null && scriptViewportRef.current) {
      const activeElement = document.getElementById(`script-line-${currentLineIndex}`);
      if (activeElement) activeElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentLineIndex]);


  // ==========================================
  // VIEW 1: LANDING PAGE (Zero State)
  // ==========================================
  if (documents.length === 0) {
    return (
      <div className="h-screen flex flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 md:px-10 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-xs">N</div>
            <span className="font-semibold text-sm tracking-tight">NoteWave</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {/* HYDRATION FIX: Only show icon when mounted */}
            {mounted ? (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <span className="w-4 h-4" />}
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-200/50 dark:bg-zinc-800/20 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Chat with your documents.
              </h1>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
                Upload a PDF to generate podcasts, summaries, and ask questions using advanced AI.
              </p>
            </div>

            {/* Drag & Drop Zone */}
            <div 
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`
                group relative border-2 border-dashed rounded-3xl p-10 transition-all duration-300 cursor-pointer
                ${isDragging 
                  ? "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900 scale-[1.02]" 
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-white/50 dark:bg-black/50"
                }
              `}
            >
              <div className="flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full transition-colors ${isDragging ? "bg-zinc-200 dark:bg-zinc-800" : "bg-zinc-100 dark:bg-zinc-900"}`}>
                   {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <UploadCloud className="w-8 h-8 text-zinc-400" />}
                </div>
                <div className="space-y-1">
                  <p className="font-medium">
                    {isUploading ? "Processing PDF..." : "Drag and drop your PDF here"}
                  </p>
                  <p className="text-sm text-zinc-400">or click to browse</p>
                </div>
                
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) processUpload(e.target.files[0]);
                  }}
                  disabled={isUploading}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-10 border-t border-zinc-100 dark:border-zinc-800 relative z-10">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="group relative cursor-default">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 blur-lg transition duration-500" />
              <h2 className="text-2xl font-bold tracking-tighter relative z-10">NoteWave</h2>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://github.com" target="_blank" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                <Github className="w-4 h-4" /> GitHub
              </a>
              <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                <Twitter className="w-4 h-4" /> Twitter
              </a>
              <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                <Book className="w-4 h-4" /> Docs
              </a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: DASHBOARD (Active State)
  // ==========================================
  return (
    <div className="h-screen flex bg-zinc-50 dark:bg-black overflow-hidden font-sans text-zinc-900 dark:text-zinc-100">
      
      {/* 1. LEFT SIDEBAR */}
      <div className="w-[280px] border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-black z-20">
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-xs">N</div>
            <span className="font-semibold text-sm tracking-tight">NoteWave</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-8 w-8 text-zinc-400">
            {mounted ? (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <span className="w-4 h-4" />}
          </Button>
        </div>
        
        <div className="p-4">
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 h-10">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">New Source</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800">
              <DialogHeader><DialogTitle>Add Source</DialogTitle></DialogHeader>
              <form onSubmit={handleUploadForm} className="space-y-4 mt-4">
                <Input name="file" type="file" accept=".pdf" required className="dark:bg-zinc-950 dark:border-zinc-800" />
                <Button type="submit" disabled={isUploading} className="w-full dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                  {isUploading ? <Loader2 className="animate-spin mr-2" /> : "Upload PDF"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-0.5">
            <h3 className="px-2 mb-2 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Library</h3>
            {documents.map((doc) => (
              <div 
                key={doc.id}
                onClick={() => handleSwitchFile(doc)}
                className={`group flex items-center justify-between px-2 py-2 rounded-md cursor-pointer transition-all ${
                  activeDoc?.id === doc.id 
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-medium" 
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 flex-shrink-0 opacity-70" />
                  <span className="text-sm truncate">{doc.name}</span>
                </div>
                <Button
                  size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 h-6 w-6 text-zinc-400 hover:text-red-500 hover:bg-transparent"
                  onClick={(e) => handleDeleteFile(e, doc.id, doc.name)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 2. CENTER CHAT */}
      <div className="flex-1 flex flex-col relative bg-zinc-50/50 dark:bg-black z-10">
        <div className="h-16 flex items-center justify-center border-b border-zinc-200/50 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Current:</span>
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {activeDoc?.name}
            </span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto p-4 md:p-10 space-y-10">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 opacity-60">
                <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white">What do you want to know?</h3>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-6 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className={`h-8 w-8 mt-1 border ${m.role === 'user' ? 'border-zinc-200 dark:border-zinc-700' : 'border-transparent bg-transparent'}`}>
                  <AvatarFallback className={m.role === 'user' ? 'bg-zinc-100 dark:bg-zinc-800 text-xs' : 'bg-transparent'}>
                    {m.role === 'user' ? <User className="w-4 h-4 text-zinc-500" /> : <Bot className="w-5 h-5 text-zinc-900 dark:text-white" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 text-sm leading-7 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {m.role === 'user' ? (
                    <span className="inline-block bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-2 rounded-2xl rounded-tr-sm font-medium">
                      {m.content}
                    </span>
                  ) : (
                    <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none">
                       <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-6">
                <div className="w-8 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-zinc-400" /></div>
                <span className="text-sm text-zinc-400">Thinking...</span>
              </div>
            )}
            <div className="h-24" />
          </div>
        </ScrollArea>

        <div className="absolute bottom-6 left-0 right-0 px-4">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto relative shadow-2xl shadow-zinc-200/50 dark:shadow-none">
            <Input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Ask anything..." 
              className="h-14 pl-5 pr-12 rounded-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-700"
            />
            <Button 
              type="submit" 
              disabled={isLoading} 
              size="icon" 
              className="absolute right-2 top-2 h-10 w-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: STUDIO */}
      <div className="w-[360px] border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex flex-col z-20">
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800">
           <h2 className="text-sm font-semibold flex items-center gap-2">
             <Headphones className="w-4 h-4 text-zinc-500" /> Studio
           </h2>
           {podcastScript.length > 0 && (
             <Button variant="ghost" size="icon" onClick={handleGenerateScript} disabled={isGeneratingScript} className="h-8 w-8 text-zinc-400">
               <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingScript ? 'animate-spin' : ''}`} />
             </Button>
           )}
        </div>

        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
           <div className="flex flex-col items-center justify-center space-y-6">
              <div className="flex items-center gap-1 h-12">
                 {[...Array(16)].map((_, i) => (
                   <div 
                     key={i} 
                     className={`w-1 bg-zinc-900 dark:bg-white rounded-full transition-all duration-100 ${isPlaying ? 'animate-pulse' : 'h-1 opacity-20'}`}
                     style={{ 
                       height: isPlaying ? `${Math.max(10, Math.random() * 40)}px` : '4px',
                       animationDelay: `${i * 0.05}s` 
                     }} 
                   />
                 ))}
              </div>

              <div className="flex items-center gap-4">
                {podcastScript.length === 0 ? (
                   <Button onClick={handleGenerateScript} disabled={isGeneratingScript} className="rounded-full px-6 dark:bg-white dark:text-black">
                     {isGeneratingScript ? "Generating..." : "Generate Audio"}
                   </Button>
                ) : (
                   <Button 
                     onClick={togglePlayback} 
                     size="icon"
                     className="h-14 w-14 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg hover:scale-105 transition-transform"
                   >
                     {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                   </Button>
                )}
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-hidden relative bg-white dark:bg-black">
          <ScrollArea className="h-full" ref={scriptViewportRef}>
            <div className="p-6 space-y-8 pb-[40vh]"> 
              {podcastScript.length === 0 && !isGeneratingScript && (
                <div className="flex flex-col items-center justify-center h-40 text-zinc-400 text-sm opacity-50">
                  <Mic className="w-8 h-8 mb-2 stroke-1" />
                  <p>No audio generated yet</p>
                </div>
              )}
              
              {podcastScript.map((line, i) => {
                const isActive = i === currentLineIndex;
                return (
                  <div 
                    key={i} 
                    id={`script-line-${i}`}
                    className={`transition-all duration-500 ${isActive ? "opacity-100" : "opacity-30 blur-[0.5px] grayscale"}`}
                  >
                    <p className={`text-[10px] font-bold tracking-widest uppercase mb-2 ${isActive ? "text-zinc-900 dark:text-white" : "text-zinc-500"}`}>
                      {line.speaker}
                    </p>
                    <p className={`text-base font-medium leading-relaxed ${isActive ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-400"}`}>
                      {line.text}
                    </p>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white dark:from-black to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-black to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}