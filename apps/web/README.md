# Jihoo Quest Web Application

Next.js 기반 ADHD 친화형 학습·집중력 게임 웹 애플리케이션

## 시작하기

### 필요 사항

- Node.js 18.0.0 이상
- pnpm 8.0.0 이상 (또는 npm/yarn)

### 설치

```bash
# 프로젝트 루트에서
pnpm install

# 또는
cd apps/web && pnpm install
```

### 개발 서버 실행

```bash
# 프로젝트 루트에서
pnpm dev

# 또는
cd apps/web && pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
pnpm build
pnpm start
```

## 프로젝트 구조

```
apps/web/
├── app/              # Next.js App Router
├── components/       # 재사용 컴포넌트
├── modules/          # 핵심 모듈
├── game/            # 미니게임 구현
├── content/         # 콘텐츠 데이터
├── lib/             # 유틸리티 및 타입
└── public/          # 정적 파일
```

