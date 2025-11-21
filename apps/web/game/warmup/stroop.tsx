'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/db';

export interface StroopResult {
  correct: number;
  incorrect: number;
  avgReactionTime: number;
}

export interface StroopTaskProps {
  onComplete: (result: StroopResult) => void;
  duration?: number; // 초 단위, 기본 90초
}

/**
 * Stroop 테스트 - 워밍업 과제
 * 색상 이름과 실제 색이 다른 경우 반응시간 측정
 */
export function StroopTask({ onComplete, duration = 90 }: StroopTaskProps) {
  const [currentTrial, setCurrentTrial] = useState(0);
  const [word, setWord] = useState('');
  const [color, setColor] = useState('');
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(duration);
  const gameStartTimeRef = useRef<number | null>(null);
  
  // Initialize game start time
  useEffect(() => {
    if (!gameStartTimeRef.current) {
      gameStartTimeRef.current = Date.now();
    }
  }, []);

  const colors = ['red', 'blue', 'green', 'yellow'];
  const colorNames = ['빨강', '파랑', '초록', '노랑'];

  useEffect(() => {
    if (remainingTime <= 0) {
      const avgReactionTime = reactionTimes.length > 0
        ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
        : 0;
      // 게임 실행 시간 기록
      if (gameStartTimeRef.current) {
        const durationSec = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
        db.gameLogs.add({
          gameType: 'stroop',
          subject: 'warmup',
          startTime: gameStartTimeRef.current,
          durationSec,
          result: { correct, incorrect, avgReactionTime },
          completed: true,
        });
      }
      onComplete({ correct, incorrect, avgReactionTime });
      return;
    }

    const interval = setInterval(() => {
      setRemainingTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime, correct, incorrect, reactionTimes, onComplete]);

  useEffect(() => {
    generateNewTrial();
  }, [currentTrial]);

  const generateNewTrial = () => {
    const wordIndex = Math.floor(Math.random() * colorNames.length);
    const colorIndex = Math.floor(Math.random() * colors.length);
    
    // 50% 확률로 일치/불일치
    const isMatch = Math.random() > 0.5;
    const finalColorIndex = isMatch ? wordIndex : colorIndex;

    setWord(colorNames[wordIndex]);
    setColor(colors[finalColorIndex]);
    setStartTime(Date.now());
  };

  const handleResponse = (isMatch: boolean) => {
    if (!startTime) return;

    const reactionTime = Date.now() - startTime;
    setReactionTimes((prev) => [...prev, reactionTime]);

    const expected = word === colorNames[colors.indexOf(color)];
    if (isMatch === expected) {
      setCorrect((prev) => prev + 1);
    } else {
      setIncorrect((prev) => prev + 1);
    }

    setCurrentTrial((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="mb-8 bg-card border border-border/50 rounded-2xl p-6 text-center">
        <p className="text-lg font-semibold text-foreground mb-2">
          남은 시간: {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
        </p>
        <p className="text-body-md text-muted-foreground">
          정답: <span className="text-success font-bold">{correct}</span> / 오답: <span className="text-error font-bold">{incorrect}</span>
        </p>
      </div>

      <div className="mb-12 text-center">
        <p className="text-label-sm text-muted-foreground mb-6">단어의 의미와 색상이 일치하는지 판단하세요</p>
        <div
          className="text-8xl font-bold mb-4"
          style={{ color: color }}
        >
          {word}
        </div>
      </div>

      <div className="flex gap-6">
        <button
          onClick={() => handleResponse(true)}
          className="min-h-[60px] px-12 py-5 bg-success text-white rounded-2xl font-bold text-xl hover:bg-success/90 transition-all hover:scale-105 shadow-lg"
        >
          ⭕ 일치
        </button>
        <button
          onClick={() => handleResponse(false)}
          className="min-h-[60px] px-12 py-5 bg-error text-white rounded-2xl font-bold text-xl hover:bg-error/90 transition-all hover:scale-105 shadow-lg"
        >
          ❌ 불일치
        </button>
      </div>
    </div>
  );
}

