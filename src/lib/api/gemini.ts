/** Google Gemini API integration for AI-powered career analysis */

import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import { GEMINI_CONFIG } from "@/lib/config/appConfig";
import { getLogger } from "./logger";
import { convertZodToJsonSchema } from "@/lib/utils/zodToJsonSchema";
import type { z } from "zod";

const log = getLogger("API:Gemini");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = GEMINI_CONFIG.MODEL;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const httpAgent = new HttpAgent({ keepAlive: true, maxSockets: 10 });
const httpsAgent = new HttpsAgent({ keepAlive: true, maxSockets: 10 });

interface GeminiRequest {
  systemInstruction?: {
    parts: Array<{
      text: string;
    }>;
  };
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
    responseMimeType?: string;
    responseSchema?: any;
    thinkingConfig: {
      thinkingLevel: string;
    };
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

export async function callGeminiAPI(
  prompt: string,
  maxTokens: number = 1000,
  systemMessage?: string,
  responseSchema?: z.ZodTypeAny
): Promise<string> {
  if (!GEMINI_API_KEY) {
    const errorMsg =
      "Gemini API key not configured. Please set GEMINI_API_KEY environment variable.";
    log.error(errorMsg);
    throw new Error(errorMsg);
  }

  log.debug(
    {
      model: GEMINI_MODEL,
      maxTokens,
      hasSystemMessage: !!systemMessage,
      hasResponseSchema: !!responseSchema,
    },
    "Calling Gemini API"
  );

  try {
    const payload: GeminiRequest = {
      generationConfig: {
        temperature: 0.01,
        topP: 0.3,
        maxOutputTokens: maxTokens,
        thinkingConfig: {
          thinkingLevel: "low",
        },
      },
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
    };

    // Add system instruction if provided
    if (systemMessage) {
      payload.systemInstruction = {
        parts: [
          {
            text: systemMessage,
          },
        ],
      };
    }

    // Add structured output schema if provided (Gemini-specific feature)
    if (responseSchema) {
      const jsonSchema = convertZodToJsonSchema(responseSchema);
      payload.generationConfig.responseMimeType = "application/json";
      payload.generationConfig.responseSchema = jsonSchema;
      
      log.debug(
        { schemaType: responseSchema.constructor.name },
        "Using structured JSON schema for Gemini response"
      );
    }

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
      const errorMsg = `Gemini API error: ${response.status} - ${JSON.stringify(
        errorData
      )}`;
      log.error(
        { status: response.status, error: errorData },
        "Gemini API request failed"
      );
      throw new Error(errorMsg);
    }

    const data = (await response.json()) as GeminiResponse;

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      log.warn(
        "Invalid Gemini API response format - missing candidates or content"
      );
      throw new Error("Invalid Gemini API response format");
    }

    const textParts = data.candidates[0].content.parts;
    if (!textParts || textParts.length === 0) {
      log.warn("Invalid Gemini API response format - no text parts");
      throw new Error("No text content in Gemini API response");
    }

    log.debug(
      { responseLength: textParts[0].text.length },
      "Gemini API response received successfully"
    );
    return textParts[0].text;
  } catch (error) {
    const errorMsg = `Failed to call Gemini API: ${
      error instanceof Error ? error.message : String(error)
    }`;
    log.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Gemini API call failed with exception"
    );
    throw new Error(errorMsg);
  }
}
