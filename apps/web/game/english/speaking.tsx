'use client';

import { useState, useEffect } from 'react';
import type { LearningItem } from '@/lib/types';
import { ttsManager } from '@/modules/audio/tts';
import { sttManager } from '@/modules/audio/stt';

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

  const currentItem = items[currentIndex];
  const isComplete = currentIndex >= items.length;

  useEffect(() => {
    if (currentIndex < items.length && !startTime) {
      setStartTime(Date.now());
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
        setTimeout(() => {
          if (currentIndex + 1 < items.length) {
            setCurrentIndex((prev) => prev + 1);
            setTranscript('');
            setStartTime(null);
          } else {
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
      <div className="text-center">
        <p>완료!</p>
        <p>정답률: {results.filter((r) => r.correct).length} / {results.length}</p>
      </div>
    );
  }

  if (!currentItem) {
    return <div>준비 중...</div>;
  }

  const promptText = currentItem.stem.type === 'text'
    ? currentItem.stem.payload
    : '다음을 따라 말하세요';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="mb-4">
        <p>문제 {currentIndex + 1} / {items.length}</p>
        <p className="text-sm text-gray-500">다음 문장을 따라 말하세요</p>
      </div>

      <div className="mb-8 text-2xl font-bold text-center">
        {promptText}
      </div>

      {transcript && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-lg">인식된 내용: {transcript}</p>
        </div>
      )}

      <button
        onClick={startListening}
        disabled={isListening}
        className={`px-8 py-4 rounded-lg font-bold text-lg ${
          isListening
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isListening ? '🎤 듣는 중...' : '🎤 시작'}
      </button>

      <button
        onClick={playExample}
        className="mt-4 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
      >
        🔊 다시 듣기
      </button>
    </div>
  );
}

