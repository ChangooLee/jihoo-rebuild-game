#!/bin/bash
# skills/build.sh
# 빌드 검증

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

# 루트에서 빌드 실행
if [ "$RUNNER" = "pnpm" ]; then
    pnpm run build
elif [ "$RUNNER" = "yarn" ]; then
    yarn build
elif [ "$RUNNER" = "npm" ]; then
    npm run build
elif [ "$RUNNER" = "bun" ]; then
    bun run build
fi
