/** Deepseek API integration for AI-powered career analysis */

import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import { getLogger } from "./logger";

const log = getLogger("API:Deepseek");

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

const httpAgent = new HttpAgent({ keepAlive: true, maxSockets: 10 });
const httpsAgent = new HttpsAgent({ keepAlive: true, maxSockets: 10 });

interface DeepseekRequest {
  model: string;
  messages: Array<{
    role: "user" | "system" | "assistant";
    content: string;
  }>;
  temperature: number;
  top_p: number;
  max_tokens?: number;
}

interface DeepseekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function callDeepseekAPI(prompt: string, maxTokens: number = 1000): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    const errorMsg = "Deepseek API key not configured. Please set DEEPSEEK_API_KEY environment variable.";
    log.error(errorMsg);
    throw new Error(errorMsg);
  }

  log.info({ model: "deepseek-chat", maxTokens }, "Calling Deepseek API");

  try {
    const payload: DeepseekRequest = {
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.01,
      top_p: 0.3,
      max_tokens: maxTokens,
    };

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      // @ts-expect-error - Node.js fetch doesn't have agent type in some versions
      agent: DEEPSEEK_API_URL.startsWith("https") ? httpsAgent : httpAgent,
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMsg = `Deepseek API error: ${response.status} - ${JSON.stringify(errorData)}`;
      log.error({ status: response.status, error: errorData }, "Deepseek API request failed");
      throw new Error(errorMsg);
    }

    const data = (await response.json()) as DeepseekResponse;

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      log.warn("Invalid Deepseek API response format - missing choices or message");
      throw new Error("Invalid Deepseek API response format");
    }

    log.debug({ responseLength: data.choices[0].message.content.length }, "Deepseek API response received successfully");
    return data.choices[0].message.content;
  } catch (error) {
    const errorMsg = `Failed to call Deepseek API: ${error instanceof Error ? error.message : String(error)}`;
    log.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Deepseek API call failed with exception"
    );
    throw new Error(errorMsg);
  }
}
