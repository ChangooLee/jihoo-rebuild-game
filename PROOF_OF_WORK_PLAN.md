# 🎯 작동 증거 제공 계획 (Implementation Plan)

**작성일**: 2025-11-03  
**목표**: 외부 검증 가능한 "작동하는 제품" 증거 제공  
**기간**: 2주 (2025-11-03 ~ 2025-11-17)

---

## 📋 우선순위별 작업 계획

### 🚀 Phase A: 데모 라우트 구현 (1주차)

#### A1. `/play?demo=1` - 플레이 데모
```typescript
// apps/web/app/play/page.tsx
export default function PlayPage({ searchParams }: { searchParams: { demo?: string } }) {
  const isDemoMode = searchParams.demo === '1';
  
  if (isDemoMode) {
    return <DemoPlaySession 
      autoProgress={true}
      duration={60}
      items={DEMO_ITEMS}
    />;
  }
  // ... 실제 플레이 로직
}
```

**검증 기준**:
- ✅ 60초 자동 진행
- ✅ HUD 표시 (진행도, 타이머, 힌트)
- ✅ 키보드 탭 순서 정상
- ✅ ARIA 라벨 노출

#### A2. `/break?demo=1` - 휴식 데모
```typescript
// apps/web/app/break/page.tsx
// prefers-reduced-motion 감지 & 대응
// 박스 호흡 애니메이션 표시
```

#### A3. `/result?demo=1` - 결과 데모
```typescript
// SessionResult 컴포넌트 활용
// 더미 데이터로 통계 표시
// 오답 복습 CTA
```

#### A4. `/diagnostic?demo=1` - 진단 데모
```typescript
// 4문항 샘플
// 반응시간 콘솔 출력
// 약점 태그 추정 결과
```

#### A5. `/dashboard?demo=1` - 대시보드 데모
```typescript
// 오늘 할 일
// 약점 태그 패널
// 누적 시간 바
```

#### A6. `/report?demo=1` - 리포트 데모
```typescript
// Recharts 더미 그래프
// A11y 라벨
```

**DoD (Definition of Done)**:
- [ ] 각 라우트가 SSR로 렌더링
- [ ] 랜딩에서 "데모 보기" 링크 추가
- [ ] Lighthouse A11y ≥ 95
- [ ] 키보드 내비게이션 완전 지원

---

### 📦 Phase B: 샘플 콘텐츠 공개 (1주차)

#### B1. 최소 콘텐츠 번들
```
apps/web/content/
├─ demo/
│  ├─ math-es56-fraction.json        # 30문항
│  ├─ math-ms1-equation.json         # 30문항
│  ├─ english-es56-listening.json    # 30문항
│  ├─ english-ms1-reading.json       # 30문항
│  ├─ science-es56-matter.json       # 30문항
│  ├─ science-ms1-motion.json        # 30문항
│  ├─ social-es-geography.json       # 30문항
│  └─ social-ms1-history.json        # 30문항
```

**총 240문항** (과목 × 학년군 × 30)

#### B2. 검증 스크립트
```bash
# package.json
"scripts": {
  "content:validate": "node tools/builder/validate-simple.mjs",
  "content:count": "node tools/builder/count-items.mjs"
}
```

#### B3. README 배지 추가
```markdown
![Content](https://img.shields.io/badge/content-2510_items-brightgreen)
![Demo](https://img.shields.io/badge/demo-240_items-blue)
```

**DoD**:
- [ ] 240문항 JSON 생성
- [ ] 검증 스크립트 통과
- [ ] README에 샘플 명시

---

### 🧠 Phase C: FSRS/적응 난이도 가시화 (1주차)

#### C1. 리콜 보스 큐 로그
```typescript
// SessionResult.tsx
<div className="bg-card p-4 rounded-lg">
  <h3>리콜 보스 큐 (최근 10개)</h3>
  <ul>
    {dueItems.slice(0, 10).map(item => (
      <li key={item.id}>
        {item.conceptTag} - {item.fsrsOutcome} - {item.nextReview}
      </li>
    ))}
  </ul>
</div>
```

#### C2. 적응 난이도 통계
```typescript
// 세션 종료 시 표시
<div>
  <p>정답률: {accuracy}%</p>
  <p>평균 반응시간: {avgLatency}ms</p>
  <p>FSRS 분포: Again {againCount}, Hard {hardCount}, Good {goodCount}, Easy {easyCount}</p>
</div>
```

#### C3. 엔진 문서
```markdown
# docs/engine.md
## FSRS 알고리즘
- 파라미터: w = [...]
- 상태 예시: { stability, difficulty, ... }

## 1-up-1-down
- 정답: difficulty + 0.5
- 오답: difficulty - 0.5
```

**DoD**:
- [ ] 리콜 큐 UI 추가
- [ ] 통계 표시
- [ ] engine.md 작성

---

### 🔔 Phase D: 알림/타이머 검증 (2주차)

#### D1. 알림 설정 목업
```typescript
// settings/notification/page.tsx
<button onClick={handleTestNotification}>
  테스트 알림 보내기
</button>
// → 브라우저 알림 or 토스트
```

#### D2. 타이머 사운드
```typescript
// FocusTimer.tsx
const playSound = (type: 'start' | 'warning' | 'end') => {
  // Web Audio API
};
```

**DoD**:
- [ ] 테스트 알림 버튼 동작
- [ ] 타이머 사운드 3종

---

### ♿ Phase E: 접근성 증거 (2주차)

#### E1. Lighthouse 리포트
```bash
npx lighthouse https://moba-project.org/jihoo \
  --output html \
  --output-path ./docs/lighthouse-report.html
```

**목표**: A11y ≥ 95

#### E2. WCAG 2.2 체크리스트
```markdown
# docs/accessibility.md
## WCAG 2.2 AA 준수 현황

| 기준 | 상태 | 비고 |
|------|------|------|
| 1.4.3 명도 대비 | ✅ | 4.5:1 이상 |
| 2.1.1 키보드 | ✅ | 모든 기능 접근 가능 |
| 2.4.7 포커스 가시 | ✅ | 3px ring |
| 2.5.5 터치 타깃 | ✅ | 44px |
| ... | ... | ... |
```

#### E3. JSON-LD 검증
```bash
# Google Rich Results Test
https://search.google.com/test/rich-results
```

**DoD**:
- [ ] Lighthouse 리포트 첨부
- [ ] WCAG 체크리스트 작성
- [ ] JSON-LD 검증 통과

---

### 🧪 Phase F: E2E 테스트 (2주차)

#### F1. Playwright 설치
```bash
cd apps/web
npm install -D @playwright/test
npx playwright install
```

#### F2. 테스트 케이스 3종
```typescript
// tests/e2e/critical-path.spec.ts

test('랜딩 → 플레이 진입', async ({ page }) => {
  await page.goto('/');
  await page.click('text=오늘 퀘스트 시작');
  await expect(page).toHaveURL('/session');
});

test('휴식 화면 표시', async ({ page }) => {
  await page.goto('/break?demo=1');
  await expect(page.locator('text=휴식 시간')).toBeVisible();
});

test('결과 화면 표시', async ({ page }) => {
  await page.goto('/result?demo=1');
  await expect(page.locator('text=세션 완료')).toBeVisible();
});
```

**DoD**:
- [ ] Playwright 설정 완료
- [ ] 3 테스트 통과
- [ ] CI에 통합

---

## 📊 진행 상황 추적

### 1주차 목표
- [x] 콘텐츠 비율 조정 (80:15:3:2)
- [ ] 데모 라우트 6종 (A1-A6)
- [ ] 샘플 콘텐츠 240문항 (B1-B3)
- [ ] FSRS 가시화 (C1-C3)

### 2주차 목표
- [ ] 알림/타이머 검증 (D1-D2)
- [ ] 접근성 증거 (E1-E3)
- [ ] E2E 테스트 (F1-F2)

---

## 🎯 최종 검증 체크리스트

### 외부 검증 가능 항목
- [ ] 데모 라우트 6종 모두 SSR 렌더링
- [ ] 샘플 콘텐츠 240문항 공개
- [ ] Lighthouse A11y ≥ 95
- [ ] WCAG 2.2 체크리스트 공개
- [ ] JSON-LD 검증 통과
- [ ] E2E 테스트 3종 통과
- [ ] README에 "데모 보기" 링크
- [ ] docs/ 디렉토리에 engine.md, accessibility.md

### 신뢰 향상 지표
- [ ] 랜딩에서 데모로 1클릭 진입
- [ ] 데모에서 실제 플레이 경험 제공
- [ ] 알고리즘 동작 가시화
- [ ] 접근성 증거 문서화

---

**다음 단계**: Phase A1부터 순차 구현 시작

