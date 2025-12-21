"use client";

import { Headphones, RefreshCw, Pause, Play, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarRightProps {
  podcastScript: any[];
  isGeneratingScript: boolean;
  isPlaying: boolean;
  currentLineIndex: number | null;
  handleGenerateScript: () => void;
  togglePlayback: () => void;
  showRightSidebar: boolean;
  scriptViewportRef: React.RefObject<HTMLDivElement | null>; // Fixed type
}

export default function SidebarRight({
  podcastScript,
  isGeneratingScript,
  isPlaying,
  currentLineIndex,
  handleGenerateScript,
  togglePlayback,
  showRightSidebar,
  scriptViewportRef
}: SidebarRightProps) {
  return (
    <div className={`fixed inset-y-0 right-0 z-40 w-[360px] bg-white dark:bg-black border-l border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-[360px] ${showRightSidebar ? "translate-x-0" : "translate-x-full"}`}>
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
                 <div key={i} className={`w-1 bg-zinc-900 dark:bg-white rounded-full transition-all duration-100 ${isPlaying ? 'animate-pulse' : 'h-1 opacity-20'}`} style={{ height: isPlaying ? `${Math.max(10, Math.random() * 40)}px` : '4px', animationDelay: `${i * 0.05}s` }} />
                ))}
            </div>
            <div className="flex items-center gap-4">
              {podcastScript.length === 0 ? (
                 <Button onClick={handleGenerateScript} disabled={isGeneratingScript} className="rounded-full px-6 dark:bg-white dark:text-black">
                   {isGeneratingScript ? "Generating..." : "Generate Audio"}
                 </Button>
              ) : (
                 <Button onClick={togglePlayback} size="icon" className="h-14 w-14 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg hover:scale-105 transition-transform">
                   {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                 </Button>
              )}
            </div>
         </div>
      </div>
      <div className="flex-1 overflow-hidden relative bg-white dark:bg-black">
        {/* Pass the ref to the updated ScrollArea */}
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
                <div key={i} id={`script-line-${i}`} className={`transition-all duration-500 ${isActive ? "opacity-100" : "opacity-30 blur-[0.5px] grayscale"}`}>
                  <p className={`text-[10px] font-bold tracking-widest uppercase mb-2 ${isActive ? "text-zinc-900 dark:text-white" : "text-zinc-500"}`}>{line.speaker}</p>
                  <p className={`text-base font-medium leading-relaxed ${isActive ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-400"}`}>{line.text}</p>
                </div>
              )
            })}
          </div>
        </ScrollArea>
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white dark:from-black to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-black to-transparent pointer-events-none" />
      </div>
    </div>
  );
}