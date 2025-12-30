// FILE: src/components/dashboard/studios/VoiceStudio.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, X, Loader2, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceStudioProps {
  onClose: () => void;
  onTranscription: (text: string) => void;
}

export default function VoiceStudio({ onClose, onTranscription }: VoiceStudioProps) {
  const [isListening, setIsListening] = useState(false);
  const [auraScale, setAuraScale] = useState(1);

  // Mock Aura pulse for Immersion
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setAuraScale(1 + Math.random() * 0.5);
      }, 150);
      return () => clearInterval(interval);
    } else {
      setAuraScale(1);
    }
  }, [isListening]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
      {/* HEADER */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <Mic className="w-4 h-4 text-blue-500" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Voice Immersion</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* IMMERSIVE AURA AREA */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
        <div className="relative">
          {/* Pulsing Aura Layers */}
          <div 
            className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full transition-transform duration-150"
            style={{ transform: `scale(${auraScale * 2})` }}
          />
          <div 
            className="absolute inset-0 bg-blue-400/30 blur-xl rounded-full transition-transform duration-200"
            style={{ transform: `scale(${auraScale * 1.5})` }}
          />
          
          <Button 
            onClick={() => setIsListening(!isListening)}
            className={cn(
              "h-32 w-32 rounded-full relative z-10 transition-all duration-500 shadow-2xl",
              isListening ? "bg-blue-600 scale-110" : "bg-zinc-900 dark:bg-white"
            )}
          >
            {isListening ? (
              <Waves className="w-12 h-12 text-white animate-pulse" />
            ) : (
              <Mic className="w-12 h-12 text-white dark:text-black" />
            )}
          </Button>
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold">
            {isListening ? "Listening to Context..." : "Press to Speak"}
          </h3>
          <p className="text-xs text-zinc-500 max-w-[200px] leading-relaxed italic">
            "NoteWave, explain the three core concepts of this document as a debate."
          </p>
        </div>
      </div>

      <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10">
        <div className="flex items-center justify-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Audio Passthrough Active</span>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}