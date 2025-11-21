'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DiagnosticEngine, type DiagnosticResult } from '@/modules/diagnostic/engine';
import type { LearningItem, Subject } from '@/lib/types';
import { db } from '@/lib/db';
import { MathRenderer } from '@/components/MathRenderer';

const SUBJECTS: Subject[] = ['math', 'english', 'science', 'social'];

export default function DiagnosticPage() {
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [items, setItems] = useState<Map<Subject, LearningItem[]>>(new Map());
  const [diagnosticEngine] = useState(() => new DiagnosticEngine());
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  // 진단 테스트 초기화
  useEffect(() => {
    initializeDiagnostic();
  }, []);

  const initializeDiagnostic = async () => {
    const itemsMap = new Map<Subject, LearningItem[]>();
    
    for (const subject of SUBJECTS) {
      const subjectItems = await diagnosticEngine.selectDiagnosticItems(subject);
      itemsMap.set(subject, subjectItems);
    }
    
    setItems(itemsMap);
    setStartTime(Date.now());
  };

  const currentSubject = SUBJECTS[currentSubjectIndex];
  const currentItems = items.get(currentSubject) || [];
  const currentItem = currentItems[currentItemIndex];

  const handleAnswer = (isCorrect: boolean) => {
    if (!currentItem || !startTime) return;

    const reactionTime = Date.now() - startTime;
    diagnosticEngine.recordResponse(currentItem.id, currentItem, isCorrect, reactionTime);

    // 다음 문제로
    if (currentItemIndex + 1 < currentItems.length) {
      setCurrentItemIndex((prev) => prev + 1);
      setUserAnswer('');
      setSelectedChoice(null);
      setStartTime(Date.now());
    } else if (currentSubjectIndex + 1 < SUBJECTS.length) {
      // 다음 과목으로
      setCurrentSubjectIndex((prev) => prev + 1);
      setCurrentItemIndex(0);
      setUserAnswer('');
      setSelectedChoice(null);
      setStartTime(Date.now());
    } else {
      // 진단 완료
      const allItems: LearningItem[] = [];
      for (const subjectItems of items.values()) {
        allItems.push(...subjectItems);
      }
      const diagnosticResult = diagnosticEngine.analyzeResults(allItems);
      setResult(diagnosticResult);
      
      // 결과 저장
      saveDiagnosticResult(diagnosticResult);
    }
  };

  const handleSubmit = () => {
    if (!currentItem) return;

    let isCorrect = false;

    if (currentItem.answer.kind === 'mcq' && selectedChoice) {
      isCorrect = selectedChoice === currentItem.answer.value;
    } else if (currentItem.answer.kind === 'short') {
      try {
        const expected = Number(currentItem.answer.value);
        const actual = Number(userAnswer);
        isCorrect = Math.abs(expected - actual) < 0.01;
      } catch {
        isCorrect = false;
      }
    }

    handleAnswer(isCorrect);
  };

  const saveDiagnosticResult = async (result: DiagnosticResult) => {
    // UserProfile에 저장
    const profile = await db.userProfile.get('default');
    await db.userProfile.put({
      id: 'default',
      gradeBand: result.gradeBand,
      weakTags: result.weakTags,
      preferredFont: profile?.preferredFont,
      animationIntensity: profile?.animationIntensity,
      focusMode: profile?.focusMode,
    });
  };

  if (result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-8">진단 결과</h1>
        
        <div className="w-full max-w-2xl space-y-6">
          <div className="p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-bold mb-2">추정 학년군</h2>
            <p className="text-2xl">{result.gradeBand}</p>
          </div>

          <div className="p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-bold mb-4">과목별 결과</h2>
            {result.subjectResults.map((sr) => (
              <div key={sr.subject} className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="font-bold">{sr.subject}</span>
                  <span>{sr.correct} / {sr.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(sr.correct / sr.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-yellow-50 rounded-lg">
            <h2 className="text-xl font-bold mb-2">약점 태그</h2>
            <div className="flex flex-wrap gap-2">
              {result.weakTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-yellow-200 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <Button
            onClick={() => {
              window.location.href = '/';
            }}
            className="w-full"
            size="lg"
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>준비 중...</p>
      </div>
    );
  }

  const progress = ((currentSubjectIndex * 12 + currentItemIndex + 1) / (SUBJECTS.length * 12)) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">
              {currentSubject} - 문제 {currentItemIndex + 1} / {currentItems.length}
            </span>
            <span className="text-sm text-gray-600">
              전체 진행: {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="text-xl font-bold mb-4">
            {currentItem.stem.type === 'text' ? (
              <MathRenderer content={currentItem.stem.payload} />
            ) : (
              '문제를 표시할 수 없습니다'
            )}
          </div>
        </div>

        {currentItem.answer.kind === 'mcq' && currentItem.choices ? (
          <div className="space-y-4 mb-8">
            {currentItem.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => setSelectedChoice(choice.id)}
                className={`w-full p-4 rounded-lg text-left transition-colors ${
                  selectedChoice === choice.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <MathRenderer content={choice.label} />
              </button>
            ))}
          </div>
        ) : (
          <div className="mb-8">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              autoFocus
              className="w-full p-4 border-2 border-gray-300 rounded-lg text-center text-lg"
              placeholder="답을 입력하세요"
            />
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={
            (currentItem.answer.kind === 'mcq' && !selectedChoice) ||
            (currentItem.answer.kind === 'short' && !userAnswer)
          }
          size="lg"
          className="w-full"
        >
          확인
        </Button>
      </div>
    </div>
  );
}

