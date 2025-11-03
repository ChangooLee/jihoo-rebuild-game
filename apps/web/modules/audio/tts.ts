/**
 * TTS (Text-to-Speech) 모듈
 * 기본: Web Speech API (en-GB)
 * 선택: 서버 TTS (Coqui 등)
 */

export interface TTSOptions {
  lang?: string; // 기본: 'en-GB'
  pitch?: number; // 0-2, 기본 1
  rate?: number; // 0.1-10, 기본 1
  volume?: number; // 0-1, 기본 1
}

export class TTSManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  /**
   * 텍스트를 음성으로 읽습니다 (en-GB)
   */
  speak(text: string, options: TTSOptions = {}) {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported');
      return;
    }

    // 이전 재생 중지
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || 'en-GB';
    utterance.pitch = options.pitch ?? 1;
    utterance.rate = options.rate ?? 1;
    utterance.volume = options.volume ?? 1;

    this.currentUtterance = utterance;
    this.synth.speak(utterance);

    return new Promise<void>((resolve, reject) => {
      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };
      utterance.onerror = (error) => {
        this.currentUtterance = null;
        reject(error);
      };
    });
  }

  /**
   * 현재 재생 중인 음성을 중지합니다
   */
  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * TTS 지원 여부 확인
   */
  isSupported(): boolean {
    return this.synth !== null;
  }

  /**
   * 사용 가능한 음성 목록 가져오기
   */
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  /**
   * en-GB 음성 찾기
   */
  findGBVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    return (
      voices.find((v) => v.lang.startsWith('en-GB')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      null
    );
  }
}

export const ttsManager = new TTSManager();

