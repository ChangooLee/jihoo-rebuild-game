'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/db';

export interface ColorMatchResult {
  correct: number;
  incorrect: number;
  avgReactionTime: number;
}

export interface ColorMatchGameProps {
  onComplete: (result: ColorMatchResult) => void;
  duration?: number; // 초 단위, 기본 90초
}

const COLORS = [
  { name: '빨강', value: '#ef4444' },
  { name: '파랑', value: '#3b82f6' },
  { name: '초록', value: '#22c55e' },
  { name: '노랑', value: '#eab308' },
  { name: '보라', value: '#a855f7' },
  { name: '주황', value: '#f97316' },
];

/**
 * 색상 매칭 게임 - 워밍업 과제
 * 빠르게 나타나는 색상 중 목표 색상 클릭
 */
export function ColorMatchGame({ onComplete, duration = 90 }: ColorMatchGameProps) {
  const [currentTrial, setCurrentTrial] = useState(0);
  const [targetColor, setTargetColor] = useState<string>('');
  const [displayedColors, setDisplayedColors] = useState<string[]>([]);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(duration);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showColors, setShowColors] = useState(false);
  const gameStartTimeRef = useRef<number | null>(null);
  
  // Initialize game start time
  useEffect(() => {
    if (!gameStartTimeRef.current) {
      gameStartTimeRef.current = Date.now();
    }
  }, []);

  useEffect(() => {
    if (remainingTime <= 0) {
      const avgReactionTime = reactionTimes.length > 0
        ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
        : 0;
      // 게임 실행 시간 기록
      if (gameStartTimeRef.current) {
        const durationSec = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
        db.gameLogs.add({
          gameType: 'color-match',
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
    if (selectedColor === null) {
      generateNewTrial();
    }
  }, [currentTrial]);

  const generateNewTrial = () => {
    // 목표 색상 선택
    const target = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(target.value);

    // 표시할 색상들 생성 (목표 색상 포함, 6개)
    const colorPool = [...COLORS];
    const displayed: string[] = [target.value];
    
    while (displayed.length < 6) {
      const randomColor = colorPool[Math.floor(Math.random() * colorPool.length)].value;
      if (!displayed.includes(randomColor)) {
        displayed.push(randomColor);
      }
    }

    // 섞기
    displayed.sort(() => Math.random() - 0.5);
    setDisplayedColors(displayed);
    setSelectedColor(null);
    setShowColors(false);

    // 0.5초 후 색상 표시
    setTimeout(() => {
      setShowColors(true);
      setStartTime(Date.now());
    }, 500);
  };

  const handleColorClick = (color: string) => {
    if (!startTime || selectedColor !== null || !showColors) return;

    const reactionTime = Date.now() - startTime;
    setReactionTimes((prev) => [...prev, reactionTime]);
    setSelectedColor(color);

    if (color === targetColor) {
      setCorrect((prev) => prev + 1);
    } else {
      setIncorrect((prev) => prev + 1);
    }

    // 1초 후 다음 문제로
    setTimeout(() => {
      setCurrentTrial((prev) => prev + 1);
      setSelectedColor(null);
    }, 1000);
  };

  const getFeedbackClass = (color: string) => {
    if (selectedColor === null) return '';
    if (color === targetColor) return 'ring-4 ring-green-500 scale-110';
    if (color === selectedColor && color !== targetColor) return 'ring-4 ring-red-500 scale-90 opacity-50';
    return 'opacity-30';
  };

  const targetColorName = COLORS.find(c => c.value === targetColor)?.name || '';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="mb-4 text-center">
        <p className="text-lg font-semibold">남은 시간: {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}</p>
        <p className="text-sm text-gray-600">정답: {correct} / 오답: {incorrect}</p>
      </div>

      <div className="mb-8 text-center">
        <p className="text-sm text-gray-500 mb-6">목표 색상을 빠르게 찾아 클릭하세요</p>
        <div className="mb-6">
          <p className="text-2xl font-bold mb-4">목표: <span style={{ color: targetColor }}>{targetColorName}</span></p>
          {!showColors && (
            <div className="text-4xl font-bold text-gray-400 animate-pulse">준비...</div>
          )}
        </div>
      </div>

      {showColors && (
        <div className="grid grid-cols-3 gap-4 max-w-md">
          {displayedColors.map((color, idx) => (
            <button
              key={idx}
              onClick={() => handleColorClick(color)}
              disabled={selectedColor !== null}
              className={`w-24 h-24 rounded-lg transition-all duration-200 ${
                selectedColor === null
                  ? 'hover:scale-110 hover:shadow-lg cursor-pointer'
                  : 'cursor-not-allowed'
              } ${getFeedbackClass(color)}`}
              style={{ backgroundColor: color }}
              aria-label={`색상 ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

