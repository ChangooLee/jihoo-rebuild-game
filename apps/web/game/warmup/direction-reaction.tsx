'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';

export interface DirectionReactionResult {
  correct: number;
  incorrect: number;
  avgReactionTime: number;
}

export interface DirectionReactionGameProps {
  onComplete: (result: DirectionReactionResult) => void;
  duration?: number; // 초 단위, 기본 90초
}

type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * 방향 반응 게임 - 워밍업 과제
 * 화살표 방향에 맞게 키 입력
 */
export function DirectionReactionGame({ onComplete, duration = 90 }: DirectionReactionGameProps) {
  const [currentTrial, setCurrentTrial] = useState(0);
  const [currentDirection, setCurrentDirection] = useState<Direction | null>(null);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(duration);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const gameStartTimeRef = useRef<number | null>(null);
  
  // Initialize game start time
  useEffect(() => {
    if (!gameStartTimeRef.current) {
      gameStartTimeRef.current = Date.now();
    }
  }, []);

  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  const directionMap: Record<Direction, { key: string; icon: typeof ArrowUp; label: string }> = {
    up: { key: 'ArrowUp', icon: ArrowUp, label: '↑' },
    down: { key: 'ArrowDown', icon: ArrowDown, label: '↓' },
    left: { key: 'ArrowLeft', icon: ArrowLeft, label: '←' },
    right: { key: 'ArrowRight', icon: ArrowRight, label: '→' },
  };

  useEffect(() => {
    if (remainingTime <= 0) {
      const avgReactionTime = reactionTimes.length > 0
        ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
        : 0;
      // 게임 실행 시간 기록
      if (gameStartTimeRef.current) {
        const durationSec = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
        db.gameLogs.add({
          gameType: 'direction-reaction',
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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!currentDirection || !startTime) return;

      const expectedKey = directionMap[currentDirection].key;
      const isCorrect = e.key === expectedKey;

      const reactionTime = Date.now() - startTime;
      setReactionTimes((prev) => [...prev, reactionTime]);
      setShowFeedback(isCorrect ? 'correct' : 'incorrect');

      if (isCorrect) {
        setCorrect((prev) => prev + 1);
      } else {
        setIncorrect((prev) => prev + 1);
      }

      // 0.5초 후 다음 문제로
      setTimeout(() => {
        setCurrentTrial((prev) => prev + 1);
        setShowFeedback(null);
      }, 500);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentDirection, startTime, correct, incorrect]);

  const generateNewTrial = () => {
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    setCurrentDirection(randomDirection);
    setStartTime(Date.now());
    setShowFeedback(null);
  };

  const DirectionIcon = currentDirection ? directionMap[currentDirection].icon : ArrowUp;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="mb-4 text-center">
        <p className="text-lg font-semibold">남은 시간: {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}</p>
        <p className="text-sm text-gray-600">정답: {correct} / 오답: {incorrect}</p>
      </div>

      <div className="mb-8 text-center">
        <p className="text-sm text-gray-500 mb-6">화살표 방향에 맞는 키를 누르세요</p>
        {currentDirection && (
          <div className="relative">
            <div
              className={`text-9xl font-bold transition-all duration-200 ${
                showFeedback === 'correct'
                  ? 'text-green-500 scale-110'
                  : showFeedback === 'incorrect'
                  ? 'text-red-500 scale-90'
                  : 'text-blue-600'
              }`}
            >
              <DirectionIcon className="w-48 h-48 mx-auto" />
            </div>
            {showFeedback && (
              <div
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold ${
                  showFeedback === 'correct' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {showFeedback === 'correct' ? '✓' : '✗'}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400 mb-2">키보드 화살표 키를 사용하세요</p>
        <div className="flex gap-2 justify-center">
          <kbd className="px-3 py-2 bg-gray-200 rounded text-sm">↑</kbd>
          <kbd className="px-3 py-2 bg-gray-200 rounded text-sm">↓</kbd>
          <kbd className="px-3 py-2 bg-gray-200 rounded text-sm">←</kbd>
          <kbd className="px-3 py-2 bg-gray-200 rounded text-sm">→</kbd>
        </div>
      </div>
    </div>
  );
}

