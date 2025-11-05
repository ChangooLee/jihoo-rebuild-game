import { getDueItems, recordReview } from '@/modules/fsrs/engine';
import { db } from '@/lib/db';
import type { LearningItem, FSRSOutcome } from '@/lib/types';

/**
 * 리콜 보스 모듈
 * FSRS Due 항목 + 오늘 틀린 문제 + 약점 태그 결합
 */
export class RecallBoss {
  /**
   * 리콜 보스용 항목 선택
   * 1. FSRS Due 항목 우선
   * 2. 오늘 틀린 문제
   * 3. 약점 태그 항목
   */
  async selectRecallItems(
    incorrectItemIds: string[],
    weakTags: string[] = [],
    limit: number = 10
  ): Promise<LearningItem[]> {
    const selected: LearningItem[] = [];

    // 1. FSRS Due 항목 우선
    const dueIds = await getDueItems(limit);
    if (dueIds.length > 0) {
      const dueItems = await db.learningItems
        .where('id')
        .anyOf(dueIds)
        .toArray();
      selected.push(...dueItems);
    }

    // 2. 오늘 틀린 문제
    if (incorrectItemIds.length > 0 && selected.length < limit) {
      const incorrectItems = await db.learningItems
        .where('id')
        .anyOf(incorrectItemIds)
        .filter((item: LearningItem) => !selected.some((s: LearningItem) => s.id === item.id))
        .limit(limit - selected.length)
        .toArray();
      selected.push(...incorrectItems);
    }

    // 3. 약점 태그 항목
    if (weakTags.length > 0 && selected.length < limit) {
      const weakTagItems = await db.learningItems
        .filter((item: LearningItem) => 
          item.conceptTag.some((tag: string) => weakTags.includes(tag)) &&
          !selected.some((s: LearningItem) => s.id === item.id)
        )
        .limit(limit - selected.length)
        .toArray();
      selected.push(...weakTagItems);
    }

    return selected.slice(0, limit);
  }

  /**
   * 리콜 결과 기록
   */
  async recordRecallResult(
    itemId: string,
    outcome: FSRSOutcome,
    latencyMs?: number
  ) {
    await recordReview(itemId, outcome, latencyMs);
  }
}

export const recallBoss = new RecallBoss();

