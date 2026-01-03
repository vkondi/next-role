/**
 * Deepseek API Integration
 * Handles communication with Deepseek API for AI-powered career analysis
 */

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

interface DeepseekRequest {
  model: string;
  messages: Array<{
    role: "user" | "system" | "assistant";
    content: string;
  }>;
  temperature: number;
  top_p: number;
}

interface DeepseekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Call Deepseek API with a prompt
 */
export async function callDeepseekAPI(prompt: string): Promise<string> {
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
      temperature: 0.1, // Low temperature for structured output
      top_p: 1,
    };

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
