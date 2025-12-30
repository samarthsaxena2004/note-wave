// FILE: src/components/dashboard/SidebarLeft.tsx
"use client";

import { 
  FileText, Plus, Trash2, Moon, Sun, Loader2, 
  Zap, Settings2, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
  onOpenSettings: () => void; // Added for Phase 3 redirection
}

export default function SidebarLeft({
  documents, activeDoc, isUploading, isUploadOpen, setIsUploadOpen,
  handleUploadForm, handleSwitchFile, handleDeleteFile, setTheme, theme,
  showLeftSidebar, isWide, onOpenSettings
}: SidebarLeftProps) {
  const widthClass = !showLeftSidebar ? "w-0 border-r-0" : isWide ? "w-[450px]" : "w-[280px]";

  return (
    <div className={cn(
      "relative h-full bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-300 ease-in-out z-40",
      widthClass
    )}>
      <div className={cn(
        "flex flex-col h-full overflow-hidden transition-opacity duration-300",
        !showLeftSidebar ? "opacity-0 invisible" : "opacity-100 visible"
      )}>
        
        {/* HEADER */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-100 dark:border-zinc-800/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center shadow-lg">
              <Zap className="w-4 h-4 text-white dark:text-black fill-current" />
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">NoteWave</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-8 w-8 text-zinc-400">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
        
        {/* NEW SOURCE */}
        <div className="p-4 shrink-0">
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
                <Button className="w-full justify-start gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 shadow-md rounded-xl h-11 px-4">
                  <Plus className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">New Source</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-zinc-950 dark:border-zinc-800">
              <DialogHeader><DialogTitle>Add Source</DialogTitle></DialogHeader>
              <form onSubmit={handleUploadForm} className="space-y-4 mt-4">
                <Input name="file" type="file" accept=".pdf" required className="dark:bg-zinc-900" />
                <Button type="submit" disabled={isUploading} className="w-full">
                  {isUploading ? <Loader2 className="animate-spin" /> : "Ingest PDF"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* LIBRARY */}
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1">
            <h3 className="px-3 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Library</h3>
            {documents.map((doc) => (
              <div 
                key={doc.id} onClick={() => handleSwitchFile(doc)}
                className={cn(
                  "group flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all",
                  activeDoc?.id === doc.id ? "bg-zinc-100 dark:bg-zinc-900" : "hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-1.5 h-1.5 rounded-full", doc.mastery > 70 ? "bg-emerald-500" : "bg-zinc-300")} />
                  <span className="text-xs font-medium truncate">{doc.name}</span>
                </div>
                <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 h-6 w-6" onClick={(e) => handleDeleteFile(e, doc.id, doc.name)}>
                  <Trash2 className="w-3 h-3 text-zinc-400 hover:text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* CLEAN FOOTER WITH SETTINGS TRIGGER */}
        <div className="p-4 mt-auto border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between px-2">
            <div 
              onClick={onOpenSettings}
              className="flex items-center gap-3 cursor-pointer group hover:opacity-70 transition-opacity"
            >
              <div className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                <Settings2 className="w-4 h-4 text-zinc-500 group-hover:rotate-45 transition-transform duration-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold">App Settings</span>
                <span className="text-[9px] text-zinc-400 uppercase">Profile & Logic</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-20">
              <Database className="w-3 h-3" />
              <span className="text-[9px] font-black uppercase">Local</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}