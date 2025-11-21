'use client';

import { useState, useEffect, useRef } from 'react';
import type { LearningItem } from '@/lib/types';
import { ttsManager } from '@/modules/audio/tts';
import { sttManager } from '@/modules/audio/stt';
import { db } from '@/lib/db';

export interface SpeakingGameProps {
  items: LearningItem[];
  onComplete: (results: { itemId: string; correct: boolean; latencyMs: number }[]) => void;
}

/**
 * 영어 말하기 게임 (STT)
 */
export function SpeakingGame({ items, onComplete }: SpeakingGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [results, setResults] = useState<{ itemId: string; correct: boolean; latencyMs: number }[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
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
      playExample();
    }
  }, [currentIndex]);

  const playExample = async () => {
    if (!currentItem) return;

    const exampleText = currentItem.stem.type === 'text' || currentItem.stem.type === 'audio'
      ? currentItem.stem.payload
      : '';
    
    await ttsManager.speak(exampleText, { lang: 'en-GB' });
  };

  const startListening = async () => {
    if (!sttManager.isSupported()) {
      alert('음성 인식이 지원되지 않습니다');
      return;
    }

    setIsListening(true);
    setTranscript('');

    try {
      const result = await sttManager.start({ lang: 'en-GB' });
      setTranscript(result);

      // 답안 검증
      if (currentItem && startTime) {
        const latencyMs = Date.now() - startTime;
        const expected = currentItem.answer.value.toLowerCase().trim();
        const actual = result.toLowerCase().trim();
        const isCorrect = actual.includes(expected) || expected.includes(actual);

        setResults((prev) => [
          ...prev,
          { itemId: currentItem.id, correct: isCorrect, latencyMs },
        ]);

        // 다음 문제로
        setTimeout(async () => {
          if (currentIndex + 1 < items.length) {
            setCurrentIndex((prev) => prev + 1);
            setTranscript('');
            setStartTime(null);
          } else {
            // 게임 실행 시간 기록
            if (gameStartTimeRef.current) {
              const durationSec = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
              await db.gameLogs.add({
                gameType: 'speaking',
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
        }, 2000);
      }
    } catch (error) {
      console.error('STT error:', error);
    } finally {
      setIsListening(false);
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

  if (!currentItem) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-foreground text-xl">준비 중...</div>
      </div>
    );
  }

  const promptText = currentItem.stem.type === 'text'
    ? currentItem.stem.payload
    : '다음을 따라 말하세요';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="mb-8 bg-card border border-border/50 rounded-2xl p-6 text-center">
        <p className="text-body-md text-muted-foreground mb-2">
          문제 <span className="text-foreground font-bold">{currentIndex + 1}</span> / {items.length}
        </p>
        <p className="text-label-sm text-muted-foreground">다음 문장을 따라 말하세요</p>
      </div>

      <div className="mb-8 bg-card border border-border/50 rounded-2xl p-8 text-center">
        <div className="text-2xl font-bold text-foreground">
          {promptText}
        </div>
      </div>

      {transcript && (
        <div className="mb-8 bg-primary/10 border border-primary/50 rounded-2xl p-6 max-w-2xl">
          <p className="text-lg text-foreground">
            <span className="text-muted-foreground">인식된 내용:</span> {transcript}
          </p>
        </div>
      )}

      <div className="flex gap-6">
        <button
          onClick={startListening}
          disabled={isListening}
          className={`min-h-[60px] px-12 py-5 rounded-2xl font-bold text-xl transition-all hover:scale-105 shadow-lg ${
            isListening
              ? 'bg-error text-white'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {isListening ? '🎤 듣는 중...' : '🎤 시작'}
        </button>

        <button
          onClick={playExample}
          className="min-h-[60px] px-8 py-5 bg-card border-2 border-border/50 text-foreground rounded-2xl hover:border-primary/50 hover:bg-card/80 transition-all hover:scale-105"
        >
          🔊 다시 듣기
        </button>
      </div>
    </div>
  );
}

