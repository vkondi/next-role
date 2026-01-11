/** AI Provider selector - routes to Deepseek or Gemini based on configuration */

import { callDeepseekAPI } from "./deepseek";
import { callGeminiAPI } from "./gemini";
import { getLogger } from "./logger";
import type { NextRequest } from "next/server";

const log = getLogger("API:ProviderSelector");

export type AIProvider = "deepseek" | "gemini";

// Server-side: read from environment variable (default fallback is gemini)
const SERVER_AI_PROVIDER = (process.env.AI_PROVIDER || "gemini").toLowerCase() as AIProvider;

// Client-side: provider is managed by SettingsContext and passed via request body
// Server-side API routes use environment variable as fallback

/** Get the server-configured AI provider (for API routes) */
export function getServerAIProvider(): AIProvider {
  return SERVER_AI_PROVIDER;
}

/** Extract AI provider from request body or use server default */
export function getAIProviderFromBody(body: any): AIProvider {
  if (body?.aiProvider && (body.aiProvider === "deepseek" || body.aiProvider === "gemini")) {
    return body.aiProvider;
  }
  return getServerAIProvider();
}

/** Extract AI provider from request body with fallback to server default */
export async function getAIProviderFromRequest(request: NextRequest): Promise<AIProvider> {
  try {
    const body = await request.clone().json();
    return getAIProviderFromBody(body);
  } catch (e) {
    // If body is not JSON or doesn't have aiProvider, fall through to default
  }
  return getServerAIProvider();
}

/** Call the specified AI provider */
export async function callAI(provider: AIProvider, prompt: string, maxTokens: number = 1000): Promise<string> {
  log.debug({ provider, maxTokens }, "Routing AI call to provider");
  
  if (provider === "gemini") {
    return callGeminiAPI(prompt, maxTokens);
  } else if (provider === "deepseek") {
    return callDeepseekAPI(prompt, maxTokens);
  } else {
    const errorMsg = `Unknown AI provider: ${provider}. Use 'deepseek' or 'gemini'.`;
    log.error({ provider }, "Unknown AI provider specified");
    throw new Error(errorMsg);
  }
}
