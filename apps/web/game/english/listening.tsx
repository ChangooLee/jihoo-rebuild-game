'use client';

import { useState, useEffect, useRef } from 'react';
import type { LearningItem } from '@/lib/types';
import { ttsManager } from '@/modules/audio/tts';
import { db } from '@/lib/db';

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
  const gameStartTimeRef = useRef<number | null>(null);

  const currentItem = items[currentIndex];
  const isComplete = currentIndex >= items.length;

  useEffect(() => {
    if (currentIndex < items.length && !startTime) {
      const now = Date.now();
      setStartTime(now);
      if (!gameStartTimeRef.current) {
        gameStartTimeRef.current = now;
      }
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
    setTimeout(async () => {
      if (currentIndex + 1 < items.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedChoice(null);
        setStartTime(null);
      } else {
        // 게임 실행 시간 기록
        if (gameStartTimeRef.current) {
          const durationSec = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
          await db.gameLogs.add({
            gameType: 'listening',
            subject: 'english',
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

  if (!currentItem) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-foreground text-xl">준비 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="mb-8 bg-card border border-border/50 rounded-2xl p-6 text-center">
        <p className="text-body-md text-muted-foreground mb-2">
          문제 <span className="text-foreground font-bold">{currentIndex + 1}</span> / {items.length}
        </p>
        <p className="text-label-sm text-muted-foreground">영어를 듣고 올바른 답을 선택하세요</p>
      </div>

      <div className="mb-12">
        <button
          onClick={playAudio}
          disabled={isPlaying}
          className="min-h-[60px] px-12 py-5 bg-primary text-primary-foreground rounded-2xl font-bold text-xl hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-all hover:scale-105 shadow-lg"
        >
          {isPlaying ? '🔊 재생 중...' : '🔊 다시 듣기'}
        </button>
      </div>

      {currentItem.choices && (
        <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
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
                className={`min-h-[80px] p-6 rounded-2xl font-bold text-lg transition-all hover:scale-105 ${buttonClass} disabled:opacity-75`}
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

