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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseText = () => {
    switch (breathPhase) {
      case 'inhale': return '들이쉬기';
      case 'hold1': return '멈춤';
      case 'exhale': return '내쉬기';
      case 'hold2': return '멈춤';
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-background p-4"
      data-analytics="break_screen"
    >
      <div className="mb-8 text-center">
        <h2 className="text-headline-md mb-4">휴식 시간</h2>
        <p className="text-body-md text-muted-foreground">
          남은 시간: <span className="font-bold text-primary">{formatTime(remaining)}</span>
        </p>
      </div>

      {/* 호흡 원 - reduced-motion 고려 */}
      <div className="relative w-64 h-64 mb-8" role="timer" aria-live="polite" aria-label={`${getPhaseText()} - 남은 시간 ${remaining}초`}>
        <div
          className={`absolute inset-0 rounded-full ${
            reducedMotion ? '' : 'transition-all duration-1000'
          } ${
            breathPhase === 'inhale'
              ? 'bg-primary/60'
              : breathPhase === 'hold1'
              ? 'bg-primary/80'
              : breathPhase === 'exhale'
              ? 'bg-primary/40'
              : 'bg-primary/60'
          }`}
          style={{
            transform: reducedMotion ? 'scale(1)' : `scale(${0.8 + progress * 0.5})`,
          }}
        />
        
        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-title-md font-bold text-foreground">
            {getPhaseText()}
          </span>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="w-64 h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((duration - remaining) / duration) * 100}%` }}
        />
      </div>

      {/* 스킵 버튼 */}
      {skipEnabled && (
        <button
          onClick={handleSkip}
          disabled={!canSkip}
          data-analytics="break_skip_attempt"
          className={`touch-target px-6 py-3 rounded-lg font-medium transition-all ${
            canSkip
              ? 'bg-muted hover:bg-muted/80 text-foreground'
              : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
          }`}
          aria-label={canSkip ? '휴식 끝내기' : `최소 ${minDuration}초 대기 필요`}
        >
          {canSkip ? '계속하기' : `최소 ${minDuration}초 대기 필요`}
        </button>
      )}

      <p className="mt-4 text-label-sm text-muted-foreground text-center max-w-md">
        박스 호흡법(4-4-4-4)으로 집중력을 회복하세요
      </p>
    </div>
  );
}

