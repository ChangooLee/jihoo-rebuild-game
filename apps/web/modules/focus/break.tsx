'use client';

import { useEffect, useState } from 'react';

export interface BoxBreathingProps {
  duration: number; // 초 단위
  onComplete?: () => void;
  skipEnabled?: boolean; // 스킵 허용 여부
  minDuration?: number; // 최소 대기 시간 (초)
}

/**
 * 박스 호흡 애니메이션 (4-4-4-4)
 * 들이쉬기 4초 - 멈춤 4초 - 내쉬기 4초 - 멈춤 4초
 */
export function BoxBreathing({
  duration,
  onComplete,
  skipEnabled = false,
  minDuration = 10,
}: BoxBreathingProps) {
  const [remaining, setRemaining] = useState(duration);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [canSkip, setCanSkip] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const newRemaining = prev - 1;
        
        // 박스 호흡 페이즈 계산 (16초 주기)
        const cyclePosition = (duration - newRemaining) % 16;
        if (cyclePosition < 4) {
          setBreathPhase('inhale');
          setProgress((cyclePosition + 1) / 4);
        } else if (cyclePosition < 8) {
          setBreathPhase('hold1');
          setProgress(1);
        } else if (cyclePosition < 12) {
          setBreathPhase('exhale');
          setProgress((cyclePosition - 7) / 4);
        } else {
          setBreathPhase('hold2');
          setProgress(1);
        }

        // 최소 시간 경과 후 스킵 허용
        if (skipEnabled && duration - newRemaining >= minDuration) {
          setCanSkip(true);
        }

        return newRemaining;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, onComplete, skipEnabled, minDuration]);

  const handleSkip = () => {
    if (canSkip && onComplete) {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">휴식 시간</h2>
        <p className="text-lg">남은 시간: {remaining}초</p>
      </div>

      <div className="relative w-64 h-64">
        {/* 호흡 원 */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-1000 ${
            breathPhase === 'inhale'
              ? 'bg-blue-400 scale-125'
              : breathPhase === 'hold1'
              ? 'bg-blue-500 scale-125'
              : breathPhase === 'exhale'
              ? 'bg-blue-300 scale-100'
              : 'bg-blue-400 scale-100'
          }`}
          style={{
            transform: `scale(${0.8 + progress * 0.5})`,
          }}
        />
        
        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {breathPhase === 'inhale' && '들이쉬기'}
            {breathPhase === 'hold1' && '멈춤'}
            {breathPhase === 'exhale' && '내쉬기'}
            {breathPhase === 'hold2' && '멈춤'}
          </span>
        </div>
      </div>

      {/* 스킵 버튼 */}
      {skipEnabled && (
        <button
          onClick={handleSkip}
          disabled={!canSkip}
          className={`mt-8 px-6 py-3 rounded-lg ${
            canSkip
              ? 'bg-gray-200 hover:bg-gray-300'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {canSkip ? '계속하기' : `최소 ${minDuration}초 대기 필요`}
        </button>
      )}
    </div>
  );
}

