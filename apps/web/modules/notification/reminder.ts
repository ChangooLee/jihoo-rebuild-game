/**
 * 로컬 리마인더 모듈
 * 브라우저 Notification API 사용
 */

export interface ReminderConfig {
  enabled: boolean;
  dailyTime?: string; // "HH:MM" 형식
  daysOfWeek?: number[]; // 0 = 일요일, 1 = 월요일, ...
}

export class ReminderManager {
  private config: ReminderConfig = {
    enabled: false,
    dailyTime: '09:00',
    daysOfWeek: [1, 2, 3, 4, 5], // 평일
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.checkPermission();
    }
  }

  /**
   * 알림 권한 확인 및 요청
   */
  async checkPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  /**
   * 리마인더 설정
   */
  setReminder(config: ReminderConfig) {
    this.config = { ...this.config, ...config };
    this.scheduleReminder();
  }

  /**
   * 리마인더 스케줄링
   */
  private scheduleReminder() {
    if (!this.config.enabled) {
      this.clearReminder();
      return;
    }

    // 이미 스케줄된 알림이 있으면 제거
    this.clearReminder();

    if (!this.config.dailyTime) return;

    const [hours, minutes] = this.config.dailyTime.split(':').map(Number);
    
    // 로컬 스토리지에 저장
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('reminderConfig', JSON.stringify(this.config));
    }

    // 매일 지정된 시간에 체크
    this.checkDailyReminder();
  }

  /**
   * 매일 리마인더 체크
   */
  private checkDailyReminder() {
    const now = new Date();
    const [hours, minutes] = (this.config.dailyTime || '09:00').split(':').map(Number);
    
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    // 오늘 알림 시간이 지났으면 내일로 설정
    if (now > reminderTime) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const msUntilReminder = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      if (this.shouldShowReminder()) {
        this.showReminder();
      }
      // 다음 날을 위해 재스케줄
      this.scheduleReminder();
    }, msUntilReminder);
  }

  /**
   * 리마인더 표시 여부 확인
   */
  private shouldShowReminder(): boolean {
    if (!this.config.enabled) return false;
    
    const today = new Date().getDay();
    if (this.config.daysOfWeek && !this.config.daysOfWeek.includes(today)) {
      return false;
    }

    return true;
  }

  /**
   * 리마인더 표시
   */
  private showReminder() {
    if (Notification.permission === 'granted') {
      new Notification('Jihoo Quest', {
        body: '오늘의 학습 세션을 시작해볼까요?',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'daily-reminder',
      });
    }
  }

  /**
   * 리마인더 제거
   */
  clearReminder() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('reminderConfig');
    }
  }

  /**
   * 저장된 설정 불러오기
   */
  loadConfig(): ReminderConfig {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('reminderConfig');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    }
    return this.config;
  }
}

export const reminderManager = new ReminderManager();

