// 최소 필요 범위만 선언 (프로젝트 내에서만 유효)
declare module 'fsrs.js' {
  export enum Rating {
    Again = 0,
    Hard = 1,
    Good = 2,
    Easy = 3,
  }

  export class Card {
    due?: Date;
    stability: number;
    difficulty: number;
    elapsed_days: number;
    scheduled_days: number;
    reps: number;
    lapses: number;
    state: number;        // 라이브러리 enum/상수화 여부에 따라 조정 가능
    last_review?: Date;
  }

  export class FSRS {
    repeat(card: Card, now?: Date): Record<Rating, { card: Card; log?: unknown }>;
  }
}

