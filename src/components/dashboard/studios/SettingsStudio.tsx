// FILE: src/components/dashboard/studios/SettingsStudio.tsx
"use client";

import React from "react";
import { 
  Settings2, Activity, BrainCircuit, Zap, 
  ShieldCheck, Bell, Cpu, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface SettingsStudioProps {
  settings: {
    focusMode: boolean;
    autoAudit: boolean;
    spacedRepetition: boolean;
  };
  onUpdate: (newSettings: any) => void;
  onClose: () => void;
}

export default function SettingsStudio({ settings, onUpdate, onClose }: SettingsStudioProps) {
  const handleToggle = (key: string) => {
    onUpdate({ ...settings, [key]: !settings[key as keyof typeof settings] });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <Settings2 className="w-4 h-4 text-zinc-500" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Preferences</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8 pb-12">
          {/* SECTION: BIO-ADAPTIVE PROFILE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Bio-Adaptive Profile</h3>
            </div>
            
            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-bold">Kinesthetic Learner</span>
                </div>
                <Badge variant="outline" className="text-[8px] h-4 border-purple-500/20 text-purple-500 bg-purple-500/5">Primary Style</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase">
                  <span>Cognitive Load</span>
                  <span>35% (Optimal)</span>
                </div>
                <Progress value={35} className="h-1" />
              </div>
            </div>
          </div>

          {/* SECTION: APPLICATION CONTROLS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Application Controls</h3>
            </div>
            
            <div className="space-y-2">
              <ControlItem 
                icon={<Zap className="w-4 h-4 text-amber-500" />} 
                title="Focus Mode" 
                desc="Simplify UI & mute notifications" 
                checked={settings.focusMode}
                onCheckedChange={() => handleToggle('focusMode')}
              />
              <ControlItem 
                icon={<Bell className="w-4 h-4 text-blue-500" />} 
                title="Spaced Repetition" 
                desc="Smart review schedules" 
                checked={settings.spacedRepetition}
                onCheckedChange={() => handleToggle('spacedRepetition')}
              />
              <ControlItem 
                icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />} 
                title="Auto-Audit" 
                desc="Audit files on upload" 
                checked={settings.autoAudit}
                onCheckedChange={() => handleToggle('autoAudit')}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center opacity-40">
             <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">NoteWave Engine v1.0.8</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function ControlItem({ icon, title, desc, checked, onCheckedChange }: { icon: any, title: string, desc: string, checked: boolean, onCheckedChange: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-50 dark:border-zinc-900 bg-white dark:bg-black/40">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">{icon}</div>
        <div className="space-y-0.5">
          <p className="text-xs font-bold">{title}</p>
          <p className="text-[10px] text-zinc-500 leading-tight">{desc}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}