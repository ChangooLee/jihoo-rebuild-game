import { z } from 'zod';
import type { LearningItem } from '@/lib/types';

// Zod 스키마로 콘텐츠 검증
const StemSchema = z.object({
  type: z.enum(['text', 'audio', 'image', 'sim']),
  payload: z.any(),
});

const ChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const AnswerSchema = z.object({
  kind: z.enum(['mcq', 'short', 'sequence']),
  value: z.any(),
});

const LearningItemSchema = z.object({
  id: z.string(),
  subject: z.enum(['math', 'english', 'science', 'social']),
  area: z.string(),
  gradeBand: z.array(z.enum(['ES12', 'ES34', 'ES56', 'MS1', 'MS23'])),
  conceptTag: z.array(z.string()),
  stem: StemSchema,
  choices: z.array(ChoiceSchema).optional(),
  answer: AnswerSchema,
  hints: z.array(z.string()).optional(),
  difficulty: z.number().min(1).max(10),
  variants: z.array(z.string()).optional(),
});

export const ContentIndexSchema = z.record(z.string(), z.array(z.string()));

/**
 * 콘텐츠 파일 검증
 */
export function validateLearningItems(items: unknown[]): LearningItem[] {
  try {
    return z.array(LearningItemSchema).parse(items) as LearningItem[];
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('콘텐츠 검증 실패:', error.errors);
      throw new Error(`콘텐츠 형식 오류: ${error.errors.map(e => `${e.path.join('.')} - ${e.message}`).join(', ')}`);
    }
    throw error;
  }
}

/**
 * 인덱스 파일 검증
 */
export function validateContentIndex(index: unknown) {
  try {
    return ContentIndexSchema.parse(index);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('인덱스 검증 실패:', error.errors);
      throw new Error('인덱스 파일 형식 오류');
    }
    throw error;
  }
}

/**
 * 콘텐츠 품질 체크
 */
export function checkContentQuality(items: LearningItem[]): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // 평균 난이도 체크 (3-5 권장)
  const avgDifficulty = items.reduce((sum, item) => sum + item.difficulty, 0) / items.length;
  if (avgDifficulty < 3 || avgDifficulty > 5) {
    warnings.push(`평균 난이도 ${avgDifficulty.toFixed(1)} (권장: 3-5)`);
  }

  // variants 체크 (각 개념당 3개 이상 권장)
  const conceptMap = new Map<string, number>();
  items.forEach(item => {
    item.conceptTag.forEach(tag => {
      conceptMap.set(tag, (conceptMap.get(tag) || 0) + 1);
    });
  });

  conceptMap.forEach((count, concept) => {
    if (count < 3) {
      warnings.push(`개념 "${concept}"의 문항 수 부족 (${count}개, 권장: 3개 이상)`);
    }
  });

  // 학년군 균형 체크
  const gradeBandCount = new Map<string, number>();
  items.forEach(item => {
    item.gradeBand.forEach(band => {
      gradeBandCount.set(band, (gradeBandCount.get(band) || 0) + 1);
    });
  });

  if (gradeBandCount.size === 0) {
    warnings.push('학년군 정보 없음');
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * 콘텐츠 로딩 및 검증
 */
export async function loadAndValidateContent(
  subject: string,
  filename: string
): Promise<LearningItem[]> {
  try {
    const response = await fetch(`/content/${subject}/${filename}`);
    if (!response.ok) {
      throw new Error(`콘텐츠 로딩 실패: ${response.statusText}`);
    }

    const items = await response.json();
    const validatedItems = validateLearningItems(items);
    
    // 품질 체크
    const quality = checkContentQuality(validatedItems);
    if (!quality.valid) {
      console.warn(`콘텐츠 품질 경고 (${subject}/${filename}):`, quality.warnings);
    }

    return validatedItems;
  } catch (error) {
    console.error(`콘텐츠 로딩 오류 (${subject}/${filename}):`, error);
    throw error;
  }
}

/**
 * 전체 콘텐츠 인덱스 로딩
 */
export async function loadContentIndex() {
  try {
    const response = await fetch('/content/index.json');
    if (!response.ok) {
      throw new Error('인덱스 로딩 실패');
    }

    const index = await response.json();
    return validateContentIndex(index);
  } catch (error) {
    console.error('인덱스 로딩 오류:', error);
    throw error;
  }
}

