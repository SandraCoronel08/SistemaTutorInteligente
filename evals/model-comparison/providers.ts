export const providerIds = ["gemini", "groq", "openrouter"] as const;

export type ProviderId = (typeof providerIds)[number];

export type ProviderResponse = {
  response: string;
  httpStatus: number;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
};

type OpenAiUsage = {
  prompt_tokens?: unknown;
  completion_tokens?: unknown;
  total_tokens?: unknown;
};

type OpenAiResponse = {
  choices?: Array<{
    message?: { content?: unknown; reasoning?: unknown; reasoning_details?: unknown };
  }>;
  usage?: OpenAiUsage;
  error?: { code?: unknown; message?: unknown };
};

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }>;
  usageMetadata?: {
    promptTokenCount?: unknown;
    candidatesTokenCount?: unknown;
    totalTokenCount?: unknown;
  };
  error?: { code?: unknown };
};

export class ProviderRequestError extends Error {
  constructor(
    readonly code: string,
    readonly httpStatus: number | null = null,
    providerMessage?: string
  ) {
    super(providerMessage ?? code);
    this.name = "ProviderRequestError";
  }
}

const asTokenCount = (value: unknown) =>
  typeof value === "number" ? value : null;

const textFrom = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((part) =>
        part && typeof part === "object" && "text" in part &&
        typeof (part as { text?: unknown }).text === "string"
          ? (part as { text: string }).text
          : ""
      )
      .join("");
  }

  return "";
};

const getApiKey = (provider: ProviderId) => {
  const keyName =
    provider === "gemini"
      ? "GEMINI_API_KEY"
      : provider === "groq"
        ? "GROQ_API_KEY"
        : "OPENROUTER_API_KEY";
  const apiKey = process.env[keyName];

  if (!apiKey) {
    throw new ProviderRequestError(`MISSING_${keyName}`);
  }

  return apiKey;
};

const requestOpenAiCompatible = async (
  endpoint: string,
  apiKey: string,
  modelId: string,
  prompt: string
): Promise<ProviderResponse> => {
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt }]
      })
    });
  } catch {
    throw new ProviderRequestError("NETWORK_ERROR");
  }

  const body = (await response.json().catch(() => null)) as OpenAiResponse | null;

  if (!response.ok) {
    const providerCode = body?.error?.code;
    const providerMessage = body?.error?.message;
    throw new ProviderRequestError(
      typeof providerCode === "string" || typeof providerCode === "number"
        ? String(providerCode)
        : `HTTP_${response.status}`,
      response.status,
      typeof providerMessage === "string" ? providerMessage : undefined
    );
  }

  const message = body?.choices?.[0]?.message;
  const content = textFrom(message?.content).trim();
  const reasoning = textFrom(message?.reasoning).trim();
  const reasoningDetails = textFrom(message?.reasoning_details).trim();

  if (!content && !reasoning && !reasoningDetails) {
    throw new ProviderRequestError("EMPTY_RESPONSE");
  }

  return {
    response: content || reasoning || reasoningDetails,
    httpStatus: response.status,
    inputTokens: asTokenCount(body?.usage?.prompt_tokens),
    outputTokens: asTokenCount(body?.usage?.completion_tokens),
    totalTokens: asTokenCount(body?.usage?.total_tokens)
  };
};

const requestGemini = async (
  modelId: string,
  prompt: string
): Promise<ProviderResponse> => {
  let response: Response;

  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent?key=${encodeURIComponent(getApiKey("gemini"))}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
      }
    );
  } catch {
    throw new ProviderRequestError("NETWORK_ERROR");
  }

  const body = (await response.json().catch(() => null)) as GeminiResponse | null;

  if (!response.ok) {
    const providerCode = body?.error?.code;
    throw new ProviderRequestError(
      typeof providerCode === "string" || typeof providerCode === "number"
        ? String(providerCode)
        : `HTTP_${response.status}`
    );
  }

  const text = body?.candidates?.[0]?.content?.parts
    ?.map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();

  if (!text) {
    throw new ProviderRequestError("EMPTY_RESPONSE");
  }

  return {
    response: text,
    httpStatus: response.status,
    inputTokens: asTokenCount(body?.usageMetadata?.promptTokenCount),
    outputTokens: asTokenCount(body?.usageMetadata?.candidatesTokenCount),
    totalTokens: asTokenCount(body?.usageMetadata?.totalTokenCount)
  };
};

export const requestModel = async (
  provider: ProviderId,
  modelId: string,
  prompt: string
): Promise<ProviderResponse> => {
  if (provider === "gemini") {
    return requestGemini(modelId, prompt);
  }

  const apiKey = getApiKey(provider);
  return requestOpenAiCompatible(
    provider === "groq"
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://openrouter.ai/api/v1/chat/completions",
    apiKey,
    modelId,
    prompt
  );
};
