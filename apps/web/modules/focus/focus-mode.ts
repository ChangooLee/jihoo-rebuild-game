/**
 * 집중모드 모듈
 * 배경음/애니메이션 최소화 옵션
 */
export class FocusMode {
  private enabled: boolean = false;

  enable() {
    this.enabled = true;
    // DOM에 클래스 추가
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('focus-mode');
    }
  }

  disable() {
    this.enabled = false;
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('focus-mode');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  toggle() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }
}

export const focusMode = new FocusMode();

