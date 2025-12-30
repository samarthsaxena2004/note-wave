// FILE: src/components/dashboard/studios/DebateStudio.tsx
"use client";

import React from 'react';
import { MessageSquare, RefreshCw, Loader2, Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RESEARCH_AGENTS } from "@/lib/agents";

export default function DebateStudio({ transcript, isLoading, onRestart, onClose }: any) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-black">
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800 flex-none">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-4 h-4 text-zinc-500" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Agentic Debate</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onRestart} disabled={isLoading} className="h-8 w-8 text-zinc-400">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400"><X className="w-4 h-4" /></Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin" /><p className="text-[10px] font-black uppercase tracking-widest">Orchestrating Room...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {transcript.map((turn: any, i: number) => {
              const agentKey = turn.agent.toUpperCase() as keyof typeof RESEARCH_AGENTS;
              const agent = RESEARCH_AGENTS[agentKey] || RESEARCH_AGENTS.CRITIC;
              return (
                <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: agent.color + '20' }}><Bot className="w-4 h-4" style={{ color: agent.color }} /></div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: agent.color }}>{agent.name} • {agent.role}</p>
                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{turn.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}