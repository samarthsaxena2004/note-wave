// FILE: src/components/dashboard/studios/VoiceStudio.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Mic, X, Loader2, Waves, MessageSquare } from "lucide-react"; // Fixed imports
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { cn } from "@/lib/utils";

interface VoiceStudioProps {
  onClose: () => void;
  onTranscription: (text: string) => void;
}

export default function VoiceStudio({ onClose, onTranscription }: VoiceStudioProps) {
  const { isRecording, audioBlob, startRecording, stopRecording } = useAudioRecorder();
  const [isProcessing, setIsProcessing] = useState(false);
  const [auraScale, setAuraScale] = useState(1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setAuraScale(1 + Math.random() * 0.4);
      }, 100);
    } else {
      setAuraScale(1);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (audioBlob && !isRecording) {
      handleTranscribe(audioBlob);
    }
  }, [audioBlob, isRecording]);

  const handleTranscribe = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", blob, "input.wav");
      const res = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.transcript) onTranscription(data.transcript);
    } catch (err) {
      console.error("Transcription Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-4 h-4 text-blue-500" />
          <h2 className="text-xs font-bold uppercase tracking-widest">Voice Immersion</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
        <div className="relative">
          <div className={cn("absolute inset-0 bg-blue-500/10 blur-3xl rounded-full transition-transform duration-300", isRecording ? "opacity-100" : "opacity-0")} style={{ transform: `scale(${auraScale * 2.5})` }} />
          <Button 
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={cn("h-32 w-32 rounded-full relative z-10 transition-all duration-500 shadow-2xl", isRecording ? "bg-blue-600 scale-110 shadow-blue-500/40" : "bg-zinc-900 dark:bg-white text-white dark:text-black")}
          >
            {isProcessing ? <Loader2 className="w-12 h-12 animate-spin" /> : isRecording ? <Waves className="w-12 h-12 animate-pulse" /> : <Mic className="w-12 h-12" />}
          </Button>
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-lg font-bold">{isProcessing ? "Analyzing..." : isRecording ? "Listening..." : "Tap to Speak"}</h3>
          <p className="text-[11px] text-zinc-500 italic opacity-60">Deepgram Nova-2 Real-time Transcription</p>
        </div>
      </div>
    </div>
  );
}