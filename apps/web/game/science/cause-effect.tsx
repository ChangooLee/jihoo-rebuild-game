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
      <div className="text-center">
        <p>완료!</p>
        <p>정답률: {results.filter((r) => r.correct).length} / {results.length}</p>
      </div>
    );
  }

  if (!currentItem) return <div>준비 중...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <p>문제 {currentIndex + 1} / {items.length}</p>
      <div className="mb-8 text-xl">
        {currentItem.stem.type === 'text' ? currentItem.stem.payload : '원인과 결과를 연결하세요'}
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        <div>
          <h3 className="font-bold mb-4">원인</h3>
          {['원인 1', '원인 2', '원인 3'].map((cause, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCause(String(idx))}
              className={`w-full p-4 mb-2 rounded-lg ${
                selectedCause === String(idx) ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              {cause}
            </button>
          ))}
        </div>

        <div>
          <h3 className="font-bold mb-4">결과</h3>
          {['결과 1', '결과 2', '결과 3'].map((effect, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedEffect(String(idx))}
              className={`w-full p-4 mb-2 rounded-lg ${
                selectedEffect === String(idx) ? 'bg-blue-500 text-white' : 'bg-gray-200'
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
        className="mt-8 px-8 py-4 bg-blue-500 text-white rounded-lg font-bold disabled:bg-gray-400"
      >
        확인
      </button>
    </div>
  );
}

