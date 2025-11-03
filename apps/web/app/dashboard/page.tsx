'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { kpiAnalytics } from '@/modules/analytics/kpi';
import { db } from '@/lib/db';
import type { SessionLog } from '@/lib/types';

export default function DashboardPage() {
  const [completionRate, setCompletionRate] = useState(0);
  const [avgSessionLength, setAvgSessionLength] = useState(0);
  const [subjectTime, setSubjectTime] = useState<Record<string, number>>({});
  const [breakSkipRate, setBreakSkipRate] = useState(0);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [weakTags, setWeakTags] = useState<string[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const completion = await kpiAnalytics.getSessionCompletionRate();
    const avgLength = await kpiAnalytics.getAverageSessionLength();
    const subjectTimes = await kpiAnalytics.getSubjectTime();
    const skipRate = await kpiAnalytics.getBreakSkipRate();

    setCompletionRate(completion);
    setAvgSessionLength(avgLength);
    setSubjectTime(subjectTimes);
    setBreakSkipRate(skipRate);

    // 일별 데이터 집계
    const logs = await db.sessionLogs.toArray();
    const dailyMap = new Map<string, { date: string; time: number; accuracy: number }>();

    for (const log of logs) {
      const date = new Date(log.startAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
      const accuracy = log.rounds.length > 0
        ? log.rounds.reduce((sum, r) => sum + (r.correct / r.items.length), 0) / log.rounds.length
        : 0;

      if (dailyMap.has(date)) {
        const existing = dailyMap.get(date)!;
        existing.time += log.durationSec / 60; // 분 단위
        existing.accuracy = (existing.accuracy + accuracy) / 2;
      } else {
        dailyMap.set(date, {
          date,
          time: log.durationSec / 60,
          accuracy,
        });
      }
    }

    setDailyData(Array.from(dailyMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));

    // 약점 태그
    const profile = await db.userProfile.get('default');
    if (profile?.weakTags) {
      setWeakTags(profile.weakTags);
    }
  };

  const subjectTimeData = Object.entries(subjectTime).map(([subject, time]) => ({
    subject,
    time: Math.round(time / 60), // 분 단위
  }));

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 mb-2">세션 완료율</h3>
          <p className="text-3xl font-bold">{Math.round(completionRate * 100)}%</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 mb-2">평균 세션 길이</h3>
          <p className="text-3xl font-bold">{Math.round(avgSessionLength / 60)}분</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 mb-2">휴식 스킵률</h3>
          <p className="text-3xl font-bold">{Math.round(breakSkipRate * 100)}%</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 mb-2">총 세션 수</h3>
          <p className="text-3xl font-bold">{dailyData.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 일별 시간 추이 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">일별 학습 시간</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="time" stroke="#8884d8" name="학습 시간 (분)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 정답률 추이 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">일별 정답률</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 1]} />
              <Tooltip formatter={(value: number) => `${Math.round(value * 100)}%`} />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" name="정답률" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 과목별 시간 */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">과목별 누적 시간</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={subjectTimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="time" fill="#8884d8" name="시간 (분)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 약점 태그 */}
      {weakTags.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">약점 태그</h2>
          <div className="flex flex-wrap gap-2">
            {weakTags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 칭호 시스템 (간단한 구현) */}
      <div className="bg-white p-6 rounded-lg shadow mt-8">
        <h2 className="text-xl font-bold mb-4">달성한 칭호</h2>
        <div className="flex flex-wrap gap-4">
          {weakTags.length === 0 && (
            <div className="text-gray-500">아직 달성한 칭호가 없습니다.</div>
          )}
          {weakTags.length > 0 && (
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              학습자
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

