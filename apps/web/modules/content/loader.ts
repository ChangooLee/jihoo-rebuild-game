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
    // public/content/index.json 로드 (basePath 포함)
    const basePath = typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_BASE_PATH || '/jihoo')
      : '';

    const indexUrl = `${basePath}/content/index.json`;
    console.log('Loading content from:', indexUrl);

    const indexResponse = await fetch(indexUrl);
    if (!indexResponse.ok) {
      throw new Error(`Failed to fetch index.json: ${indexResponse.status}`);
    }

    const index = await indexResponse.json();
    const allItems: LearningItem[] = [];

    // 각 과목별 파일 로드
    for (const subject of Object.keys(index)) {
      const files = index[subject];
      for (const file of files) {
        try {
          const fileUrl = `${basePath}/content/${file}`;
          console.log(`Loading ${subject}:`, fileUrl);
          const response = await fetch(fileUrl);

          if (response.ok) {
            const items = await response.json();
            allItems.push(...items);
            console.log(`✓ Loaded ${items.length} items from ${file}`);
          } else {
            console.error(`Failed to load ${file}: ${response.status}`);
          }
        } catch (error) {
          console.error(`Error loading ${file}:`, error);
        }
      }
    }

    // 조건부: math/bank.json 로드 (생성된 콘텐츠가 있는 경우)
    try {
      const bankUrl = `${basePath}/content/math/bank.json`;
      const bankResponse = await fetch(bankUrl);

      if (bankResponse.ok) {
        const bankItems = await bankResponse.json();
        allItems.push(...bankItems);
        console.log(`✓ Loaded ${bankItems.length} items from math/bank.json`);
      }
    } catch (error) {
      // bank.json이 없으면 무시 (optional)
      console.log('math/bank.json not found (optional generated content)');
    }

    console.log(`Total loaded: ${allItems.length} learning items`);
    return allItems;
  } catch (error) {
    console.error('Failed to load content:', error);
    return [];
  }
}

