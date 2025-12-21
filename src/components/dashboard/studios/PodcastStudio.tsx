"use client";

import React, { useState } from "react";
import { Headphones, RefreshCw, Pause, Play, Mic, Download, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface PodcastStudioProps {
  podcastScript: any[];
  isGeneratingScript: boolean;
  isPlaying: boolean;
  currentLineIndex: number | null;
  handleGenerateScript: () => void;
  togglePlayback: () => void;
  scriptViewportRef: React.RefObject<HTMLDivElement | null>;
  audioChunks: Blob[]; // New: To keep track of generated audio for export
  isPremium?: boolean;  // Preparation for Phase 6/7
}

export default function PodcastStudio({
  podcastScript,
  isGeneratingScript,
  isPlaying,
  currentLineIndex,
  handleGenerateScript,
  togglePlayback,
  scriptViewportRef,
  audioChunks,
  isPremium = false,
}: PodcastStudioProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const handleDownload = () => {
    if (audioChunks.length === 0) return;
    
    // Create a single blob from all collected audio segments
    const mergedBlob = new Blob(audioChunks, { type: "audio/mpeg" });
    const url = URL.createObjectURL(mergedBlob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `NoteWave_Podcast_${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePremiumSave = async () => {
    setIsSaving(true);
    // This will be connected to Supabase in Phase 6
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 3000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Headphones className="w-4 h-4 text-zinc-500" /> Podcast Studio
        </h2>
        <div className="flex items-center gap-1">
          {podcastScript.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGenerateScript}
              disabled={isGeneratingScript}
              className="h-8 w-8 text-zinc-400"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingScript ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
      </div>

      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="flex items-center gap-1 h-12">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-zinc-900 dark:bg-white rounded-full transition-all duration-100 ${
                  isPlaying ? "animate-pulse" : "h-1 opacity-20"
                }`}
                style={{
                  height: isPlaying ? `${Math.max(10, Math.random() * 40)}px` : "4px",
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-4">
            {podcastScript.length === 0 ? (
              <Button
                onClick={handleGenerateScript}
                disabled={isGeneratingScript}
                className="rounded-full px-6 dark:bg-white dark:text-black"
              >
                {isGeneratingScript ? "Generating..." : "Generate Audio"}
              </Button>
            ) : (
              <Button
                onClick={togglePlayback}
                size="icon"
                className="h-14 w-14 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-1" />
                )}
              </Button>
            )}
          </div>

          {/* EXPORT OPTIONS */}
          {audioChunks.length > 0 && (
            <div className="flex gap-2 w-full pt-2">
              <Button 
                variant="outline" 
                className="flex-1 text-[11px] h-8 rounded-lg gap-2"
                onClick={handleDownload}
              >
                <Download className="w-3 h-3" /> Download MP3
              </Button>
              
              <Button 
                variant={isPremium ? "default" : "secondary"}
                disabled={!isPremium || isSaving}
                className="flex-1 text-[11px] h-8 rounded-lg gap-2"
                onClick={handlePremiumSave}
              >
                {hasSaved ? (
                  <><CheckCircle2 className="w-3 h-3 text-green-500" /> Saved</>
                ) : (
                  <><Save className="w-3 h-3" /> {isPremium ? "Save to Cloud" : "Premium Save"}</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-white dark:bg-black">
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
              const isLoaded = i < audioChunks.length;

              return (
                <div
                  key={i}
                  id={`script-line-${i}`}
                  className={`relative transition-all duration-500 ${
                    isActive ? "opacity-100 scale-[1.02] origin-left" : "opacity-30 blur-[0.5px] grayscale"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                     <p className={`text-[10px] font-bold tracking-widest uppercase ${
                      isActive ? "text-zinc-900 dark:text-white" : "text-zinc-500"
                    }`}>
                      {line.speaker}
                    </p>
                    {isLoaded && !isActive && <Badge variant="secondary" className="text-[8px] h-3 px-1 opacity-50">Buffered</Badge>}
                  </div>
                  <p
                    className={`text-base font-medium leading-relaxed ${
                      isActive ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-400"
                    }`}
                  >
                    {line.text}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white dark:from-black to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-black to-transparent pointer-events-none" />
      </div>
    </div>
  );
}