#!/usr/bin/env bash
set -euo pipefail

bash skills/setup.sh >/dev/null 2>&1 || true

source skills/_util.sh

if run_script "typecheck"; then
  exit 0
else
  # 스크립트가 없고 tsconfig가 있으면 tsc 직접 실행
  if [ -f tsconfig.json ]; then
    npx -y tsc -p tsconfig.json --noEmit
  fi
fi
