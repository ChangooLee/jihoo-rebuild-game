import { db } from '@/lib/db';
import type { SessionLog, RoundResult } from '@/lib/types';

/**
 * 분석 지표 (KPI) 모듈
 */
export class KPIAnalytics {
  /**
   * 세션 완료율 계산
   */
  async getSessionCompletionRate(): Promise<number> {
    const logs = await db.sessionLogs.toArray();
    if (logs.length === 0) return 0;
    
    // 완료된 세션 (라운드 3개 이상)
    const completed = logs.filter((log: SessionLog) => log.rounds.length >= 3);
    return completed.length / logs.length;
  }

  /**
   * 평균 세션 길이
   */
  async getAverageSessionLength(): Promise<number> {
    const logs = await db.sessionLogs.toArray();
    if (logs.length === 0) return 0;
    
    const totalDuration = logs.reduce((sum: number, log: SessionLog) => sum + log.durationSec, 0);
    return totalDuration / logs.length;
  }

  /**
   * 재정복률 (FSRS Due→정답)
   */
  async getRecoveryRate(): Promise<number> {
    // 구현 필요: ReviewState에서 Due 항목의 정답률 계산
    return 0;
  }

  /**
   * 과목별 누적 시간
   */
  async getSubjectTime(): Promise<Record<string, number>> {
    const logs = await db.sessionLogs.toArray();
    const subjectTime: Record<string, number> = {
      math: 0,
      english: 0,
      science: 0,
      social: 0,
    };
    
    for (const log of logs) {
      for (const round of log.rounds) {
        subjectTime[round.subject] = (subjectTime[round.subject] || 0) + (log.durationSec / log.rounds.length);
      }
    }
    
    return subjectTime;
  }

  /**
   * 휴식 스킵률
   */
  async getBreakSkipRate(): Promise<number> {
    const logs = await db.sessionLogs.toArray();
    if (logs.length === 0) return 0;
    
    // 휴식이 2회 있는 경우 완전한 세션
    const withBreaks = logs.filter((log: SessionLog) => log.breaks >= 2);
    return 1 - (withBreaks.length / logs.length);
  }
}

export const kpiAnalytics = new KPIAnalytics();

