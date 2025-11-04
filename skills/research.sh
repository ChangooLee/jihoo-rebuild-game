#!/usr/bin/env bash
# 사용법: bash skills/research.sh "react game loop optimize"

set -euo pipefail

q="${1:-}"

if [ -z "$q" ]; then
  echo "query is required"; exit 1
fi

slug="$(echo "$q" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')"
dir="docs/research"
mkdir -p "$dir"

file="$dir/$(date +%Y-%m-%d)-$slug.md"

cat > "$file" <<EOF
# Research: $q

- Date: $(date +'%Y-%m-%d %H:%M %Z')
- Note: 공개 문서/릴리스 노트/모범사례만 참고. 유료·폐쇄 콘텐츠 스크랩 금지.

## Findings (links + 1~2줄 요약)

- …

## Apply to repo (plan)

- …

## Risks / Trade-offs

- …

## License notes

- 출처·라이선스 확인 사항: …

EOF

echo "[research] created $file"
