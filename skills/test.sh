#!/usr/bin/env bash
set -euo pipefail

bash skills/setup.sh >/dev/null 2>&1 || true

source skills/_util.sh

# 테스트는 존재하면 실패를 전파(품질 게이트)
run_script "test"
