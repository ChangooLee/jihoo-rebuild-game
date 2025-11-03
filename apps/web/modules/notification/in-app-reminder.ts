/**
 * 인앱 리마인더 모듈
 * 앱이 열려있을 때 배너/사운드로 알림
 */

export interface InAppReminderConfig {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  reminderMinutes: number; // 5, 10, 15분 전
}

export class InAppReminderManager {
  private config: InAppReminderConfig = {
    enabled: true,
    sound: true,
    vibration: true,
    reminderMinutes: 5,
  };
  
  private timers: NodeJS.Timeout[] = [];
  private onShowCallback?: (message: string) => void;

  /**
   * 인앱 리마인더 설정
   */
  setConfig(config: Partial<InAppReminderConfig>) {
    this.config = { ...this.config, ...config };
    this.saveConfig();
  }

  /**
   * 설정 저장
   */
  private saveConfig() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('inAppReminderConfig', JSON.stringify(this.config));
    }
  }

  /**
   * 설정 불러오기
   */
  loadConfig(): InAppReminderConfig {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('inAppReminderConfig');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    }
    return this.config;
  }

  /**
   * 리마인더 표시 콜백 설정
   */
  onShow(callback: (message: string) => void) {
    this.onShowCallback = callback;
  }

  /**
   * 세션 시작 후 지정 시간에 리마인더 표시
   */
  scheduleSessionReminder(sessionDurationMinutes: number) {
    if (!this.config.enabled) return;

    // 기존 타이머 제거
    this.clearTimers();

    // 세션 중간에 리마인더 (선택 사항)
    if (sessionDurationMinutes > 10) {
      const midSessionMs = (sessionDurationMinutes / 2) * 60 * 1000;
      const timer = setTimeout(() => {
        this.showReminder('세션이 절반 지났습니다. 집중하고 있나요?');
      }, midSessionMs);
      this.timers.push(timer);
    }

    // 세션 종료 N분 전 알림
    const beforeEndMs = (sessionDurationMinutes - this.config.reminderMinutes) * 60 * 1000;
    if (beforeEndMs > 0) {
      const timer = setTimeout(() => {
        this.showReminder(`${this.config.reminderMinutes}분 후 세션이 종료됩니다.`);
      }, beforeEndMs);
      this.timers.push(timer);
    }
  }

  /**
   * 휴식 종료 전 리마인더
   */
  scheduleBreakEndReminder(breakDurationSeconds: number) {
    if (!this.config.enabled) return;

    const beforeEndMs = (breakDurationSeconds - 10) * 1000; // 10초 전
    if (beforeEndMs > 0) {
      const timer = setTimeout(() => {
        this.showReminder('곧 휴식이 끝납니다. 준비하세요!');
      }, beforeEndMs);
      this.timers.push(timer);
    }
  }

  /**
   * 리마인더 표시
   */
  private showReminder(message: string) {
    if (!this.config.enabled) return;

    // 콜백 호출 (UI에 배너 표시)
    if (this.onShowCallback) {
      this.onShowCallback(message);
    }

    // 사운드 재생
    if (this.config.sound && typeof Audio !== 'undefined') {
      try {
        const audio = new Audio('/sounds/reminder.mp3'); // 사운드 파일 필요
        audio.volume = 0.5;
        audio.play().catch(() => {
          console.warn('Sound play failed (user interaction required)');
        });
      } catch (error) {
        console.warn('Audio not supported:', error);
      }
    }

    // 진동
    if (this.config.vibration && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]); // 짧은 진동 패턴
    }
  }

  /**
   * 모든 타이머 제거
   */
  clearTimers() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
  }

  /**
   * 일일 학습 리마인더 (앱이 열려있을 때)
   */
  showDailyReminder() {
    if (!this.config.enabled) return;

    // 마지막 학습 시간 확인
    const lastSession = this.getLastSessionTime();
    const now = Date.now();
    const hoursSinceLastSession = (now - lastSession) / (1000 * 60 * 60);

    // 24시간 이상 지났으면 리마인더
    if (hoursSinceLastSession >= 24) {
      this.showReminder('오늘 아직 학습하지 않았어요. 짧게라도 시작해볼까요?');
    }
  }

  /**
   * 마지막 세션 시간 저장
   */
  recordSessionTime() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lastSessionTime', Date.now().toString());
    }
  }

  /**
   * 마지막 세션 시간 조회
   */
  private getLastSessionTime(): number {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('lastSessionTime');
      if (saved) {
        return parseInt(saved, 10);
      }
    }
    return 0;
  }
}

export const inAppReminderManager = new InAppReminderManager();

