import Dexie, { Table } from 'dexie';
import type { LearningItem, ReviewState, SessionLog, UserProfile, GameLog } from './types';

export class JihooQuestDB extends Dexie {
  learningItems!: Table<LearningItem>;
  reviewStates!: Table<ReviewState>;
  sessionLogs!: Table<SessionLog>;
  userProfile!: Table<UserProfile, string>;
  gameLogs!: Table<GameLog>;

  constructor() {
    super('JihooQuestDB');
    
    this.version(1).stores({
      learningItems: 'id, subject, area, gradeBand, conceptTag, difficulty',
      reviewStates: 'itemId',
      sessionLogs: 'startAt',
      userProfile: 'id',
    });

    // Version 2: Add gameLogs table
    this.version(2).stores({
      learningItems: 'id, subject, area, gradeBand, conceptTag, difficulty',
      reviewStates: 'itemId',
      sessionLogs: 'startAt',
      userProfile: 'id',
      gameLogs: '++id, gameType, subject, startTime',
    });
  }
}

export const db = new JihooQuestDB();

