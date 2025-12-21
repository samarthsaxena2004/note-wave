"use client";

import React, { useState } from "react";
import { 
  LayoutList, RefreshCw, ChevronLeft, ChevronRight, 
  RotateCcw, BrainCircuit, Loader2, X, Plus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Ensure this exists or use standard textarea

interface FlashcardsStudioProps {
  cards: any[];
  isLoading: boolean;
  onGenerate: () => void;
  onClose: () => void;
  onAddCard: (card: { question: string; answer: string }) => void; // New Prop
}

export default function FlashcardsStudio({ cards, isLoading, onGenerate, onClose, onAddCard }: FlashcardsStudioProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Custom Card State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 100);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length), 100);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.trim() || !newA.trim()) return;
    onAddCard({ question: newQ, answer: newA });
    setNewQ("");
    setNewA("");
    setIsAddOpen(false);
    // Jump to the new card
    setTimeout(() => setCurrentIndex(cards.length), 100); 
  };

  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black">
      {/* HEADER */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800 flex-none">
        <div className="flex items-center gap-3">
          <LayoutList className="w-4 h-4 text-zinc-500" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Flashcard Studio</h2>
        </div>
        <div className="flex items-center gap-1">
          {/* ADD CARD BUTTON */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-zinc-900 dark:border-zinc-800">
              <DialogHeader>
                <DialogTitle>Create Custom Flashcard</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveCard} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-zinc-500">Question</label>
                  <Input 
                    value={newQ} onChange={(e) => setNewQ(e.target.value)} 
                    placeholder="e.g., What is the powerhouse of the cell?"
                    className="dark:bg-zinc-950"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-zinc-500">Answer</label>
                  <Textarea 
                    value={newA} onChange={(e) => setNewA(e.target.value)} 
                    placeholder="e.g., The Mitochondria."
                    className="dark:bg-zinc-950"
                  />
                </div>
                <Button type="submit" className="w-full bg-zinc-900 text-white dark:bg-white dark:text-black">Save Card</Button>
              </form>
            </DialogContent>
          </Dialog>

          {cards.length > 0 && (
            <Button variant="ghost" size="icon" onClick={onGenerate} disabled={isLoading} className="h-8 w-8 text-zinc-400">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        {cards.length > 0 ? (
          <div className="flex-1 flex flex-col">
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Deck Progress</span>
                <span className="text-[10px] font-mono text-zinc-400">{currentIndex + 1} / {cards.length}</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>

            <div className="relative flex-1 perspective-1000 group py-4" onClick={() => setIsFlipped(!isFlipped)}>
              <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? "rotate-y-180" : ""}`}>
                <Card className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 text-center border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-[2rem] shadow-sm">
                  <Badge variant="outline" className="mb-4 opacity-50 text-[9px]">QUESTION</Badge>
                  <p className="text-lg font-medium leading-relaxed">{cards[currentIndex].question}</p>
                  <div className="absolute bottom-6 flex items-center gap-2 text-zinc-400 text-[9px] uppercase font-bold tracking-widest">
                    <RotateCcw className="w-3 h-3" /> Tap to Flip
                  </div>
                </Card>

                <Card className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 text-center border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 rounded-[2rem] shadow-xl">
                  <Badge variant="outline" className="mb-4 opacity-30 border-white dark:border-black text-white dark:text-black text-[9px]">ANSWER</Badge>
                  <p className="text-lg font-medium leading-relaxed text-white dark:text-zinc-900">{cards[currentIndex].answer}</p>
                </Card>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8">
              <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); prevCard(); }} className="rounded-full h-10 w-10"><ChevronLeft className="w-5 h-5" /></Button>
              <div className="flex gap-1.5">
                 <div className={`h-1 w-4 rounded-full transition-all ${isFlipped ? 'bg-zinc-200 dark:bg-zinc-800' : 'bg-zinc-900 dark:bg-white'}`} />
                 <div className={`h-1 w-4 rounded-full transition-all ${isFlipped ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
              </div>
              <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); nextCard(); }} className="rounded-full h-10 w-10"><ChevronRight className="w-5 h-5" /></Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <BrainCircuit className="w-12 h-12 text-zinc-200 dark:text-zinc-800" />
            <p className="text-xs text-zinc-500">Extract cards or add one manually.</p>
            <div className="flex gap-2">
                <Button onClick={onGenerate} disabled={isLoading} className="rounded-full px-6 dark:bg-white dark:text-black">{isLoading ? <Loader2 className="animate-spin" /> : "Generate Deck"}</Button>
                <Button variant="outline" onClick={() => setIsAddOpen(true)} className="rounded-full px-6">Add Manual</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}