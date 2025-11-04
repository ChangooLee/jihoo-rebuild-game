#!/usr/bin/env bash

set -euo pipefail

if [ -f pnpm-lock.yaml ]; then
  command -v pnpm >/dev/null 2>&1 || npm i -g pnpm
  pnpm run -if-present lint || true
  pnpm run -if-present typecheck || true
  pnpm run -if-present test || true
  pnpm run -if-present build || true
elif [ -f yarn.lock ]; then
  command -v yarn >/dev/null 2>&1 || npm i -g yarn
  yarn -s run lint || true
  yarn -s run typecheck || true
  yarn -s test || true
  yarn -s build || true
elif [ -f bun.lockb ]; then
  export PATH="$HOME/.bun/bin:$PATH"
  bun run lint || true
  bun run typecheck || true
  bun test || true
  bun run build || true
else
  npm run lint || true
  npm run typecheck || true
  npm test || true
  npm run build || true
fi

echo "[smoke] done."

