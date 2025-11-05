// README 섹션 5 데이터 모델

export type Subject = 'math' | 'english' | 'science' | 'social';
export type GradeBand = 'ES12' | 'ES34' | 'ES56' | 'MS1' | 'MS23';

export type StemType = 'text' | 'audio' | 'image' | 'sim';
export type AnswerKind = 'mcq' | 'short' | 'sequence';

export interface Stem {
  type: StemType;
  payload: any;
}

export interface Choice {
  id: string;
  label: string;
}

export interface Answer {
  kind: AnswerKind;
  value: any;
}

export interface LearningItem {
  id: string;
  subject: Subject;
  area: string;              // e.g., "math.자료와가능성", "science.지구와우주"
  gradeBand: GradeBand[];
  conceptTag: string[];      // ["분수연산","평균"], ["past-tense"], ...
  stem: Stem;
  choices?: Choice[];
  answer: Answer;
  hints?: string[];
  difficulty: number;        // 1..10
  variants?: string[];       // 스킨/문장/형식 변주 ID
}

export type FSRSOutcome = 'again' | 'hard' | 'good' | 'easy';

import type { Card } from 'fsrs.js';

export interface ReviewState {
  itemId: string;
  fsrs: Card;                 // FSRS 스케줄 상태
  lastOutcome: FSRSOutcome;
  lastLatencyMs?: number;
}

export interface RoundResult {
  subject: Subject;
  items: string[];
  correct: number;
  latencyAvgMs: number;
}

export interface SessionLog {
  startAt: number;
  durationSec: number;
  rounds: RoundResult[];
  breaks: number;
}

export interface UserProfile {
  id?: string;  // Primary key for Dexie
  gradeBand?: GradeBand;
  weakTags?: string[];
  preferredFont?: 'default' | 'lexend' | 'opendyslexic';
  animationIntensity?: number; // 0-1
  focusMode?: boolean;
  firstSessionDate?: number; // 첫 세션 시작 날짜 (timestamp)
}

// 세션 관련 타입
export type SessionPhase = 
  | 'warmup'      // 워밍업 (90초)
  | 'round-a'     // 라운드 A (3분)
  | 'break-1'      // 휴식 1 (50초)
  | 'round-b'     // 라운드 B (3분)
  | 'break-2'     // 휴식 2 (50초)
  | 'round-c'     // 라운드 C (3분)
  | 'recall-boss' // 리콜 보스 (1분)
  | 'report';      // 리포트 (30초)

export interface SessionState {
  phase: SessionPhase;
  startTime: number;
  elapsedSeconds: number;
  roundResults: RoundResult[];
  incorrectItems: string[]; // 오늘 틀린 항목 ID들
}
