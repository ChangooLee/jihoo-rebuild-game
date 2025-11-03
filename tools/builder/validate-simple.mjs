#!/usr/bin/env node
/**
 * 콘텐츠 간단 검증
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateItem(item, index) {
  const errors = [];
  
  // 필수 필드 체크
  if (!item.id) errors.push('id 누락');
  if (!item.subject) errors.push('subject 누락');
  if (!item.gradeBand) errors.push('gradeBand 누락');
  if (!item.stem) errors.push('stem 누락');
  if (!item.answer) errors.push('answer 누락');
  
  // 타입 체크
  if (item.difficulty && (item.difficulty < 1 || item.difficulty > 10)) {
    errors.push(`difficulty 범위 오류: ${item.difficulty}`);
  }
  
  return errors;
}

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
        const errors = validateItem(items[i], i);
        
        if (errors.length === 0) {
          validCount++;
        } else {
          console.error(`    ❌ 문항 ${i + 1} (id: ${items[i].id || 'unknown'}):`, errors.join(', '));
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

function main() {
  console.log('=' .repeat(60));
  console.log('콘텐츠 검증');
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

main();

