#!/usr/bin/env node
/**
 * 콘텐츠 정규화 및 검증
 * 생성된 문항들을 표준 스키마로 통합하고 검증
 */

const fs = require('fs');
const path = require('path');
const { z } = require('zod');

// 스키마 정의 (apps/web/content/schema/learning-item.ts 참조)
const LearningItemSchema = z.object({
  id: z.string(),
  subject: z.enum(['math', 'english', 'science', 'social']),
  area: z.string(),
  gradeBand: z.array(z.string()),
  conceptTag: z.array(z.string()),
  stem: z.object({
    type: z.enum(['text', 'image', 'audio', 'sim']),
    payload: z.any()
  }),
  choices: z.array(z.object({
    id: z.string(),
    label: z.string()
  })).optional(),
  answer: z.object({
    kind: z.enum(['mcq', 'short', 'sequence']),
    value: z.any()
  }),
  source: z.object({
    url: z.string().optional(),
    generator: z.string().optional(),
    license: z.string(),
    attribution: z.string().optional()
  }).optional(),
  hints: z.array(z.string()).optional(),
  difficulty: z.number().min(1).max(10),
  variants: z.array(z.string()).optional()
});

/**
 * 디렉토리 내 모든 JSON 파일 검증
 */
function validateDirectory(dirPath) {
  console.log(`\n📁 검증 디렉토리: ${dirPath}`);
  
  if (!fs.existsSync(dirPath)) {
    console.log(`  ⚠️ 디렉토리가 없습니다.`);
    return { valid: 0, invalid: 0, total: 0 };
  }
  
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
  let validCount = 0;
  let invalidCount = 0;
  let totalItems = 0;
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    console.log(`\n  📄 ${file}`);
    
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const items = Array.isArray(content) ? content : [content];
      
      for (let i = 0; i < items.length; i++) {
        try {
          LearningItemSchema.parse(items[i]);
          validCount++;
        } catch (err) {
          console.error(`    ❌ 문항 ${i + 1} (id: ${items[i].id || 'unknown'}): ${err.message}`);
          invalidCount++;
        }
        totalItems++;
      }
      
      console.log(`    ✓ ${items.length}개 문항 검증 완료`);
    } catch (err) {
      console.error(`    ❌ 파일 읽기 실패: ${err.message}`);
    }
  }
  
  return { valid: validCount, invalid: invalidCount, total: totalItems };
}

/**
 * 중복 제거 (ID 기준)
 */
function deduplicateItems(items) {
  const seen = new Set();
  const unique = [];
  
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      unique.push(item);
    }
  }
  
  return unique;
}

/**
 * 메인 실행
 */
function main() {
  console.log('=' .repeat(60));
  console.log('콘텐츠 검증 및 정규화');
  console.log('=' .repeat(60));
  
  const contentDir = path.join(__dirname, '../../apps/web/content');
  const subjects = ['math', 'english', 'science', 'social'];
  
  let totalValid = 0;
  let totalInvalid = 0;
  let totalItems = 0;
  
  for (const subject of subjects) {
    const subjectDir = path.join(contentDir, subject);
    const stats = validateDirectory(subjectDir);
    totalValid += stats.valid;
    totalInvalid += stats.invalid;
    totalItems += stats.total;
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('검증 결과 요약');
  console.log('=' .repeat(60));
  console.log(`총 문항: ${totalItems}개`);
  console.log(`✓ 유효: ${totalValid}개 (${((totalValid/totalItems)*100).toFixed(1)}%)`);
  console.log(`✗ 오류: ${totalInvalid}개 (${((totalInvalid/totalItems)*100).toFixed(1)}%)`);
  
  if (totalInvalid > 0) {
    console.log('\n⚠️  오류가 있는 문항을 수정하세요.');
    process.exit(1);
  } else {
    console.log('\n✅ 모든 문항이 유효합니다!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateDirectory, deduplicateItems };

