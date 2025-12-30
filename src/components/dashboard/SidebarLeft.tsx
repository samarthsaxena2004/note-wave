// FILE: src/components/dashboard/SidebarLeft.tsx
"use client";

import { FileText, Plus, Trash2, Moon, Sun, Loader2, Activity, BrainCircuit, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";

interface SidebarLeftProps {
  documents: any[];
  activeDoc: any;
  isUploading: boolean;
  isUploadOpen: boolean;
  setIsUploadOpen: (open: boolean) => void;
  handleUploadForm: (e: React.FormEvent<HTMLFormElement>) => void;
  handleSwitchFile: (doc: any) => void;
  handleDeleteFile: (e: React.MouseEvent, id: number, name: string) => void;
  setTheme: (theme: string) => void;
  theme: string | undefined;
  showLeftSidebar: boolean;
  isWide: boolean;
  toggleSidebar: () => void;
}

export default function SidebarLeft({
  documents, activeDoc, isUploading, isUploadOpen, setIsUploadOpen,
  handleUploadForm, handleSwitchFile, handleDeleteFile, setTheme, theme,
  showLeftSidebar, isWide, toggleSidebar
}: SidebarLeftProps) {
  const widthClass = !showLeftSidebar ? "w-0 border-r-0" : isWide ? "w-[450px]" : "w-[280px]";

  return (
    <div className={`relative h-full bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-300 ease-in-out ${widthClass}`}>
      <div className={`flex flex-col h-full overflow-hidden ${!showLeftSidebar ? "opacity-0 invisible" : "opacity-100 visible"}`}>
        
        {/* HEADER */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-xs">N</div>
            <span className="font-semibold text-sm tracking-tight">NoteWave</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-8 w-8 text-zinc-400">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
        
        {/* COGNITIVE STATE (PHASE 3) */}
        <div className="p-4 space-y-4 border-b border-zinc-50 dark:border-zinc-900/50">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Cognitive State</span>
              <Badge variant="outline" className="text-[8px] h-4 gap-1 px-1.5 border-emerald-500/20 text-emerald-500 bg-emerald-500/5">
                <Activity className="w-2.5 h-2.5" /> Bio-Synced
              </Badge>
           </div>
           
           <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
                 <div className="flex items-center gap-1.5">
                    <BrainCircuit className="w-3 h-3 text-purple-500" />
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">Style</span>
                 </div>
                 <p className="text-[10px] font-bold">Kinesthetic</p>
              </div>
              <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
                 <div className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">Focus</span>
                 </div>
                 <p className="text-[10px] font-bold">Deep Work</p>
              </div>
           </div>
        </div>

        {/* UPLOAD ACTION */}
        <div className="p-4">
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 h-10">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">New Source</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800">
              <DialogHeader><DialogTitle>Add Source</DialogTitle></DialogHeader>
              <form onSubmit={handleUploadForm} className="space-y-4 mt-4">
                <Input name="file" type="file" accept=".pdf" required className="dark:bg-zinc-950 dark:border-zinc-800" />
                <Button type="submit" disabled={isUploading} className="w-full">
                  {isUploading ? <Loader2 className="animate-spin mr-2" /> : "Upload PDF"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* LIBRARY */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-0.5">
            <h3 className="px-2 mb-2 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Library</h3>
            {documents.map((doc) => (
              <div 
                key={doc.id} onClick={() => handleSwitchFile(doc)}
                className={`group flex items-center justify-between px-2 py-2 rounded-md cursor-pointer transition-all ${activeDoc?.id === doc.id ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-medium" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"}`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 flex-shrink-0 opacity-70" />
                  <span className="text-sm truncate">{doc.name}</span>
                </div>
                <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 h-6 w-6 text-zinc-400 hover:text-red-500" onClick={(e) => handleDeleteFile(e, doc.id, doc.name)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}