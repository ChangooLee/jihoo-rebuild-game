import { db } from './db';
import type { LearningItem, ReviewState, SessionLog, GameLog } from './types';

/**
 * 데이터 관리 모듈
 * JSON 내보내기/가져오기, 삭제 기능
 */
export class DataManager {
  /**
   * 모든 데이터를 JSON으로 내보내기
   */
  async exportData(): Promise<string> {
    const data = {
      learningItems: await db.learningItems.toArray(),
      reviewStates: await db.reviewStates.toArray(),
      sessionLogs: await db.sessionLogs.toArray(),
      userProfile: await db.userProfile.toArray(),
      gameLogs: await db.gameLogs.toArray(),
      exportDate: new Date().toISOString(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * JSON 데이터 가져오기
   */
  async importData(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);
    
    if (data.learningItems) {
      await db.learningItems.bulkPut(data.learningItems);
    }
    
    if (data.reviewStates) {
      await db.reviewStates.bulkPut(data.reviewStates);
    }
    
    if (data.sessionLogs) {
      await db.sessionLogs.bulkPut(data.sessionLogs);
    }
    
    if (data.userProfile) {
      await db.userProfile.bulkPut(data.userProfile);
    }

    if (data.gameLogs) {
      await db.gameLogs.bulkPut(data.gameLogs);
    }
  }

  /**
   * 모든 데이터 삭제
   */
  async deleteAllData(): Promise<void> {
    await Promise.all([
      db.learningItems.clear(),
      db.reviewStates.clear(),
      db.sessionLogs.clear(),
      db.userProfile.clear(),
      db.gameLogs.clear(),
    ]);
  }

  /**
   * 특정 타입만 삭제
   */
  async deleteByType(type: 'learningItems' | 'reviewStates' | 'sessionLogs' | 'userProfile' | 'gameLogs'): Promise<void> {
    await db[type].clear();
  }
}

export const dataManager = new DataManager();

