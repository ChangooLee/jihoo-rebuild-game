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

## 설치

```bash
# Python 의존성
pip install -r requirements.txt

# Node.js 의존성 (프로젝트 루트에서)
cd ../../apps/web && npm install
```

## 사용법

### 1. 수학 문항 생성 (파라메트릭)

```bash
cd tools/generators/math
python3 build_bank.py --seeds 50
```

- 초5-6, 중1 수학 문항 생성
- `--seeds N`: 문제 유형당 N개 생성
- 출력: `apps/web/content/math/*.generated.json`

### 2. 검증

```bash
cd tools/builder
node validate.mjs
```

- 모든 JSON 파일의 스키마 검증
- 필수 필드, 타입, 범위 확인

## 라이선스 및 출처

- **mathgenerator**: MIT License
- **OpenStax**: CC BY 4.0 (출처 표기 필수)
- **Wikidata**: CC0/CC BY-SA
- **Tatoeba**: CC0 문장 사용

모든 생성 문항은 `source` 필드에 라이선스 정보 포함.

