"""Minimal client for the AI Free Text Pro API (Python 3.8+, `pip install requests`).

    export AIFREETEXT_API_KEY=sk_live_...
    python python/aifreetext.py humanize "Your AI-generated text"
    python python/aifreetext.py detect "Text to check"
"""
import os
import sys

import requests

BASE_URL = "https://api.aifreetextpro.com/v1"


class AIFreeTextError(Exception):
    def __init__(self, status, code, message, retry_after=None):
        super().__init__(f"{status} {code}: {message}")
        self.status = status
        self.code = code
        self.retry_after = retry_after


class AIFreeText:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.environ.get("AIFREETEXT_API_KEY")
        if not self.api_key:
            raise ValueError("Set AIFREETEXT_API_KEY (create a key at https://developer.aifreetextpro.com/keys)")

    def _post(self, path, payload, timeout):
        response = requests.post(
            f"{BASE_URL}{path}",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json=payload,
            timeout=timeout,
        )
        data = response.json()
        if not response.ok:
            error = data.get("error", {})
            raise AIFreeTextError(response.status_code, error.get("code"), error.get("message"),
                                  response.headers.get("Retry-After"))
        return data

    def humanize(self, text, style="professional", strength="strong", language=None, return_versions=False):
        """Rewrite text sentence by sentence, checked with an AI detector. 1 token per word.

        style: professional, academic, casual, creative or simple
        strength: "light", "balanced", "strong" or a number from 0 to 100
        """
        payload = {"text": text, "style": style, "strength": strength, "return_versions": return_versions}
        if language:
            payload["language"] = language
        # Rewriting and detector checks can take up to about two minutes.
        return self._post("/humanize", payload, timeout=150)

    def detect(self, text):
        """AI score from 0 to 100, a human/mixed/ai verdict and the flagged sentences. 1 token per 5 words."""
        return self._post("/detect", {"text": text}, timeout=60)


if __name__ == "__main__":
    if len(sys.argv) < 3 or sys.argv[1] not in ("humanize", "detect"):
        print(__doc__)
        sys.exit(1)
    client = AIFreeText()
    command, text = sys.argv[1], sys.argv[2]
    try:
        if command == "humanize":
            result = client.humanize(text)
            print(result["humanized_text"], end="\n\n")
            score = result.get("ai_score") or {}
            print(f"AI score: {score.get('before')} -> {score.get('after')}"
                  + (" (unchanged: original returned)" if result["unchanged"] else ""))
        else:
            result = client.detect(text)
            print(f"AI score: {result['ai_score']} ({result['verdict']})")
            for sentence in result["flagged_sentences"]:
                print(f"  flagged: {sentence}")
        print(f"Tokens used: {result['tokens_used']}, remaining: {result['tokens_remaining']}")
    except AIFreeTextError as error:
        print(error, file=sys.stderr)
        sys.exit(1)
