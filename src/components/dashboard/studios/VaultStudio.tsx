// FILE: src/components/dashboard/studios/VaultStudio.tsx
"use client";

import React from 'react';
import { ShieldCheck, ShieldAlert, Info, Loader2, RefreshCw, BarChart3, Fingerprint, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VaultStudioProps {
  audit: any;
  isLoading: boolean;
  onAudit: () => void;
  onClose: () => void;
}

export default function VaultStudio({ audit, isLoading, onAudit, onClose }: VaultStudioProps) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-black">
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800 flex-none">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Verified Vault</h2>
        </div>
        <div className="flex items-center gap-1">
          {audit && <Button variant="ghost" size="icon" onClick={onAudit} disabled={isLoading} className="h-8 w-8 text-zinc-400"><RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /></Button>}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400"><X className="w-4 h-4" /></Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /><p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Running Audit...</p></div>
        ) : !audit ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 mt-12">
            <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-900"><ShieldCheck className="w-12 h-12 text-zinc-300" /></div>
            <div className="space-y-2"><h3 className="text-sm font-bold uppercase tracking-widest">Vault Secure</h3><p className="text-xs text-zinc-500">Scan for bias and truth-score inconsistencies.</p></div>
            <Button onClick={onAudit} className="rounded-full px-8 dark:bg-white dark:text-black">Perform Integrity Audit</Button>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            <Card className="p-6 border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
               <div className="flex justify-between items-end mb-4">
                 <div><p className="text-[10px] font-black uppercase text-zinc-400">Truth Score</p><p className="text-2xl font-bold">{audit.truthScore}%</p></div>
                 <Badge variant={audit.truthScore > 80 ? "default" : "destructive"}>{audit.truthScore > 80 ? "High Integrity" : "Needs Review"}</Badge>
               </div>
               <Progress value={audit.truthScore} className="h-1.5" />
            </Card>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-2"><div className="flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5 text-zinc-400" /><span className="text-[10px] font-bold uppercase tracking-widest">Bias</span></div><p className="text-lg font-bold">{audit.biasScore}%</p></div>
               <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-2"><div className="flex items-center gap-2"><Fingerprint className="w-3.5 h-3.5 text-zinc-400" /><span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Signature</span></div><p className="text-[10px] font-bold truncate">{audit.provenance}</p></div>
            </div>
            <div className="space-y-4">
               <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-zinc-400"><ShieldAlert className="w-3.5 h-3.5" /> Hallucinations</h3>
               {audit.unsupportedClaims.map((claim: string, i: number) => (
                 <div key={i} className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/10 border border-red-100/50 dark:border-red-900/20 text-xs italic text-zinc-600 dark:text-zinc-400 leading-relaxed">{claim}</div>
               ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}