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
  // 나중에 동적으로 로드하도록 구현
  // 현재는 빈 배열 반환
  return [];
}

