#!/usr/bin/env bash
# Humanize text. Usage: AIFREETEXT_API_KEY=sk_live_... ./curl/humanize.sh "Your text"
set -euo pipefail
TEXT="${1:-Artificial intelligence has transformed the way businesses operate. It enables companies to automate repetitive tasks and make informed decisions.}"

curl -sS -X POST https://api.aifreetextpro.com/v1/humanize \
  --max-time 150 \
  -H "Authorization: Bearer ${AIFREETEXT_API_KEY:?Set AIFREETEXT_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$(printf '{"text": %s, "style": "professional", "strength": "strong"}' "$(printf '%s' "$TEXT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')")"
echo
