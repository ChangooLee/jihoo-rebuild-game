'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SessionFlowManager } from '@/modules/focus/session-flow';
import { BoxBreathing } from '@/modules/focus/break';
import { StroopTask } from '@/game/warmup';
import { SpeedCalculation } from '@/game/math';
import { ListeningGame, SpeakingGame } from '@/game/english';
import { CauseEffect } from '@/game/science';
import { ScenarioGame } from '@/game/social';
import { recallBoss } from '@/modules/review/recall-boss';
import { SessionProgress } from '@/components/SessionProgress';
import { InstantFeedback } from '@/components/InstantFeedback';
import { SubjectTimeBar } from '@/components/SubjectTimeBar';
import { SessionResult } from '@/components/SessionResult';
import type { SessionPhase, LearningItem, RoundResult } from '@/lib/types';
import { db } from '@/lib/db';
import { PersonalizedScheduler } from '@/modules/scheduler/personalized';

export default function SessionPage() {
  const [sessionFlow] = useState(() => new SessionFlowManager());
  const [currentPhase, setCurrentPhase] = useState<SessionPhase>('warmup');
  const [roundItems, setRoundItems] = useState<LearningItem[]>([]);
  const [warmupResult, setWarmupResult] = useState<any>(null);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [incorrectItems, setIncorrectItems] = useState<string[]>([]);
  const [scheduler] = useState(() => new PersonalizedScheduler());
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | 'complete'; message?: string } | null>(null);
  const [subjectTimes, setSubjectTimes] = useState({ math: 0, english: 0, science: 0, social: 0 });
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    sessionFlow.onPhaseChangeCallback((phase) => {
      setCurrentPhase(phase);
      handlePhaseChange(phase);
    });

    sessionFlow.onCompleteCallback((state) => {
      saveSession(state);
      window.location.href = '/dashboard';
    });

    // 세션 시작
    sessionFlow.start();

    return () => {
      // Cleanup
    };
  }, []);

  const handlePhaseChange = async (phase: SessionPhase) => {
    if (phase === 'round-a' || phase === 'round-b' || phase === 'round-c') {
      // 라운드 항목 선택
      const items = await scheduler.selectItemsForRound(10);
      setRoundItems(items);
    } else if (phase === 'recall-boss') {
      // 리콜 보스 항목 선택
      const profile = await db.userProfile.get('default');
      const items = await recallBoss.selectRecallItems(
        incorrectItems,
        profile?.weakTags || [],
        10
      );
      setRoundItems(items);
    }
  };

  const handleWarmupComplete = (result: any) => {
    setWarmupResult(result);
    sessionFlow.nextPhase();
  };

  const handleRoundComplete = (results: { itemId: string; correct: boolean; latencyMs: number }[]) => {
    const correct = results.filter((r) => r.correct).length;
    const avgLatency = results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length;

    // 오답 항목 추적
    const incorrect = results.filter((r) => !r.correct).map((r) => r.itemId);
    setIncorrectItems((prev) => [...prev, ...incorrect]);

    // 라운드 결과 저장
    const roundResult: RoundResult = {
      subject: roundItems[0]?.subject || 'math',
      items: results.map((r) => r.itemId),
      correct,
      latencyAvgMs: avgLatency,
    };

    setRoundResults((prev) => [...prev, roundResult]);
    sessionFlow.recordRoundResult(roundResult);
    sessionFlow.nextPhase();
  };

  const handleBreakComplete = () => {
    sessionFlow.nextPhase();
  };

  const handleRecallBossComplete = (results: { itemId: string; correct: boolean; latencyMs: number }[]) => {
    handleRoundComplete(results);
  };

  const saveSession = async (state: any) => {
    await db.sessionLogs.add({
      startAt: state.startTime,
      durationSec: state.elapsedSeconds,
      rounds: state.roundResults,
      breaks: 2,
    });
  };

  // 결과 화면
  if (currentPhase === 'report' || showResult) {
    return (
      <SessionResult
        rounds={roundResults}
        totalSeconds={totalElapsed}
        incorrectCount={incorrectItems.length}
        onComplete={() => (window.location.href = '/')}
      />
    );
  }

  // 페이즈별 컴포넌트 렌더링
  return (
    <div className="relative min-h-screen">
      {/* 상단 진행 바 */}
      <SessionProgress
        phase={currentPhase}
        phaseElapsed={phaseElapsed}
        totalElapsed={totalElapsed}
        roundResults={roundResults.map(r => ({
          subject: r.subject,
          correct: r.correct,
          total: r.items.length
        }))}
      />

      {/* 즉각 피드백 */}
      {feedback && (
        <InstantFeedback
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* 메인 콘텐츠 */}
      <div className="pt-24 pb-32">
        {currentPhase === 'warmup' && (
          <StroopTask onComplete={handleWarmupComplete} duration={90} />
        )}

        {(currentPhase === 'break-1' || currentPhase === 'break-2') && (
          <BoxBreathing
            duration={50}
            onComplete={handleBreakComplete}
            skipEnabled={true}
            minDuration={10}
          />
        )}

        {currentPhase === 'round-a' && roundItems.filter(item => item.subject === 'math').length > 0 && (
          <SpeedCalculation
            items={roundItems.filter(item => item.subject === 'math')}
            onComplete={handleRoundComplete}
            timeLimit={180}
          />
        )}

        {currentPhase === 'round-b' && roundItems.filter(item => item.subject === 'english').length > 0 && (
          <ListeningGame
            items={roundItems.filter(item => item.subject === 'english')}
            onComplete={handleRoundComplete}
          />
        )}

        {currentPhase === 'round-c' && roundItems.filter(item => item.subject === 'science' || item.subject === 'social').length > 0 && (
          <>
            {roundItems.filter(item => item.subject === 'science').length > 0 ? (
              <CauseEffect
                items={roundItems.filter(item => item.subject === 'science')}
                onComplete={handleRoundComplete}
              />
            ) : (
              <ScenarioGame
                items={roundItems.filter(item => item.subject === 'social')}
                onComplete={handleRoundComplete}
              />
            )}
          </>
        )}

        {currentPhase === 'recall-boss' && roundItems.length > 0 && (
          <ScenarioGame
            items={roundItems}
            onComplete={handleRecallBossComplete}
          />
        )}

        {!currentPhase && <div className="text-center">준비 중...</div>}
      </div>

      {/* 하단 과목별 시간 바 */}
      <SubjectTimeBar
        mathSeconds={subjectTimes.math}
        englishSeconds={subjectTimes.english}
        scienceSeconds={subjectTimes.science}
        socialSeconds={subjectTimes.social}
      />
    </div>
  );
}

