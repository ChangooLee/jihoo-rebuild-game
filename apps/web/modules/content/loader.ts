import { z } from 'zod';
import { load } from 'js-yaml';
import { learningItemSchema, type LearningItemSchema } from '@/content/schema/learning-item';
import type { LearningItem } from '@/lib/types';

/**
 * YAML 파일을 로드하고 검증합니다.
 */
export async function loadYAML<T>(path: string, schema: z.ZodSchema<T>): Promise<T> {
  const response = await fetch(path);
  const text = await response.text();
  const data = load(text) as unknown;
  return schema.parse(data);
}

/**
 * JSON 파일을 로드하고 검증합니다.
 */
export async function loadJSON<T>(path: string, schema: z.ZodSchema<T>): Promise<T> {
  const response = await fetch(path);
  const data = await response.json();
  return schema.parse(data);
}

/**
 * LearningItem을 로드합니다.
 */
export async function loadLearningItem(path: string): Promise<LearningItem> {
  const data = await loadJSON<LearningItemSchema>(path, learningItemSchema);
  return data as LearningItem;
}

/**
 * 여러 LearningItem을 로드합니다.
 */
export async function loadLearningItems(paths: string[]): Promise<LearningItem[]> {
  const items = await Promise.all(paths.map(path => loadLearningItem(path)));
  return items;
}

/**
 * 콘텐츠 디렉토리에서 모든 LearningItem을 로드합니다.
 */
export async function loadAllLearningItems(): Promise<LearningItem[]> {
  try {
    // content/index.json 로드
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/jihoo';
    const indexResponse = await fetch(`${basePath}/content/index.json`);
    const index = await indexResponse.json();
    
    const allItems: LearningItem[] = [];
    
    // 각 과목별 파일 로드
    for (const subject of Object.keys(index)) {
      const files = index[subject];
      for (const file of files) {
        try {
          const response = await fetch(`${basePath}/content/${file}`);
          const items = await response.json();
          allItems.push(...items);
        } catch (error) {
          console.error(`Failed to load ${file}:`, error);
        }
      }
    }
    
    return allItems;
  } catch (error) {
    console.error('Failed to load content:', error);
    return [];
  }
}

