import { FSRS, Card, Rating } from 'fsrs.js';
import type { ReviewState, FSRSOutcome } from '@/lib/types';
import { db } from '@/lib/db';

const fsrs = new FSRS();

/**
 * Type definition for FSRS scheduling results.
 * Each Rating maps to a card state and optional log entry.
 *
 * @see {@link https://github.com/open-spaced-repetition/fsrs.js}
 */
interface RecordLogItem {
  card: Card;
  log?: {
    rating: Rating;
    state: number;
    due: Date;
    stability: number;
    difficulty: number;
    elapsed_days: number;
    last_elapsed_days: number;
    scheduled_days: number;
    review: Date;
  };
}

type SchedulingResult = Record<Rating, RecordLogItem>;

/**
 * FSRS 결과를 ReviewState의 FSRSOutcome으로 변환합니다.
 */
export function outcomeToRating(outcome: FSRSOutcome): Rating {
  switch (outcome) {
    case 'again':
      return Rating.Again;
    case 'hard':
      return Rating.Hard;
    case 'good':
      return Rating.Good;
    case 'easy':
      return Rating.Easy;
  }
}

/**
 * 리콜 결과를 기록하고 FSRS 상태를 업데이트합니다.
 *
 * @param itemId - 학습 항목 ID
 * @param outcome - 리콜 결과 (again/hard/good/easy)
 * @param latencyMs - 응답 시간 (밀리초)
 * @returns 업데이트된 ReviewState
 */
export async function recordReview(
  itemId: string,
  outcome: FSRSOutcome,
  latencyMs?: number
): Promise<ReviewState> {
  const existing = await db.reviewStates.get(itemId);

  const card: Card = existing?.fsrs
    ? existing.fsrs
    : new Card();

  const now = new Date();
  const rating = outcomeToRating(outcome);
  const schedulingCards: SchedulingResult = fsrs.repeat(card, now);
  const selectedCard: RecordLogItem = schedulingCards[rating];

  const reviewState: ReviewState = {
    itemId,
    fsrs: selectedCard.card,
    lastOutcome: outcome,
    lastLatencyMs: latencyMs,
  };

  await db.reviewStates.put(reviewState);
  return reviewState;
}

/**
 * 오늘 리콜해야 할 항목들을 가져옵니다 (Due 항목).
 */
export async function getDueItems(limit: number = 20): Promise<string[]> {
  const now = new Date();
  const allStates = await db.reviewStates.toArray();
  
  const dueItems: string[] = [];
  
  for (const state of allStates) {
    if (state.fsrs) {
      const card = state.fsrs;
      const dueDate = card.due ? new Date(card.due) : null;
      if (dueDate && dueDate <= now) {
        dueItems.push(state.itemId);
        if (dueItems.length >= limit) break;
      }
    } else {
      // FSRS 상태가 없는 항목은 즉시 due로 간주
      dueItems.push(state.itemId);
      if (dueItems.length >= limit) break;
    }
  }
  
  return dueItems;
}

/**
 * 항목의 현재 FSRS 상태를 가져옵니다.
 */
export async function getReviewState(itemId: string): Promise<ReviewState | undefined> {
  return await db.reviewStates.get(itemId);
}
