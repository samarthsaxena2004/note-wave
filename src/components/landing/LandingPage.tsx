"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, UploadCloud, Loader2, Github, Heart, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { AuthModal } from "@/components/auth/AuthModal";

export default function LandingPage() {
  const { setTheme, theme } = useTheme();
  const { user, signOut } = useAuth(); // Destructured signOut for functional logout
  const [mounted, setMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function processUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);
    try {
      const res = await fetch("/api/ingest", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const newDoc = { id: Date.now(), name: data.filename, date: "Just now" };
      const savedDocs = JSON.parse(localStorage.getItem("notewave_docs") || "[]");
      localStorage.setItem("notewave_docs", JSON.stringify([...savedDocs, newDoc]));
      window.location.reload(); 
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsUploading(false);
      setIsDragging(false);
    }
  }

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) processUpload(e.dataTransfer.files[0]);
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <header className="h-16 flex items-center justify-between px-6 md:px-10 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-xs">N</div>
          <span className="font-semibold text-sm tracking-tight">NoteWave</span>
        </div>
        
        <div className="flex items-center gap-4">
          {!mounted ? null : user ? (
            <div className="flex items-center gap-3">
              {/* Authenticated User Badge */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs font-medium truncate max-w-[150px]">{user.email}</span>
              </div>
              {/* Explicit Sign Out Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => signOut()} 
                className="text-xs font-bold text-zinc-500 hover:text-red-500 gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </div>
          ) : (
            /* Auth Modal Trigger */
            <AuthModal trigger={
              <Button variant="outline" size="sm" className="rounded-full px-6 h-9 text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity">
                Sign In
              </Button>
            } />
          )}

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {mounted ? (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <span className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-200/50 dark:bg-zinc-800/20 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white">Chat with your documents.</h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">Upload a PDF to generate podcasts, summaries, and ask questions using advanced AI.</p>
          </div>
          <div 
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            className={`group relative border-2 border-dashed rounded-3xl p-10 transition-all duration-300 cursor-pointer ${isDragging ? "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900 scale-[1.02]" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-white/50 dark:bg-black/50"}`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-full transition-colors ${isDragging ? "bg-zinc-200 dark:bg-zinc-800" : "bg-zinc-100 dark:bg-zinc-900"}`}>
                {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <UploadCloud className="w-8 h-8 text-zinc-400" />}
              </div>
              <div className="space-y-1">
                <p className="font-medium">{isUploading ? "Processing PDF..." : "Drag and drop your PDF here"}</p>
                <p className="text-sm text-zinc-400">or click to browse</p>
              </div>
              <input type="file" accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => { if (e.target.files?.length) processUpload(e.target.files[0]); }} disabled={isUploading} />
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-zinc-100 dark:border-zinc-800 relative z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-black font-bold text-[10px]">N</div>
            <span className="font-semibold text-sm tracking-tight text-zinc-500 dark:text-zinc-400">NoteWave</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-100 dark:border-zinc-800">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current animate-pulse" />
            <span>by</span>
            <a href="https://enflect.tech/" target="_blank" className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline">Samarth Saxena</a>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/samarthsaxena2004/note-wave" target="_blank" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 text-sm"><Github className="w-4 h-4" />GitHub repository</a>
          </div>
        </div>
      </footer>
    </div>
  );
}