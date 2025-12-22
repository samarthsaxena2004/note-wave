"use client";

import { FileText, Plus, Trash2, Moon, Sun, Loader2, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { useAuth } from "@/components/auth-provider";
import { AuthModal } from "@/components/auth/AuthModal";

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
  const { user, signOut } = useAuth();
  const widthClass = !showLeftSidebar ? "w-0 border-r-0" : isWide ? "w-[450px]" : "w-[280px]";

  // Get display name from metadata or fallback to email
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0];

  return (
    <div className={`relative h-full bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-300 ease-in-out ${widthClass}`}>
      <div className={`flex flex-col h-full overflow-hidden ${!showLeftSidebar ? "opacity-0 invisible" : "opacity-100 visible"}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-xs">N</div>
            <span className="font-semibold text-sm tracking-tight">NoteWave</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-8 w-8 text-zinc-400">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
        
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

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-900/10">
          {user ? (
            <div className="flex items-center justify-between group/user">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase leading-none mb-1">Authenticated</span>
                  <span className="text-xs truncate font-medium text-zinc-700 dark:text-zinc-300">{displayName}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => signOut()} 
                className="h-8 w-8 text-zinc-400 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[10px] text-zinc-400 text-center uppercase font-bold tracking-tight">Cloud storage disabled</p>
              <AuthModal trigger={
                <Button variant="secondary" className="w-full text-xs h-8 font-bold rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800">
                  Sign In to Sync
                </Button>
              } />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}