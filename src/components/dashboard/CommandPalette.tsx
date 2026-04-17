"use client";

import { Command } from "@/lib/commands";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface CommandPaletteProps {
  commands: Command[];
  selectedIndex: number;
  onSelect: (command: Command) => void;
}

export default function CommandPalette({ commands, selectedIndex, onSelect }: CommandPaletteProps) {
  if (commands.length === 0) return null;

  return (
    <Card className="absolute bottom-full mb-4 left-0 right-0 max-w-2xl mx-auto overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200 rounded-2xl">
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Tools & Commands</span>
        <div className="flex gap-1.5">
          <Badge variant="outline" className="text-[9px] h-4 px-1 opacity-50 font-mono">↑↓ to navigate</Badge>
          <Badge variant="outline" className="text-[9px] h-4 px-1 opacity-50 font-mono">↵ to select</Badge>
        </div>
      </div>
      
      {/* Fixed height with auto-scroll logic */}
      <ScrollArea className="h-full max-h-[320px] overflow-y-auto">
        <div className="p-2 space-y-1">
          {commands.map((cmd, i) => {
            const Icon = cmd.icon;
            const isSelected = i === selectedIndex;
            
            return (
              <div
                key={cmd.id}
                onClick={() => onSelect(cmd)}
                className={`group flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all duration-150 ${
                  isSelected 
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md scale-[0.99]" 
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                }`}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={`p-2 rounded-lg transition-colors ${
                    isSelected 
                      ? "bg-white/10 dark:bg-black/10" 
                      : "bg-zinc-100 dark:bg-zinc-800"
                  }`}>
                    <Icon className={`w-4 h-4 ${isSelected ? "text-white dark:text-zinc-900" : "text-zinc-500"}`} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold tracking-tight">{cmd.label}</span>
                    <span className={`text-xs truncate ${isSelected ? "opacity-80" : "opacity-50"}`}>
                      {cmd.description}
                    </span>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="flex items-center animate-in fade-in slide-in-from-right-2">
                    <span className="text-[10px] font-mono opacity-60">Enter</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      <div className="p-2 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
        <p className="text-[9px] text-center text-zinc-400">
          Tip: You can chain intent by typing the command followed by your query.
        </p>
      </div>
    </Card>
  );
}