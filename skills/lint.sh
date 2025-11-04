#!/bin/bash
# skills/lint.sh
# 린트 검사

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

if [ "$RUNNER" = "pnpm" ]; then
    pnpm run lint
elif [ "$RUNNER" = "yarn" ]; then
    yarn lint
elif [ "$RUNNER" = "npm" ]; then
    npm run lint
elif [ "$RUNNER" = "bun" ]; then
    bun run lint
fi
