'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { db } from '@/lib/db';
import type { SessionLog, RoundResult } from '@/lib/types';

export default function ReportPage() {
  const [subjectTimeData, setSubjectTimeData] = useState<any[]>([]);
  const [improvementData, setImprovementData] = useState<any[]>([]);
  const [weakTagHistory, setWeakTagHistory] = useState<any[]>([]);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    const logs = await db.sessionLogs.toArray();
    const profile = await db.userProfile.get('default');

    // 과목별 누적 시간 계산
    const subjectMap = new Map<string, number>();
    const weeklyMap = new Map<string, Map<string, number>>(); // 주별, 과목별 시간

    for (const log of logs) {
      const week = getWeekKey(log.startAt);
      
      for (const round of log.rounds) {
        const time = log.durationSec / log.rounds.length / 60; // 분 단위
        subjectMap.set(round.subject, (subjectMap.get(round.subject) || 0) + time);

        if (!weeklyMap.has(week)) {
          weeklyMap.set(week, new Map());
        }
        const weekData = weeklyMap.get(week)!;
        weekData.set(round.subject, (weekData.get(round.subject) || 0) + time);
      }
    }

    // 과목별 총 시간
    const subjectTimeArray = Array.from(subjectMap.entries()).map(([subject, time]) => ({
      subject,
      time: Math.round(time),
    }));
    setSubjectTimeData(subjectTimeArray);

    // 개선 곡선 (주별 정답률)
    const improvementArray: any[] = [];
    for (const [week, weekData] of weeklyMap.entries()) {
      const weekLogs = logs.filter(log => getWeekKey(log.startAt) === week);
      let totalCorrect = 0;
      let totalItems = 0;

      for (const log of weekLogs) {
        for (const round of log.rounds) {
          totalCorrect += round.correct;
          totalItems += round.items.length;
        }
      }

      improvementArray.push({
        week,
        accuracy: totalItems > 0 ? totalCorrect / totalItems : 0,
      });
    }

    improvementArray.sort((a, b) => a.week.localeCompare(b.week));
    setImprovementData(improvementArray);

    // 약점 태그 변화 (현재 약점 태그)
    if (profile?.weakTags) {
      setWeakTagHistory([
        { period: '현재', tags: profile.weakTags.length },
      ]);
    }
  };

  const getWeekKey = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  };

  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const handleExportPDF = () => {
    // PDF 내보내기 기능 (구현 필요)
    alert('PDF 내보내기 기능은 추후 구현 예정입니다.');
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">보호자/상담 리포트</h1>
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          PDF 내보내기
        </button>
      </div>

      {/* 과목별 누적 시간 */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">과목별 누적 학습 시간</h2>
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

      {/* 개선 곡선 */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">주별 정답률 개선 곡선</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={improvementData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis domain={[0, 1]} />
            <Tooltip formatter={(value: number) => `${Math.round(value * 100)}%`} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="accuracy" 
              stroke="#82ca9d" 
              name="정답률"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 약점 변화 */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">약점 태그 변화</h2>
        {weakTagHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weakTagHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tags" fill="#ffc658" name="약점 태그 수" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">약점 태그 데이터가 없습니다.</p>
        )}
      </div>

      {/* 요약 정보 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">학습 요약</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-bold mb-2">총 학습 시간</h3>
            <p className="text-2xl">
              {Math.round(subjectTimeData.reduce((sum, d) => sum + d.time, 0))}분
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">평균 주당 학습 시간</h3>
            <p className="text-2xl">
              {improvementData.length > 0
                ? Math.round(
                    subjectTimeData.reduce((sum, d) => sum + d.time, 0) / improvementData.length
                  )
                : 0}
                분
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">전체 정답률 추세</h3>
            <p className="text-2xl">
              {improvementData.length > 1
                ? improvementData[improvementData.length - 1].accuracy >
                  improvementData[0].accuracy
                  ? '📈 향상'
                  : '📉 유지'
                : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

