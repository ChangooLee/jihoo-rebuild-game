/**
 * 과몰입 경보 모듈
 * 세션 과다 연장 차단
 */

export interface OveruseConfig {
  maxSessionDuration: number; // 초 단위, 기본 30분 (1800초)
  warningThreshold: number; // 경고 임계값, 기본 25분 (1500초)
}

export class OveruseAlertManager {
  private config: OveruseConfig = {
    maxSessionDuration: 1800, // 30분
    warningThreshold: 1500, // 25분
  };

  private sessionStartTime: number | null = null;
  private warningShown: boolean = false;

  /**
   * 세션 시작
   */
  startSession() {
    this.sessionStartTime = Date.now();
    this.warningShown = false;
  }

  /**
   * 세션 종료
   */
  endSession() {
    this.sessionStartTime = null;
    this.warningShown = false;
  }

  /**
   * 과몰입 체크
   */
  checkOveruse(): {
    shouldWarn: boolean;
    shouldBlock: boolean;
    elapsedSeconds: number;
  } {
    if (!this.sessionStartTime) {
      return { shouldWarn: false, shouldBlock: false, elapsedSeconds: 0 };
    }

    const elapsedSeconds = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    const shouldWarn = elapsedSeconds >= this.config.warningThreshold && !this.warningShown;
    const shouldBlock = elapsedSeconds >= this.config.maxSessionDuration;

    if (shouldWarn) {
      this.warningShown = true;
    }

    return { shouldWarn, shouldBlock, elapsedSeconds };
  }

  /**
   * 경고 메시지 표시
   */
  showWarning() {
    if (typeof window !== 'undefined') {
      const message = '장시간 학습하셨습니다. 휴식을 권장합니다.';
      alert(message);
    }
  }

  /**
   * 강제 종료
   */
  forceBreak() {
    if (typeof window !== 'undefined') {
      alert('최대 학습 시간을 초과했습니다. 강제 휴식이 필요합니다.');
      // 세션 종료 또는 휴식 페이지로 리다이렉트
      window.location.href = '/';
    }
  }

  /**
   * 설정 업데이트
   */
  updateConfig(config: Partial<OveruseConfig>) {
    this.config = { ...this.config, ...config };
  }
}

export const overuseAlertManager = new OveruseAlertManager();

