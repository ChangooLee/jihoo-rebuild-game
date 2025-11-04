#!/usr/bin/env bash
set -euo pipefail

bash skills/setup.sh >/dev/null 2>&1 || true

source skills/_util.sh

run_script "lint" || true
