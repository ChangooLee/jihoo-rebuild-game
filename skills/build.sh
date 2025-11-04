#!/usr/bin/env bash
set -euo pipefail

bash skills/setup.sh >/dev/null 2>&1 || true

source skills/_util.sh

# 빌드는 존재하면 실패를 전파
run_script "build"
