#!/usr/bin/env node
/**
 * TypeScript Math Content Generator
 * Generates sample math learning items for Korean curriculum (ES34-MS23)
 *
 * Usage: node tools/generators/math/build_bank.ts
 * Output: apps/web/content/math/bank.json
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Types matching the Zod schema
interface Stem {
  type: 'text' | 'audio' | 'image' | 'sim';
  payload: string;
}

interface Choice {
  id: string;
  label: string;
}

interface Answer {
  kind: 'mcq' | 'short' | 'sequence';
  value: string | number;
}

interface LearningItem {
  id: string;
  subject: 'math' | 'english' | 'science' | 'social';
  area: string;
  gradeBand: ('ES12' | 'ES34' | 'ES56' | 'MS1' | 'MS23')[];
  conceptTag: string[];
  stem: Stem;
  choices?: Choice[];
  answer: Answer;
  hints?: string[];
  difficulty: number;
  variants?: string[];
}

/**
 * Generate unique ID for a problem
 */
function generateId(category: string, seed: number): string {
  const raw = `M-${category}-${seed}-${Date.now()}`;
  return crypto.createHash('md5').update(raw).digest('hex').substring(0, 12).toUpperCase();
}

/**
 * Shuffle array in place (Fisher-Yates)
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate MCQ choices with distractors
 */
function generateChoices(correct: number, precision: number = 2): Choice[] {
  const distractors = [
    Math.round(correct * 1.1 * Math.pow(10, precision)) / Math.pow(10, precision),
    Math.round(correct * 0.9 * Math.pow(10, precision)) / Math.pow(10, precision),
    Math.round(correct * 1.2 * Math.pow(10, precision)) / Math.pow(10, precision),
  ];

  const allChoices = [
    { id: 'a', label: String(correct) },
    { id: 'b', label: String(distractors[0]) },
    { id: 'c', label: String(distractors[1]) },
    { id: 'd', label: String(distractors[2]) },
  ];

  return shuffle(allChoices);
}

/**
 * Find correct choice ID
 */
function findCorrectId(choices: Choice[], correctValue: string): string {
  const found = choices.find(c => c.label === correctValue);
  return found ? found.id : 'a';
}

/**
 * Math Problem Generators
 */

// 1. 수와연산 - 분수 덧셈 (ES34, ES56)
function generateFractionAddition(seed: number): LearningItem {
  const num1 = 1 + (seed % 5);
  const num2 = 1 + ((seed + 1) % 5);
  const denom = 2 + (seed % 8);
  const result = (num1 + num2) / denom;

  const problem = `${num1}/${denom} + ${num2}/${denom} = ?`;
  const answer = Math.round(result * 100) / 100;
  const choices = generateChoices(answer, 2);

  return {
    id: generateId('fraction-add', seed),
    subject: 'math',
    area: 'math.수와연산',
    gradeBand: ['ES34', 'ES56'],
    conceptTag: ['분수', '분수연산', '덧셈'],
    stem: { type: 'text', payload: problem },
    choices,
    answer: { kind: 'mcq', value: findCorrectId(choices, String(answer)) },
    difficulty: 3,
    variants: [`seed:${seed}`],
  };
}

// 2. 수와연산 - 소수 곱셈 (ES56)
function generateDecimalMultiplication(seed: number): LearningItem {
  const factor1 = (1 + (seed % 9)) / 10;
  const factor2 = 2 + (seed % 8);
  const result = factor1 * factor2;

  const problem = `${factor1} × ${factor2} = ?`;
  const answer = Math.round(result * 100) / 100;
  const choices = generateChoices(answer, 2);

  return {
    id: generateId('decimal-mult', seed),
    subject: 'math',
    area: 'math.수와연산',
    gradeBand: ['ES56'],
    conceptTag: ['소수', '소수연산', '곱셈'],
    stem: { type: 'text', payload: problem },
    choices,
    answer: { kind: 'mcq', value: findCorrectId(choices, String(answer)) },
    difficulty: 4,
    variants: [`seed:${seed}`],
  };
}

// 3. 변화와관계 - 일차방정식 (MS1)
function generateLinearEquation(seed: number): LearningItem {
  const coef = 2 + (seed % 5);
  const constant = 5 + (seed % 10);
  const x = 3 + (seed % 7);
  const rhs = coef * x + constant;

  const problem = `${coef}x + ${constant} = ${rhs}, x = ?`;
  const choices = generateChoices(x, 0);

  return {
    id: generateId('linear-eq', seed),
    subject: 'math',
    area: 'math.변화와관계',
    gradeBand: ['MS1'],
    conceptTag: ['일차방정식', '방정식', '미지수'],
    stem: { type: 'text', payload: problem },
    choices,
    answer: { kind: 'mcq', value: findCorrectId(choices, String(x)) },
    difficulty: 5,
    variants: [`seed:${seed}`],
  };
}

// 4. 도형과측정 - 직사각형 넓이 (ES34)
function generateRectangleArea(seed: number): LearningItem {
  const width = 3 + (seed % 8);
  const height = 4 + ((seed + 2) % 7);
  const area = width * height;

  const problem = `가로 ${width}cm, 세로 ${height}cm인 직사각형의 넓이는?`;
  const choices = generateChoices(area, 0);

  return {
    id: generateId('rect-area', seed),
    subject: 'math',
    area: 'math.도형과측정',
    gradeBand: ['ES34'],
    conceptTag: ['직사각형', '넓이', '곱셈'],
    stem: { type: 'text', payload: problem },
    choices,
    answer: { kind: 'mcq', value: findCorrectId(choices, String(area)) },
    difficulty: 2,
    hints: ['넓이 = 가로 × 세로'],
    variants: [`seed:${seed}`],
  };
}

// 5. 도형과측정 - 원의 둘레 (ES56)
function generateCircleCircumference(seed: number): LearningItem {
  const radius = 3 + (seed % 10);
  const circumference = Math.round(2 * Math.PI * radius * 100) / 100;

  const problem = `반지름이 ${radius}cm인 원의 둘레는? (π = 3.14)`;
  const choices = generateChoices(circumference, 2);

  return {
    id: generateId('circle-circum', seed),
    subject: 'math',
    area: 'math.도형과측정',
    gradeBand: ['ES56'],
    conceptTag: ['원', '둘레', '원주율'],
    stem: { type: 'text', payload: problem },
    choices,
    answer: { kind: 'mcq', value: findCorrectId(choices, String(circumference)) },
    difficulty: 5,
    hints: ['둘레 = 2πr'],
    variants: [`seed:${seed}`],
  };
}

// 6. 자료와가능성 - 평균 (ES56)
function generateAverage(seed: number): LearningItem {
  const values = [
    10 + (seed % 20),
    15 + ((seed + 1) % 20),
    20 + ((seed + 2) % 20),
    25 + ((seed + 3) % 20),
  ];
  const avg = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;

  const problem = `다음 수의 평균은? ${values.join(', ')}`;
  const choices = generateChoices(avg, 1);

  return {
    id: generateId('average', seed),
    subject: 'math',
    area: 'math.자료와가능성',
    gradeBand: ['ES56'],
    conceptTag: ['평균', '통계', '계산'],
    stem: { type: 'text', payload: problem },
    choices,
    answer: { kind: 'mcq', value: findCorrectId(choices, String(avg)) },
    difficulty: 3,
    hints: ['평균 = (모든 수의 합) ÷ (개수)'],
    variants: [`seed:${seed}`],
  };
}

// 7. 수와연산 - 정수 연산 (MS1)
function generateIntegerOperation(seed: number): LearningItem {
  const a = -10 + (seed % 20);
  const b = -5 + ((seed + 3) % 15);
  const result = a + b;

  const problem = `${a} + (${b}) = ?`;
  const choices = generateChoices(result, 0);

  return {
    id: generateId('integer-add', seed),
    subject: 'math',
    area: 'math.수와연산',
    gradeBand: ['MS1'],
    conceptTag: ['정수', '정수연산', '덧셈'],
    stem: { type: 'text', payload: problem },
    choices,
    answer: { kind: 'mcq', value: findCorrectId(choices, String(result)) },
    difficulty: 4,
    variants: [`seed:${seed}`],
  };
}

// 8. 변화와관계 - 일차함수 (MS1, MS23)
function generateLinearFunction(seed: number): LearningItem {
  const slope = 2 + (seed % 5);
  const intercept = -5 + ((seed + 2) % 10);
  const x = 3;
  const y = slope * x + intercept;

  const problem = `일차함수 y = ${slope}x + (${intercept})에서 x = 3일 때 y의 값은?`;
  const choices = generateChoices(y, 0);

  return {
    id: generateId('linear-func', seed),
    subject: 'math',
    area: 'math.변화와관계',
    gradeBand: ['MS1', 'MS23'],
    conceptTag: ['일차함수', '함수', '대입'],
    stem: { type: 'text', payload: problem },
    choices,
    answer: { kind: 'mcq', value: findCorrectId(choices, String(y)) },
    difficulty: 5,
    variants: [`seed:${seed}`],
  };
}

// 9. 도형과측정 - 삼각형 넓이 (ES56)
function generateTriangleArea(seed: number): LearningItem {
  const base = 4 + (seed % 10);
  const height = 5 + ((seed + 1) % 8);
  const area = (base * height) / 2;

  const problem = `밑변 ${base}cm, 높이 ${height}cm인 삼각형의 넓이는?`;
  const choices = generateChoices(area, 0);

  return {
    id: generateId('triangle-area', seed),
    subject: 'math',
    area: 'math.도형과측정',
    gradeBand: ['ES56'],
    conceptTag: ['삼각형', '넓이', '나눗셈'],
    stem: { type: 'text', payload: problem },
    choices,
    answer: { kind: 'mcq', value: findCorrectId(choices, String(area)) },
    difficulty: 3,
    hints: ['삼각형 넓이 = (밑변 × 높이) ÷ 2'],
    variants: [`seed:${seed}`],
  };
}

// 10. 자료와가능성 - 확률 (MS1)
function generateProbability(seed: number): LearningItem {
  const favorable = 1 + (seed % 4);
  const total = 6 + (seed % 8);
  const prob = Math.round((favorable / total) * 100) / 100;

  const problem = `전체 ${total}개 중에서 ${favorable}개를 뽑을 확률은? (소수로 표현)`;
  const choices = generateChoices(prob, 2);

  return {
    id: generateId('probability', seed),
    subject: 'math',
    area: 'math.자료와가능성',
    gradeBand: ['MS1'],
    conceptTag: ['확률', '경우의수', '나눗셈'],
    stem: { type: 'text', payload: problem },
    choices,
    answer: { kind: 'mcq', value: findCorrectId(choices, String(prob)) },
    difficulty: 6,
    hints: ['확률 = (경우의 수) ÷ (전체 경우의 수)'],
    variants: [`seed:${seed}`],
  };
}

/**
 * Build content bank with 10 sample items
 */
function buildContentBank(): LearningItem[] {
  const seed = 100; // Fixed seed for reproducible output

  const items: LearningItem[] = [
    generateFractionAddition(seed),
    generateDecimalMultiplication(seed + 1),
    generateLinearEquation(seed + 2),
    generateRectangleArea(seed + 3),
    generateCircleCircumference(seed + 4),
    generateAverage(seed + 5),
    generateIntegerOperation(seed + 6),
    generateLinearFunction(seed + 7),
    generateTriangleArea(seed + 8),
    generateProbability(seed + 9),
  ];

  return items;
}

/**
 * Main execution
 */
function main() {
  console.log('='.repeat(60));
  console.log('TypeScript Math Content Generator');
  console.log('Generating 10 sample learning items...');
  console.log('='.repeat(60));

  const items = buildContentBank();

  // Output path
  const outputDir = path.join(__dirname, '../../../apps/web/content/math');
  const outputFile = path.join(outputDir, 'bank.json');

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write JSON file
  fs.writeFileSync(outputFile, JSON.stringify(items, null, 2), 'utf-8');

  console.log(`\n✓ Generated ${items.length} items`);
  console.log(`✓ Output: ${outputFile}`);

  // Statistics
  const byGrade = items.reduce((acc, item) => {
    item.gradeBand.forEach(grade => {
      acc[grade] = (acc[grade] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  console.log('\nBreakdown by grade band:');
  Object.entries(byGrade).forEach(([grade, count]) => {
    console.log(`  ${grade}: ${count} items`);
  });

  const byArea = items.reduce((acc, item) => {
    acc[item.area] = (acc[item.area] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\nBreakdown by area:');
  Object.entries(byArea).forEach(([area, count]) => {
    console.log(`  ${area}: ${count} items`);
  });

  console.log('\n✅ Generation complete!');
}

// Run if called directly
if (require.main === module) {
  main();
}

export { buildContentBank, LearningItem };
