import type { Subject, GradeBand, LearningItem } from '@/lib/types';
import { db } from '@/lib/db';
import { getDueItems } from '@/modules/fsrs/engine';
import { loadAllLearningItems } from '@/modules/content/loader';

// 콘텐츠 캐시
let contentCache: LearningItem[] | null = null;
let cacheLoadPromise: Promise<LearningItem[]> | null = null;

async function getContentCache(): Promise<LearningItem[]> {
  if (contentCache) return contentCache;
  if (cacheLoadPromise) return cacheLoadPromise;
  
  cacheLoadPromise = loadAllLearningItems().then(items => {
    contentCache = items;
    console.log(`Loaded ${items.length} learning items`);
    return items;
  });
  
  return cacheLoadPromise;
}

export interface SubjectDistribution {
  math: number;      // 기본 40%
  english: number;   // 기본 30%
  science: number;   // 기본 15%
  social: number;    // 기본 15%
}

const DEFAULT_DISTRIBUTION: SubjectDistribution = {
  math: 0.4,
  english: 0.3,
  science: 0.15,
  social: 0.15,
};

export interface SchedulerConfig {
  gradeBand?: GradeBand;
  weakTags?: string[];
  distribution?: SubjectDistribution;
  weaknessWeight?: number; // 약점 태그 비중 (0-1, 기본 0.6)
  firstSessionDate?: number; // 첫 세션 날짜 (timestamp, 시간 기반 가중치 계산용)
}

/**
 * 약점 태그를 기반으로 과목 분포를 조정합니다.
 */
export function adjustDistributionForWeakness(
  base: SubjectDistribution,
  weakTags: string[],
  weaknessWeight: number = 0.6
): SubjectDistribution {
  if (weakTags.length === 0) return base;
  
  // 약점 태그에서 과목별 빈도 계산
  const subjectCounts: Record<Subject, number> = {
    math: 0,
    english: 0,
    science: 0,
    social: 0,
  };
  
  for (const tag of weakTags) {
    if (tag.startsWith('math.')) subjectCounts.math++;
    else if (tag.startsWith('english.')) subjectCounts.english++;
    else if (tag.startsWith('science.')) subjectCounts.science++;
    else if (tag.startsWith('social.')) subjectCounts.social++;
  }
  
  const total = Object.values(subjectCounts).reduce((a, b) => a + b, 0);
  if (total === 0) return base;
  
  // 약점 가중치 적용
  const adjusted: SubjectDistribution = { ...base };
  for (const subject of Object.keys(subjectCounts) as Subject[]) {
    const weakRatio = subjectCounts[subject] / total;
    adjusted[subject] = base[subject] * (1 - weaknessWeight) + weakRatio * weaknessWeight;
  }
  
  // 정규화
  const sum = Object.values(adjusted).reduce((a, b) => a + b, 0);
  for (const subject of Object.keys(adjusted) as Subject[]) {
    adjusted[subject] /= sum;
  }
  
  return adjusted;
}

/**
 * 시간 경과에 따른 약점 가중치 계산
 * README.md: "첫 2주: 약점 비중 60% → 3-4주차 40%"
 */
export function calculateWeaknessWeightByTime(firstSessionDate?: number): number {
  if (!firstSessionDate) {
    return 0.6; // 기본값 (첫 2주)
  }
  
  const now = Date.now();
  const daysSinceFirst = (now - firstSessionDate) / (1000 * 60 * 60 * 24);
  
  if (daysSinceFirst < 14) {
    // 첫 2주: 60%
    return 0.6;
  } else if (daysSinceFirst < 28) {
    // 3-4주차: 40%
    return 0.4;
  } else {
    // 4주 이상: 40% 유지 (또는 더 낮춤)
    return 0.4;
  }
}

/**
 * 개인화 스케줄러
 * 과목 분포 조정 및 약점 태그 기반 출제
 */
export class PersonalizedScheduler {
  private config: SchedulerConfig;

  constructor(config: SchedulerConfig = {}) {
    // 시간 기반 weaknessWeight 계산
    let weaknessWeight = config.weaknessWeight;
    if (weaknessWeight === undefined && config.firstSessionDate !== undefined) {
      weaknessWeight = calculateWeaknessWeightByTime(config.firstSessionDate);
    } else if (weaknessWeight === undefined) {
      weaknessWeight = 0.6; // 기본값
    }
    
    this.config = {
      distribution: DEFAULT_DISTRIBUTION,
      weaknessWeight,
      ...config,
    };
    
    if (this.config.weakTags && this.config.distribution) {
      this.config.distribution = adjustDistributionForWeakness(
        this.config.distribution,
        this.config.weakTags,
        this.config.weaknessWeight!
      );
    }
  }

  /**
   * 다음에 출제할 과목을 선택합니다.
   */
  selectNextSubject(): Subject {
    const dist = this.config.distribution || DEFAULT_DISTRIBUTION;
    const rand = Math.random();
    
    let cumulative = 0;
    for (const [subject, prob] of Object.entries(dist)) {
      cumulative += prob;
      if (rand <= cumulative) {
        return subject as Subject;
      }
    }
    
    return 'math'; // fallback
  }

  /**
   * 과목과 난이도에 맞는 학습 항목을 선택합니다.
   */
  async selectItems(
    subject: Subject,
    count: number,
    difficultyRange?: { min: number; max: number }
  ): Promise<LearningItem[]> {
    // 콘텐츠 캐시에서 로드
    const allContent = await getContentCache();
    
    // 과목 필터링
    let filtered = allContent.filter(item => item.subject === subject);
    
    // 학년군 필터링
    if (this.config.gradeBand) {
      filtered = filtered.filter(item => 
        item.gradeBand.includes(this.config.gradeBand!)
      );
    }
    
    // 약점 태그 우선 선택
    let prioritized: LearningItem[] = [];
    let others: LearningItem[] = [];
    
    if (this.config.weakTags && this.config.weakTags.length > 0) {
      for (const item of filtered) {
        const hasWeakTag = item.conceptTag.some(tag => 
          this.config.weakTags!.includes(tag)
        );
        if (hasWeakTag) {
          prioritized.push(item);
        } else {
          others.push(item);
        }
      }
    } else {
      others = filtered;
    }
    
    // 난이도 필터
    if (difficultyRange) {
      prioritized = prioritized.filter(item => 
        item.difficulty >= difficultyRange.min &&
        item.difficulty <= difficultyRange.max
      );
      others = others.filter(item => 
        item.difficulty >= difficultyRange.min &&
        item.difficulty <= difficultyRange.max
      );
    }
    
    // 약점 태그 항목 우선, 나머지는 랜덤
    const selected: LearningItem[] = [];
    selected.push(...prioritized.slice(0, count));
    
    if (selected.length < count) {
      const remaining = count - selected.length;
      const shuffled = [...others].sort(() => Math.random() - 0.5);
      selected.push(...shuffled.slice(0, remaining));
    }
    
    return selected.slice(0, count);
  }

  /**
   * FSRS Due 항목을 포함하여 다음 출제 항목들을 선택합니다.
   */
  async selectItemsForRound(
    count: number,
    includeDue: boolean = true
  ): Promise<LearningItem[]> {
    const selected: LearningItem[] = [];
    
    if (includeDue) {
      const dueIds = await getDueItems(count);
      if (dueIds.length > 0) {
        const dueItems = await db.learningItems
          .where('id')
          .anyOf(dueIds)
          .toArray();
        selected.push(...dueItems);
      }
    }
    
    if (selected.length < count) {
      const subject = this.selectNextSubject();
      const additional = await this.selectItems(
        subject,
        count - selected.length
      );
      selected.push(...additional);
    }
    
    return selected.slice(0, count);
  }
}

