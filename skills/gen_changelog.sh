#!/usr/bin/env bash
set -euo pipefail

mkdir -p docs

f="docs/CHANGELOG.md"

if [ ! -f "$f" ]; then
cat > "$f" <<'EOF'
# Changelog

All notable changes to this project will be documented in this file.

(Keep a Changelog format, dates in YYYY-MM-DD)

EOF
fi

today="$(date +%Y-%m-%d)"

echo -e "\n## [$today]\n- chore: automated maintenance (claude)\n" >> "$f"

echo "[changelog] updated $f"
