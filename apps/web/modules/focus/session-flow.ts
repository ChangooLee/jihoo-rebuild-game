import type { SessionPhase, SessionState, RoundResult } from '@/lib/types';

const PHASE_DURATIONS: Record<SessionPhase, number> = {
  warmup: 90,        // 90초
  'round-a': 180,    // 3분
  'break-1': 50,     // 50초
  'round-b': 180,    // 3분
  'break-2': 50,     // 50초
  'round-c': 180,    // 3분
  'recall-boss': 60, // 1분
  report: 30,        // 30초
};

const PHASE_ORDER: SessionPhase[] = [
  'warmup',
  'round-a',
  'break-1',
  'round-b',
  'break-2',
  'round-c',
  'recall-boss',
  'report',
];

export class SessionFlowManager {
  private state: SessionState;
  private onPhaseChange?: (phase: SessionPhase) => void;
  private onComplete?: (state: SessionState) => void;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.state = {
      phase: 'warmup',
      startTime: Date.now(),
      elapsedSeconds: 0,
      roundResults: [],
      incorrectItems: [],
    };
  }

  /**
   * 세션 시작
   */
  start() {
    this.state.startTime = Date.now();
    this.state.elapsedSeconds = 0;
    this.runPhase();
  }

  /**
   * 현재 페이즈 실행
   */
  private runPhase() {
    const phase = this.state.phase;
    const duration = PHASE_DURATIONS[phase];
    
    if (this.onPhaseChange) {
      this.onPhaseChange(phase);
    }

    // 타이머 시작
    this.intervalId = setInterval(() => {
      this.state.elapsedSeconds++;
      
      const phaseElapsed = this.state.elapsedSeconds - this.getPhaseStartTime();
      
      if (phaseElapsed >= duration) {
        this.nextPhase();
      }
    }, 1000);
  }

  /**
   * 다음 페이즈로 이동
   */
  nextPhase() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    const currentIndex = PHASE_ORDER.indexOf(this.state.phase);
    
    if (currentIndex < PHASE_ORDER.length - 1) {
      this.state.phase = PHASE_ORDER[currentIndex + 1];
      this.runPhase();
    } else {
      // 세션 완료
      this.complete();
    }
  }

  /**
   * 라운드 결과 기록
   */
  recordRoundResult(result: RoundResult) {
    this.state.roundResults.push(result);
    
    // 오답 항목 추적
    // (실제 구현에서는 각 항목별 정답 여부를 기록해야 함)
  }

  /**
   * 페이즈 스킵 (제한적으로만 허용)
   */
  skipPhase(phase: SessionPhase) {
    // 휴식 페이즈는 스킵 불가 또는 제한적 허용
    if (phase === 'break-1' || phase === 'break-2') {
      // 스킵 최소화: 최소 10초는 기다려야 함
      const phaseElapsed = this.state.elapsedSeconds - this.getPhaseStartTime();
      if (phaseElapsed < 10) {
        return false;
      }
    }
    
    if (this.state.phase === phase) {
      this.nextPhase();
      return true;
    }
    return false;
  }

  /**
   * 세션 완료
   */
  private complete() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    if (this.onComplete) {
      this.onComplete(this.state);
    }
  }

  /**
   * 페이즈 시작 시간 계산
   */
  private getPhaseStartTime(): number {
    const currentIndex = PHASE_ORDER.indexOf(this.state.phase);
    let startTime = 0;
    
    for (let i = 0; i < currentIndex; i++) {
      startTime += PHASE_DURATIONS[PHASE_ORDER[i]];
    }
    
    return startTime;
  }

  /**
   * 현재 페이즈 남은 시간
   */
  getRemainingTime(): number {
    const phaseElapsed = this.state.elapsedSeconds - this.getPhaseStartTime();
    const duration = PHASE_DURATIONS[this.state.phase];
    return Math.max(0, duration - phaseElapsed);
  }

  /**
   * 세션 상태 가져오기
   */
  getState(): SessionState {
    return { ...this.state };
  }

  /**
   * 이벤트 콜백 등록
   */
  onPhaseChangeCallback(callback: (phase: SessionPhase) => void) {
    this.onPhaseChange = callback;
  }

  onCompleteCallback(callback: (state: SessionState) => void) {
    this.onComplete = callback;
  }
}

