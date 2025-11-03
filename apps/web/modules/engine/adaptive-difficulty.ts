import type { LearningItem, FSRSOutcome } from '@/lib/types';

export interface DifficultyState {
  currentDifficulty: number; // 1-10
  minDifficulty: number; // 기본 1
  maxDifficulty: number; // 기본 10
}

export interface ResponseData {
  isCorrect: boolean;
  latencyMs: number;
  baselineLatencyMs?: number; // 평균 반응시간
}

/**
 * 1-up-1-down 알고리즘으로 난이도를 조정합니다.
 * 정답: +0.5단계, 오답: -0.5단계
 */
export function adjustDifficulty1Up1Down(
  state: DifficultyState,
  isCorrect: boolean
): DifficultyState {
  let newDifficulty = state.currentDifficulty;
  
  if (isCorrect) {
    newDifficulty = Math.min(state.maxDifficulty, newDifficulty + 0.5);
  } else {
    newDifficulty = Math.max(state.minDifficulty, newDifficulty - 0.5);
  }
  
  return {
    ...state,
    currentDifficulty: newDifficulty,
  };
}

/**
 * 속도 보정: 정답이어도 지연이면 'hard'로 기록
 * 상위 n% (기본 20%) 느리면 hard로 간주
 */
export function shouldMarkAsHard(
  latencyMs: number,
  baselineLatencyMs: number,
  percentileThreshold: number = 0.8 // 상위 20% = 80 percentile
): boolean {
  // percentile threshold보다 느리면 hard
  return latencyMs > baselineLatencyMs * percentileThreshold;
}

/**
 * 응답 결과를 기반으로 FSRS outcome을 결정합니다.
 * 속도 보정을 적용합니다.
 */
export function determineOutcome(
  isCorrect: boolean,
  latencyMs: number,
  baselineLatencyMs?: number
): FSRSOutcome {
  if (!isCorrect) {
    // 오답이면 속도에 따라 again 또는 hard
    if (baselineLatencyMs && latencyMs < baselineLatencyMs * 0.5) {
      // 빠르게 틀렸으면 again
      return 'again';
    }
    return 'hard';
  }
  
  // 정답인 경우
  if (baselineLatencyMs && shouldMarkAsHard(latencyMs, baselineLatencyMs)) {
    // 느리게 맞췄으면 hard
    return 'hard';
  }
  
  // 정상적으로 맞췄으면 good
  return 'good';
}

/**
 * 적응 난이도 엔진
 * 학습 항목의 난이도를 동적으로 조정하고, 속도 보정을 적용합니다.
 */
export class AdaptiveDifficultyEngine {
  private states: Map<string, DifficultyState> = new Map();
  private baselineLatencies: Map<string, number> = new Map();

  /**
   * 항목의 난이도 상태를 가져옵니다.
   */
  getDifficultyState(itemId: string, initialDifficulty: number): DifficultyState {
    if (!this.states.has(itemId)) {
      this.states.set(itemId, {
        currentDifficulty: initialDifficulty,
        minDifficulty: 1,
        maxDifficulty: 10,
      });
    }
    return this.states.get(itemId)!;
  }

  /**
   * 응답을 기록하고 난이도를 조정합니다.
   */
  recordResponse(
    itemId: string,
    item: LearningItem,
    response: ResponseData
  ): {
    updatedDifficulty: number;
    outcome: FSRSOutcome;
  } {
    const state = this.getDifficultyState(itemId, item.difficulty);
    
    // 1-up-1-down으로 난이도 조정
    const updatedState = adjustDifficulty1Up1Down(state, response.isCorrect);
    this.states.set(itemId, updatedState);
    
    // 속도 보정 적용
    const baseline = this.baselineLatencies.get(itemId) || response.baselineLatencyMs || response.latencyMs;
    if (response.isCorrect && !this.baselineLatencies.has(itemId)) {
      // 첫 정답의 반응시간을 기준으로 설정
      this.baselineLatencies.set(itemId, response.latencyMs);
    }
    
    const outcome = determineOutcome(
      response.isCorrect,
      response.latencyMs,
      baseline
    );
    
    return {
      updatedDifficulty: updatedState.currentDifficulty,
      outcome,
    };
  }

  /**
   * 기준 반응시간을 업데이트합니다 (이동 평균).
   */
  updateBaseline(itemId: string, latencyMs: number, alpha: number = 0.3) {
    const current = this.baselineLatencies.get(itemId) || latencyMs;
    const updated = current * (1 - alpha) + latencyMs * alpha;
    this.baselineLatencies.set(itemId, updated);
  }
}

