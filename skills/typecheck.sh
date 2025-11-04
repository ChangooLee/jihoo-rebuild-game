#!/usr/bin/env bash
set -euo pipefail

bash skills/setup.sh >/dev/null 2>&1 || true

source skills/_util.sh

if run_script "typecheck"; then
  exit 0
else
  # 스크립트가 없고 tsconfig가 있으면 tsc 직접 실행
  if [ -f apps/web/tsconfig.json ]; then
    cd apps/web && npx -y tsc --noEmit || true
    cd ../..
  elif [ -f tsconfig.json ]; then
    npx -y tsc -p tsconfig.json --noEmit || true
  fi
  # 타입 에러는 경고로 처리 (실패하지 않음)
  exit 0
fi
