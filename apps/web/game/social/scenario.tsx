'use client';

import { useState, useRef } from 'react';
import type { LearningItem } from '@/lib/types';
import { db } from '@/lib/db';

export interface ScenarioGameProps {
  items: LearningItem[];
  onComplete: (results: { itemId: string; correct: boolean; latencyMs: number }[]) => void;
}

/**
 * 사회 시나리오 선택형 게임
 */
export function ScenarioGame({ items, onComplete }: ScenarioGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [results, setResults] = useState<{ itemId: string; correct: boolean; latencyMs: number }[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const gameStartTimeRef = useRef<number | null>(null);
  
  // Initialize game start time
  if (!gameStartTimeRef.current) {
    gameStartTimeRef.current = Date.now();
  }

  const currentItem = items[currentIndex];
  const isComplete = currentIndex >= items.length;

  const handleChoice = (choiceId: string) => {
    if (!currentItem || selectedChoice) return;

    const latencyMs = Date.now() - startTime;
    const isCorrect = choiceId === currentItem.answer.value;

    setResults((prev) => [
      ...prev,
      { itemId: currentItem.id, correct: isCorrect, latencyMs },
    ]);

    setSelectedChoice(choiceId);

    setTimeout(async () => {
      if (currentIndex + 1 < items.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedChoice(null);
        setStartTime(Date.now());
      } else {
        // 게임 실행 시간 기록
        if (gameStartTimeRef.current) {
          const durationSec = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
          await db.gameLogs.add({
            gameType: 'scenario',
            subject: 'social',
            startTime: gameStartTimeRef.current,
            durationSec,
            result: {
              totalItems: items.length,
              correct: results.filter((r) => r.correct).length,
              incorrect: results.filter((r) => !r.correct).length,
            },
            completed: true,
          });
        }
        onComplete(results);
      }
    }, 1000);
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
          <h2 className="text-headline-md text-foreground mb-4">완료! 🎉</h2>
          <p className="text-body-md text-muted-foreground mb-2">
            정답률: <span className="text-success font-bold text-xl">{results.filter((r) => r.correct).length}</span> / {results.length}
          </p>
        </div>
      </div>
    );
  }

  if (!currentItem) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-foreground text-xl">준비 중...</div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="mb-8 bg-card border border-border/50 rounded-2xl p-6 text-center">
        <p className="text-body-md text-muted-foreground">
          문제 <span className="text-foreground font-bold">{currentIndex + 1}</span> / {items.length}
        </p>
      </div>
      
      <div className="mb-12 bg-card border border-border/50 rounded-2xl p-8 max-w-2xl">
        <div className="text-xl text-foreground leading-relaxed">
          {currentItem.stem.type === 'text' ? currentItem.stem.payload : '시나리오를 읽고 올바른 선택을 하세요'}
        </div>
      </div>

      {currentItem.choices && (
        <div className="w-full max-w-2xl space-y-4">
          {currentItem.choices.map((choice) => {
            const isSelected = selectedChoice === choice.id;
            const isCorrect = currentItem.answer.value === choice.id;
            let buttonClass = 'bg-card border-2 border-border/50 text-foreground hover:border-primary/50 hover:bg-card/80';

            if (isSelected) {
              buttonClass = isCorrect 
                ? 'bg-success/20 border-2 border-success text-success' 
                : 'bg-error/20 border-2 border-error text-error';
            }

            return (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                disabled={!!selectedChoice}
                className={`w-full min-h-[80px] p-6 rounded-2xl text-left font-bold text-lg transition-all hover:scale-105 ${buttonClass} disabled:opacity-75`}
              >
                {choice.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

