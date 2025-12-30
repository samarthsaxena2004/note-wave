// FILE: src/components/dashboard/studios/GraphStudio.tsx
"use client";

import React, { useMemo, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card } from "@/components/ui/card";
import { Loader2, Zap, Share2, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- DYNAMIC IMPORT REPAIR ---
// We explicitly return the component to ensure next/dynamic sees the class/function
const ForceGraph3D = dynamic(
  () => import('react-force-graph-3d').then((mod) => mod.ForceGraph3D || mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
        <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Waking 3D Engine...</p>
      </div>
    )
  }
);

interface GraphStudioProps {
  data: any;
  isLoading: boolean;
  onNodeClick: (node: any) => void;
}

export default function GraphStudio({ data, isLoading, onNodeClick }: GraphStudioProps) {
  const fgRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleZoom = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(600, 100);
    }
  };

  // Check if we have valid data
  const hasData = mounted && data?.nodes && Array.isArray(data.nodes) && data.nodes.length > 0;

  if (isLoading || !mounted) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Mapping Knowledge Orbs...</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-8 text-center space-y-4">
        <div className="relative">
          <Zap className="w-12 h-12 opacity-10" />
          <Loader2 className="w-4 h-4 animate-spin absolute -top-1 -right-1 opacity-40" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">No Data Detected</p>
          <p className="text-[10px] opacity-60">Generate a graph via /graph to begin visualization.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-zinc-50/20 dark:bg-zinc-950/20 overflow-hidden">
      {/* RENDER THE DYNAMIC COMPONENT DIRECTLY */}
      <ForceGraph3D
        ref={fgRef}
        graphData={data}
        nodeLabel="name"
        nodeAutoColorBy="group"
        onNodeClick={onNodeClick}
        backgroundColor="#00000000"
        nodeRelSize={6}
        linkWidth={1.5}
        linkOpacity={0.4}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        showNavInfo={false}
      />
      
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <Card className="p-4 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-zinc-200 dark:border-zinc-800 shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Quantum Weaver</span>
          </div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Conceptual Memory Graph</h4>
        </Card>
      </div>

      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleZoom}
          className="rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md h-10 w-10 shadow-xl border-zinc-200 dark:border-zinc-800"
        >
          <ZoomIn className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md h-10 w-10 shadow-xl border-zinc-200 dark:border-zinc-800"
        >
          <Share2 className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
        </Button>
      </div>
    </div>
  );
}