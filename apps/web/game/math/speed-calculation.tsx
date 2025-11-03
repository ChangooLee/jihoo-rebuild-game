'use client';

import { useState, useEffect } from 'react';
import type { LearningItem } from '@/lib/types';

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

  const currentItem = items[currentIndex];
  const isComplete = currentIndex >= items.length || remainingTime <= 0;

  useEffect(() => {
    if (currentIndex < items.length && !startTime) {
      setStartTime(Date.now());
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

  const handleComplete = () => {
    onComplete(results);
  };

  if (isComplete) {
    return (
      <div className="text-center">
        <p>완료!</p>
        <p>정답률: {results.filter((r) => r.correct).length} / {results.length}</p>
      </div>
    );
  }

  if (!currentItem) {
    return <div>준비 중...</div>;
  }

  // 문제 텍스트 렌더링
  const problemText = currentItem.stem.type === 'text' 
    ? currentItem.stem.payload 
    : '문제를 표시할 수 없습니다';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="mb-4">
        <p>남은 시간: {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}</p>
        <p>문제 {currentIndex + 1} / {items.length}</p>
      </div>

      <div className="text-4xl font-bold mb-8">
        {problemText}
      </div>

      <div className="mb-4">
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
          className="text-2xl p-4 border-2 border-gray-300 rounded-lg text-center"
        />
      </div>

      <button
        onClick={handleAnswer}
        className="px-8 py-4 bg-blue-500 text-white rounded-lg text-lg font-bold hover:bg-blue-600"
      >
        제출
      </button>
    </div>
  );
}

