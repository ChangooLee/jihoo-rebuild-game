# Jihoo Quest 개발 현황 문서

## 프로젝트 개요

ADHD 친화형 학습·집중력 게임 - 한국 초등·중등 학생 대상 학습 게임 플랫폼

**기술 스택:**
- **프레임워크**: Next.js 14+ (App Router), React 18.3, TypeScript 5.3
- **스타일링**: Tailwind CSS 3.4, shadcn/ui, PostCSS
- **데이터베이스**: Dexie.js 3.2.4 (IndexedDB)
- **PWA**: next-pwa 5.6.0
- **학습 알고리즘**: fsrs.js 1.0.0 (분산학습 스케줄러)
- **콘텐츠 검증**: Zod 3.22.4
- **음성 처리**: Web Speech API (TTS/STT)
- **차트**: recharts 2.10.3
- **워밍업**: jspsych 7.3.0

---

## ✅ 완료된 작업

### 1. 프로젝트 기반 구조

#### 1.1 Next.js 설정
- ✅ Next.js 14.2.0 (App Router) 프로젝트 초기화
- ✅ TypeScript 5.3.0 설정 완료
- ✅ `apps/web/` 디렉토리 구조 생성
- ✅ `tsconfig.json` 경로 별칭 설정 (`@/*`)
- ✅ `next.config.js` PWA 설정 (`next-pwa`)

**파일:**
- `apps/web/package.json`
- `apps/web/tsconfig.json`
- `apps/web/next.config.js`
- `apps/web/.gitignore`

#### 1.2 UI 프레임워크
- ✅ Tailwind CSS 3.4.1 설정
- ✅ PostCSS + Autoprefixer 설정
- ✅ shadcn/ui 기본 컴포넌트 (Button)
- ✅ `tailwind.config.ts` 다크모드, 애니메이션 설정
- ✅ `app/globals.css` CSS 변수 시스템 (라이트/다크 테마)

**파일:**
- `apps/web/tailwind.config.ts`
- `apps/web/postcss.config.js`
- `apps/web/app/globals.css`
- `apps/web/components/ui/button.tsx`
- `apps/web/lib/utils.ts` (cn 유틸리티)

#### 1.3 PWA 설정
- ✅ `next-pwa` 통합
- ✅ `manifest.json` 생성 (아이콘, 테마 설정)
- ✅ 서비스 워커 자동 등록

**파일:**
- `apps/web/public/manifest.json`
- `apps/web/next.config.js` (withPWA 설정)

---

### 2. 데이터 모델 및 타입 시스템

#### 2.1 타입 정의
- ✅ `LearningItem` 인터페이스 (과목, 학년군, 개념 태그, 난이도 등)
- ✅ `ReviewState` 인터페이스 (FSRS 상태, 결과, 반응시간)
- ✅ `SessionLog` 인터페이스 (세션 기록)
- ✅ `UserProfile` 인터페이스 (사용자 설정)
- ✅ `SessionPhase`, `SessionState` 타입 (세션 플로우)

**기술:** TypeScript, 구조화된 타입 시스템

**파일:**
- `apps/web/lib/types.ts`

#### 2.2 데이터베이스 스키마
- ✅ Dexie.js IndexedDB 스키마 설계
- ✅ `JihooQuestDB` 클래스 구현
- ✅ 테이블: `learningItems`, `reviewStates`, `sessionLogs`, `userProfile`
- ✅ 인덱스 설정 (과목, 학년군, 개념 태그, 난이도별 검색)

**기술:** Dexie.js 3.2.4, IndexedDB

**파일:**
- `apps/web/lib/db.ts`

---

### 3. 핵심 학습 엔진

#### 3.1 FSRS 분산학습 엔진
- ✅ `fsrs.js` 통합
- ✅ 리콜 결과 기록 (`recordReview`)
- ✅ Due 항목 조회 (`getDueItems`)
- ✅ FSRS 상태 관리 (Card 기반 스케줄링)
- ✅ 결과 변환 (again/hard/good/easy → Rating)

**기술:** fsrs.js 1.0.0, 분산학습 알고리즘

**파일:**
- `apps/web/modules/fsrs/engine.ts`

#### 3.2 적응 난이도 엔진
- ✅ 1-up-1-down 알고리즘 구현 (정답 +0.5, 오답 -0.5)
- ✅ 속도 보정 (상위 20% 느리면 'hard' 기록)
- ✅ 기준 반응시간 계산 (이동 평균)
- ✅ `AdaptiveDifficultyEngine` 클래스

**기술:** 알고리즘 설계, 반응시간 분석

**파일:**
- `apps/web/modules/engine/adaptive-difficulty.ts`

#### 3.3 개인화 스케줄러
- ✅ 과목 분포 조정 (기본: 수학 40%, 영어 30%, 과학 15%, 사회 15%)
- ✅ 약점 태그 기반 출제 우선순위
- ✅ 약점 가중치 시스템 (기본 60%)
- ✅ FSRS Due 항목 통합
- ✅ 학년군 필터링

**기술:** 확률 기반 선택, 개인화 알고리즘

**파일:**
- `apps/web/modules/scheduler/personalized.ts`

---

### 4. 세션 시스템

#### 4.1 세션 플로우 관리
- ✅ `SessionFlowManager` 클래스
- ✅ 8단계 플로우 (워밍업 → 라운드 A/B/C → 휴식 → 리콜 보스 → 리포트)
- ✅ 시간 제한 자동 관리 (각 단계별 duration)
- ✅ 페이즈 변경 콜백 시스템
- ✅ 휴식 스킵 제한 (최소 10초 대기)

**기술:** 상태 머신, 이벤트 기반 아키텍처

**파일:**
- `apps/web/modules/focus/session-flow.ts`

#### 4.2 포커스 타이머
- ✅ `FocusTimer` 클래스
- ✅ 3가지 프리셋 (120/150/180초)
- ✅ 시작/일시정지/정지/리셋 기능
- ✅ 실시간 콜백 (onTick, onComplete)

**기술:** 클래스 기반 타이머, 인터벌 관리

**파일:**
- `apps/web/modules/focus/timer.ts`

#### 4.3 강제 휴식 시스템
- ✅ 박스 호흡 애니메이션 (4-4-4-4 패턴)
- ✅ 16초 주기 시각화 (들이쉬기 → 멈춤 → 내쉬기 → 멈춤)
- ✅ 스킵 최소화 (최소 시간 설정)
- ✅ React 컴포넌트 (`BoxBreathing`)

**기술:** React hooks, CSS 애니메이션, 타이밍 제어

**파일:**
- `apps/web/modules/focus/break.tsx`

#### 4.4 집중모드
- ✅ `FocusMode` 클래스
- ✅ 애니메이션/트랜지션 비활성화
- ✅ 배경 이미지 제거
- ✅ DOM 클래스 기반 토글

**기술:** CSS 제어, 상태 관리

**파일:**
- `apps/web/modules/focus/focus-mode.ts`

---

### 5. 콘텐츠 시스템

#### 5.1 스키마 검증
- ✅ Zod 스키마 정의 (`learningItemSchema`)
- ✅ Stem, Choice, Answer 타입 검증
- ✅ 과목, 학년군, 개념 태그 검증

**기술:** Zod 3.22.4, 스키마 검증

**파일:**
- `apps/web/content/schema/learning-item.ts`

#### 5.2 콘텐츠 로더
- ✅ YAML 로더 (`js-yaml`)
- ✅ JSON 로더
- ✅ 스키마 검증 통합
- ✅ 다중 항목 로드 (`loadLearningItems`)

**기술:** js-yaml 4.1.0, Zod 검증

**파일:**
- `apps/web/modules/content/loader.ts`

---

### 6. 게임 구현

#### 6.1 수학 게임
- ✅ 스피드 연산 게임 (`SpeedCalculation`)
- ✅ 타임 리미트 (기본 3분)
- ✅ 실시간 정답률 추적
- ✅ 반응시간 기록

**기술:** React, 실시간 상태 관리

**파일:**
- `apps/web/game/math/speed-calculation.tsx`
- `apps/web/game/math/index.ts`

#### 6.2 영어 게임
- ✅ 듣기 게임 (`ListeningGame`)
  - TTS en-GB 음성 재생
  - 다중 선택지
  - 정답 피드백
- ✅ 말하기 게임 (`SpeakingGame`)
  - STT 음성 인식
  - 텍스트 비교 검증
  - 발음 피드백

**기술:** Web Speech API (TTS/STT), 비동기 처리

**파일:**
- `apps/web/game/english/listening.tsx`
- `apps/web/game/english/speaking.tsx`
- `apps/web/modules/audio/tts.ts`
- `apps/web/modules/audio/stt.ts`

#### 6.3 과학 게임
- ✅ 원인-결과 연결 게임 (`CauseEffect`)
- ✅ 양방향 매칭 인터페이스
- ✅ 반응시간 기록

**기술:** React 상태 관리, 드래그앤드롭 기반

**파일:**
- `apps/web/game/science/cause-effect.tsx`

#### 6.4 사회 게임
- ✅ 시나리오 선택형 게임 (`ScenarioGame`)
- ✅ 다중 선택지 UI
- ✅ 정답/오답 시각적 피드백

**기술:** React 컴포넌트, 상태 관리

**파일:**
- `apps/web/game/social/scenario.tsx`

#### 6.5 워밍업 과제
- ✅ Stroop 테스트 (`StroopTask`)
- ✅ 색상-단어 불일치 반응시간 측정
- ✅ 정답률 추적
- ✅ 90초 타임리미트

**기술:** React, 실시간 반응시간 측정

**파일:**
- `apps/web/game/warmup/stroop.tsx`

---

### 7. 리콜 시스템

#### 7.1 리콜 보스
- ✅ FSRS Due 항목 우선 선택
- ✅ 오늘 틀린 문제 통합
- ✅ 약점 태그 기반 보완
- ✅ `RecallBoss` 클래스

**기술:** 우선순위 큐 알고리즘, 데이터 필터링

**파일:**
- `apps/web/modules/review/recall-boss.ts`

#### 7.2 오답 변주 시스템
- ✅ 변주 ID 기반 항목 선택
- ✅ 랜덤 변주 선택 (`selectRandomVariant`)
- ✅ 간헐 보상 확률 계산
- ✅ 연속 정답에 따른 보상 확률 증가

**기술:** 확률 기반 알고리즘, 변주 관리

**파일:**
- `apps/web/modules/review/variant.ts`

---

### 8. 데이터 관리

#### 8.1 데이터 내보내기/가져오기
- ✅ JSON 내보내기 (`exportData`)
- ✅ JSON 가져오기 (`importData`)
- ✅ 벌크 연산 (bulkPut)
- ✅ 전체 데이터 삭제 (`deleteAllData`)
- ✅ 타입별 삭제 (`deleteByType`)

**기술:** JSON 직렬화, IndexedDB 벌크 연산

**파일:**
- `apps/web/lib/data-management.ts`

---

### 9. 분석 지표 (KPI)

#### 9.1 KPI 수집
- ✅ 세션 완료율 (`getSessionCompletionRate`)
- ✅ 평균 세션 길이 (`getAverageSessionLength`)
- ✅ 재정복률 (`getRecoveryRate`) - 구조만
- ✅ 과목별 누적 시간 (`getSubjectTime`)
- ✅ 휴식 스킵률 (`getBreakSkipRate`)
- ✅ `KPIAnalytics` 클래스

**기술:** 데이터 집계, 통계 분석

**파일:**
- `apps/web/modules/analytics/kpi.ts`

---

### 10. 기본 UI

#### 10.1 홈페이지
- ✅ 기본 레이아웃 (`app/page.tsx`)
- ✅ 세션 시작 버튼
- ✅ 진단 테스트 링크
- ✅ 대시보드 링크

**파일:**
- `apps/web/app/page.tsx`
- `apps/web/app/layout.tsx`

---

## 🚧 남은 작업 (우선순위별)

### 높은 우선순위

#### 1. 진단 테스트 시스템 구현

**기능 요구사항:**
- [ ] 진단 테스트 UI 페이지 (`app/diagnostic/page.tsx`)
- [ ] 과목별 12문항 출제 (각 45-60초)
- [ ] 반응시간 실시간 기록
- [ ] 1-up-1-down 난이도 추정 통합
- [ ] 약점 태그 추출 알고리즘
- [ ] GradeBand 추정 로직 (ES12/ES34/ES56/MS1/MS23)
- [ ] 진단 결과 리포트 생성

**기술 스택:**
- React 컴포넌트
- `AdaptiveDifficultyEngine` 통합
- 통계 분석 (정답률, 반응시간 분포)
- 결과 시각화

**예상 파일:**
- `apps/web/app/diagnostic/page.tsx`
- `apps/web/modules/diagnostic/engine.ts`

---

#### 2. 세션 페이지 구현

**기능 요구사항:**
- [ ] 세션 플로우 UI (`app/session/page.tsx`)
- [ ] 워밍업 통합 (Stroop 테스트)
- [ ] 라운드별 게임 라우팅 (수학/영어/과학·사회)
- [ ] 휴식 화면 통합 (박스 호흡)
- [ ] 리콜 보스 게임 화면
- [ ] 실시간 진행 상태 표시
- [ ] 라운드별 결과 저장

**기술 스택:**
- Next.js App Router
- React 상태 관리 (Context 또는 Zustand)
- `SessionFlowManager` 통합
- 각 게임 컴포넌트 통합

**예상 파일:**
- `apps/web/app/session/page.tsx`
- `apps/web/app/session/layout.tsx`
- `apps/web/components/session/ProgressBar.tsx`

---

#### 3. 대시보드 구현

**기능 요구사항:**
- [ ] 대시보드 메인 페이지 (`app/dashboard/page.tsx`)
- [ ] 실시간 누적바 (과목별 시간, 남은 라운드)
- [ ] 일/주/월 차트 (recharts 사용)
  - 누적 시간 그래프
  - 정답률 추이
  - 성장 곡선
- [ ] 약점 태그 분석 시각화
  - 태그별 정답률
  - 히트맵 또는 바 차트
- [ ] 칭호 시스템
  - 개념 기반 칭호 ("분수 마스터", "소수 스피더" 등)
  - 칭호 달성 조건 체크
  - 칭호 표시 UI

**기술 스택:**
- recharts 2.10.3
- 데이터 집계 (`KPIAnalytics`)
- 시각화 컴포넌트

**예상 파일:**
- `apps/web/app/dashboard/page.tsx`
- `apps/web/components/dashboard/TimeChart.tsx`
- `apps/web/components/dashboard/WeakTagChart.tsx`
- `apps/web/components/dashboard/AchievementBadges.tsx`

---

#### 4. 리포트 시스템

**기능 요구사항:**
- [ ] 보호자/상담 리포트 페이지 (`app/report/page.tsx`)
- [ ] 과목별 누적 시간 리포트
- [ ] 개선 곡선 (시계열 그래프)
- [ ] 약점 변화 추이
- [ ] PDF 내보내기 기능 (선택)
- [ ] 리포트 공유 기능 (선택)

**기술 스택:**
- recharts (시계열 그래프)
- PDF 생성 라이브러리 (선택: `react-pdf` 또는 `jspdf`)
- 데이터 집계 및 필터링

**예상 파일:**
- `apps/web/app/report/page.tsx`
- `apps/web/components/report/SubjectTimeReport.tsx`
- `apps/web/components/report/ImprovementChart.tsx`

---

### 중간 우선순위

#### 5. 접근성 기능

**기능 요구사항:**
- [ ] 접근성 설정 페이지 (`app/settings/accessibility/page.tsx`)
- [ ] 폰트 옵션 선택
  - 기본 폰트
  - Lexend (가독성 향상)
  - OpenDyslexic (난독증 친화)
- [ ] 행간/자간 조절 슬라이더
- [ ] 애니메이션 강도 슬라이더 (0-1)
- [ ] 색각 대비 체크 및 조정
- [ ] 설정 저장 (`UserProfile`)

**기술 스택:**
- CSS 변수 기반 폰트 변경
- CSS `line-height`, `letter-spacing` 동적 조절
- 색상 대비 검사 알고리즘 (WCAG 기준)

**예상 파일:**
- `apps/web/app/settings/accessibility/page.tsx`
- `apps/web/modules/accessibility/font-manager.ts`
- `apps/web/modules/accessibility/color-contrast.ts`

---

#### 6. 알림 시스템

**기능 요구사항:**
- [ ] Web Push 알림 설정
- [ ] VAPID 키 설정 (환경변수)
- [ ] 서비스워커 푸시 알림 처리
- [ ] 로컬 리마인더 (Notification API)
- [ ] 데일리 루틴 알림
- [ ] 주간/시즌 미션 알림

**기술 스택:**
- Web Push API
- Service Worker
- `next-pwa` 푸시 알림 통합
- 로컬 스토리지 기반 스케줄링

**예상 파일:**
- `apps/web/public/sw.js` (서비스워커)
- `apps/web/modules/notification/push-manager.ts`
- `apps/web/modules/notification/reminder.ts`

---

#### 7. 추가 게임 구현

**수학 게임:**
- [ ] 분수↔소수 변환 게임
- [ ] 각/넓이 계산 게임
- [ ] 평균·최빈값 계산 게임
- [ ] 그래프 읽기 게임

**과학 게임:**
- [ ] 전기회로 시뮬레이션 게임
- [ ] 태양-지구-달 위치 게임
- [ ] 물질 상태 시뮬레이션

**사회 게임:**
- [ ] 지도 기호/방위 매칭 게임
- [ ] 국기/수도 퀴즈

**워밍업:**
- [ ] N-back 테스트
- [ ] Go-NoGo 테스트

**기술 스택:**
- React 컴포넌트
- Canvas 또는 SVG (시뮬레이션)
- 인터랙티브 UI

---

### 낮은 우선순위

#### 8. 고급 기능

**주의 부하 관리:**
- [ ] 오답/지연 연속 감지
- [ ] 자동 난이도 하향 조정
- [ ] 애니메이션 축소
- [ ] 라운드 단축

**과몰입 경보:**
- [ ] 세션 시간 임계값 설정
- [ ] 경고 메시지 표시
- [ ] 강제 휴식 요구

**A/B 실험 프레임워크:**
- [ ] 실험 그룹 분할
- [ ] 보상/휴식 길이 변수 실험
- [ ] 결과 수집 및 분석

**기술 스택:**
- 상태 머신 (주의 부하 관리)
- 타이머 기반 경보 시스템
- 랜덤 분할 알고리즘

**예상 파일:**
- `apps/web/modules/advanced/cognitive-load.ts`
- `apps/web/modules/advanced/overuse-alert.ts`
- `apps/web/modules/advanced/ab-test.ts`

---

#### 9. 콘텐츠 데이터

**필요한 콘텐츠:**
- [ ] 한국 커리큘럼 기반 학습 항목 생성
  - 수학: ES12/ES34/ES56/MS1/MS23 × 4영역
  - 영어: ES/MS × 듣기/읽기/문법/어휘
  - 과학: ES34/ES56/MS1/MS2/MS3 × 4영역
  - 사회: ES/MS × 지리/역사/정치·법/경제
- [ ] 개념 태그 매핑
- [ ] 변주 생성 (각 항목당 최소 3개)
- [ ] YAML/JSON 포맷으로 저장

**기술 스택:**
- YAML 작성 도구
- 콘텐츠 검증 스크립트
- 한국 교육과정 매핑 테이블

**예상 파일:**
- `apps/web/content/yaml/math/*.yaml`
- `apps/web/content/yaml/english/*.yaml`
- `apps/web/scripts/validate-content.ts`

---

#### 10. 서버 기능 (선택)

**백엔드 (옵션):**
- [ ] NestJS 서버 설정
- [ ] PostgreSQL/Supabase 연동
- [ ] STT 서버 (Whisper/Vosk/Coqui)
- [ ] Web Push 서버
- [ ] 데이터 동기화 API

**기술 스택:**
- NestJS
- PostgreSQL 또는 Supabase
- STT 서버 (Python 또는 Node.js)
- REST API 또는 GraphQL

---

## 기술적 부채 및 개선 사항

### 현재 알려진 이슈

1. **FSRS 엔진 통합:**
   - `fsrs.js`의 Card.fromJSON/toJSON 메서드가 실제 API와 일치하는지 확인 필요
   - FSRS 파라미터 튜닝 필요

2. **오디오 모듈:**
   - 브라우저별 Web Speech API 호환성 체크 필요
   - STT fallback (서버 STT) 구현 필요

3. **성능 최적화:**
   - 대량 데이터 로딩 시 최적화
   - IndexedDB 쿼리 최적화
   - React 컴포넌트 메모이제이션

4. **에러 핸들링:**
   - 전역 에러 바운더리 추가
   - 네트워크 에러 처리
   - 데이터베이스 에러 복구

---

## 개발 환경 설정

### 필수 요구사항
- Node.js 18.0.0 이상
- pnpm 8.0.0 이상

### 설치 및 실행

```bash
# 프로젝트 루트에서
cd apps/web
pnpm install
pnpm dev
```

### 환경변수 (선택)

`.env.local` 파일:
```
NEXT_PUBLIC_PUSH_PUBLIC_KEY=your_vapid_public_key
PUSH_PRIVATE_KEY=your_vapid_private_key
STT_ENDPOINT=https://your-stt-server.com/api
DATABASE_URL=your_postgres_url (옵션)
```

---

## 다음 마일스톤

1. **MVP 완성 (2주 내)**
   - 진단 테스트 시스템
   - 세션 페이지 통합
   - 기본 대시보드

2. **베타 버전 (4주 내)**
   - 모든 게임 구현
   - 리포트 시스템
   - 접근성 기능

3. **프로덕션 준비 (6주 내)**
   - 콘텐츠 데이터 추가
   - 성능 최적화
   - 테스트 완료

---

## 참고 문서

- [README.md](./README.md) - 프로젝트 전체 개요
- [apps/web/README.md](./apps/web/README.md) - 웹 앱 개발 가이드
- [apps/web/IMPLEMENTATION_STATUS.md](./apps/web/IMPLEMENTATION_STATUS.md) - 구현 현황 요약

---

**최종 업데이트:** 2024년 (현재 날짜)

