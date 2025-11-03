'use client';

import { useState } from 'react';
import { QuestCTA } from '@/components/ui/QuestCTA';
import { Zap, Target, Brain, GraduationCap } from 'lucide-react';

type GradeBand = 'ES' | 'MS';

export default function HomePage() {
  const handleStartQuest = () => {
    window.location.href = '/jihoo/session';
  };

  const handleFreePractice = () => {
    window.location.href = '/jihoo/dashboard';
  };

  const handleDiagnostic = () => {
    window.location.href = '/jihoo/diagnostic';
  };

  return (
    <>
      {/* 스킵 링크 (접근성) */}
      <a href="#main-content" className="skip-link">
        메인 콘텐츠로 이동
      </a>

      <div className="min-h-screen bg-background">
        {/* 헤더 */}
        <header className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-lg bg-background/80">
          <nav className="container mx-auto px-4 py-4 flex items-center justify-between" role="navigation" aria-label="메인 내비게이션">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" aria-hidden="true" />
              <h1 className="text-title-md font-bold">
                Jihoo Quest
              </h1>
            </div>

            {/* 적응형 레벨 안내 */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30">
              <Target className="w-4 h-4 text-primary" aria-hidden="true" />
              <span className="text-label-sm text-primary font-medium">
                자동 레벨 조정
              </span>
            </div>

            {/* 로그인 없이 시작 */}
            <p className="text-label-sm text-muted-foreground">
              로그인 없이 시작
            </p>
          </nav>
        </header>

        {/* 메인 콘텐츠 */}
        <main id="main-content" className="container mx-auto px-4 py-12">
          {/* 히어로 섹션 */}
          <section className="max-w-4xl mx-auto text-center mb-20" aria-labelledby="hero-heading">
            {/* 가치 제안 */}
            <h2 id="hero-heading" className="text-display-sm mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              10~15분 퀘스트로<br />
              집중력 + 교과 성취
            </h2>
            
            <p className="text-body-md text-muted-foreground mb-8 max-w-2xl mx-auto">
              집중력 향상 학습 게임 · 강제 휴식 · 즉시 보상 · 적응형 난이도
            </p>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
              <QuestCTA
                title="오늘 퀘스트 시작"
                description="10~15분 · 워밍업 → 3라운드 → 리콜 보스"
                onClick={handleStartQuest}
                variant="primary"
                icon={<Zap />}
                shortcut="Enter"
                className="sm:w-96"
              />
              
              {/* Secondary CTA */}
              <QuestCTA
                title="자유 연습"
                description="과목별 문제 풀이 · 대시보드"
                onClick={handleFreePractice}
                variant="secondary"
                icon={<GraduationCap />}
                className="sm:w-80"
              />
            </div>

            {/* 진단 테스트 안내 */}
            <div className="flex justify-center mb-8">
              <button
                onClick={handleDiagnostic}
                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border/50 hover:border-primary/50 transition-all"
                data-analytics="landing_diagnostic"
              >
                <Target className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-label-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  처음이신가요? <span className="text-primary font-medium">진단 테스트</span>로 시작하세요
                </span>
              </button>
            </div>

            {/* 빠른 통계 (동기부여) */}
            <div className="flex justify-center gap-8 text-label-sm text-muted-foreground">
              <div>
                <span className="font-bold text-primary">수학 40%</span> · 
                <span className="ml-1">영어 30%</span>
              </div>
              <div className="border-l border-border pl-8">
                과학 15% · 사회 15%
              </div>
            </div>
          </section>

          {/* 3가지 가치 카드 */}
          <section className="max-w-6xl mx-auto mb-20" aria-labelledby="features-heading">
            <h2 id="features-heading" className="sr-only">주요 기능</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* 즉시 시작 */}
              <article className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-title-md mb-3">즉시 시작</h3>
                <p className="text-body-md text-muted-foreground leading-relaxed">
                  클릭 3번 이내 플레이 진입. 
                  로그인 없이 바로 시작하고, 
                  데이터는 브라우저에 안전하게 저장됩니다.
                </p>
              </article>

              {/* 강제 휴식 */}
              <article className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-success" aria-hidden="true" />
                </div>
                <h3 className="text-title-md mb-3">강제 휴식</h3>
                <p className="text-body-md text-muted-foreground leading-relaxed">
                  3분 라운드마다 50초 박스 호흡. 
                  과몰입 방지와 지속 가능한 집중을 위해 
                  스킵 최소화 설계.
                </p>
              </article>

              {/* 리콜 보스 */}
              <article className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-warning" aria-hidden="true" />
                </div>
                <h3 className="text-title-md mb-3">리콜 보스</h3>
                <p className="text-body-md text-muted-foreground leading-relaxed">
                  오답과 약점 태그를 
                  과학적 간격 반복(FSRS)으로 재출제. 
                  실수를 성장의 기회로 전환합니다.
                </p>
              </article>
            </div>
          </section>

          {/* 커리큘럼 정렬 */}
          <section className="max-w-4xl mx-auto text-center mb-12" aria-labelledby="curriculum-heading">
            <h2 id="curriculum-heading" className="text-headline-md mb-4">
              적응형 학습 시스템
            </h2>
            <p className="text-body-md text-muted-foreground mb-6">
              진단 테스트로 현재 레벨 파악 · 실시간 난이도 조정 (1-up-1-down) · 
              오답 기반 약점 집중 · 한국 교육과정 정렬
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {['수와 연산', '도형', '자료와 가능성', '듣기', '읽기', '문법', '물질', '지구와 우주', '지리', '역사'].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-muted rounded-full text-label-sm text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </main>

        {/* 푸터 */}
        <footer className="border-t border-border/40 py-8">
          <div className="container mx-auto px-4 text-center text-label-sm text-muted-foreground">
            <p className="mb-2">
              Jihoo Quest · MIT License · 
              <a href="https://github.com/ChangooLee/jihoo-rebuild-game" className="ml-2 underline hover:text-primary">
                GitHub
              </a>
            </p>
            <p>
              콘텐츠 출처: mathgenerator(MIT) · OpenStax(CC BY 4.0) · 
              Tatoeba(CC0) · KOGL(1유형)
            </p>
          </div>
        </footer>
      </div>

      {/* 구조화 데이터 (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: 'Jihoo Quest',
            description: '집중력 향상 적응형 학습 게임 - 10~15분 퀘스트로 집중력과 교과 성취',
            provider: {
              '@type': 'Organization',
              name: 'Jihoo Quest',
              url: 'https://moba-project.org/jihoo',
            },
            educationalLevel: '초등학교-중학교',
            teaches: ['수학', '영어', '과학', '사회'],
            timeRequired: 'PT15M',
            interactivityType: 'active',
            learningResourceType: 'Adaptive Learning Game',
            accessMode: ['textual', 'visual', 'auditory'],
            accessibilityFeature: [
              'alternativeText',
              'readingOrder',
              'structuralNavigation',
              'tableOfContents',
            ],
            inLanguage: 'ko',
          }),
        }}
      />
    </>
  );
}
