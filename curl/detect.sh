#!/usr/bin/env bash
# Check text for AI writing. Usage: AIFREETEXT_API_KEY=sk_live_... ./curl/detect.sh "Your text"
set -euo pipefail
TEXT="${1:-Artificial intelligence has transformed the way businesses operate. It enables companies to automate repetitive tasks and make informed decisions.}"

curl -sS -X POST https://api.aifreetextpro.com/v1/detect \
  --max-time 60 \
  -H "Authorization: Bearer ${AIFREETEXT_API_KEY:?Set AIFREETEXT_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$(printf '{"text": %s}' "$(printf '%s' "$TEXT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')")"
echo
