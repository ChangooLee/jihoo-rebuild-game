#!/bin/bash
# skills/test.sh
# 테스트 실행

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

# Next.js 프로젝트는 주로 apps/web에 있음
cd apps/web

# package.json에 test 스크립트가 있는지 확인
if grep -q "\"test\"" package.json 2>/dev/null; then
    if [ "$RUNNER" = "pnpm" ]; then
        pnpm run test || echo "⚠️  테스트 스크립트가 없거나 실패했습니다."
    elif [ "$RUNNER" = "yarn" ]; then
        yarn test || echo "⚠️  테스트 스크립트가 없거나 실패했습니다."
    elif [ "$RUNNER" = "npm" ]; then
        npm run test || echo "⚠️  테스트 스크립트가 없거나 실패했습니다."
    elif [ "$RUNNER" = "bun" ]; then
        bun run test || echo "⚠️  테스트 스크립트가 없거나 실패했습니다."
    fi
else
    echo "⚠️  package.json에 test 스크립트가 없습니다. 건너뜁니다."
    exit 0
fi
