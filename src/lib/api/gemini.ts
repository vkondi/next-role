/** Google Gemini API integration for AI-powered career analysis */

import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

const httpAgent = new HttpAgent({ keepAlive: true, maxSockets: 10 });
const httpsAgent = new HttpsAgent({ keepAlive: true, maxSockets: 10 });

interface GeminiRequest {
  contents: Array<{
    role: string;
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig: {
    temperature: number;
    topP: number;
    maxOutputTokens: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export async function callGeminiAPI(prompt: string, maxTokens: number = 1000): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key not configured. Please set GEMINI_API_KEY environment variable."
    );
  }

  try {
    const payload: GeminiRequest = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.01,
        topP: 0.3,
        maxOutputTokens: maxTokens,
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      // @ts-expect-error - Node.js fetch doesn't have agent type in some versions
      agent: GEMINI_API_URL.startsWith("https") ? httpsAgent : httpAgent,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = (await response.json()) as GeminiResponse;

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid Gemini API response format");
    }

    const textParts = data.candidates[0].content.parts;
    if (!textParts || textParts.length === 0) {
      throw new Error("No text content in Gemini API response");
    }

    return textParts[0].text;
  } catch (error) {
    throw new Error(
      `Failed to call Gemini API: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
