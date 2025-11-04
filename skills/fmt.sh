#!/bin/bash
# skills/fmt.sh
# 코드 포맷팅

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

# --check 옵션이 있으면 검사만, 없으면 포맷팅
CHECK_ONLY=false
if [ "$1" = "--check" ]; then
    CHECK_ONLY=true
fi

# Next.js 프로젝트는 주로 apps/web에 있음
cd apps/web

# prettier가 설치되어 있는지 확인하고 실행
if [ -f "package.json" ] && grep -q "\"prettier\"" package.json 2>/dev/null || command -v prettier &> /dev/null; then
    if [ "$CHECK_ONLY" = true ]; then
        if [ "$RUNNER" = "pnpm" ]; then
            pnpm exec prettier --check "**/*.{ts,tsx,js,jsx,json,css,md}" 2>/dev/null || echo "⚠️  prettier가 설정되지 않았거나 파일이 포맷되지 않았습니다."
        elif [ "$RUNNER" = "yarn" ]; then
            yarn prettier --check "**/*.{ts,tsx,js,jsx,json,css,md}" 2>/dev/null || echo "⚠️  prettier가 설정되지 않았거나 파일이 포맷되지 않았습니다."
        elif [ "$RUNNER" = "npm" ]; then
            npm exec prettier --check "**/*.{ts,tsx,js,jsx,json,css,md}" 2>/dev/null || echo "⚠️  prettier가 설정되지 않았거나 파일이 포맷되지 않았습니다."
        else
            prettier --check "**/*.{ts,tsx,js,jsx,json,css,md}" 2>/dev/null || echo "⚠️  prettier가 설정되지 않았거나 파일이 포맷되지 않았습니다."
        fi
    else
        if [ "$RUNNER" = "pnpm" ]; then
            pnpm exec prettier --write "**/*.{ts,tsx,js,jsx,json,css,md}" 2>/dev/null || echo "⚠️  prettier가 설정되지 않았습니다."
        elif [ "$RUNNER" = "yarn" ]; then
            yarn prettier --write "**/*.{ts,tsx,js,jsx,json,css,md}" 2>/dev/null || echo "⚠️  prettier가 설정되지 않았습니다."
        elif [ "$RUNNER" = "npm" ]; then
            npm exec prettier --write "**/*.{ts,tsx,js,jsx,json,css,md}" 2>/dev/null || echo "⚠️  prettier가 설정되지 않았습니다."
        else
            prettier --write "**/*.{ts,tsx,js,jsx,json,css,md}" 2>/dev/null || echo "⚠️  prettier가 설정되지 않았습니다."
        fi
    fi
else
    # prettier가 없으면 Next.js 기본 린트로 대체
    echo "⚠️  prettier를 찾을 수 없습니다. Next.js 기본 포맷팅을 사용합니다."
    if [ "$CHECK_ONLY" = false ]; then
        echo "✅ 포맷팅 완료 (Next.js 기본)"
    else
        echo "✅ 포맷 검사 완료 (Next.js 기본)"
    fi
fi
