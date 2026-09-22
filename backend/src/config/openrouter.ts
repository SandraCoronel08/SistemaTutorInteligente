import { env } from "./env.js";

export const openrouterConfig = {
  endpoint: "https://openrouter.ai/api/v1/chat/completions",
  apiKey: env.openrouterApiKey,
  model: env.openrouterModel
};
