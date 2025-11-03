'use client';

import { useEffect, useState } from 'react';
import type { SessionPhase } from '@/lib/types';

interface SessionProgressProps {
  phase: SessionPhase;
  phaseElapsed: number;
  totalElapsed: number;
  roundResults?: {
    subject: string;
    correct: number;
    total: number;
  }[];
}

const PHASE_INFO: Record<SessionPhase, { name: string; duration: number; color: string }> = {
  warmup: { name: '워밍업', duration: 90, color: 'bg-yellow-500' },
  'round-a': { name: '수학', duration: 180, color: 'bg-blue-500' },
  'break-1': { name: '휴식', duration: 50, color: 'bg-green-500' },
  'round-b': { name: '영어', duration: 180, color: 'bg-purple-500' },
  'break-2': { name: '휴식', duration: 50, color: 'bg-green-500' },
  'round-c': { name: '과학/사회', duration: 180, color: 'bg-red-500' },
  'recall-boss': { name: '리콜 보스', duration: 60, color: 'bg-orange-500' },
  report: { name: '결과', duration: 30, color: 'bg-gray-500' },
};

export function SessionProgress({ phase, phaseElapsed, totalElapsed, roundResults }: SessionProgressProps) {
  const info = PHASE_INFO[phase];
  const progress = Math.min((phaseElapsed / info.duration) * 100, 100);
  const remaining = Math.max(info.duration - phaseElapsed, 0);

  // 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      {/* 상단 진행 바 */}
      <div className="h-2 bg-gray-200">
        <div
          className={`h-full transition-all duration-300 ${info.color}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 페이즈 정보 */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${info.color}`} />
            <span className="font-semibold text-lg">{info.name}</span>
          </div>
          <span className="text-sm text-gray-600">
            남은 시간: {formatTime(remaining)}
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* 총 경과 시간 */}
          <div className="text-sm text-gray-600">
            총 {formatTime(totalElapsed)}
          </div>

          {/* 라운드 결과 요약 */}
          {roundResults && roundResults.length > 0 && (
            <div className="flex gap-2">
              {roundResults.map((result, idx) => (
                <div key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded">
                  {result.subject}: {result.correct}/{result.total}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 미니 타임라인 */}
      <div className="px-4 pb-2">
        <div className="flex gap-1">
          {Object.entries(PHASE_INFO).map(([p, pInfo], idx) => {
            const isActive = p === phase;
            const isDone = Object.keys(PHASE_INFO).indexOf(p) < Object.keys(PHASE_INFO).indexOf(phase);
            
            return (
              <div
                key={p}
                className={`flex-1 h-1 rounded-full transition-all ${
                  isDone ? pInfo.color : isActive ? `${pInfo.color} opacity-50` : 'bg-gray-200'
                }`}
                title={pInfo.name}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

