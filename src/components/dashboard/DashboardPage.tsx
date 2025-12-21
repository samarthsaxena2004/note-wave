"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from "next-themes";
import { 
  FileText, ArrowUp, Loader2, Bot, User, Mic, StopCircle 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

// Modular Components
import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";

export default function DashboardPage() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // --- DATA STATE ---
  const [documents, setDocuments] = useState<any[]>([]); 
  const [activeDoc, setActiveDoc] = useState<any>(null);
  
  // --- CHAT STATE ---
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // --- VOICE STATE ---
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // --- PODCAST STATE ---
  const [podcastScript, setPodcastScript] = useState<any[]>([]);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState<number | null>(null);
  const scriptViewportRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopSignalRef = useRef(false);

  // --- UI STATE ---
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);

  // --- INITIALIZATION & PERSISTENCE ---
  useEffect(() => {
    setMounted(true);
    const savedDocs = localStorage.getItem("notewave_docs");
    if (savedDocs) {
      try {
        const parsed = JSON.parse(savedDocs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDocuments(parsed);
          setActiveDoc(parsed[0]); 
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  const saveDocsToStorage = (newDocs: any[]) => {
    localStorage.setItem("notewave_docs", JSON.stringify(newDocs));
  };

  // --- LOGIC: VOICE INPUT ---
  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser does not support voice input.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

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
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
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
      const updatedDocs = [...documents, newDoc];
      setDocuments(updatedDocs);
      saveDocsToStorage(updatedDocs);
      handleSwitchFile(newDoc);
      setIsUploadOpen(false);
    } catch (err: any) { alert("Error: " + err.message); } finally { setIsUploading(false); }
  }

  async function handleUploadForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    if (file && file.name) await processUpload(file);
  }

  // --- LOGIC: FILE OPS ---
  function handleSwitchFile(doc: any) {
    setActiveDoc(doc);
    setMessages([]); 
    setPodcastScript([]);
    setCurrentLineIndex(null);
    stopAudio();
    setShowLeftSidebar(false);
  }

  async function handleDeleteFile(e: React.MouseEvent, docId: number, filename: string) {
    e.stopPropagation();
    if (!confirm(`Delete ${filename}?`)) return;
    try {
      await fetch("/api/delete", { method: "POST", body: JSON.stringify({ filename }) });
      const newDocs = documents.filter(d => d.id !== docId);
      setDocuments(newDocs);
      saveDocsToStorage(newDocs);
      if (activeDoc?.id === docId) {
        if (newDocs.length > 0) handleSwitchFile(newDocs[0]);
        else window.location.reload(); 
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
          audio.play().catch(() => {});
        });
      } catch (err) { break; }
    }
    if (!stopSignalRef.current) {
      setIsPlaying(false);
      setCurrentLineIndex(null);
    }
  }

  function togglePlayback() {
    if (isPlaying) stopAudio();
    else {
      const startFrom = currentLineIndex === null || currentLineIndex >= podcastScript.length - 1 ? 0 : currentLineIndex;
      playScriptLoop(startFrom);
    }
  }

  if (!mounted) return null;

  return (
    <div className="h-screen flex bg-zinc-50 dark:bg-black overflow-hidden font-sans text-zinc-900 dark:text-zinc-100 relative">
      {(showLeftSidebar || showRightSidebar) && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" onClick={() => { setShowLeftSidebar(false); setShowRightSidebar(false); }} />
      )}

      {/* MODULAR SIDEBAR LEFT */}
      <SidebarLeft 
        documents={documents}
        activeDoc={activeDoc}
        isUploading={isUploading}
        isUploadOpen={isUploadOpen}
        setIsUploadOpen={setIsUploadOpen}
        handleUploadForm={handleUploadForm}
        handleSwitchFile={handleSwitchFile}
        handleDeleteFile={handleDeleteFile}
        setTheme={setTheme}
        theme={theme}
        showLeftSidebar={showLeftSidebar}
      />

      {/* CENTER CHAT AREA */}
      <div className="flex-1 flex flex-col relative bg-zinc-50/50 dark:bg-black z-10 w-full">
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200/50 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm sticky top-0 z-20">
          <Button variant="ghost" size="icon" className="md:hidden text-zinc-500" onClick={() => setShowLeftSidebar(true)}>
            <div className="h-5 w-5 grid gap-1">
              <span className="h-0.5 w-full bg-current rounded-full" />
              <span className="h-0.5 w-full bg-current rounded-full" />
              <span className="h-0.5 w-full bg-current rounded-full" />
            </div>
          </Button>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hidden sm:inline">Current:</span>
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span className="max-w-[100px] truncate">{activeDoc?.name}</span>
            </span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden text-zinc-500" onClick={() => setShowRightSidebar(true)}>
            <Mic className="w-5 h-5" />
          </Button>
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
              className="h-14 pl-12 pr-12 rounded-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-base focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-700"
            />
            <Button 
              type="button" 
              onClick={toggleVoiceInput}
              variant="ghost" 
              size="icon" 
              className={`absolute left-2 top-2 h-10 w-10 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 ${isListening ? "text-red-500 animate-pulse" : "text-zinc-400"}`}
            >
              {isListening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="absolute right-2 top-2 h-10 w-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50">
              <ArrowUp className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>

      {/* MODULAR SIDEBAR RIGHT */}
      <SidebarRight 
        podcastScript={podcastScript}
        isGeneratingScript={isGeneratingScript}
        isPlaying={isPlaying}
        currentLineIndex={currentLineIndex}
        handleGenerateScript={handleGenerateScript}
        togglePlayback={togglePlayback}
        showRightSidebar={showRightSidebar}
        scriptViewportRef={scriptViewportRef}
      />
    </div>
  );
}