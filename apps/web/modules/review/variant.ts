import type { LearningItem } from '@/lib/types';

/**
 * 오답 변주 시스템
 * 동일 개념의 형식/스킨/문장 변주
 */
export class VariantSystem {
  /**
   * 항목의 변주 가져오기
   */
  getVariant(item: LearningItem, variantId: string): LearningItem | null {
    if (!item.variants || !item.variants.includes(variantId)) {
      return null;
    }

    // 변주 로직 (실제로는 DB나 콘텐츠 시스템에서 로드)
    // 여기서는 간단히 구조만 반환
    return {
      ...item,
      id: `${item.id}-${variantId}`,
      variants: item.variants,
    };
  }

  /**
   * 동일 개념의 다른 변주 선택 (최소 3개 중)
   */
  selectRandomVariant(item: LearningItem): string | null {
    if (!item.variants || item.variants.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * item.variants.length);
    return item.variants[randomIndex];
  }

  /**
   * 간헐 보상 확률 계산
   */
  shouldShowIntermittentReward(
    consecutiveCorrect: number,
    baseProbability: number = 0.1 // 기본 10%
  ): boolean {
    // 연속 정답이 많을수록 보상 확률 증가
    const adjustedProbability = baseProbability + (consecutiveCorrect * 0.05);
    return Math.random() < Math.min(adjustedProbability, 0.5);
  }
}

export const variantSystem = new VariantSystem();

