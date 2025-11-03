import { FSRS, Card, Rating } from 'fsrs.js';
import type { ReviewState, FSRSOutcome } from '@/lib/types';
import { db } from '@/lib/db';

const fsrs = new FSRS();

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
 */
export async function recordReview(
  itemId: string,
  outcome: FSRSOutcome,
  latencyMs?: number
): Promise<ReviewState> {
  const existing = await db.reviewStates.get(itemId);
  
  const card = existing?.fsrs 
    ? Card.fromJSON(existing.fsrs)
    : fsrs.createCard();

  const now = new Date();
  const scheduledCard = fsrs.repeat(card, now);

  const reviewState: ReviewState = {
    itemId,
    fsrs: scheduledCard.toJSON(),
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
      const card = Card.fromJSON(state.fsrs);
      if (card.due <= now) {
        dueItems.push(state.itemId);
        if (dueItems.length >= limit) break;
      }
    } else {
      // FSRS 상태가 없는 항목은 즉시 due로 간주
      dueItems.push(state.itemId);
      if (dueItems.length >= limit) break;
    }
  }
  
  // due 시간 순으로 정렬
  return dueItems.sort((a, b) => {
    const stateA = allStates.find(s => s.itemId === a);
    const stateB = allStates.find(s => s.itemId === b);
    
    if (!stateA?.fsrs) return -1;
    if (!stateB?.fsrs) return 1;
    
    const cardA = Card.fromJSON(stateA.fsrs);
    const cardB = Card.fromJSON(stateB.fsrs);
    return cardA.due.getTime() - cardB.due.getTime();
  });
}

/**
 * 항목의 현재 FSRS 상태를 가져옵니다.
 */
export async function getReviewState(itemId: string): Promise<ReviewState | undefined> {
  return await db.reviewStates.get(itemId);
}

