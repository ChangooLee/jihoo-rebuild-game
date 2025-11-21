'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SpeedCalculation } from '@/game/math';
import { ListeningGame, SpeakingGame, FPSGame } from '@/game/english';
import { CauseEffect } from '@/game/science';
import { ScenarioGame } from '@/game/social';
import { StroopTask, NumberSequenceGame, DirectionReactionGame, ColorMatchGame } from '@/game/warmup';
import { loadAllLearningItems } from '@/modules/content/loader';
import type { LearningItem } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const subject = params.subject as string;
  const gameType = params.game as string;
  const [items, setItems] = useState<LearningItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGame = async () => {
      setLoading(true);
      try {
        // 게임에 필요한 항목 로드
        if (subject === 'warmup') {
          // 워밍업 게임은 항목이 필요 없음
          setItems([]);
        } else {
          const allItems = await loadAllLearningItems();
          // 과목별 필터링
          const filteredItems = allItems.filter(item => item.subject === subject);
          // 샘플 10개 항목 선택 (실제로는 스케줄러 사용)
          setItems(filteredItems.slice(0, 10));
        }
      } catch (error) {
        console.error('Failed to load game items:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [subject]);

  const handleComplete = (results: any) => {
    // 게임 완료 후 메인 화면으로 복귀
    router.push('/jihoo');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>게임 로딩 중...</p>
      </div>
    );
  }

  // 게임 컴포넌트 렌더링
  const renderGame = () => {
    switch (subject) {
      case 'math':
        if (gameType === 'speed-calculation') {
          return <SpeedCalculation items={items} onComplete={handleComplete} />;
        }
        break;
      case 'english':
        if (gameType === 'listening') {
          return <ListeningGame items={items} onComplete={handleComplete} />;
        } else if (gameType === 'speaking') {
          return <SpeakingGame items={items} onComplete={handleComplete} />;
        } else if (gameType === 'fps') {
          return <FPSGame items={items} onComplete={handleComplete} />;
        }
        break;
      case 'science':
        if (gameType === 'cause-effect') {
          return <CauseEffect items={items} onComplete={handleComplete} />;
        }
        break;
      case 'social':
        if (gameType === 'scenario') {
          return <ScenarioGame items={items} onComplete={handleComplete} />;
        }
        break;
      case 'warmup':
        if (gameType === 'stroop') {
          return <StroopTask onComplete={handleComplete} />;
        } else if (gameType === 'number-sequence') {
          return <NumberSequenceGame onComplete={handleComplete} />;
        } else if (gameType === 'direction-reaction') {
          return <DirectionReactionGame onComplete={handleComplete} />;
        } else if (gameType === 'color-match') {
          return <ColorMatchGame onComplete={handleComplete} />;
        }
        break;
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl mb-4">게임을 찾을 수 없습니다</p>
        <Button onClick={() => router.push('/jihoo')}>메인으로 돌아가기</Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={() => router.push('/jihoo')}
          variant="outline"
          className="bg-white/90 hover:bg-white"
        >
          ← 메인으로
        </Button>
      </div>
      {renderGame()}
    </div>
  );
}



