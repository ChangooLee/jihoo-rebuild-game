# Content Pipeline Tools

학습 콘텐츠 자동 생성 및 관리 파이프라인

## 구조

```
tools/
├── ingest/              # 외부 소스 수집
├── generators/          # 문항 생성기
│   ├── math/           # 파라메트릭 수학 생성
│   ├── english/        # 영어 문항 생성
│   ├── science/        # 과학 문항 생성
│   └── social/         # 사회 문항 생성
└── builder/            # 정규화, 검증, 내보내기
    ├── validate.mjs    # 스키마 검증
    ├── normalize.mjs   # 정규화
    └── dedupe.mjs      # 중복 제거
```

## 자동화 (GitHub Actions)

### 주간 자동 생성
**매주 일요일 18:00 KST** - 새 문항 자동 생성 및 PR 생성

```yaml
# .github/workflows/content-pipeline.yml
- 매주 50개씩 새 문항 생성
- 자동 검증 후 PR 생성
- 리뷰 후 병합
```

### 수동 실행
GitHub → Actions → "Content Pipeline (Weekly)" → "Run workflow"

## 설치

```bash
# Python 의존성
cd tools
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 사용법

### 1. 수학 문항 생성 (파라메트릭)

```bash
cd tools
source venv/bin/activate

# 기본 생성 (0-50 시드)
python3 generators/math/build_bank.py --seeds 50

# 증분 생성 (100-150 시드)
python3 generators/math/build_bank.py --seeds 50 --offset 100
```

**옵션:**
- `--seeds N`: 문제 유형당 N개 생성
- `--offset N`: 시드 오프셋 (매주 자동 증가)
- `--output PATH`: 출력 디렉토리

**출력:** `apps/web/content/math/*.generated.json`

### 2. 검증

```bash
node builder/validate.mjs
```

- 모든 JSON 파일의 스키마 검증
- 필수 필드, 타입, 범위 확인

## 콘텐츠 증가 전략

### 현재 (수학만)
- 초기: 2,300개
- 주간 증가: +1,150개/주
- **10주 후: 13,800개** 수학 문항

### 향후 (영어/과학/사회 추가 시)
- 영어: Tatoeba CC0 기반
- 과학: OpenStax/Wikidata
- 사회: Wikidata SPARQL + KOGL

## 라이선스 및 출처

- **mathgenerator**: MIT License
- **OpenStax**: CC BY 4.0 (출처 표기 필수)
- **Wikidata**: CC0/CC BY-SA
- **Tatoeba**: CC0 문장 사용

모든 생성 문항은 `source` 필드에 라이선스 정보 포함.

