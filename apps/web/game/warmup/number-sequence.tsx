'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/db';

export interface NumberSequenceResult {
  correct: number;
  incorrect: number;
  avgReactionTime: number;
}

export interface NumberSequenceGameProps {
  onComplete: (result: NumberSequenceResult) => void;
  duration?: number; // 초 단위, 기본 90초
}

/**
 * 숫자 순서 게임 - 워밍업 과제
 * 등차수열 패턴을 인식하여 다음 숫자를 예측
 */
export function NumberSequenceGame({ onComplete, duration = 90 }: NumberSequenceGameProps) {
  const [currentTrial, setCurrentTrial] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [options, setOptions] = useState<number[]>([]);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(duration);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
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
          gameType: 'number-sequence',
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
    if (selectedAnswer === null) {
      generateNewTrial();
    }
  }, [currentTrial]);

  const generateNewTrial = () => {
    // 등차수열 생성 (공차: 2~7)
    const commonDiff = Math.floor(Math.random() * 6) + 2;
    const start = Math.floor(Math.random() * 10) + 1;
    const sequenceLength = 4;
    
    const newSequence: number[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      newSequence.push(start + i * commonDiff);
    }
    
    setSequence(newSequence);
    
    // 정답과 오답 생성
    const correctAnswer = start + sequenceLength * commonDiff;
    const wrongAnswers: number[] = [];
    
    // 오답: 정답 ± 1~3 범위에서 선택
    while (wrongAnswers.length < 3) {
      const wrong = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      if (wrong !== correctAnswer && !wrongAnswers.includes(wrong) && wrong > 0) {
        wrongAnswers.push(wrong);
      }
    }
    
    // 선택지 섞기
    const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setStartTime(Date.now());
    setSelectedAnswer(null);
  };

  const handleAnswer = (answer: number) => {
    if (!startTime || selectedAnswer !== null) return;

    const reactionTime = Date.now() - startTime;
    setReactionTimes((prev) => [...prev, reactionTime]);
    setSelectedAnswer(answer);

    // 정답 계산
    const correctAnswer = sequence[0] + (sequence[1] - sequence[0]) * sequence.length;
    
    if (answer === correctAnswer) {
      setCorrect((prev) => prev + 1);
    } else {
      setIncorrect((prev) => prev + 1);
    }

    // 1초 후 다음 문제로
    setTimeout(() => {
      setCurrentTrial((prev) => prev + 1);
      setSelectedAnswer(null);
    }, 1000);
  };

  const getFeedbackColor = (option: number) => {
    if (selectedAnswer === null) return '';
    const correctAnswer = sequence[0] + (sequence[1] - sequence[0]) * sequence.length;
    if (option === correctAnswer) return 'bg-success/20 border-success text-success';
    if (option === selectedAnswer && option !== correctAnswer) return 'bg-error/20 border-error text-error';
    return '';
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
        <p className="text-label-sm text-muted-foreground mb-6">숫자 패턴을 보고 다음 숫자를 선택하세요</p>
        <div className="flex gap-4 justify-center items-center mb-6">
          {sequence.map((num, idx) => (
            <span
              key={idx}
              className="text-5xl font-bold px-6 py-4 bg-primary/20 text-primary rounded-2xl border-2 border-primary/50"
            >
              {num}
            </span>
          ))}
          <span className="text-5xl font-bold text-muted-foreground">?</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-md">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(option)}
            disabled={selectedAnswer !== null}
            className={`min-h-[80px] px-8 py-6 text-3xl font-bold rounded-2xl border-2 transition-all ${
              selectedAnswer === null
                ? 'bg-card border-border/50 text-foreground hover:border-primary/50 hover:bg-card/80 hover:scale-105'
                : getFeedbackColor(option) || 'bg-card/50 border-border/30 text-muted-foreground opacity-50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

