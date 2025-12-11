"use client";

import { useState } from "react";
import { ChatComponent } from "@/components/ChatComponent";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  PlusCircle, 
  PanelLeft, 
  Moon, 
  Sun,
  Headphones,
  Play,
  Loader2,
  Trash2
} from "lucide-react";
import { useTheme } from "next-themes";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Dashboard() {
  // --- STATE ---
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [isPodcastOpen, setIsPodcastOpen] = useState(false);
  const [podcastScript, setPodcastScript] = useState<any[]>([]);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState<number | null>(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const { setTheme, theme } = useTheme();

  // Document Management
  const [documents, setDocuments] = useState([
    { id: 1, name: "resume.pdf", date: "Today" },
  ]);
  const [activeDoc, setActiveDoc] = useState(documents[0]); 

  // --- ACTIONS ---

  // 1. SWITCH FILE
  function handleSwitchFile(doc: any) {
    setActiveDoc(doc);
    setMessages([]); // Clear chat history for the new file
    setPodcastScript([]); // Clear podcast
    // Ideally, you'd fetch previous chat history for this doc from a DB here
  }

  // 2. DELETE FILE
  async function handleDeleteFile(e: React.MouseEvent, docId: number, filename: string) {
    e.stopPropagation(); // Prevent triggering the switch file click
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      // Call API to remove vectors
      await fetch("/api/delete", {
        method: "POST",
        body: JSON.stringify({ filename }),
      });

      // Update UI
      const newDocs = documents.filter(d => d.id !== docId);
      setDocuments(newDocs);

      // If we deleted the active doc, switch to another one or reset
      if (activeDoc.id === docId) {
        if (newDocs.length > 0) {
          handleSwitchFile(newDocs[0]);
        } else {
          setActiveDoc({ id: 0, name: "No Document Selected", date: "" });
        }
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete file.");
    }
  }

  // 3. CHAT (Now sends fileId)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !activeDoc.id) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // UPDATED: Send fileId (filename) so backend knows what to filter
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

  // 4. UPLOAD
  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.files || e.currentTarget.files.files.length === 0) return;

    const file = e.currentTarget.files.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);

    try {
      const res = await fetch("/api/ingest", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      const newDoc = { id: Date.now(), name: data.filename, date: "Just now" };
      setDocuments(prev => [...prev, newDoc]);
      handleSwitchFile(newDoc); // Switch to new file immediately
      
      setIsUploadOpen(false);
      
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  }

  // 5. PODCAST (Generate)
  async function handleGenerateScript() {
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
    } catch (err) {
      console.error("Failed to generate script", err);
    } finally {
      setIsGeneratingScript(false);
    }
  }

  // 6. PODCAST (Play)
  async function handlePlayPodcast() {
    if (podcastScript.length === 0) return;
    setIsPlaying(true);
    for (let i = 0; i < podcastScript.length; i++) {
      setCurrentLineIndex(i); 
      const line = podcastScript[i];
      try {
        const res = await fetch("/api/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: line.text, speaker: line.speaker }),
        });
        if (!res.ok) throw new Error("Audio fetch failed");
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        await new Promise((resolve) => {
          audio.onended = resolve;
          audio.play();
        });
      } catch (err) {
        break; 
      }
    }
    setIsPlaying(false);
    setCurrentLineIndex(null);
  }
  
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* SIDEBAR */}
      <div className={`${isSidebarOpen ? "w-64" : "w-0"} hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 overflow-hidden`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">N</span>
          </div>
          <span className="font-bold text-lg dark:text-white">NoteWave</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  <PlusCircle className="w-4 h-4" />
                  New Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>Select a PDF to analyze.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4 mt-4">
                  <input name="files" type="file" accept=".pdf" className="flex w-full rounded-md border px-3 py-2 text-sm" required />
                  <Button type="submit" disabled={isUploading} className="w-full">
                    {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : "Upload and Index"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 pl-2">Sources</p>
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className={`group flex items-center justify-between w-full p-2 rounded-md text-sm cursor-pointer transition-colors ${
                  activeDoc.id === doc.id 
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-medium" 
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => handleSwitchFile(doc)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{doc.name}</span>
                </div>
                
                {/* DELETE BUTTON (Only shows on hover) */}
                <button 
                  onClick={(e) => handleDeleteFile(e, doc.id, doc.name)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-slate-400 hover:text-red-500 transition-all"
                  title="Delete file"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex">
              <PanelLeft className="w-5 h-5 text-slate-500" />
            </Button>
            <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">
              {activeDoc.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={isPodcastOpen} onOpenChange={setIsPodcastOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-slate-600 dark:text-slate-300" disabled={!activeDoc.id}>
                  <Headphones className="w-4 h-4" />
                  <span className="hidden sm:inline">Audio Overview</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Deep Dive Podcast</DialogTitle>
                  <DialogDescription>
                    Conversation about: {activeDoc.name}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden min-h-[300px] bg-slate-50 dark:bg-slate-900 rounded-md border p-4 relative">
                  {podcastScript.length === 0 && !isGeneratingScript ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                       <Headphones className="w-12 h-12 text-slate-300 mb-4" />
                       <p className="text-slate-500 mb-4">No podcast generated yet.</p>
                       <Button onClick={handleGenerateScript}>Generate Script</Button>
                     </div>
                  ) : isGeneratingScript ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                      <p className="text-sm text-slate-500">Writing script...</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-full pr-4">
                      <div className="space-y-4">
                        {podcastScript.map((line, i) => (
                          <div key={i} className={`flex gap-3 ${line.speaker === 'Host' ? 'flex-row' : 'flex-row-reverse'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              line.speaker === 'Host' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {line.speaker === 'Host' ? 'H' : 'E'}
                            </div>
                            <div className={`flex-1 p-3 rounded-lg text-sm transition-all duration-300 ${
                               line.speaker === 'Host' ? 'bg-white border text-slate-800 rounded-tl-none' : 'bg-green-50 border border-green-100 text-slate-800 rounded-tr-none'
                            } ${i === currentLineIndex ? 'ring-2 ring-blue-500 shadow-md scale-[1.02]' : ''}`}>
                              <p className="font-semibold text-xs mb-1 opacity-50">{line.speaker}</p>
                              {line.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                   {podcastScript.length > 0 && (
                     <Button className="bg-green-600 hover:bg-green-700" onClick={handlePlayPodcast} disabled={isPlaying}>
                       {isPlaying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Playing...</> : <><Play className="w-4 h-4 mr-2" /> Play Audio</>}
                     </Button>
                   )}
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 p-4 max-w-4xl mx-auto w-full">
            {activeDoc.id ? (
              <ChatComponent 
                messages={messages}
                input={input}
                handleInputChange={(e) => setInput(e.target.value)}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <FileText className="w-16 h-16 opacity-20 mb-4" />
                <p>Select a document to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}