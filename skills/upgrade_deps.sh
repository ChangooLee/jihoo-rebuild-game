#!/usr/bin/env bash
set -euo pipefail

bash skills/setup.sh || true

runner="$(cat .runner 2>/dev/null || echo npm)"

# 안전 범위 우선: 패치/마이너 → 메이저는 별도 PR 권장
npx -y npm-check-updates -u || true

case "$runner" in
  pnpm) pnpm i ;;
  yarn) yarn install ;;
  bun)  bun install || true ;;
  npm)  npm i ;;
esac

bash skills/verify.sh
