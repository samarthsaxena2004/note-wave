"use client";

import React from "react";
import PodcastStudio from "./studios/PodcastStudio";

export type StudioType = "podcast" | "flashcards" | "quiz" | "summary" | "image" | "video";

interface SidebarRightProps {
  activeStudio: StudioType;
  showRightSidebar: boolean;
  podcastProps: {
    script: any[];
    audioChunks: Blob[]; // NEW
    isGenerating: boolean;
    isPlaying: boolean;
    currentLineIndex: number | null;
    onGenerate: () => void;
    onTogglePlayback: () => void;
    viewportRef: React.RefObject<HTMLDivElement | null>;
  };
}

export default function SidebarRight({
  activeStudio,
  showRightSidebar,
  podcastProps,
}: SidebarRightProps) {
  return (
    <div
      className={`fixed inset-y-0 right-0 z-40 w-[360px] bg-white dark:bg-black border-l border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-[360px] ${
        showRightSidebar ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {activeStudio === "podcast" ? (
        <PodcastStudio
          podcastScript={podcastProps.script}
          audioChunks={podcastProps.audioChunks}
          isGeneratingScript={podcastProps.isGenerating}
          isPlaying={podcastProps.isPlaying}
          currentLineIndex={podcastProps.currentLineIndex}
          handleGenerateScript={podcastProps.onGenerate}
          togglePlayback={podcastProps.onTogglePlayback}
          scriptViewportRef={podcastProps.viewportRef}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
            <span className="text-2xl">✨</span>
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest">{activeStudio} Studio</h3>
        </div>
      )}
    </div>
  );
}