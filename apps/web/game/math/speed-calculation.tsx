'use client';

import { useState, useEffect, useRef } from 'react';
import type { LearningItem } from '@/lib/types';
import { db } from '@/lib/db';
import { MathRenderer } from '@/components/MathRenderer';

export interface SpeedCalculationProps {
  items: LearningItem[];
  onComplete: (results: { itemId: string; correct: boolean; latencyMs: number }[]) => void;
  timeLimit?: number; // 초 단위, 기본 3분
}

/**
 * 수학 스피드 연산 게임
 */
export function SpeedCalculation({
  items,
  onComplete,
  timeLimit = 180,
}: SpeedCalculationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [results, setResults] = useState<{ itemId: string; correct: boolean; latencyMs: number }[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(timeLimit);
  const gameStartTimeRef = useRef<number | null>(null);

  const currentItem = items[currentIndex];
  const isComplete = currentIndex >= items.length || remainingTime <= 0;

  useEffect(() => {
    if (currentIndex < items.length && !startTime) {
      const now = Date.now();
      setStartTime(now);
      if (!gameStartTimeRef.current) {
        gameStartTimeRef.current = now;
      }
    }
  }, [currentIndex, items.length, startTime]);

  useEffect(() => {
    if (remainingTime <= 0 || isComplete) {
      if (!isComplete) {
        handleComplete();
      }
      return;
    }

    const interval = setInterval(() => {
      setRemainingTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime, isComplete]);

  const handleAnswer = () => {
    if (!currentItem || !startTime) return;

    const latencyMs = Date.now() - startTime;
    let isCorrect = false;

    // 답안 검증 (간단한 수식 평가)
    if (currentItem.answer.kind === 'short') {
      try {
        const expected = Number(currentItem.answer.value);
        const actual = Number(userAnswer);
        isCorrect = Math.abs(expected - actual) < 0.01;
      } catch {
        isCorrect = false;
      }
    } else if (currentItem.answer.kind === 'mcq') {
      isCorrect = userAnswer === currentItem.answer.value;
    }

    setResults((prev) => [
      ...prev,
      { itemId: currentItem.id, correct: isCorrect, latencyMs },
    ]);

    // 다음 문제로
    if (currentIndex + 1 < items.length) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer('');
      setStartTime(Date.now());
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    // 게임 실행 시간 기록
    if (gameStartTimeRef.current) {
      const durationSec = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      await db.gameLogs.add({
        gameType: 'speed-calculation',
        subject: 'math',
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

  if (!currentItem) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-foreground text-xl">준비 중...</div>
      </div>
    );
  }

  // 문제 텍스트 렌더링
  const problemText = currentItem.stem.type === 'text' 
    ? currentItem.stem.payload 
    : '문제를 표시할 수 없습니다';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="mb-8 bg-card border border-border/50 rounded-2xl p-6 text-center">
        <p className="text-lg font-semibold text-foreground mb-2">
          남은 시간: {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
        </p>
        <p className="text-body-md text-muted-foreground">
          문제 {currentIndex + 1} / {items.length}
        </p>
      </div>

      <div className="mb-12 bg-card border border-border/50 rounded-2xl p-8 text-center">
        <div className="text-4xl font-bold text-foreground">
          <MathRenderer content={problemText} />
        </div>
      </div>

      <div className="mb-8 w-full max-w-md">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAnswer();
            }
          }}
          autoFocus
          className="w-full text-2xl p-6 border-2 border-border bg-card text-foreground rounded-2xl text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="답을 입력하세요"
        />
      </div>

      <button
        onClick={handleAnswer}
        className="min-h-[60px] px-12 py-5 bg-primary text-primary-foreground rounded-2xl text-xl font-bold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
      >
        제출 ✓
      </button>
    </div>
  );
}

