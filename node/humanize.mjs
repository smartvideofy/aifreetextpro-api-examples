// Humanize text with the AI Free Text Pro API (Node 18+, no dependencies).
//   AIFREETEXT_API_KEY=sk_live_... node node/humanize.mjs "Your AI-generated text"
const API_KEY = process.env.AIFREETEXT_API_KEY;
if (!API_KEY) {
  console.error("Set AIFREETEXT_API_KEY (create a key at https://developer.aifreetextpro.com/keys)");
  process.exit(1);
}

const text = process.argv[2] ??
  "Artificial intelligence has transformed the way businesses operate. It enables companies to automate repetitive tasks and make informed decisions.";

async function humanize(text, { style = "professional", strength = "strong", returnVersions = false } = {}) {
  const response = await fetch("https://api.aifreetextpro.com/v1/humanize", {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text, style, strength, return_versions: returnVersions }),
    // Rewriting and detector checks can take up to about two minutes.
    signal: AbortSignal.timeout(150_000),
  });
  const data = await response.json();
  if (!response.ok) {
    const retry = response.headers.get("retry-after");
    throw new Error(`${response.status} ${data.error.code}: ${data.error.message}${retry ? ` (retry after ${retry}s)` : ""}`);
  }
  return data;
}

let result;
try {
  result = await humanize(text);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
console.log(result.humanized_text);
console.log();
console.log(`AI score: ${result.ai_score?.before ?? "?"} -> ${result.ai_score?.after ?? "?"}` +
  `${result.unchanged ? " (unchanged: every version scored higher, original returned)" : ""}`);
console.log(`Versions: ${result.versions.map((v) => `V${v.version} ${v.ai_score}`).join(", ") || "none"}; best: V${result.best_version ?? "-"}`);
console.log(`Tokens used: ${result.tokens_used}, remaining: ${result.tokens_remaining}`);
