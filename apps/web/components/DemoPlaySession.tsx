'use client';

import { useState, useEffect } from 'react';
import { Brain, Clock, Lightbulb } from 'lucide-react';
import { DEMO_ITEMS } from '@/lib/demo-data';

export default function DemoPlaySession() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [autoProgress, setAutoProgress] = useState(true);

  const currentItem = DEMO_ITEMS[currentIndex];

  // 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 자동 진행 (60초 후 종료)
  useEffect(() => {
    if (autoProgress && timeElapsed >= 60) {
      window.location.href = '/result?demo=1';
    }
  }, [timeElapsed, autoProgress]);

  const handleChoiceSelect = (choiceId: string) => {
    setSelectedChoice(choiceId);
    const correct = choiceId === currentItem.answer.value;
    setIsCorrect(correct);

    setTimeout(() => {
      if (currentIndex < DEMO_ITEMS.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedChoice(null);
        setIsCorrect(null);
        setShowHints(false);
      } else {
        window.location.href = '/result?demo=1';
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* HUD */}
      <header 
        className="sticky top-0 z-50 bg-card border-b border-border/40 p-4"
        role="banner"
        aria-label="플레이 헤더"
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Brain className="w-6 h-6 text-primary" aria-hidden="true" />
            <span className="text-label-md font-medium">데모 플레이</span>
          </div>
          <div className="flex items-center gap-6">
            <div 
              className="flex items-center gap-2"
              role="timer"
              aria-live="polite"
              aria-atomic="true"
            >
              <Clock className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              <span className="text-label-md font-mono">
                {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div 
              className="flex items-center gap-2"
              role="status"
              aria-label="진행 상황"
            >
              <span className="text-label-sm text-muted-foreground">
                {currentIndex + 1} / {DEMO_ITEMS.length}
              </span>
            </div>
          </div>
        </div>
        {/* 진행도 바 */}
        <div className="mt-3 w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / DEMO_ITEMS.length) * 100}%` }}
            role="progressbar"
            aria-valuenow={(currentIndex + 1) / DEMO_ITEMS.length * 100}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`진행률 ${Math.round((currentIndex + 1) / DEMO_ITEMS.length * 100)}%`}
          />
        </div>
      </header>

      {/* 문제 영역 */}
      <main className="flex-1 container mx-auto px-4 py-8" id="main-content">
        <div className="max-w-2xl mx-auto">
          {/* 과목 배지 */}
          <div className="mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-label-sm font-medium ${
                currentItem.subject === 'math'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : currentItem.subject === 'english'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                  : currentItem.subject === 'science'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              }`}
            >
              {currentItem.subject === 'math'
                ? '수학'
                : currentItem.subject === 'english'
                ? '영어'
                : currentItem.subject === 'science'
                ? '과학'
                : '사회'}
            </span>
          </div>

          {/* 문제 */}
          <div
            className="bg-card p-8 rounded-lg shadow-lg border border-border/50 mb-6"
            role="region"
            aria-label="문제"
          >
            <h2 className="text-title-lg mb-6">
              {currentItem.stem.payload}
            </h2>

            {/* 선택지 */}
            <div className="space-y-3" role="radiogroup" aria-label="답 선택">
              {currentItem.choices?.map((choice, idx) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceSelect(choice.id)}
                  disabled={selectedChoice !== null}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedChoice === choice.id
                      ? isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-border hover:border-primary hover:bg-accent/10'
                  } ${selectedChoice !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  role="radio"
                  aria-checked={selectedChoice === choice.id}
                  aria-label={`선택지 ${idx + 1}: ${choice.label}`}
                  tabIndex={0}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + idx)}.</span>
                  {choice.label}
                </button>
              ))}
            </div>
          </div>

          {/* 힌트 */}
          {currentItem.hints && currentItem.hints.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setShowHints(!showHints)}
                className="flex items-center gap-2 text-primary hover:underline"
                aria-expanded={showHints}
                aria-controls="hints-panel"
              >
                <Lightbulb className="w-4 h-4" aria-hidden="true" />
                <span className="text-label-md">힌트 {showHints ? '숨기기' : '보기'}</span>
              </button>
              {showHints && (
                <div
                  id="hints-panel"
                  className="mt-3 p-4 bg-accent/20 rounded-lg"
                  role="region"
                  aria-label="힌트"
                >
                  <ul className="list-disc list-inside space-y-1">
                    {currentItem.hints.map((hint, idx) => (
                      <li key={idx} className="text-body-sm text-muted-foreground">
                        {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 피드백 */}
          {isCorrect !== null && (
            <div
              className={`p-4 rounded-lg ${
                isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              }`}
              role="alert"
              aria-live="polite"
            >
              <p className={`text-body-md font-medium ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {isCorrect ? '✅ 정답입니다!' : '❌ 틀렸습니다. 다시 도전해보세요!'}
              </p>
            </div>
          )}

          {/* 데모 안내 */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border/30">
            <p className="text-label-sm text-muted-foreground text-center">
              🎮 데모 모드 · 60초 후 자동 종료 · <a href="/session" className="text-primary hover:underline">실제 플레이 하기</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

