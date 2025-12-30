// FILE: src/components/dashboard/SidebarRight.tsx
"use client";

import React from "react";
import { Sparkles, Headphones, LayoutList, BrainCircuit, MessageSquare, Zap } from "lucide-react";
import PodcastStudio from "./studios/PodcastStudio";
import FlashcardsStudio from "./studios/FlashcardsStudio";
import GraphStudio from "./studios/GraphStudio";

export type StudioType = "podcast" | "flashcards" | "graph" | "quiz" | "summary" | "none";

interface SidebarRightProps {
  activeStudio: StudioType;
  showRightSidebar: boolean;
  isWide: boolean;
  toggleSidebar: () => void;
  podcastProps?: any;
  flashcardProps?: any;
  graphProps?: any;
}

export default function SidebarRight({
  activeStudio,
  showRightSidebar,
  isWide,
  podcastProps = {},
  flashcardProps = {},
  graphProps = {},
}: SidebarRightProps) {
  const widthClass = !showRightSidebar ? "w-0 border-l-0" : isWide ? "w-[650px]" : "w-[360px]";

  return (
    <div className={`relative h-full bg-white dark:bg-black border-l border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-300 ease-in-out ${widthClass}`}>
      <div className={`flex flex-col h-full overflow-hidden ${!showRightSidebar ? "opacity-0 invisible" : "opacity-100 visible"}`}>
        
        {activeStudio === "none" && (
          <div className="flex-1 flex flex-col p-8 space-y-8 justify-center">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-zinc-900 dark:text-white" />
              </div>
              <h3 className="text-lg font-bold">Studio Hub</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Select a specialized AI tool to process your document in new ways.</p>
            </div>

            <div className="grid gap-3">
              <FeatureItem icon={<Zap className="w-4 h-4" />} title="Knowledge Graph" desc="3D interaction with concepts" />
              <FeatureItem icon={<Headphones className="w-4 h-4" />} title="Podcast" desc="Turn text into engaging audio" />
              <FeatureItem icon={<LayoutList className="w-4 h-4" />} title="Flashcards" desc="Extract key study concepts" />
              <FeatureItem icon={<BrainCircuit className="w-4 h-4" />} title="Quiz" desc="Test your knowledge" />
            </div>
            
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest text-center pt-4">Type / to launch</p>
          </div>
        )}

        {activeStudio === "podcast" && (
          <PodcastStudio 
            podcastScript={podcastProps.script || []} 
            audioChunks={podcastProps.audioChunks || []}
            {...podcastProps} 
          />
        )}

        {activeStudio === "flashcards" && (
          <FlashcardsStudio 
            cards={flashcardProps.cards || []} 
            {...flashcardProps} 
            onClose={() => {}} 
          />
        )}

        {activeStudio === "graph" && (
          <GraphStudio 
            data={graphProps.data} 
            isLoading={graphProps.isLoading} 
            onNodeClick={graphProps.onNodeClick} 
          />
        )}

        {!["podcast", "flashcards", "graph", "none"].includes(activeStudio) && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest">{activeStudio} Studio</h3>
            <p className="text-xs text-zinc-500 italic">This studio is currently under maintenance.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
      <div className="mt-0.5 text-zinc-400">{icon}</div>
      <div className="space-y-0.5">
        <p className="text-xs font-bold">{title}</p>
        <p className="text-[10px] text-zinc-500 leading-tight">{desc}</p>
      </div>
    </div>
  );
}