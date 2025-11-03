import Link from 'next/link';
import { Trophy, Target, Clock, TrendingUp } from 'lucide-react';

export default function ResultDemoPage() {
  // 더미 데이터
  const stats = {
    totalItems: 12,
    correctItems: 9,
    accuracy: 75,
    avgLatency: 3200,
    totalTime: 38,
    subjectBreakdown: {
      math: { correct: 3, total: 4, time: 12 },
      english: { correct: 2, total: 3, time: 10 },
      science: { correct: 2, total: 3, time: 9 },
      social: { correct: 2, total: 2, time: 7 },
    },
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-display-sm mb-2">세션 완료!</h1>
          <p className="text-body-lg text-muted-foreground">
            훌륭해요! 오늘도 한 걸음 성장했습니다 🎉
          </p>
        </div>

        {/* 주요 통계 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border border-border/50 text-center">
            <Target className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-label-sm text-muted-foreground">정답률</p>
            <p className="text-display-sm font-bold text-primary">{stats.accuracy}%</p>
            <p className="text-label-xs text-muted-foreground mt-1">
              {stats.correctItems}/{stats.totalItems}문항
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border/50 text-center">
            <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-label-sm text-muted-foreground">평균 응답시간</p>
            <p className="text-display-sm font-bold">{(stats.avgLatency / 1000).toFixed(1)}초</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border/50 text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-label-sm text-muted-foreground">총 시간</p>
            <p className="text-display-sm font-bold">{stats.totalTime}분</p>
          </div>
        </div>

        {/* 과목별 분석 */}
        <div className="bg-card p-6 rounded-lg border border-border/50 mb-8">
          <h2 className="text-title-md mb-4">과목별 분석</h2>
          <div className="space-y-4">
            {Object.entries(stats.subjectBreakdown).map(([subject, data]) => {
              const percentage = (data.correct / data.total) * 100;
              return (
                <div key={subject}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-label-md font-medium">
                      {subject === 'math' ? '수학' : subject === 'english' ? '영어' : subject === 'science' ? '과학' : '사회'}
                    </span>
                    <span className="text-label-sm text-muted-foreground">
                      {data.correct}/{data.total} · {data.time}분
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 오답 복습 */}
        <div className="bg-accent/20 p-6 rounded-lg border border-accent/40 mb-8">
          <h2 className="text-title-md mb-2">오답 복습</h2>
          <p className="text-body-sm text-muted-foreground mb-4">
            틀린 {stats.totalItems - stats.correctItems}문항이 리콜 보스에 등록되었습니다. 
            내일 다시 도전해보세요!
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            대시보드 보기
          </Link>
        </div>

        {/* CTA */}
        <div className="flex gap-4">
          <Link
            href="/session"
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg text-center hover:bg-primary/90 transition-colors"
          >
            다시 시작
          </Link>
          <Link
            href="/"
            className="flex-1 py-3 bg-card border border-border/50 rounded-lg text-center hover:bg-accent/10 transition-colors"
          >
            홈으로
          </Link>
        </div>

        {/* 데모 안내 */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border/30 text-center">
          <p className="text-label-sm text-muted-foreground">
            🎮 데모 모드 · <Link href="/play?demo=1" className="text-primary hover:underline">다시 플레이</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

