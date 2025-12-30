// FILE: src/components/dashboard/studios/QuizStudio.tsx
"use client";

import React, { useState } from "react";
import { 
  HelpCircle, Trophy, BarChart3, RefreshCw, ChevronRight, 
  CheckCircle2, XCircle, X, Loader2, BrainCircuit, Target, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuizStudioProps {
  fileId: string;
  questions: any[];
  isLoading: boolean;
  onGenerate: (count: number) => void;
  onClose: () => void;
}

export default function QuizStudio({ fileId, questions, isLoading, onGenerate, onClose }: QuizStudioProps) {
  const [stage, setStage] = useState<"setup" | "playing" | "report">("setup");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [qCount, setQCount] = useState(5);

  const handleStart = () => {
    onGenerate(qCount);
    setStage("playing");
    setCurrentIndex(0);
    setUserAnswers({});
  };

  const handleSelect = (option: string) => {
    setUserAnswers({ ...userAnswers, [currentIndex]: option });
  };

  const next = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
    else setStage("report");
  };

  const correctCount = questions.filter((q, i) => userAnswers[i] === q.answer).length;
  const score = Math.round((correctCount / questions.length) * 100);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
      {/* HEADER: FIXED HEIGHT */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-4 h-4 text-purple-500" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Quiz Studio</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* CONTENT AREA: FLEX-1 WITH HIDDEN OVERFLOW FOR SCROLLAREA */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full w-full">
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                <p className="text-[10px] font-black uppercase tracking-widest animate-pulse text-zinc-400">Syncing Mastery Data...</p>
              </div>
            ) : stage === "setup" ? (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-8">
                <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                  <HelpCircle className="w-10 h-10 text-zinc-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-bold">Knowledge Check</h2>
                  <p className="text-xs text-zinc-500 leading-relaxed max-w-[220px]">
                    Evaluate your mastery of "{fileId.slice(0, 15)}..." via AI-generated concepts.
                  </p>
                </div>
                <div className="flex gap-2">
                  {[5, 10].map(n => (
                    <Button key={n} variant={qCount === n ? "default" : "outline"} onClick={() => setQCount(n)} className="rounded-full h-8 px-4 text-[10px] font-bold">
                      {n} Qs
                    </Button>
                  ))}
                </div>
                <Button onClick={handleStart} className="w-full rounded-xl h-12 bg-black text-white dark:bg-white dark:text-black font-bold">
                  Start Quiz
                </Button>
              </div>
            ) : stage === "playing" && questions.length > 0 ? (
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-end text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                    <span>Question {currentIndex + 1} / {questions.length}</span>
                    <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
                  </div>
                  <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-1" />
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Badge className="bg-purple-500/10 text-purple-500 border-none text-[8px] uppercase font-black tracking-tighter">
                      {questions[currentIndex].concept || "General"}
                    </Badge>
                    <h3 className="text-base font-semibold leading-snug">{questions[currentIndex].question}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {questions[currentIndex].options.map((opt: string) => (
                      <button 
                        key={opt} 
                        onClick={() => handleSelect(opt)}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left text-sm transition-all duration-200",
                          userAnswers[currentIndex] === opt 
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-black border-transparent shadow-md" 
                            : "bg-white dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={next} 
                  disabled={!userAnswers[currentIndex]} 
                  className="w-full rounded-xl h-12 bg-black text-white dark:bg-white dark:text-black font-bold"
                >
                  {currentIndex === questions.length - 1 ? "View Mastery Report" : "Next Question"}
                </Button>
              </div>
            ) : (
              /* REPORT STAGE: FIXED WIDTH AND PADDING */
              <div className="space-y-8 pb-10">
                <div className="text-center space-y-4 py-6">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-yellow-500/10 blur-2xl rounded-full" />
                    <Trophy className={cn("w-16 h-16 relative z-10", score > 70 ? "text-yellow-500" : "text-zinc-200")} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black">{score}%</h2>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Assessment Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-center">
                    <p className="text-[9px] font-black uppercase text-zinc-400">Correct</p>
                    <p className="text-lg font-bold text-emerald-500">{correctCount}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-center">
                    <p className="text-[9px] font-black uppercase text-zinc-400">Incorrect</p>
                    <p className="text-lg font-bold text-red-500">{questions.length - correctCount}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <BarChart3 className="w-3 h-3" /> Detailed Review
                  </h3>
                  <div className="space-y-3">
                    {questions.map((q, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 space-y-3">
                        <div className="flex gap-3">
                          {userAnswers[i] === q.answer ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-2 flex-1">
                            <p className="text-xs font-bold leading-relaxed">{q.question}</p>
                            <div className="p-3 rounded-lg bg-white dark:bg-black/40 border border-zinc-100 dark:border-zinc-800">
                               <p className="text-[10px] text-zinc-500 leading-normal italic">{q.explanation}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button onClick={() => setStage("setup")} variant="outline" className="w-full rounded-xl h-11 text-xs font-bold">Retake Quiz</Button>
                  <Button onClick={onClose} className="w-full rounded-xl h-11 text-xs font-bold bg-black text-white dark:bg-white dark:text-black">Finish</Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}