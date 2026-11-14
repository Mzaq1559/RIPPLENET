import "server-only";

export interface GroqMessage {
  role: "system" | "user";
  content: string;
}

interface GroqCompletionResponse {
  model?: string;
  choices?: Array<{
    message?: { content?: string | null };
  }>;
}

export interface GroqJsonResult<T> {
  data: T;
  model: string;
}

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b";

export class GroqRequestError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "GroqRequestError";
  }
}

/**
 * Server-side JSON completion. The key is never accepted from request input
 * and is never returned to callers.
 */
export async function groqJson<T>(
  messages: GroqMessage[],
  options: { maxCompletionTokens?: number; timeoutMs?: number } = {},
): Promise<GroqJsonResult<T>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GroqRequestError("AI analysis is not configured on the server.");
  }

  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 25_000,
  );

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.1,
        max_completion_tokens: options.maxCompletionTokens ?? 900,
        response_format: { type: "json_object" },
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error("Groq request failed", { status: response.status });
      throw new GroqRequestError(
        response.status === 429
          ? "AI provider rate limit reached. Try again shortly."
          : "AI provider could not complete the analysis.",
        response.status,
      );
    }

    const payload = (await response.json()) as GroqCompletionResponse;
    const text = payload.choices?.[0]?.message?.content;
    if (!text) {
      throw new GroqRequestError("AI provider returned an empty response.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new GroqRequestError("AI provider returned invalid JSON.");
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new GroqRequestError("AI provider returned an unexpected response.");
    }

    return { data: parsed as T, model: payload.model || model };
  } catch (error) {
    if (error instanceof GroqRequestError) throw error;
    if (controller.signal.aborted) {
      throw new GroqRequestError("AI analysis timed out. Please retry.");
    }
    throw new GroqRequestError("Could not reach the AI provider.");
  } finally {
    clearTimeout(timeout);
  }
}
