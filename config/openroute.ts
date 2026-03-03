import { OpenRouter } from "@openrouter/sdk";

export const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});
// OpenRouter SDK instance used for AI screen configuration generation
