import { OpenRouter } from "@openrouter/sdk";

export const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

/** OpenRouter model id, e.g. `openai/gpt-oss-120b:free` — set OPENROUTER_MODEL in .env to override. */
export const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL?.trim() || "openai/gpt-oss-120b:free";
