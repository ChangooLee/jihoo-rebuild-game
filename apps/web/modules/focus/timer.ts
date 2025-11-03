export type TimerPreset = 120 | 150 | 180;

export interface TimerState {
  remainingSeconds: number;
  isRunning: boolean;
  preset: TimerPreset;
}

export class FocusTimer {
  private state: TimerState;
  private intervalId: NodeJS.Timeout | null = null;
  private onTick?: (state: TimerState) => void;
  private onComplete?: () => void;

  constructor(preset: TimerPreset = 180) {
    this.state = {
      remainingSeconds: preset,
      isRunning: false,
      preset,
    };
  }

  /**
   * 타이머 시작
   */
  start() {
    if (this.isRunning) return;
    
    this.state.isRunning = true;
    this.intervalId = setInterval(() => {
      this.state.remainingSeconds--;
      
      if (this.onTick) {
        this.onTick({ ...this.state });
      }
      
      if (this.state.remainingSeconds <= 0) {
        this.stop();
        if (this.onComplete) {
          this.onComplete();
        }
      }
    }, 1000);
  }

  /**
   * 타이머 일시정지
   */
  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.state.isRunning = false;
  }

  /**
   * 타이머 정지
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.state.isRunning = false;
  }

  /**
   * 타이머 리셋
   */
  reset(preset?: TimerPreset) {
    this.stop();
    if (preset !== undefined) {
      this.state.preset = preset;
    }
    this.state.remainingSeconds = this.state.preset;
  }

  /**
   * 프리셋 변경
   */
  setPreset(preset: TimerPreset) {
    if (!this.isRunning) {
      this.state.preset = preset;
      this.state.remainingSeconds = preset;
    }
  }

  /**
   * 타이머 상태 가져오기
   */
  getState(): TimerState {
    return { ...this.state };
  }

  /**
   * 이벤트 콜백 등록
   */
  onTickCallback(callback: (state: TimerState) => void) {
    this.onTick = callback;
  }

  onCompleteCallback(callback: () => void) {
    this.onComplete = callback;
  }

  get isRunning(): boolean {
    return this.state.isRunning;
  }

  get remainingSeconds(): number {
    return this.state.remainingSeconds;
  }
}

