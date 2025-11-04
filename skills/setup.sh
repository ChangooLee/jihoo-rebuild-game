#!/bin/bash
# skills/setup.sh
# 패키지 매니저 자동 감지 및 설치

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# 패키지 매니저 감지
if [ -f "pnpm-lock.yaml" ]; then
    RUNNER="pnpm"
elif [ -f "yarn.lock" ]; then
    RUNNER="yarn"
elif [ -f "package-lock.json" ]; then
    RUNNER="npm"
elif [ -f "bun.lockb" ]; then
    RUNNER="bun"
else
    echo "❌ 패키지 매니저를 감지할 수 없습니다. (pnpm-lock.yaml, yarn.lock, package-lock.json, bun.lockb 중 하나가 필요합니다)"
    exit 1
fi

# 러너가 설치되어 있는지 확인
if ! command -v "$RUNNER" &> /dev/null; then
    echo "⚠️  $RUNNER이(가) 설치되어 있지 않습니다. 설치를 시도합니다..."
    case "$RUNNER" in
        pnpm)
            npm install -g pnpm
            ;;
        yarn)
            npm install -g yarn
            ;;
        bun)
            curl -fsSL https://bun.sh/install | bash
            ;;
    esac
fi

# .runner 파일에 기록
echo "$RUNNER" > .runner
echo "✅ $RUNNER을(를) 사용합니다."

# 의존성 설치
echo "📦 의존성 설치 중..."
if [ "$RUNNER" = "pnpm" ]; then
    pnpm install
elif [ "$RUNNER" = "yarn" ]; then
    yarn install
elif [ "$RUNNER" = "npm" ]; then
    npm install
elif [ "$RUNNER" = "bun" ]; then
    bun install
fi

echo "✅ 설정 완료"
