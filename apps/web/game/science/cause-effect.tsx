'use client';

import { useState, useRef } from 'react';
import type { LearningItem } from '@/lib/types';
import { db } from '@/lib/db';

export interface CauseEffectProps {
  items: LearningItem[];
  onComplete: (results: { itemId: string; correct: boolean; latencyMs: number }[]) => void;
}

/**
 * 과학 원인-결과 연결 게임
 */
export function CauseEffect({ items, onComplete }: CauseEffectProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [results, setResults] = useState<{ itemId: string; correct: boolean; latencyMs: number }[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const gameStartTimeRef = useRef<number | null>(null);
  
  // Initialize game start time
  if (!gameStartTimeRef.current) {
    gameStartTimeRef.current = Date.now();
  }

  const currentItem = items[currentIndex];
  const isComplete = currentIndex >= items.length;

  const handleSubmit = async () => {
    if (!selectedCause || !selectedEffect || !currentItem) return;

    const latencyMs = Date.now() - startTime;
    // 간단한 검증 (실제로는 answer.value에 맞춰야 함)
    const isCorrect = selectedCause === 'cause' && selectedEffect === 'effect';

    setResults((prev) => [
      ...prev,
      { itemId: currentItem.id, correct: isCorrect, latencyMs },
    ]);

    if (currentIndex + 1 < items.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedCause(null);
      setSelectedEffect(null);
      setStartTime(Date.now());
    } else {
      // 게임 실행 시간 기록
      if (gameStartTimeRef.current) {
        const durationSec = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
        await db.gameLogs.add({
          gameType: 'cause-effect',
          subject: 'science',
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

      <div className="mb-12 bg-card border border-border/50 rounded-2xl p-8 text-center max-w-2xl">
        <div className="text-xl text-foreground">
          {currentItem.stem.type === 'text' ? currentItem.stem.payload : '원인과 결과를 연결하세요'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 w-full max-w-4xl mb-8">
        <div>
          <h3 className="font-bold text-foreground text-lg mb-4 text-center">원인</h3>
          {['원인 1', '원인 2', '원인 3'].map((cause, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCause(String(idx))}
              className={`w-full p-6 mb-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 ${
                selectedCause === String(idx) 
                  ? 'bg-primary text-primary-foreground border-2 border-primary' 
                  : 'bg-card border-2 border-border/50 text-foreground hover:border-primary/50'
              }`}
            >
              {cause}
            </button>
          ))}
        </div>

        <div>
          <h3 className="font-bold text-foreground text-lg mb-4 text-center">결과</h3>
          {['결과 1', '결과 2', '결과 3'].map((effect, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedEffect(String(idx))}
              className={`w-full p-6 mb-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 ${
                selectedEffect === String(idx) 
                  ? 'bg-accent text-primary-foreground border-2 border-accent' 
                  : 'bg-card border-2 border-border/50 text-foreground hover:border-accent/50'
              }`}
            >
              {effect}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedCause || !selectedEffect}
        className="min-h-[60px] px-12 py-5 bg-primary text-primary-foreground rounded-2xl font-bold text-xl hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-all hover:scale-105 shadow-lg"
      >
        확인 ✓
      </button>
    </div>
  );
}

