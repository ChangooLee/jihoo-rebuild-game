import type { Subject, GradeBand, LearningItem } from '@/lib/types';
import { AdaptiveDifficultyEngine, type ResponseData } from '@/modules/engine/adaptive-difficulty';
import { db } from '@/lib/db';

export interface DiagnosticResult {
  gradeBand: GradeBand;
  weakTags: string[];
  estimatedDifficulty: number; // 평균 난이도
  subjectResults: {
    subject: Subject;
    correct: number;
    total: number;
    avgReactionTime: number;
    weakTags: string[];
  }[];
}

/**
 * 진단 테스트 엔진
 * 과목별 12문항, 1-up-1-down 난이도 추정, 약점 태그 추출
 */
export class DiagnosticEngine {
  private adaptiveEngine: AdaptiveDifficultyEngine;
  private results: Map<string, { correct: boolean; reactionTime: number }> = new Map();

  constructor() {
    this.adaptiveEngine = new AdaptiveDifficultyEngine();
  }

  /**
   * 진단 테스트 항목 선택 (과목별 12문항)
   */
  async selectDiagnosticItems(subject: Subject, gradeBand?: GradeBand): Promise<LearningItem[]> {
    let query = db.learningItems
      .where('subject')
      .equals(subject);
    
    if (gradeBand) {
      query = query.filter((item: LearningItem) => item.gradeBand.includes(gradeBand));
    }

    // 난이도 분포: 쉬움(1-3), 보통(4-6), 어려움(7-10) 각 4문항
    const items = await query.toArray();
    const easy = items.filter((i: LearningItem) => i.difficulty <= 3).slice(0, 4);
    const medium = items.filter((i: LearningItem) => i.difficulty >= 4 && i.difficulty <= 6).slice(0, 4);
    const hard = items.filter((i: LearningItem) => i.difficulty >= 7).slice(0, 4);

    return [...easy, ...medium, ...hard].slice(0, 12);
  }

  /**
   * 응답 기록
   */
  recordResponse(itemId: string, item: LearningItem, isCorrect: boolean, reactionTime: number) {
    const response: ResponseData = {
      isCorrect,
      latencyMs: reactionTime,
    };

    this.adaptiveEngine.recordResponse(itemId, item, response);
    this.results.set(itemId, { correct: isCorrect, reactionTime });
  }

  /**
   * 진단 결과 분석
   */
  analyzeResults(items: LearningItem[]): DiagnosticResult {
    const subjectResults: DiagnosticResult['subjectResults'] = [];
    const allWeakTags: string[] = [];
    let totalDifficulty = 0;
    let count = 0;

    // 과목별 결과 집계
    const bySubject = new Map<Subject, LearningItem[]>();
    for (const item of items) {
      if (!bySubject.has(item.subject)) {
        bySubject.set(item.subject, []);
      }
      bySubject.get(item.subject)!.push(item);
    }

    for (const [subject, subjectItems] of bySubject) {
      let correct = 0;
      let totalReactionTime = 0;
      const weakTags: string[] = [];

      for (const item of subjectItems) {
        const result = this.results.get(item.id);
        if (result) {
          if (result.correct) {
            correct++;
          } else {
            // 오답인 경우 개념 태그를 약점으로 추가
            weakTags.push(...item.conceptTag);
          }
          totalReactionTime += result.reactionTime;

          // 최종 난이도 집계
          const state = this.adaptiveEngine.getDifficultyState(item.id, item.difficulty);
          totalDifficulty += state.currentDifficulty;
          count++;
        }
      }

      const uniqueWeakTags = Array.from(new Set(weakTags));
      allWeakTags.push(...uniqueWeakTags);

      subjectResults.push({
        subject,
        correct,
        total: subjectItems.length,
        avgReactionTime: totalReactionTime / subjectItems.length || 0,
        weakTags: uniqueWeakTags,
      });
    }

    // GradeBand 추정 (가장 낮은 난이도 기준)
    const avgDifficulty = count > 0 ? totalDifficulty / count : 5;
    const gradeBand = this.estimateGradeBand(avgDifficulty, subjectResults);

    return {
      gradeBand,
      weakTags: Array.from(new Set(allWeakTags)),
      estimatedDifficulty: avgDifficulty,
      subjectResults,
    };
  }

  /**
   * GradeBand 추정 (난이도 기반)
   */
  private estimateGradeBand(
    avgDifficulty: number,
    subjectResults: DiagnosticResult['subjectResults']
  ): GradeBand {
    // 전체 정답률 계산
    const totalCorrect = subjectResults.reduce((sum, r) => sum + r.correct, 0);
    const totalItems = subjectResults.reduce((sum, r) => sum + r.total, 0);
    const accuracy = totalItems > 0 ? totalCorrect / totalItems : 0;

    // 난이도와 정답률을 결합하여 추정
    if (avgDifficulty <= 3 && accuracy >= 0.8) {
      return 'ES12';
    } else if (avgDifficulty <= 5 && accuracy >= 0.6) {
      return 'ES34';
    } else if (avgDifficulty <= 6 && accuracy >= 0.5) {
      return 'ES56';
    } else if (avgDifficulty <= 8 && accuracy >= 0.4) {
      return 'MS1';
    } else {
      return 'MS23';
    }
  }

  /**
   * 결과 초기화
   */
  reset() {
    this.results.clear();
    this.adaptiveEngine = new AdaptiveDifficultyEngine();
  }
}

