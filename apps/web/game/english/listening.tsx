'use client';

import { useState, useEffect } from 'react';
import type { LearningItem } from '@/lib/types';
import { ttsManager } from '@/modules/audio/tts';

export interface ListeningGameProps {
  items: LearningItem[];
  onComplete: (results: { itemId: string; correct: boolean; latencyMs: number }[]) => void;
}

/**
 * 영어 듣기 게임 (TTS en-GB)
 */
export function ListeningGame({ items, onComplete }: ListeningGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [results, setResults] = useState<{ itemId: string; correct: boolean; latencyMs: number }[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentItem = items[currentIndex];
  const isComplete = currentIndex >= items.length;

  useEffect(() => {
    if (currentIndex < items.length && !startTime) {
      setStartTime(Date.now());
      playAudio();
    }
  }, [currentIndex]);

  const playAudio = async () => {
    if (!currentItem) return;

    setIsPlaying(true);
    const audioText = currentItem.stem.type === 'audio' || currentItem.stem.type === 'text'
      ? currentItem.stem.payload
      : '';
    
    try {
      await ttsManager.speak(audioText, { lang: 'en-GB' });
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleChoice = (choiceId: string) => {
    if (!currentItem || !startTime || selectedChoice) return;

    const latencyMs = Date.now() - startTime;
    const isCorrect = choiceId === currentItem.answer.value;

    setResults((prev) => [
      ...prev,
      { itemId: currentItem.id, correct: isCorrect, latencyMs },
    ]);

    setSelectedChoice(choiceId);

    // 1초 후 다음 문제로
    setTimeout(() => {
      if (currentIndex + 1 < items.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedChoice(null);
        setStartTime(null);
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

  if (!currentItem) {
    return <div>준비 중...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="mb-4">
        <p>문제 {currentIndex + 1} / {items.length}</p>
        <p className="text-sm text-gray-500">영어를 듣고 올바른 답을 선택하세요</p>
      </div>

      <div className="mb-8">
        <button
          onClick={playAudio}
          disabled={isPlaying}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isPlaying ? '재생 중...' : '🔊 다시 듣기'}
        </button>
      </div>

      {currentItem.choices && (
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {currentItem.choices.map((choice) => {
            const isSelected = selectedChoice === choice.id;
            const isCorrect = currentItem.answer.value === choice.id;
            let bgColor = 'bg-gray-100 hover:bg-gray-200';

            if (isSelected) {
              bgColor = isCorrect ? 'bg-green-500' : 'bg-red-500';
            }

            return (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                disabled={!!selectedChoice}
                className={`p-6 rounded-lg font-bold text-lg ${bgColor} text-white transition-colors disabled:opacity-75`}
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

