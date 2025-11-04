#!/bin/bash
# skills/upgrade_deps.sh
# 안전 범위 내 의존성 업데이트

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# .runner 파일에서 러너 읽기
if [ ! -f ".runner" ]; then
    RUNNER="pnpm"  # 기본값
else
    RUNNER=$(cat .runner)
fi

echo "📦 의존성 업데이트 중..."

# npm-check-updates 사용 (주요 버전 업은 별도 브랜치에서 처리)
if command -v npx &> /dev/null; then
    echo "🔍 사용 가능한 업데이트 확인 중..."
    npx npm-check-updates -u
    
    # 의존성 재설치
    cd apps/web
    if [ "$RUNNER" = "pnpm" ]; then
        pnpm install
    elif [ "$RUNNER" = "yarn" ]; then
        yarn install
    elif [ "$RUNNER" = "npm" ]; then
        npm install
    elif [ "$RUNNER" = "bun" ]; then
        bun install
    fi
    
    echo "✅ 의존성 업데이트 완료"
    echo "⚠️  주요 버전 업데이트는 별도 브랜치에서 처리하세요."
else
    echo "❌ npx를 찾을 수 없습니다."
    exit 1
fi
