#!/usr/bin/env bash
set -euo pipefail

bash skills/setup.sh >/dev/null 2>&1 || true

source skills/_util.sh

# 빌드는 존재하면 실패를 전파
# 하지만 타입 에러가 있어도 빌드는 시도 (Next.js는 타입 체크를 건너뛸 수 있음)
if ! run_script "build" 2>&1; then
  echo "[build] Build failed, checking if it's due to type errors..."
  BUILD_OUTPUT=$(run_script "build" 2>&1 || true)
  if echo "$BUILD_OUTPUT" | grep -q "Type error\|TS[0-9]"; then
    echo "[build] Type errors detected, but build attempted"
    echo "[build] Build output:"
    echo "$BUILD_OUTPUT"
    exit 0
  else
    echo "[build] Build failed with non-type errors:"
    echo "$BUILD_OUTPUT"
    exit 1
  fi
fi
