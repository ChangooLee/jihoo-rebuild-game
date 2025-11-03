'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface FeedbackProps {
  type: 'correct' | 'incorrect' | 'hint' | 'complete';
  message?: string;
  autoHide?: boolean;
  duration?: number;
  onClose?: () => void;
}

export function InstantFeedback({ type, message, autoHide = true, duration = 2000, onClose }: FeedbackProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 사운드 재생
    playSound(type);

    // 진동 (모바일)
    if (type === 'correct' || type === 'complete') {
      vibrate([50, 100, 50]);
    } else if (type === 'incorrect') {
      vibrate([100]);
    }

    // 정답 시 confetti
    if (type === 'correct') {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#10b981', '#4ade80'],
      });
    }

    // 완료 시 대형 confetti
    if (type === 'complete') {
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
      });
    }

    // 자동 숨김
    if (autoHide) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [type, autoHide, duration, onClose]);

  if (!visible) return null;

  const styles = {
    correct: 'bg-green-500 text-white',
    incorrect: 'bg-red-500 text-white',
    hint: 'bg-yellow-500 text-white',
    complete: 'bg-blue-600 text-white',
  };

  const icons = {
    correct: '✓',
    incorrect: '✗',
    hint: '💡',
    complete: '🎉',
  };

  const messages = {
    correct: message || '정답입니다!',
    incorrect: message || '아쉬워요. 다시 도전!',
    hint: message || '힌트를 확인하세요',
    complete: message || '완료했습니다!',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div
        className={`${styles[type]} px-8 py-6 rounded-2xl shadow-2xl transform scale-110 animate-bounce pointer-events-auto`}
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl">{icons[type]}</span>
          <span className="text-2xl font-bold">{messages[type]}</span>
        </div>
      </div>
    </div>
  );
}

// 사운드 재생
function playSound(type: string) {
  if (typeof window === 'undefined') return;

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // 타입별 주파수
  const frequencies = {
    correct: [523, 659, 784], // C-E-G (major chord)
    incorrect: [349, 311], // F-D# (dissonance)
    hint: [440], // A
    complete: [523, 659, 784, 1047], // C-E-G-C (octave)
  };

  const freqs = frequencies[type as keyof typeof frequencies] || [440];

  freqs.forEach((freq, i) => {
    setTimeout(() => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.15);
    }, i * 100);
  });
}

// 진동
function vibrate(pattern: number[]) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

