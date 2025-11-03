# Jihoo Quest

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

**집중력을 높이고 싶은 아이들을 위한 즐거운 학습 게임 플랫폼**

Jihoo Quest는 아이들의 집중력을 향상시키고 학습 효과를 극대화하기 위해 설계된 인터랙티브 게임 모음입니다. 재미있고 도전적인 미니게임들을 통해 자연스럽게 집중력을 기르고 학습 능력을 발전시킬 수 있습니다.

## 📋 목차

- [주요 특징](#-주요-특징)
- [게임 종류](#-게임-종류)
- [시작하기](#-시작하기)
- [프로젝트 구조](#-프로젝트-구조)
- [라이선스](#-라이선스)

## 🎯 주요 특징

- **🎮 집중력 향상 게임**: 다양한 미니게임을 통해 아이들의 집중력을 단계적으로 키워갑니다
- **📊 개인화된 학습 경험**: 각 아이의 수준에 맞춰 자동으로 난이도가 조절되는 적응형 학습 시스템
- **🎯 즐거운 게임 경험**: 영어, 수학, 과학, 사회 등 다양한 주제를 게임으로 재미있게 학습
- **📈 집중력 모니터링**: 실시간 집중도 추적 및 분석으로 학습 효과를 측정

## 🎮 게임 종류

- **워밍업 게임**: Stroop 테스트 등 집중력 준비 운동
- **영어 게임**: 듣기(Listening), 말하기(Speaking) 연습
- **수학 게임**: 빠른 계산 능력 향상
- **과학 게임**: 인과관계 추론 능력 개발
- **사회 게임**: 시나리오 기반 문제 해결 능력 향상

## 🚀 시작하기

### 필요 사항

- Node.js 18.0.0 이상
- pnpm 8.0.0 이상 (또는 npm/yarn)

### 설치

```bash
pnpm install
```

### 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
pnpm build
pnpm start
```

## 📁 프로젝트 구조

```
apps/web/
├── app/              # Next.js App Router
├── components/       # 재사용 컴포넌트
├── modules/          # 핵심 모듈 (집중력 관리, 진단, 스케줄링 등)
├── game/            # 미니게임 구현
├── content/         # 콘텐츠 데이터
├── lib/             # 유틸리티 및 타입
└── public/          # 정적 파일
```

## 🛠️ 기술 스택

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Dexie (IndexedDB)
- **State Management**: React Hooks
- **Spaced Repetition**: FSRS 알고리즘
- **PWA Support**: next-pwa

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

