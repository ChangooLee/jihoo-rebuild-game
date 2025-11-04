#!/usr/bin/env bash

set -euo pipefail

runner="npm"

if [ -f pnpm-lock.yaml ]; then
  runner="pnpm"
  npm i -g pnpm >/dev/null 2>&1 || true
  pnpm i || true
elif [ -f yarn.lock ]; then
  runner="yarn"
  npm i -g yarn >/dev/null 2>&1 || true
  yarn install || true
elif [ -f bun.lockb ]; then
  runner="bun"
  if ! command -v bun >/dev/null 2>&1; then
    curl -fsSL https://bun.sh/install | bash -s -- -y || true
    export PATH="$HOME/.bun/bin:$PATH"
  fi
  bun install || true
else
  npm ci || npm i || true
fi

echo -n "$runner" > .runner

echo "[setup] runner=$runner"
