#!/usr/bin/env bash
set -euo pipefail

runner="${RUNNER_OVERRIDE:-$(cat .runner 2>/dev/null || echo npm)}"

run_script () {
  local name="$1"
  case "$runner" in
    pnpm) pnpm run -if-present "$name" ;;
    yarn) yarn -s run "$name" ;;
    bun)  bun run "$name" ;;
    npm)  npm run "$name" ;;
  esac
}

