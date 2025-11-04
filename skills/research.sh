#!/bin/bash
# skills/research.sh
# 웹 리서치 자동화 (간단한 구조)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# 질의어 확인
if [ -z "$1" ]; then
    echo "❌ 사용법: $0 <검색어>"
    exit 1
fi

QUERY="$1"
DATE=$(date +%Y-%m-%d)
SLUG=$(echo "$QUERY" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
RESEARCH_FILE="docs/research/${DATE}-${SLUG}.md"

# docs/research 디렉토리 생성
mkdir -p docs/research

# 리서치 파일 생성
cat > "$RESEARCH_FILE" << EOF
# 리서치: $QUERY

**날짜**: $DATE  
**검색어**: $QUERY

## 핵심 링크

<!-- 여기에 리서치 결과 링크를 추가하세요 -->

## 요약

<!-- 주요 발견사항을 요약하세요 -->

## 적용 가능성

<!-- 프로젝트에 적용할 수 있는 아이디어를 정리하세요 -->

## 라이선스 주의점

<!-- 3rd-party 코드/에셋 사용 시 라이선스 확인 사항 -->

## 출처

<!-- 참고한 문서/리소스 목록 -->

EOF

echo "✅ 리서치 파일 생성: $RESEARCH_FILE"
echo "📝 파일을 편집하여 리서치 결과를 추가하세요."
