/** Resume interpreter prompt module */

import { ResumeProfileSchema } from "../schemas";
import type { ResumeProfile } from "../schemas";
import { callDeepseekAPI } from "@/lib/api/deepseek";

export function createResumeInterpreterPrompt(
  resumeText: string
): string {
  return `Extract resume data as JSON: {"name":"string or null","currentRole":"string","yearsOfExperience":number,"techStack":["array"],"strengthAreas":["array"],"industryBackground":"string","certifications":["array"],"education":["array"]}

Resume:
${resumeText}`;
}

/** Parses and validates resume interpretation response */
export async function parseResumeInterpreterResponse(
  responseText: string
): Promise<ResumeProfile> {
  try {
    let cleanedText = responseText.trim();
    
    if (cleanedText.startsWith("```")) {
      const endIdx = cleanedText.lastIndexOf("```");
      if (endIdx > 3) {
        cleanedText = cleanedText.substring(cleanedText.indexOf("\n") + 1, endIdx);
      }
    }
    
    cleanedText = cleanedText.trim();
    if (!cleanedText || cleanedText === "{}") {
      throw new Error("Empty or invalid JSON response");
    }

    const parsed = JSON.parse(cleanedText);
    const validated = ResumeProfileSchema.parse(parsed);
    return validated;
  } catch (error) {
    throw new Error(
      `Failed to parse resume interpreter response: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function interpretResume(resumeText: string): Promise<ResumeProfile> {
  const prompt = createResumeInterpreterPrompt(resumeText);
  const response = await callDeepseekAPI(prompt);
  const profile = await parseResumeInterpreterResponse(response);
  
  return profile;
}
