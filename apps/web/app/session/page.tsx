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

  // 페이즈별 컴포넌트 렌더링
  if (currentPhase === 'warmup') {
    return (
      <div>
        <StroopTask onComplete={handleWarmupComplete} duration={90} />
      </div>
    );
  }

  if (currentPhase === 'break-1' || currentPhase === 'break-2') {
    return (
      <BoxBreathing
        duration={50}
        onComplete={handleBreakComplete}
        skipEnabled={true}
        minDuration={10}
      />
    );
  }

  if (currentPhase === 'round-a') {
    const mathItems = roundItems.filter((item) => item.subject === 'math');
    if (mathItems.length === 0) {
      sessionFlow.nextPhase();
      return <div>준비 중...</div>;
    }
    return (
      <SpeedCalculation
        items={mathItems}
        onComplete={handleRoundComplete}
        timeLimit={180}
      />
    );
  }

  if (currentPhase === 'round-b') {
    const englishItems = roundItems.filter((item) => item.subject === 'english');
    if (englishItems.length === 0) {
      sessionFlow.nextPhase();
      return <div>준비 중...</div>;
    }
    // 듣기와 말하기 게임 번갈아가며
    const listeningItems = englishItems.slice(0, 5);
    const speakingItems = englishItems.slice(5, 10);
    
    return (
      <div>
        {listeningItems.length > 0 && (
          <ListeningGame
            items={listeningItems}
            onComplete={(results) => {
              if (speakingItems.length > 0) {
                // 말하기로 전환하는 로직 필요 (간단화를 위해 듣기만 처리)
                handleRoundComplete(results);
              } else {
                handleRoundComplete(results);
              }
            }}
          />
        )}
      </div>
    );
  }

  if (currentPhase === 'round-c') {
    const scienceSocialItems = roundItems.filter(
      (item) => item.subject === 'science' || item.subject === 'social'
    );
    if (scienceSocialItems.length === 0) {
      sessionFlow.nextPhase();
      return <div>준비 중...</div>;
    }

    const scienceItems = scienceSocialItems.filter((item) => item.subject === 'science');
    const socialItems = scienceSocialItems.filter((item) => item.subject === 'social');

    if (scienceItems.length > 0) {
      return (
        <CauseEffect
          items={scienceItems}
          onComplete={handleRoundComplete}
        />
      );
    } else if (socialItems.length > 0) {
      return (
        <ScenarioGame
          items={socialItems}
          onComplete={handleRoundComplete}
        />
      );
    }
  }

  if (currentPhase === 'recall-boss') {
    if (roundItems.length === 0) {
      sessionFlow.nextPhase();
      return <div>준비 중...</div>;
    }
    // 리콜 보스는 간단한 선택형으로 처리 (실제로는 각 항목의 게임 타입에 따라 다르게 처리해야 함)
    return (
      <ScenarioGame
        items={roundItems}
        onComplete={handleRecallBossComplete}
      />
    );
  }

  if (currentPhase === 'report') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-8">세션 완료!</h1>
        <div className="space-y-4">
          <p>총 라운드: {roundResults.length}</p>
          <p>
            정답률:{' '}
            {roundResults.length > 0
              ? Math.round(
                  (roundResults.reduce((sum, r) => sum + r.correct, 0) /
                    roundResults.reduce((sum, r) => sum + r.items.length, 0)) *
                    100
                )
              : 0}
            %
          </p>
          <Button
            onClick={() => {
              window.location.href = '/dashboard';
            }}
          >
            대시보드로 이동
          </Button>
        </div>
      </div>
    );
  }

  return <div>준비 중...</div>;
}

