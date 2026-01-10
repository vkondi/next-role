/** Deepseek API integration for AI-powered career analysis */

import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";

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
    throw new Error(
      "Deepseek API key not configured. Please set DEEPSEEK_API_KEY environment variable."
    );
  }

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
      throw new Error(
        `Deepseek API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = (await response.json()) as DeepseekResponse;

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid Deepseek API response format");
    }

    return data.choices[0].message.content;
  } catch (error) {
    throw new Error(
      `Failed to call Deepseek API: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
