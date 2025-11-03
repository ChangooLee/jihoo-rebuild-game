import Dexie, { Table } from 'dexie';
import type { LearningItem, ReviewState, SessionLog, UserProfile } from './types';

export class JihooQuestDB extends Dexie {
  learningItems!: Table<LearningItem>;
  reviewStates!: Table<ReviewState>;
  sessionLogs!: Table<SessionLog>;
  userProfile!: Table<UserProfile, string>;

  constructor() {
    super('JihooQuestDB');
    
    this.version(1).stores({
      learningItems: 'id, subject, area, gradeBand, conceptTag, difficulty',
      reviewStates: 'itemId',
      sessionLogs: 'startAt',
      userProfile: 'id',
    });
  }
}

export const db = new JihooQuestDB();

