"use client";

import React, { useState } from "react";
import { HelpCircle, Trophy, BarChart3, RefreshCw, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface QuizStudioProps {
  fileId: string;
}

export default function QuizStudio({ fileId }: QuizStudioProps) {
  const [stage, setStage] = useState<"setup" | "playing" | "report">("setup");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [qCount, setQCount] = useState(5);

  const startQuiz = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        body: JSON.stringify({ fileId, count: qCount }),
      });
      const data = await res.json();
      setQuestions(data.questions);
      setStage("playing");
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleSelect = (option: string) => {
    setUserAnswers({ ...userAnswers, [currentIndex]: option });
  };

  const next = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
    else setStage("report");
  };

  // --- SUB-COMPONENTS ---
  if (stage === "setup") return (
    <div className="p-8 flex flex-col items-center justify-center space-y-6 h-full text-center">
      <HelpCircle className="w-12 h-12 text-zinc-300" />
      <div className="space-y-2">
        <h2 className="text-lg font-bold">Knowledge Check</h2>
        <p className="text-xs text-zinc-500">Test your mastery of {fileId}</p>
      </div>
      <div className="flex gap-2">
        {[5, 10, 15].map(n => (
          <Button key={n} variant={qCount === n ? "default" : "outline"} onClick={() => setQCount(n)} className="rounded-full">
            {n} Qs
          </Button>
        ))}
      </div>
      <Button onClick={startQuiz} disabled={isLoading} className="w-full max-w-xs rounded-xl">
        {isLoading ? <RefreshCw className="animate-spin mr-2" /> : "Start Quiz"}
      </Button>
    </div>
  );

  if (stage === "playing") {
    const q = questions[currentIndex];
    return (
      <div className="p-6 space-y-6 flex flex-col h-full">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-zinc-400">Question {currentIndex + 1} of {questions.length}</span>
          <Progress value={((currentIndex + 1) / questions.length) * 100} className="w-32 h-1" />
        </div>
        <h3 className="text-base font-semibold leading-relaxed">{q.question}</h3>
        <div className="space-y-3 flex-1">
          {q.options.map((opt: string) => (
            <div 
              key={opt} 
              onClick={() => handleSelect(opt)}
              className={`p-4 rounded-xl border text-sm cursor-pointer transition-all ${userAnswers[currentIndex] === opt ? "bg-black text-white dark:bg-white dark:text-black border-transparent" : "hover:bg-zinc-50 dark:hover:bg-zinc-900 border-zinc-100 dark:border-zinc-800"}`}
            >
              {opt}
            </div>
          ))}
        </div>
        <Button onClick={next} disabled={!userAnswers[currentIndex]} className="rounded-full">
          {currentIndex === questions.length - 1 ? "Finish" : "Next Question"} <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  }

  // --- REPORT STAGE ---
  const correctCount = questions.filter((q, i) => userAnswers[i] === q.answer).length;
  const score = Math.round((correctCount / questions.length) * 100);

  return (
    <div className="p-6 space-y-8 h-full overflow-y-auto">
      <div className="text-center space-y-2">
        <Trophy className={`w-12 h-12 mx-auto ${score > 70 ? "text-yellow-500" : "text-zinc-300"}`} />
        <h2 className="text-2xl font-bold">{score}%</h2>
        <p className="text-xs text-zinc-500">You got {correctCount} out of {questions.length} correct</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <BarChart3 className="w-3 h-3" /> Detailed Review
        </h3>
        {questions.map((q, i) => (
          <div key={i} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 space-y-2">
            <div className="flex gap-2">
              {userAnswers[i] === q.answer ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-500 mt-0.5" />}
              <p className="text-xs font-medium leading-relaxed">{q.question}</p>
            </div>
            <p className="text-[10px] text-zinc-500 italic pl-6">{q.explanation}</p>
          </div>
        ))}
      </div>
      <Button onClick={() => setStage("setup")} variant="outline" className="w-full rounded-xl">Restart</Button>
    </div>
  );
}