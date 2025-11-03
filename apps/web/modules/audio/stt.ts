/**
 * STT (Speech-to-Text) 모듈
 * 기본: Web Speech API
 * 선택: 서버 STT (Whisper/Vosk/Coqui)
 */

export interface STTOptions {
  lang?: string; // 기본: 'en-GB'
  continuous?: boolean; // 연속 인식 여부
  interimResults?: boolean; // 중간 결과 표시 여부
}

export class STTManager {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-GB';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      }
    }
  }

  /**
   * 음성 인식 시작
   */
  start(options: STTOptions = {}): Promise<string> {
    if (!this.recognition) {
      return Promise.reject(new Error('SpeechRecognition is not supported'));
    }

    if (this.isListening) {
      this.stop();
    }

    this.recognition.lang = options.lang || 'en-GB';
    this.recognition.continuous = options.continuous ?? false;
    this.recognition.interimResults = options.interimResults ?? false;

    return new Promise((resolve, reject) => {
      let finalTranscript = '';

      this.recognition!.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
      };

      this.recognition!.onend = () => {
        this.isListening = false;
        if (finalTranscript) {
          resolve(finalTranscript.trim());
        } else {
          reject(new Error('No speech detected'));
        }
      };

      this.recognition!.onerror = (event) => {
        this.isListening = false;
        reject(event.error);
      };

      this.isListening = true;
      this.recognition!.start();
    });
  }

  /**
   * 음성 인식 중지
   */
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * STT 지원 여부 확인
   */
  isSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * 현재 인식 중인지 확인
   */
  getListening(): boolean {
    return this.isListening;
  }
}

export const sttManager = new STTManager();

