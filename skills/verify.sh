#!/usr/bin/env bash
set -euo pipefail

fail=0

echo "== setup"
bash skills/setup.sh || fail=1

echo "== fmt"
bash skills/fmt.sh || true

echo "== lint"
bash skills/lint.sh || true

echo "== typecheck"
bash skills/typecheck.sh || echo "[verify] typecheck warnings (non-blocking)"

echo "== test"
if ! bash skills/test.sh; then
  echo "[verify] test failed"
  fail=1
fi

echo "== build"
if ! bash skills/build.sh; then
  echo "[verify] build failed"
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  echo "[verify] ❌ quality gate failed"
  exit 1
fi

echo "[verify] ✅ passed"
