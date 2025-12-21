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

import SidebarLeft from "./SidebarLeft";
import SidebarRight from "./SidebarRight";
import CommandPalette from "./CommandPalette";
import { COMMANDS, Command } from "@/lib/commands";

export default function DashboardPage() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [documents, setDocuments] = useState<any[]>([]); 
  const [activeDoc, setActiveDoc] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [podcastScript, setPodcastScript] = useState<any[]>([]);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState<number | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<Command[]>([]);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  const recognitionRef = useRef<any>(null);
  const scriptViewportRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopSignalRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Smooth Auto-Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    if (val.startsWith("/")) {
      const query = val.slice(1).toLowerCase();
      const filtered = COMMANDS.filter(c => c.id.includes(query));
      setFilteredCommands(filtered);
      setSelectedCommandIndex(0);
    } else {
      setFilteredCommands([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredCommands.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedCommandIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedCommandIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        executeCommand(filteredCommands[selectedCommandIndex]);
      } else if (e.key === "Escape") {
        setFilteredCommands([]);
      }
    }
  };

  const executeCommand = (cmd: Command) => {
    setFilteredCommands([]);
    switch (cmd.id) {
      case "podcast":
        setInput("");
        setShowRightSidebar(true);
        handleGenerateScript();
        break;
      case "quiz":
        setInput("Generate a quiz for this document...");
        setTimeout(() => document.getElementById("chat-form")?.dispatchEvent(new Event('submit', {cancelable: true, bubbles: true})), 10);
        break;
      case "summary":
        setInput("Provide a detailed summary of this document.");
        setTimeout(() => document.getElementById("chat-form")?.dispatchEvent(new Event('submit', {cancelable: true, bubbles: true})), 10);
        break;
      default:
        setInput(`${cmd.label} `);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !activeDoc) return;
    
    if (input.startsWith("/") && !filteredCommands.length) {
      const cmdId = input.slice(1).split(" ")[0];
      const cmd = COMMANDS.find(c => c.id === cmdId);
      if (cmd) { executeCommand(cmd); return; }
    }

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
    if (!stopSignalRef.current) { setIsPlaying(false); setCurrentLineIndex(null); }
  }

  function togglePlayback() {
    if (isPlaying) stopAudio();
    else {
      const startFrom = currentLineIndex === null || currentLineIndex >= podcastScript.length - 1 ? 0 : currentLineIndex;
      playScriptLoop(startFrom);
    }
  }

  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => setInput(prev => prev + event.results[0][0].transcript);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  if (!mounted) return null;

  return (
    <div className="h-screen flex bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      <SidebarLeft 
        documents={documents} activeDoc={activeDoc} isUploading={isUploading} isUploadOpen={isUploadOpen}
        setIsUploadOpen={setIsUploadOpen} handleUploadForm={handleUploadForm} handleSwitchFile={handleSwitchFile}
        handleDeleteFile={handleDeleteFile} setTheme={setTheme} theme={theme} showLeftSidebar={showLeftSidebar}
      />

      {/* --- CENTER AREA: THE FIX --- */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-black relative overflow-hidden">
        
        {/* HEADER: Flex-none keeps it locked at top */}
        <header className="h-16 flex-none flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800 z-30">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowLeftSidebar(true)}>
            <FileText className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Current Source</span>
            <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" />
            <span className="text-xs font-semibold truncate max-w-[150px]">{activeDoc?.name}</span>
          </div>

          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setShowRightSidebar(true)}>
            <StopCircle className="w-5 h-5" />
          </Button>
        </header>

        {/* MESSAGES: flex-1 takes remaining space and handles scroll */}
        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full w-full custom-scrollbar">
            <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-6 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className={`h-9 w-9 mt-1 flex-none ${m.role === 'user' ? 'border-zinc-200' : 'bg-zinc-900'}`}>
                    <AvatarFallback className="text-xs">
                      {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5 text-white" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex-1 min-w-0 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {m.role === 'user' ? (
                      <div className="inline-block bg-zinc-100 dark:bg-zinc-900 px-5 py-3 rounded-2xl rounded-tr-sm text-sm font-medium">
                        {m.content}
                      </div>
                    ) : (
                      <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 items-center opacity-50">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-medium">Analyzing document...</span>
                </div>
              )}
              
              {/* Anchor for scroll */}
              <div ref={messagesEndRef} className="h-20" />
            </div>
          </ScrollArea>
        </div>

        {/* INPUT: flex-none sits at bottom */}
        <footer className="flex-none p-6 bg-gradient-to-t from-white dark:from-black via-white/90 dark:via-black/90 to-transparent">
          <div className="max-w-2xl mx-auto relative pb-2">
            <CommandPalette commands={filteredCommands} selectedIndex={selectedCommandIndex} onSelect={executeCommand} />
            <form id="chat-form" onSubmit={handleSubmit} className="relative group">
              <Input 
                value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
                placeholder="Ask anything about the document..." 
                className="h-14 pl-12 pr-14 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl focus-visible:ring-zinc-500 transition-all"
              />
              <Mic className={`absolute left-4 top-4 w-5 h-5 cursor-pointer hover:text-zinc-900 ${isListening ? 'text-red-500 animate-pulse' : 'text-zinc-400'}`} onClick={toggleVoiceInput} />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black">
                <ArrowUp className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </footer>
      </div>

      <SidebarRight 
        podcastScript={podcastScript} isGeneratingScript={isGeneratingScript} isPlaying={isPlaying} 
        currentLineIndex={currentLineIndex} handleGenerateScript={handleGenerateScript} togglePlayback={togglePlayback}
        showRightSidebar={showRightSidebar} scriptViewportRef={scriptViewportRef}
      />
    </div>
  );
}