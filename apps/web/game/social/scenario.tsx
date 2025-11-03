'use client';

import { useState } from 'react';
import type { LearningItem } from '@/lib/types';

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

    setTimeout(() => {
      if (currentIndex + 1 < items.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedChoice(null);
        setStartTime(Date.now());
      } else {
        onComplete(results);
      }
    }, 1000);
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
      
      <div className="mb-8 text-xl max-w-2xl">
        {currentItem.stem.type === 'text' ? currentItem.stem.payload : '시나리오를 읽고 올바른 선택을 하세요'}
      </div>

      {currentItem.choices && (
        <div className="w-full max-w-2xl space-y-4">
          {currentItem.choices.map((choice) => {
            const isSelected = selectedChoice === choice.id;
            const isCorrect = currentItem.answer.value === choice.id;
            let bgColor = 'bg-gray-100 hover:bg-gray-200';

            if (isSelected) {
              bgColor = isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
            }

            return (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                disabled={!!selectedChoice}
                className={`w-full p-6 rounded-lg text-left font-bold ${bgColor} transition-colors disabled:opacity-75`}
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

