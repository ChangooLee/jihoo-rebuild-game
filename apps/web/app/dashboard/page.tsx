'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { QuestCTA } from '@/components/ui/QuestCTA';
import { db } from '@/lib/db';
import { getDueItems } from '@/modules/fsrs/engine';
import { Clock, Trophy, Target, TrendingUp, Award, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const [todayQuest, setTodayQuest] = useState<string | null>(null);
  const [timerPreset, setTimerPreset] = useState<120 | 150 | 180>(150);
  const [weeklyStreak, setWeeklyStreak] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [weakTags, setWeakTags] = useState<string[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // 오늘 할 일
    const lastSession = await db.sessionLogs.orderBy('startAt').last();
    const today = new Date().toDateString();
    if (!lastSession || new Date(lastSession.startAt).toDateString() !== today) {
      setTodayQuest('오늘의 퀘스트를 시작하세요!');
    } else {
      setTodayQuest(null);
    }

    // 주간 연속 일수 계산 (날짜 기반)
    const sessions = await db.sessionLogs.toArray();
    setTotalSessions(sessions.length);
    
    // 날짜 기반 연속 일수 계산
    const sessionDates = new Set<string>();
    for (const session of sessions) {
      const date = new Date(session.startAt).toDateString();
      sessionDates.add(date);
    }
    
    // 최근 7일 중 연속된 날짜 계산 (오늘부터 역순)
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0); // 시간 제거
    
    let streak = 0;
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(todayDate);
      checkDate.setDate(todayDate.getDate() - i);
      const dateStr = checkDate.toDateString();
      if (sessionDates.has(dateStr)) {
        streak++;
      } else {
        // 연속이 끊기면 중단 (단, 첫 날(오늘)이 아니면 streak 유지)
        if (i > 0) break;
      }
    }
    setWeeklyStreak(streak);

    // 약점 태그 (상위 3개)
    const profile = await db.userProfile.get('default');
    if (profile?.weakTags) {
      setWeakTags(profile.weakTags.slice(0, 3));
    }

    // 리콜 보스 Due 카운트 (FSRS 로직 사용)
    const dueItemIds = await getDueItems(100); // 충분한 수량 가져오기
    setDueCount(dueItemIds.length);

    // 뱃지 (예시)
    const badgeList = [];
    if (totalSessions >= 1) badgeList.push('첫 퀘스트');
    if (totalSessions >= 10) badgeList.push('퀘스터');
    if (weeklyStreak >= 3) badgeList.push('3일 연속');
    setBadges(badgeList);
  };

  const handleStartQuest = () => {
    window.location.href = '/jihoo/session';
  };

  const handleSkipQuest = async () => {
    // 스킵 시 오늘 날짜로 세션 로그 저장 (연속 일수 유지용)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await db.sessionLogs.add({
      startAt: today.getTime(),
      durationSec: 0,
      rounds: [],
      breaks: 0,
    });
    
    // 대시보드 새로고침
    window.location.reload();
  };

  const handleDiagnostic = () => {
    window.location.href = '/jihoo/diagnostic';
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* 상단 고정 영역 */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40 -mx-4 px-4 py-4 mb-8">
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center justify-between mb-4">
            <h1 className="text-headline-md">대시보드</h1>
            <a href="/jihoo" className="text-label-sm text-primary hover:underline">
              홈으로
            </a>
          </nav>

          {/* 오늘 할 일 */}
          {todayQuest && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-title-md font-semibold text-primary">{todayQuest}</p>
                  <p className="text-label-sm text-muted-foreground">
                    10~15분 · 워밍업 + 3라운드 + 리콜 보스
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSkipQuest}
                  data-analytics="dashboard_skip_quest"
                  variant="outline"
                  className="text-muted-foreground hover:text-foreground"
                >
                  스킵
                </Button>
                <Button
                  onClick={handleStartQuest}
                  data-analytics="dashboard_start_quest"
                  className="touch-target"
                >
                  시작하기
                </Button>
              </div>
            </div>
          )}

          {/* 타이머 프리셋 + 보상 */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* 타이머 프리셋 */}
            <div className="flex items-center gap-2" role="group" aria-label="타이머 선택">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-label-sm text-muted-foreground">타이머:</span>
              {([120, 150, 180] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setTimerPreset(preset)}
                  data-analytics={`timer_preset_${preset}`}
                  className={`px-3 py-1 rounded-lg text-label-sm font-medium transition-all ${
                    timerPreset === preset
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                  aria-pressed={timerPreset === preset}
                >
                  {preset / 60}분
                </button>
              ))}
            </div>

            {/* 보상 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-warning" />
                <span className="text-label-sm">
                  <span className="font-bold text-warning">{weeklyStreak}일</span> 연속
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-label-sm">
                  <span className="font-bold text-primary">{badges.length}</span> 뱃지
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto">
        {/* 통계 카드 */}
        <section className="grid md:grid-cols-3 gap-6 mb-8" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">통계</h2>

          {/* 총 세션 */}
          <article className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-md">총 세션</h3>
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <p className="text-display-sm font-bold">{totalSessions}</p>
            <p className="text-label-sm text-muted-foreground">완료한 퀘스트</p>
          </article>

          {/* 리콜 보스 Due */}
          <article className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-md">리콜 보스</h3>
              <Target className="w-6 h-6 text-warning" />
            </div>
            <p className="text-display-sm font-bold">{dueCount}</p>
            <p className="text-label-sm text-muted-foreground">복습 대기 중</p>
          </article>

          {/* 주간 연속 */}
          <article className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-md">연속 기록</h3>
              <Trophy className="w-6 h-6 text-success" />
            </div>
            <p className="text-display-sm font-bold">{weeklyStreak}일</p>
            <p className="text-label-sm text-muted-foreground">이번 주</p>
          </article>
        </section>

        {/* 약점 태그 */}
        {weakTags.length > 0 && (
          <section className="mb-8" aria-labelledby="weak-tags-heading">
            <h2 id="weak-tags-heading" className="text-headline-md mb-4">
              집중 학습 영역
            </h2>
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <p className="text-body-md text-muted-foreground mb-4">
                아래 개념을 중점적으로 연습하고 있어요
              </p>
              <div className="flex gap-3 flex-wrap">
                {weakTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-warning/10 border border-warning/30 rounded-lg text-label-sm text-warning font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 액션 카드 */}
        <section className="grid md:grid-cols-2 gap-6" aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="sr-only">빠른 액션</h2>

          <QuestCTA
            title="진단 테스트"
            description="12문항 · 학년군 & 약점 태그 자동 추정"
            onClick={handleDiagnostic}
            variant="secondary"
            icon={<Target />}
          />

          <QuestCTA
            title="설정"
            description="알림 · 접근성 · 과몰입 차단"
            onClick={() => (window.location.href = '/jihoo/settings')}
            variant="secondary"
            icon={<Award />}
          />
        </section>

        {/* 뱃지/칭호 */}
        {badges.length > 0 && (
          <section className="mt-8" aria-labelledby="badges-heading">
            <h2 id="badges-heading" className="text-headline-md mb-4">
              획득한 칭호
            </h2>
            <div className="flex gap-4 flex-wrap">
              {badges.map((badge) => (
                <div
                  key={badge}
                  className="bg-primary/10 border border-primary/30 rounded-xl px-6 py-3 flex items-center gap-2"
                >
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-label-sm font-medium text-primary">{badge}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LearningResource',
            name: 'Jihoo Quest Dashboard',
            description: '학습 진행 상황 대시보드',
            learningResourceType: 'Dashboard',
            educationalUse: 'self assessment',
            inLanguage: 'ko',
          }),
        }}
      />
    </div>
  );
}
