// Typed client for the AI Free Text Pro API. Copy this file into your project
// (Node 18+, Deno, Bun or the browser's fetch; keep your key on the server).

export type Style = "professional" | "academic" | "casual" | "creative" | "simple";
export type Strength = "light" | "balanced" | "strong" | number;
export type Language = "en" | "es" | "fr" | "de" | "nl" | "pt" | "it";

export interface HumanizeRequest {
  text: string;
  style?: Style;
  strength?: Strength;
  /** Detected from the text when left out. */
  language?: Language;
  /** Include the text of every version, not just its score. */
  return_versions?: boolean;
}

export interface HumanizeResponse {
  id: string;
  humanized_text: string;
  /** True when every version scored higher than the original, so the original comes back. */
  unchanged: boolean;
  ai_score: { before: number; after: number } | null;
  versions: { version: number; ai_score: number; text?: string }[];
  best_version: number | null;
  word_count: number;
  tokens_used: number;
  tokens_remaining: number;
  style: Style;
  strength: number;
  language: Language;
}

export interface DetectResponse {
  id: string;
  ai_score: number;
  verdict: "human" | "mixed" | "ai";
  flagged_sentences: string[];
  word_count: number;
  tokens_used: number;
  tokens_remaining: number;
}

export class AIFreeTextError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: Record<string, unknown> = {},
    public retryAfterSeconds?: number,
  ) {
    super(`${status} ${code}: ${message}`);
  }
}

export class AIFreeText {
  constructor(private apiKey: string, private baseUrl = "https://api.aifreetextpro.com/v1") {}

  private async post<T>(path: string, body: unknown, timeoutMs: number): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const data = await response.json();
    if (!response.ok) {
      const { code, message, ...details } = data.error ?? {};
      const retry = Number(response.headers.get("retry-after"));
      throw new AIFreeTextError(response.status, code, message, details, Number.isFinite(retry) && retry > 0 ? retry : undefined);
    }
    return data as T;
  }

  /** Rewrite text sentence by sentence, checked with an AI detector. 1 token per word, up to 5,000 words. */
  humanize(request: HumanizeRequest): Promise<HumanizeResponse> {
    return this.post("/humanize", request, 150_000);
  }

  /** AI score, verdict and flagged sentences. 1 token per 5 words, up to 50,000 characters. */
  detect(text: string): Promise<DetectResponse> {
    return this.post("/detect", { text }, 60_000);
  }
}

// Example:
//   const client = new AIFreeText(process.env.AIFREETEXT_API_KEY!);
//   const { humanized_text, ai_score } = await client.humanize({ text, style: "casual" });
