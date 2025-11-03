/**
 * 주의 부하 관리 모듈
 * 오답/지연 연속 감지 및 자동 조정
 */

export interface CognitiveLoadState {
  consecutiveErrors: number;
  consecutiveDelays: number;
  difficultyReduced: boolean;
  animationReduced: boolean;
}

export class CognitiveLoadManager {
  private state: CognitiveLoadState = {
    consecutiveErrors: 0,
    consecutiveDelays: 0,
    difficultyReduced: false,
    animationReduced: false,
  };

  private readonly ERROR_THRESHOLD = 3; // 연속 오답 임계값
  private readonly DELAY_THRESHOLD = 3; // 연속 지연 임계값

  /**
   * 오답 기록
   */
  recordError() {
    this.state.consecutiveErrors++;
    this.state.consecutiveDelays = 0; // 오답이면 지연 카운터 리셋

    if (this.state.consecutiveErrors >= this.ERROR_THRESHOLD) {
      this.triggerReduction();
    }
  }

  /**
   * 지연 기록 (느린 반응)
   */
  recordDelay() {
    this.state.consecutiveDelays++;
    this.state.consecutiveErrors = 0; // 지연이면 오답 카운터 리셋

    if (this.state.consecutiveDelays >= this.DELAY_THRESHOLD) {
      this.triggerReduction();
    }
  }

  /**
   * 정답 기록 (상태 리셋)
   */
  recordCorrect() {
    this.state.consecutiveErrors = 0;
    this.state.consecutiveDelays = 0;
    
    // 정답이면 점진적으로 복구
    if (this.state.difficultyReduced || this.state.animationReduced) {
      this.restoreGradually();
    }
  }

  /**
   * 자극 축소 트리거
   */
  private triggerReduction() {
    this.state.difficultyReduced = true;
    this.state.animationReduced = true;

    // 애니메이션 축소
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--animation-scale', '0.5');
    }
  }

  /**
   * 점진적 복구
   */
  private restoreGradually() {
    // 정답이 연속으로 나오면 점진적으로 복구
    // (간단한 구현)
    setTimeout(() => {
      if (this.state.consecutiveErrors === 0 && this.state.consecutiveDelays === 0) {
        this.state.difficultyReduced = false;
        this.state.animationReduced = false;
        
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--animation-scale', '1');
        }
      }
    }, 5000);
  }

  /**
   * 현재 상태 가져오기
   */
  getState(): CognitiveLoadState {
    return { ...this.state };
  }

  /**
   * 난이도 조정 여부
   */
  shouldReduceDifficulty(): boolean {
    return this.state.difficultyReduced;
  }

  /**
   * 애니메이션 축소 여부
   */
  shouldReduceAnimation(): boolean {
    return this.state.animationReduced;
  }

  /**
   * 상태 리셋
   */
  reset() {
    this.state = {
      consecutiveErrors: 0,
      consecutiveDelays: 0,
      difficultyReduced: false,
      animationReduced: false,
    };
  }
}

export const cognitiveLoadManager = new CognitiveLoadManager();

