'use client';

import { useEffect, useState } from 'react';
import type { RoundResult } from '@/lib/types';
import confetti from 'canvas-confetti';

interface SessionResultProps {
  rounds: RoundResult[];
  totalSeconds: number;
  incorrectCount: number;
  onComplete: () => void;
}

export function SessionResult({ rounds, totalSeconds, incorrectCount, onComplete }: SessionResultProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // 결과 화면 진입 시 축하 confetti
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
    });

    // 3초 후 자동 이동 (또는 수동 클릭)
    const timer = setTimeout(() => {
      onComplete();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // 통계 계산
  const totalItems = rounds.reduce((sum, r) => sum + r.items.length, 0);
  const totalCorrect = rounds.reduce((sum, r) => sum + r.correct, 0);
  const accuracy = totalItems > 0 ? Math.round((totalCorrect / totalItems) * 100) : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초`;
  };

  // 과목별 통계
  const subjectStats = rounds.map((round) => ({
    subject: round.subject,
    correct: round.correct,
    total: round.items.length,
    accuracy: round.items.length > 0 ? Math.round((round.correct / round.items.length) * 100) : 0,
    avgLatency: round.latencyAvgMs ? Math.round(round.latencyAvgMs / 1000) : 0,
  }));

  const subjectNames: Record<string, string> = {
    math: '수학',
    english: '영어',
    science: '과학',
    social: '사회',
  };

  const subjectColors: Record<string, string> = {
    math: 'bg-blue-500',
    english: 'bg-purple-500',
    science: 'bg-red-500',
    social: 'bg-green-500',
  };

  // 칭찬 메시지
  const getMessage = () => {
    if (accuracy >= 90) return '완벽합니다! 🎉';
    if (accuracy >= 75) return '훌륭해요! 👏';
    if (accuracy >= 60) return '잘했어요! 😊';
    return '좋아요! 계속 도전하세요! 💪';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">세션 완료!</h1>
          <p className="text-xl text-gray-600">{getMessage()}</p>
        </div>

        {/* 주요 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{accuracy}%</div>
            <div className="text-sm text-gray-600">정답률</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{totalCorrect}/{totalItems}</div>
            <div className="text-sm text-gray-600">정답/전체</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{formatTime(totalSeconds)}</div>
            <div className="text-sm text-gray-600">학습 시간</div>
          </div>
        </div>

        {/* 과목별 통계 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">과목별 결과</h3>
          <div className="space-y-4">
            {subjectStats.map((stat) => (
              <div key={stat.subject} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${subjectColors[stat.subject]}`} />
                    <span className="font-semibold">{subjectNames[stat.subject]}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {stat.correct}/{stat.total} ({stat.accuracy}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${subjectColors[stat.subject]} transition-all duration-500`}
                    style={{ width: `${stat.accuracy}%` }}
                  />
                </div>
                {stat.avgLatency > 0 && (
                  <div className="mt-1 text-xs text-gray-500">
                    평균 응답 시간: {stat.avgLatency}초
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 오답 정보 */}
        {incorrectCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">오답 {incorrectCount}개</span>를 다음 리콜 보스에서 다시 만나요!
            </p>
          </div>
        )}

        {/* 버튼들 */}
        <div className="flex gap-4">
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            대시보드 보기
          </button>
          <button
            onClick={() => (window.location.href = '/session')}
            className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            다시 시작
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onComplete}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            홈으로 ({Math.max(0, 10 - Math.floor(totalSeconds / 1000))}초)
          </button>
        </div>
      </div>
    </div>
  );
}

