# AI Free Text Pro API examples

Working examples for the [AI Free Text Pro API](https://aifreetextpro.com/api): humanize AI-generated text and detect AI writing with one REST call.

- **`POST /v1/humanize`** rewrites text sentence by sentence (every sentence, name, number and citation kept) and checks each version with an AI detector. It returns the lowest-scoring version, the score before and after, and up to four versions to choose from.
- **`POST /v1/detect`** returns an AI score from 0 to 100, a `human` / `mixed` / `ai` verdict and the flagged sentences.

Full documentation: **https://aifreetextpro.com/api/docs**

## Get a key

1. Sign up at the [developer console](https://developer.aifreetextpro.com) (500 free tokens).
2. Create a key under **API keys** and set it as an environment variable:

```bash
export AIFREETEXT_API_KEY=sk_live_your_key_here
```

Keep the key on your server. Never ship it in browser or mobile code.

## Examples

| Folder | What's there |
|---|---|
| [`curl/`](curl) | `humanize.sh`, `detect.sh` |
| [`node/`](node) | `humanize.mjs`, `detect.mjs` (Node 18+, no dependencies) |
| [`python/`](python) | `aifreetext.py`, a small client plus a command-line tool (`pip install requests`) |
| [`typescript/`](typescript) | `client.ts`, a typed client to copy into your project |
| [`postman/`](postman) | A Postman collection: import it and set the `apiKey` variable |

```bash
./curl/detect.sh "Text to check for AI writing"
node node/humanize.mjs "Your AI-generated text"
python python/aifreetext.py humanize "Your AI-generated text"
```

### Humanize

```bash
curl -X POST https://api.aifreetextpro.com/v1/humanize \
  --max-time 150 \
  -H "Authorization: Bearer $AIFREETEXT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Your AI-generated text here...", "style": "professional", "strength": "strong"}'
```

```json
{
  "id": "6f1c2b8e-4d0a-4e57-9a51-2f0f6c3b9d11",
  "humanized_text": "Your humanized text...",
  "unchanged": false,
  "ai_score": { "before": 100, "after": 42.4 },
  "versions": [
    { "version": 1, "ai_score": 100 },
    { "version": 2, "ai_score": 100 },
    { "version": 3, "ai_score": 42.4 },
    { "version": 4, "ai_score": 42.7 }
  ],
  "best_version": 3,
  "word_count": 118,
  "tokens_used": 118,
  "tokens_remaining": 4862,
  "style": "professional",
  "strength": 90,
  "language": "en"
}
```

| Field | Values |
|---|---|
| `text` | Required, up to 5,000 words |
| `style` | `professional` (default), `academic`, `casual`, `creative`, `simple` |
| `strength` | `light`, `balanced`, `strong` (default) or a number from 0 to 100 |
| `language` | `en`, `es`, `fr`, `de`, `nl`, `pt`, `it`; detected from the text when left out |
| `return_versions` | `true` to get the text of every version, not only its score |

A request can take up to about two minutes while versions are rewritten and checked, so set a 150-second timeout.

### Detect

```bash
curl -X POST https://api.aifreetextpro.com/v1/detect \
  -H "Authorization: Bearer $AIFREETEXT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Text to check for AI writing..."}'
```

```json
{
  "id": "8a74396e-525e-4089-8473-dbf299846afe",
  "ai_score": 100,
  "verdict": "ai",
  "flagged_sentences": ["Artificial intelligence has transformed the way businesses operate."],
  "word_count": 34,
  "tokens_used": 7,
  "tokens_remaining": 4980
}
```

`verdict` is `human` below 40, `mixed` from 40 to 69.9 and `ai` from 70.

## Pricing and limits

- **Humanize:** 1 token per word, up to 5,000 words per request.
- **Detect:** 1 token per 5 words, up to 50,000 characters per request.
- **Token packs:** from $9.99 for 15,000 tokens. See [API pricing](https://aifreetextpro.com/api/docs/pricing).
- **Charging:** failed requests are refunded. A humanize request that comes back `unchanged` (every version scored higher than the original) is still charged.
- **Rate limits** are per account and returned with `Retry-After`. See [rate limits](https://aifreetextpro.com/api/docs/rate-limits).

## Errors

Errors come back as `{"error": {"code": "...", "message": "..."}}` with the HTTP status:

| Status | `code` |
|---|---|
| 400 | `invalid_request`, `text_too_long` |
| 401 | `invalid_api_key` |
| 402 | `insufficient_tokens` |
| 413 | `payload_too_large` |
| 429 | `rate_limited` (wait `Retry-After` seconds) |
| 500 / 503 | `server_error`, `service_unavailable` (retry later) |

See [errors](https://aifreetextpro.com/api/docs/errors) for the full list.

## A note on scores

AI-detector scores are estimates. The scores in responses come from the detector the API uses, and other detectors may score the same text differently. No tool can guarantee a result with every detector.

## License

MIT. Questions: support@aifreetextpro.com
