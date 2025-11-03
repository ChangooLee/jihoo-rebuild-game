# 🎯 다음 단계 (올바른 방향)

## ✅ 완료된 것
1. 개발 방향 재정렬
2. 불필요한 데모 파일 제거
3. FSRS 빌드 에러 수정
4. 콘텐츠 생성 비율 조정 (80:15:3:2)

## 🔥 즉시 작업 (우선순위 1)

### 1. 실제 플레이 흐름 완성
**파일**: `apps/web/app/session/page.tsx`

**현재 상태**: 
- SessionProgress, InstantFeedback, SubjectTimeBar 컴포넌트 존재 ✅
- 워밍업 (Stroop), 휴식 (BoxBreathing) 컴포넌트 존재 ✅
- 게임 파일 존재 (speed-calculation, listening, etc.) ✅

**필요한 것**:
```typescript
// 전체 플로우 연결
const flow = [
  'warmup',    // Stroop
  'roundA',    // 수학
  'break1',    // 휴식
  'roundB',    // 영어
  'break2',    // 휴식
  'roundC',    // 과학/사회
  'recallBoss', // 오답 복습
  'result',    // 결과
];

// 각 단계마다 IndexedDB 저장
// FSRS 상태 실시간 업데이트
```

### 2. 콘텐츠 로더 실제 연결
**파일**: `apps/web/modules/content/loader.ts`

**현재 상태**:
- content/index.json 존재 ✅
- 2,510개 문항 존재 ✅

**필요한 것**:
```typescript
// 1. 학년군별 필터링
// 2. 난이도 적응 (1-up-1-down)
// 3. FSRS Due 우선 출제
// 4. 과목 비율 (40:30:15:15) 준수
```

### 3. IndexedDB 실시간 저장
**파일**: `apps/web/lib/db.ts`

**현재 상태**:
- Dexie 스키마 정의 완료 ✅

**필요한 것**:
```typescript
// 매 문항마다:
// 1. 정답/오답 기록
// 2. 반응시간 저장
// 3. FSRS 상태 업데이트
// 4. 세션 로그 누적
```

## 📊 다음 주 작업 (우선순위 2)

### 4. 대시보드 실제 데이터 연결
**파일**: `apps/web/app/dashboard/page.tsx`

```typescript
// IndexedDB에서 읽기:
// 1. 오늘 할 일 (FSRS Due)
// 2. 누적 통계 (총 세션, 정답률)
// 3. 약점 태그 (FSRS 분석)
// 4. 학년군 추정 진행도
```

### 5. 리포트 페이지
**파일**: `apps/web/app/report/page.tsx`

```typescript
// 시계열 데이터:
// 1. 일/주/월 그래프
// 2. 과목별 누적 시간
// 3. 정답률 추이
// 4. 개선 곡선
```

## 🧪 2주 후 작업 (우선순위 3)

### 6. 접근성 증거
- Lighthouse 리포트 (A11y ≥ 95)
- WCAG 2.2 체크리스트
- 키보드 내비게이션 검증

### 7. E2E 테스트
- Playwright 설치
- 랜딩 → 플레이 → 결과
- 데이터 저장 검증
- FSRS 동작 검증

## 📝 핵심 원칙 (항상 기억)

1. **로그인 없이 시작** → 즉시 플레이 가능
2. **로컬 우선 저장** → IndexedDB가 메인
3. **실제 플레이가 데모** → 별도 데모 모드 불필요
4. **자동 레벨 조정** → 진단 테스트 분리 불필요
5. **PWA 오프라인** → 인터넷 없이도 동작

## 🎯 최종 목표

**외부 검증자가 확인할 수 있는 것**:
1. 랜딩에서 클릭 한 번으로 플레이 진입 ✅
2. 실제 문제 풀이 (HUD, 정답 피드백)
3. 휴식 화면 자동 전환 ✅
4. 결과 화면에 실제 통계
5. 대시보드에 누적 데이터
6. 모든 데이터 로컬 저장

→ **"작동하는 제품"을 보여주는 것이 최고의 증거**
