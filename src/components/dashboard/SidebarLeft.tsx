// FILE: src/components/dashboard/SidebarLeft.tsx
"use client";

import { 
  FileText, Plus, Trash2, Moon, Sun, Loader2, 
  BrainCircuit, Zap, BarChart, Settings2, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card"; // FIXED: Added missing import
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
}

export default function SidebarLeft({
  documents, activeDoc, isUploading, isUploadOpen, setIsUploadOpen,
  handleUploadForm, handleSwitchFile, handleDeleteFile, setTheme, theme,
  showLeftSidebar, isWide, toggleSidebar
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
        
        {/* HEADER: CLEAN & COMPACT */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center shadow-lg">
              <Zap className="w-4 h-4 text-white dark:text-black fill-current" />
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">NoteWave</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
        
        {/* NEW SOURCE ACTION */}
        <div className="p-4">
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
                <Button className="w-full justify-start gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 shadow-md rounded-xl h-11 px-4">
                  <Plus className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">New Source</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-zinc-950 dark:border-zinc-800 rounded-3xl">
              <DialogHeader><DialogTitle className="text-xl font-bold">Add Research Source</DialogTitle></DialogHeader>
              <form onSubmit={handleUploadForm} className="space-y-4 mt-6">
                <div className="group relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 transition-colors hover:border-zinc-400 dark:hover:border-zinc-600">
                    <Input name="file" type="file" accept=".pdf" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
                        <FileText className="w-8 h-8 text-zinc-400" />
                        <p className="text-sm font-medium text-zinc-500">Select or drop PDF file here</p>
                        <p className="text-[10px] text-zinc-400 uppercase">Max size: 4.5MB</p>
                    </div>
                </div>
                <Button type="submit" disabled={isUploading} className="w-full h-12 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white">
                  {isUploading ? <><Loader2 className="animate-spin mr-2 w-4 h-4" /> Processing...</> : "Begin Ingestion"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* LIBRARY: WITH MASTERY DOTS */}
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 mb-6">
            <h3 className="px-3 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Knowledge Library</h3>
            {documents.map((doc) => (
              <div 
                key={doc.id} onClick={() => handleSwitchFile(doc)}
                className={cn(
                  "group flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all duration-200",
                  activeDoc?.id === doc.id 
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm" 
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    doc.mastery > 80 ? "bg-emerald-500" : doc.mastery > 40 ? "bg-amber-500" : "bg-zinc-300"
                  )} />
                  <span className="text-xs font-medium truncate">{doc.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    {doc.mastery !== undefined && <span className="text-[9px] font-bold opacity-40">{doc.mastery}%</span>}
                    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 h-7 w-7 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg" onClick={(e) => handleDeleteFile(e, doc.id, doc.name)}>
                    <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* PREMIUM MASTERY FOOTER (PHASE 3) */}
        <div className="p-4 mt-auto border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10">
            <Card className="p-4 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Bio-Adaptive Profile</span>
                    </div>
                    <Settings2 className="w-3 h-3 text-zinc-300 cursor-pointer hover:text-zinc-600 transition-colors" />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="w-4 h-4 text-purple-500" />
                            <span className="text-[11px] font-bold">Kinesthetic Learner</span>
                        </div>
                        <Badge className="h-4 text-[8px] bg-purple-500/10 text-purple-500 border-none">Active</Badge>
                    </div>
                    
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] font-bold uppercase text-zinc-400">
                            <span>Cognitive Load</span>
                            <span>Optimal</span>
                        </div>
                        <Progress value={35} className="h-1 bg-zinc-100 dark:bg-zinc-800" />
                    </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900">
                    <div className="flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-medium text-zinc-500">Focus Mode Engaged</span>
                    </div>
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
}