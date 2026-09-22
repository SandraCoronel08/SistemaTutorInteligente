import { openrouterConfig } from "../config/openrouter.js";
import { env } from "../config/env.js";
import { AppError } from "../middlewares/errorMiddleware.js";

type OpenRouterErrorBody = {
  error?: { code?: unknown; message?: unknown };
};

type OpenRouterResponse = {
  choices?: Array<{ message?: { content?: unknown } }>;
};

type OpenRouterRequestError = Error & {
  status?: number;
  code?: string;
};

const genericGenerationError =
  "No se pudo generar una respuesta. Intenta nuevamente mas tarde.";

const createRequestError = (
  message: string,
  status?: number,
  code?: string
) => Object.assign(new Error(message), { status, code }) as OpenRouterRequestError;

const getErrorDetails = (error: unknown) => {
  const requestError = error as OpenRouterRequestError | undefined;

  return {
    provider: "openrouter",
    model: openrouterConfig.model,
    status: requestError?.status,
    code: requestError?.code,
    message:
      error instanceof Error ? error.message.slice(0, 500) : "Unknown error"
  };
};

export const generateTutorAnswer = async (prompt: string) => {
  try {
    const response = await fetch(openrouterConfig.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openrouterConfig.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: openrouterConfig.model,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const body = (await response.json().catch(() => null)) as OpenRouterResponse &
      OpenRouterErrorBody;

    if (!response.ok) {
      const errorCode = body?.error?.code;
      const errorMessage = body?.error?.message;
      throw createRequestError(
        typeof errorMessage === "string" ? errorMessage : `HTTP ${response.status}`,
        response.status,
        typeof errorCode === "string" || typeof errorCode === "number"
          ? String(errorCode)
          : `HTTP_${response.status}`
      );
    }

    const content = body?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.trim().length === 0) {
      throw createRequestError("OpenRouter returned empty content", response.status, "EMPTY_CONTENT");
    }

    return content.trim();
  } catch (error) {
    if (env.nodeEnv === "development") {
      console.error("OpenRouter request failed", getErrorDetails(error));
    }

    throw new AppError(genericGenerationError, 502);
  }
};
