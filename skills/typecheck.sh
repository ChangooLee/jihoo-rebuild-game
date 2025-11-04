#!/bin/bash
# skills/typecheck.sh
# TypeScript 타입 검사

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

# TypeScript 컴파일러로 타입 체크
if [ "$RUNNER" = "pnpm" ]; then
    pnpm exec tsc --noEmit
elif [ "$RUNNER" = "yarn" ]; then
    yarn tsc --noEmit
elif [ "$RUNNER" = "npm" ]; then
    npm exec tsc --noEmit
elif [ "$RUNNER" = "bun" ]; then
    bun run tsc --noEmit
else
    tsc --noEmit
fi
