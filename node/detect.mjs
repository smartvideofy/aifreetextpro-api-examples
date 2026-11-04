// Check text for AI writing with the AI Free Text Pro API (Node 18+, no dependencies).
//   AIFREETEXT_API_KEY=sk_live_... node node/detect.mjs "Text to check"
const API_KEY = process.env.AIFREETEXT_API_KEY;
if (!API_KEY) {
  console.error("Set AIFREETEXT_API_KEY (create a key at https://developer.aifreetextpro.com/keys)");
  process.exit(1);
}

const text = process.argv[2] ??
  "Artificial intelligence has transformed the way businesses operate. It enables companies to automate repetitive tasks and make informed decisions.";

const response = await fetch("https://api.aifreetextpro.com/v1/detect", {
  method: "POST",
  headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ text }),
  signal: AbortSignal.timeout(60_000),
});
const data = await response.json();
if (!response.ok) {
  console.error(`${response.status} ${data.error.code}: ${data.error.message}`);
  process.exit(1);
}

// verdict: "human" (under 40), "mixed" (40 to 69.9) or "ai" (70 and above)
console.log(`AI score: ${data.ai_score} (${data.verdict})`);
for (const sentence of data.flagged_sentences) console.log(`  flagged: ${sentence}`);
console.log(`Tokens used: ${data.tokens_used}, remaining: ${data.tokens_remaining}`);
