"use client";

import { Command } from "@/lib/commands";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CommandPaletteProps {
  commands: Command[];
  selectedIndex: number;
  onSelect: (command: Command) => void;
}

export default function CommandPalette({ commands, selectedIndex, onSelect }: CommandPaletteProps) {
  if (commands.length === 0) return null;

  return (
    <Card className="absolute bottom-full mb-4 left-0 right-0 max-w-2xl mx-auto overflow-hidden shadow-2xl border-zinc-100 dark:border-zinc-900 bg-white/95 dark:bg-black/95 backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl">
      <div className="px-5 py-3 border-b border-zinc-50 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/30">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Command Console</span>
      </div>
      <ScrollArea className="max-h-[400px]">
        <div className="p-2 space-y-1">
          {commands.map((cmd, i) => {
            const Icon = cmd.icon;
            const isSelected = i === selectedIndex;
            return (
              <div key={cmd.id} onClick={() => onSelect(cmd)} className={`flex items-center justify-between px-4 py-4 rounded-xl cursor-pointer transition-all duration-200 ${isSelected ? "bg-zinc-900 dark:bg-white text-white dark:text-black scale-[1.01]" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}>
                <div className="flex items-center gap-5">
                  <Icon className={`w-5 h-5 ${isSelected ? "text-white dark:text-black" : "text-zinc-400"}`} />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-black uppercase tracking-wider">{cmd.label}</span>
                    <span className={`text-[11px] ${isSelected ? "opacity-80" : "opacity-50"}`}>{cmd.description}</span>
                  </div>
                </div>
                {isSelected && <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Execute</span>}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}