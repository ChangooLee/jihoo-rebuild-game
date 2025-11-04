#!/bin/bash
# skills/gen_changelog.sh
# 변경 로그 생성

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

CHANGELOG_FILE="docs/CHANGELOG.md"
DATE=$(date +%Y-%m-%d)

# docs 디렉토리 생성
mkdir -p docs

# CHANGELOG.md가 없으면 생성
if [ ! -f "$CHANGELOG_FILE" ]; then
    cat > "$CHANGELOG_FILE" << EOF
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial changelog

EOF
fi

# git log에서 최근 변경사항 가져오기 (직전 커밋)
if git rev-parse --git-dir > /dev/null 2>&1; then
    LAST_COMMIT=$(git log -1 --pretty=format:"%s")
    echo ""
    echo "📝 최근 커밋: $LAST_COMMIT"
    echo ""
    echo "CHANGELOG.md에 변경사항을 수동으로 추가하세요:"
    echo "  파일: $CHANGELOG_FILE"
    echo ""
    echo "예시 형식:"
    echo "  ## [$DATE]"
    echo "  ### Added"
    echo "  - 새 기능"
    echo "  ### Changed"
    echo "  - 변경 사항"
    echo "  ### Fixed"
    echo "  - 버그 수정"
else
    echo "⚠️  git 저장소가 아닙니다."
fi
