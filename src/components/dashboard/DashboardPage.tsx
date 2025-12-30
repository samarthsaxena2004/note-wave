// FILE: src/components/dashboard/DashboardPage.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from "next-themes";
import { 
  FileText, ArrowUp, Loader2, Bot, User, Mic, ChevronLeft, ChevronRight, Maximize2, Minimize2 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

import SidebarLeft from "./SidebarLeft";
import SidebarRight, { StudioType } from "./SidebarRight";
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
  
  const [activeStudio, setActiveStudio] = useState<StudioType>("none");
  const [podcastScript, setPodcastScript] = useState<any[]>([]);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState<number | null>(null);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });
  const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);

  const [debateTranscript, setDebateTranscript] = useState<any[]>([]);
  const [isDebating, setIsDebating] = useState(false);
  const [vaultAudit, setVaultAudit] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [leftSidebarWide, setLeftSidebarWide] = useState(false);
  const [rightSidebarWide, setRightSidebarWide] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<Command[]>([]);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  const scriptViewportRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    setMounted(true);
    const savedDocs = localStorage.getItem("notewave_docs");
    if (savedDocs) {
      try {
        const parsed = JSON.parse(savedDocs);
        if (Array.isArray(parsed)) {
          setDocuments(parsed);
          if (parsed.length > 0) setActiveDoc(parsed[0]);
        }
      } catch (e) { console.error("Storage Error:", e); }
    }
  }, []);

  const saveDocsToStorage = (newDocs: any[]) => {
    localStorage.setItem("notewave_docs", JSON.stringify(newDocs));
  };

  // --- STUDIO HANDLERS ---
  async function handleGenerateGraph() {
    if (!activeDoc) return alert("Please upload/select a document first.");
    setIsGeneratingGraph(true);
    try {
      const res = await fetch("/api/graph/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: activeDoc.name }),
      });
      const data = await res.json();
      setGraphData(data);
    } catch (err) { console.error("Graph API Fail:", err); } finally { setIsGeneratingGraph(false); }
  }

  async function handleStartDebate() {
    if (!activeDoc) return alert("Please upload/select a document first.");
    setIsDebating(true);
    try {
      const res = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: activeDoc.name }),
      });
      const data = await res.json();
      setDebateTranscript(data.transcript || []);
    } catch (err) { console.error("Debate API Fail:", err); } finally { setIsDebating(false); }
  }

  async function handleVaultAudit() {
    if (!activeDoc) return alert("Please upload/select a document first.");
    setIsAuditing(true);
    try {
      const res = await fetch("/api/vault/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: activeDoc.name }),
      });
      const data = await res.json();
      setVaultAudit(data);
    } catch (err) { console.error("Vault API Fail:", err); } finally { setIsAuditing(false); }
  }

  async function handleGenerateFlashcards() {
    if (!activeDoc) return;
    setIsGeneratingFlashcards(true);
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: activeDoc.name }),
      });
      const data = await res.json();
      if (data.flashcards) setFlashcards(data.flashcards);
    } catch (err) { console.error(err); } finally { setIsGeneratingFlashcards(false); }
  }

  async function handleGenerateScript() {
    if (!activeDoc) return;
    setIsGeneratingScript(true);
    try {
      const res = await fetch("/api/podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: activeDoc.name }),
      });
      const data = await res.json();
      if (data.script) setPodcastScript(data.script);
    } catch (e) { console.error(e); } finally { setIsGeneratingScript(false); }
  }

  const executeCommand = (cmd: Command) => {
    console.log("Executing Command:", cmd.id); // Debug Log
    setFilteredCommands([]);
    setActiveStudio(cmd.id as StudioType);
    setShowRightSidebar(true);
    
    // Trigger specific logic
    if (cmd.id === "flashcards") handleGenerateFlashcards();
    else if (cmd.id === "podcast") handleGenerateScript();
    else if (cmd.id === "graph") handleGenerateGraph();
    else if (cmd.id === "debate") handleStartDebate();
    else if (cmd.id === "vault") handleVaultAudit();
    
    setInput("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    if (val.startsWith("/")) {
      const query = val.slice(1).toLowerCase();
      setFilteredCommands(COMMANDS.filter(c => c.id.includes(query)));
      setSelectedCommandIndex(0);
    } else { setFilteredCommands([]); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredCommands.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedCommandIndex(p => (p+1)%filteredCommands.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedCommandIndex(p => (p-1+filteredCommands.length)%filteredCommands.length); }
      else if (e.key === "Enter") { e.preventDefault(); executeCommand(filteredCommands[selectedCommandIndex]); }
      else if (e.key === "Escape") setFilteredCommands([]);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !activeDoc) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, fileId: activeDoc.name }),
      });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      while (true) {
        const { value, done } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content += chunk;
          return updated;
        });
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }

  if (!mounted) return null;

  return (
    <div className="h-screen flex bg-white dark:bg-black overflow-hidden font-sans">
      <SidebarLeft 
        documents={documents} activeDoc={activeDoc} isUploading={isUploading} isUploadOpen={isUploadOpen}
        setIsUploadOpen={setIsUploadOpen} handleUploadForm={async (e) => {
          e.preventDefault();
          const file = new FormData(e.currentTarget).get("file") as File;
          if (!file) return;
          setIsUploading(true);
          const formData = new FormData(); formData.append("file", file);
          const res = await fetch("/api/ingest", { method: "POST", body: formData });
          const data = await res.json();
          const updated = [...documents, { id: Date.now(), name: data.filename }];
          setDocuments(updated); saveDocsToStorage(updated); setActiveDoc(updated[updated.length-1]);
          setIsUploading(false); setIsUploadOpen(false);
        }}
        handleSwitchFile={(doc) => { 
          setActiveDoc(doc); setMessages([]); setActiveStudio("none"); 
          setGraphData({nodes:[], links:[]}); setDebateTranscript([]); setVaultAudit(null);
        }}
        handleDeleteFile={(e, id, name) => { e.stopPropagation(); const updated = documents.filter(d => d.id !== id); setDocuments(updated); saveDocsToStorage(updated); }}
        setTheme={setTheme} theme={theme} showLeftSidebar={showLeftSidebar} isWide={leftSidebarWide}
        toggleSidebar={() => setShowLeftSidebar(!showLeftSidebar)}
      />

      <div className="flex-1 flex flex-col h-full bg-white dark:bg-black relative overflow-hidden transition-all duration-500">
        <header className="h-16 flex-none flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800 z-30">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowLeftSidebar(!showLeftSidebar)} className="h-8 w-8 text-zinc-400">
              <ChevronLeft className={`h-5 w-5 transition-transform ${!showLeftSidebar ? "rotate-180" : ""}`} />
            </Button>
            {showLeftSidebar && (
              <Button variant="ghost" size="icon" onClick={() => setLeftSidebarWide(!leftSidebarWide)} className="h-8 w-8 text-zinc-400">
                {leftSidebarWide ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            )}
            {!showLeftSidebar && <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">NoteWave</span>}
          </div>
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase text-zinc-400">Context</span>
            <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" />
            <span className="text-xs font-semibold truncate max-w-[150px] text-zinc-900 dark:text-zinc-100">{activeDoc?.name || "Ready"}</span>
          </div>
          <div className="flex items-center gap-2">
            {showRightSidebar && (
              <Button variant="ghost" size="icon" onClick={() => setRightSidebarWide(!rightSidebarWide)} className="h-8 w-8 text-zinc-400">
                {rightSidebarWide ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setShowRightSidebar(!showRightSidebar)} className="h-8 w-8 text-zinc-400">
              <ChevronRight className={`h-5 w-5 transition-transform ${showRightSidebar ? "" : "rotate-180"}`} />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full w-full">
            <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                  <Bot className="w-12 h-12 mb-4" />
                  <p className="text-sm max-w-xs">Ask anything about your document or type / to launch a studio tool.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-6 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className={`h-9 w-9 mt-1 flex-none ${m.role === 'user' ? 'bg-zinc-100' : 'bg-zinc-900 dark:bg-white'}`}>
                    <AvatarFallback className="text-xs">{m.role === 'user' ? <User className="w-4 h-4 text-black" /> : <Bot className="w-5 h-5 text-white dark:text-black" />}</AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 min-w-0 ${m.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`markdown-content ${m.role === 'user' ? 'inline-block bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-2xl text-zinc-900 dark:text-zinc-100' : ''}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && <Loader2 className="w-4 h-4 animate-spin opacity-20 mx-auto" />}
              <div ref={messagesEndRef} className="h-20" />
            </div>
          </ScrollArea>
        </div>

        <footer className="flex-none p-6">
          <div className="max-w-2xl mx-auto relative">
            <CommandPalette commands={filteredCommands} selectedIndex={selectedCommandIndex} onSelect={executeCommand} />
            <form onSubmit={handleSubmit} className="relative group">
              <Input 
                value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
                placeholder="Type / for tools..." className="h-14 pl-12 pr-14 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl text-zinc-900 dark:text-zinc-100" 
              />
              <Mic className="absolute left-4 top-4 w-5 h-5 text-zinc-400 cursor-pointer hover:text-zinc-900" />
              <Button type="submit" disabled={isLoading} size="icon" className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-black dark:bg-white text-white dark:text-black"><ArrowUp className="w-5 h-5" /></Button>
            </form>
          </div>
        </footer>
      </div>

      <SidebarRight 
        activeStudio={activeStudio} 
        showRightSidebar={showRightSidebar} 
        isWide={rightSidebarWide}
        toggleSidebar={() => setShowRightSidebar(!showRightSidebar)}
        podcastProps={{ script: podcastScript, audioChunks, isGenerating: isGeneratingScript, isPlaying, currentLineIndex, onGenerate: handleGenerateScript, onTogglePlayback: () => setIsPlaying(!isPlaying), viewportRef: scriptViewportRef }}
        flashcardProps={{ cards: flashcards, isLoading: isGeneratingFlashcards, onGenerate: handleGenerateFlashcards }}
        graphProps={{ data: graphData, isLoading: isGeneratingGraph, onNodeClick: (node: any) => console.log("Node:", node) }}
        debateProps={{ transcript: debateTranscript, isLoading: isDebating, onRestart: handleStartDebate }}
        vaultProps={{ audit: vaultAudit, isLoading: isAuditing, onAudit: handleVaultAudit }}
      />
    </div>
  );
}