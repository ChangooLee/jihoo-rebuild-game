'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SessionFlowManager } from '@/modules/focus/session-flow';
import { BoxBreathing } from '@/modules/focus/break';
import { StroopTask, NumberSequenceGame, DirectionReactionGame, ColorMatchGame } from '@/game/warmup';
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
import { recordReview } from '@/modules/fsrs/engine';
import { AdaptiveDifficultyEngine, determineOutcome } from '@/modules/engine/adaptive-difficulty';

// 워밍업 게임 타입 정의
type WarmupGame = 'stroop' | 'number-sequence' | 'direction-reaction' | 'color-match';

const WARMUP_GAMES: WarmupGame[] = ['stroop', 'number-sequence', 'direction-reaction', 'color-match'];

export default function SessionPage() {
  const [sessionFlow] = useState(() => new SessionFlowManager());
  const [currentPhase, setCurrentPhase] = useState<SessionPhase>('warmup');
  const [roundItems, setRoundItems] = useState<LearningItem[]>([]);
  const [warmupResult, setWarmupResult] = useState<any>(null);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [incorrectItems, setIncorrectItems] = useState<string[]>([]);
  const [scheduler, setScheduler] = useState<PersonalizedScheduler | null>(null);
  const [adaptiveEngine] = useState(() => new AdaptiveDifficultyEngine());
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | 'complete'; message?: string } | null>(null);
  const [subjectTimes, setSubjectTimes] = useState({ math: 0, english: 0, science: 0, social: 0 });
  const [showResult, setShowResult] = useState(false);
  const [selectedWarmupGame, setSelectedWarmupGame] = useState<WarmupGame | null>(null);

  useEffect(() => {
    // 워밍업 게임 랜덤 선택 (컴포넌트 마운트 시 한 번만)
    const randomGame = WARMUP_GAMES[Math.floor(Math.random() * WARMUP_GAMES.length)];
    setSelectedWarmupGame(randomGame);

    // 스케줄러 초기화 (UserProfile에서 firstSessionDate 가져오기)
    const initializeScheduler = async () => {
      const profile = await db.userProfile.get('default');
      const schedulerInstance = new PersonalizedScheduler({
        gradeBand: profile?.gradeBand,
        weakTags: profile?.weakTags,
        firstSessionDate: profile?.firstSessionDate,
      });
      setScheduler(schedulerInstance);
    };
    
    initializeScheduler();

    // 페이즈 변경 콜백 등록
    sessionFlow.onPhaseChangeCallback(async (phase) => {
      console.log('Phase changed to:', phase);
      setCurrentPhase(phase);
      await handlePhaseChange(phase);
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
    // scheduler가 아직 준비되지 않았으면 대기
    if (!scheduler) {
      // scheduler 준비 대기
      const checkScheduler = async () => {
        const profile = await db.userProfile.get('default');
        const schedulerInstance = new PersonalizedScheduler({
          gradeBand: profile?.gradeBand,
          weakTags: profile?.weakTags,
          firstSessionDate: profile?.firstSessionDate,
        });
        setScheduler(schedulerInstance);
        
        // scheduler 준비 후 다시 처리
        if (phase === 'round-a' || phase === 'round-b' || phase === 'round-c') {
          const items = await schedulerInstance.selectItemsForRound(10);
          setRoundItems(items);
        } else if (phase === 'recall-boss') {
          const items = await recallBoss.selectRecallItems(
            incorrectItems,
            profile?.weakTags || [],
            10
          );
          setRoundItems(items);
        }
      };
      
      await checkScheduler();
      return;
    }
    
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

  const handleWarmupComplete = async (result: any) => {
    setWarmupResult(result);
    // 다음 페이즈로 이동
    // SessionFlowManager의 nextPhase()가 onPhaseChange 콜백을 호출하므로
    // currentPhase가 자동으로 업데이트됨
    sessionFlow.nextPhase();
  };

  const handleRoundComplete = async (results: { itemId: string; correct: boolean; latencyMs: number }[]) => {
    const correct = results.filter((r) => r.correct).length;
    const avgLatency = results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length;

    // 오답 항목 추적
    const incorrect = results.filter((r) => !r.correct).map((r) => r.itemId);
    setIncorrectItems((prev) => [...prev, ...incorrect]);

    // 각 결과에 대해 FSRS 상태 실시간 업데이트
    const baselineLatency = avgLatency;
    for (const result of results) {
      const item = roundItems.find((i) => i.id === result.itemId);
      if (item) {
        // AdaptiveDifficultyEngine을 사용하여 outcome 결정
        const outcome = determineOutcome(
          result.correct,
          result.latencyMs,
          baselineLatency
        );
        
        // FSRS 상태 업데이트
        await recordReview(result.itemId, outcome, result.latencyMs);
        
        // AdaptiveDifficultyEngine에도 기록 (난이도 추적용)
        adaptiveEngine.recordResponse(item.id, item, {
          isCorrect: result.correct,
          latencyMs: result.latencyMs,
          baselineLatencyMs: baselineLatency,
        });
      }
    }

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

  const handleRecallBossComplete = async (results: { itemId: string; correct: boolean; latencyMs: number }[]) => {
    await handleRoundComplete(results);
  };

  const saveSession = async (state: any) => {
    await db.sessionLogs.add({
      startAt: state.startTime,
      durationSec: state.elapsedSeconds,
      rounds: state.roundResults,
      breaks: 2,
    });
    
    // 첫 세션 날짜 기록 (README.md: 시간 가중치 조정용)
    const profile = await db.userProfile.get('default');
    if (!profile || !profile.firstSessionDate) {
      await db.userProfile.put({
        id: 'default',
        ...profile,
        firstSessionDate: state.startTime,
      });
    }
  };

  const handleSkipPhase = () => {
    // 현재 페이즈를 스킵하고 다음 페이즈로 이동
    sessionFlow.nextPhase();
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

      {/* 단계 스킵 버튼 */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={handleSkipPhase}
          variant="outline"
          className="bg-white/90 hover:bg-white"
        >
          다음 단계
        </Button>
      </div>

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
        {currentPhase === 'warmup' && selectedWarmupGame && (
          <>
            {selectedWarmupGame === 'stroop' && (
              <StroopTask onComplete={handleWarmupComplete} duration={90} />
            )}
            {selectedWarmupGame === 'number-sequence' && (
              <NumberSequenceGame onComplete={handleWarmupComplete} duration={90} />
            )}
            {selectedWarmupGame === 'direction-reaction' && (
              <DirectionReactionGame onComplete={handleWarmupComplete} duration={90} />
            )}
            {selectedWarmupGame === 'color-match' && (
              <ColorMatchGame onComplete={handleWarmupComplete} duration={90} />
            )}
          </>
        )}

        {(currentPhase === 'break-1' || currentPhase === 'break-2') && (
          <BoxBreathing
            duration={50}
            onComplete={handleBreakComplete}
            skipEnabled={true}
            minDuration={10}
          />
        )}

        {currentPhase === 'round-a' && (
          roundItems.filter(item => item.subject === 'math').length > 0 ? (
            <SpeedCalculation
              items={roundItems.filter(item => item.subject === 'math')}
              onComplete={handleRoundComplete}
              timeLimit={180}
            />
          ) : (
            <div className="text-center">준비 중...</div>
          )
        )}

        {currentPhase === 'round-b' && (
          roundItems.filter(item => item.subject === 'english').length > 0 ? (
            <ListeningGame
              items={roundItems.filter(item => item.subject === 'english')}
              onComplete={handleRoundComplete}
            />
          ) : (
            <div className="text-center">준비 중...</div>
          )
        )}

        {currentPhase === 'round-c' && (
          roundItems.filter(item => item.subject === 'science' || item.subject === 'social').length > 0 ? (
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
          ) : (
            <div className="text-center">준비 중...</div>
          )
        )}

        {currentPhase === 'recall-boss' && (
          roundItems.length > 0 ? (
            <ScenarioGame
              items={roundItems}
              onComplete={handleRecallBossComplete}
            />
          ) : (
            <div className="text-center">준비 중...</div>
          )
        )}
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

