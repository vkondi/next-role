/** Resume interpreter prompt module */

import { ResumeProfileSchema } from "../schemas";
import type { ResumeProfile } from "../schemas";
import { callAI } from "@/lib/api/aiProvider";
import type { AIProvider } from "@/lib/api/aiProvider";

export function createResumeInterpreterPrompt(
  resumeText: string
): string {
  return `You are a resume analyzer. Extract information from the resume and return ONLY a valid JSON object.

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON object - no markdown, no code blocks, no extra text before or after
2. Return ALL fields below - do not omit any field
3. Use proper JSON format with double quotes for all strings and keys
4. For lists, return array format: ["item1", "item2", "item3"]
5. Return complete data - do not truncate or abbreviate any values
6. For years of experience, return as integer number

REQUIRED FIELDS (all mandatory):
- name: string (full name)
- currentRole: string (current job title)
- yearsOfExperience: number (integer, total years)
- techStack: array of strings (technologies and tools used)
- strengthAreas: array of strings (key strengths and competencies)
- industryBackground: string (industry/domain background)
- certifications: array of strings (or empty array if none)
- education: array of strings (or empty array if none)

EXAMPLE RESPONSE (must be valid JSON):
{"name":"John Doe","currentRole":"Senior Engineer","yearsOfExperience":8,"techStack":["Python","JavaScript","AWS"],"strengthAreas":["Leadership","Architecture"],"industryBackground":"Technology","certifications":[],"education":["BS Computer Science"]}

Resume to analyze:
${resumeText}

RESPOND WITH ONLY THE JSON OBJECT. NO OTHER TEXT.`;
}

/** Parses and validates resume interpretation response */
export async function parseResumeInterpreterResponse(
  responseText: string,
  aiProvider?: string
): Promise<ResumeProfile> {
  try {
    // Step 1: Find and extract JSON object from response
    let jsonObject = extractJSONObject(responseText);
    
    // Step 2: If extraction fails, try to recover from truncated/malformed response
    if (!jsonObject) {
      jsonObject = tryRecoverJSON(responseText);
    }
    
    if (!jsonObject) {
      throw new Error(
        `No valid JSON found in response. Response length: ${responseText.length} chars`
      );
    }
    
    const parsed = JSON.parse(jsonObject);
    
    // Step 3: Normalize and validate all fields
    const normalized: Record<string, any> = {
      name: parsed.name ?? null,
      currentRole: String(parsed.currentRole ?? "").trim() || "Professional",
      yearsOfExperience: Math.max(0, Number(parsed.yearsOfExperience ?? 0)),
      techStack: normalizeArray(parsed.techStack),
      strengthAreas: normalizeArray(parsed.strengthAreas),
      industryBackground: String(parsed.industryBackground ?? "").trim() || "Industry",
    };
    
    // Ensure required arrays are not empty
    if (!normalized.techStack.length) normalized.techStack = ["Not specified"];
    if (!normalized.strengthAreas.length) normalized.strengthAreas = ["Not specified"];
    
    // Step 4: Handle optional fields
    if (Array.isArray(parsed.certifications)) {
      const filtered = normalizeArray(parsed.certifications);
      if (filtered.length > 0) normalized.certifications = filtered;
    }
    
    if (Array.isArray(parsed.education)) {
      const filtered = normalizeArray(parsed.education);
      if (filtered.length > 0) normalized.education = filtered;
    }
    
    // Step 5: Validate against schema
    const validated = ResumeProfileSchema.parse(normalized);
    return validated;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(
      `[Resume Parser] Failed to parse response from ${aiProvider || "unknown"} provider:`,
      errorMsg
    );
    throw new Error(
      `Failed to parse resume interpreter response: ${errorMsg}`
    );
  }
}

/**
 * Try to recover JSON from malformed/truncated response
 * Extracts complete fields from partially corrupted JSON
 */
function tryRecoverJSON(text: string): string | null {
  // Try removing all markdown first
  let cleaned = text
    .replace(/^```[\s\S]*?\n/gm, "")
    .replace(/\n?```[\s\S]*?$/gm, "")
    .replace(/^`+|`+$/gm, "")
    .trim();
  
  // Find the start of JSON
  const jsonStart = cleaned.indexOf("{");
  if (jsonStart === -1) {
    return null;
  }
  
  const jsonPart = cleaned.substring(jsonStart);
  const extracted: Record<string, any> = {};
  
  // Extract name (must be complete string)
  let nameMatch = /"name"\s*:\s*"([^"]+)"/.exec(jsonPart);
  if (nameMatch) extracted.name = nameMatch[1];
  
  // Extract currentRole (must be complete string)
  let roleMatch = /"currentRole"\s*:\s*"([^"]*)/.exec(jsonPart);
  if (roleMatch) extracted.currentRole = roleMatch[1].split('"')[0]; // Take until next quote or end
  
  // Extract yearsOfExperience (number)
  let yearsMatch = /"yearsOfExperience"\s*:\s*(\d+)/.exec(jsonPart);
  if (yearsMatch) extracted.yearsOfExperience = parseInt(yearsMatch[1], 10);
  
  // Extract techStack (array - may be incomplete)
  let techMatch = /"techStack"\s*:\s*\[(.*?)(?:\]|$)/.exec(jsonPart);
  if (techMatch) {
    const arrayContent = techMatch[1];
    // Split by comma and clean up quotes
    const items = arrayContent
      .split(",")
      .map(item => {
        // Remove quotes and whitespace
        return item.replace(/["\s]/g, "").trim();
      })
      .filter(item => item.length > 0);
    if (items.length > 0) extracted.techStack = items;
  }
  
  // Extract strengthAreas (array - may be incomplete)
  let strengthMatch = /"strengthAreas"\s*:\s*\[(.*?)(?:\]|$)/.exec(jsonPart);
  if (strengthMatch) {
    const arrayContent = strengthMatch[1];
    const items = arrayContent
      .split(",")
      .map(item => item.replace(/["\s]/g, "").trim())
      .filter(item => item.length > 0);
    if (items.length > 0) extracted.strengthAreas = items;
  }
  
  // Extract industryBackground
  let industryMatch = /"industryBackground"\s*:\s*"([^"]*)/.exec(jsonPart);
  if (industryMatch) extracted.industryBackground = industryMatch[1].split('"')[0];
  
  // Extract certifications (array - may be incomplete)
  let certMatch = /"certifications"\s*:\s*\[(.*?)(?:\]|$)/.exec(jsonPart);
  if (certMatch) {
    const arrayContent = certMatch[1];
    const items = arrayContent
      .split(",")
      .map(item => item.replace(/["\s]/g, "").trim())
      .filter(item => item.length > 0);
    if (items.length > 0) extracted.certifications = items;
  }
  
  // Extract education (array - may be incomplete)
  let eduMatch = /"education"\s*:\s*\[(.*?)(?:\]|$)/.exec(jsonPart);
  if (eduMatch) {
    const arrayContent = eduMatch[1];
    const items = arrayContent
      .split(",")
      .map(item => item.replace(/["\s]/g, "").trim())
      .filter(item => item.length > 0);
    if (items.length > 0) extracted.education = items;
  }
  
  if (Object.keys(extracted).length > 0) {
    // Build a valid JSON object from extracted fields
    return JSON.stringify(extracted);
  }
  
  return null;
}

/**
 * Robustly extracts JSON object from text with markdown, prefixes, etc.
 * Returns the first valid JSON object found, or null
 */
function extractJSONObject(text: string): string | null {
  // Remove common markdown wrappers
  let cleaned = text
    .replace(/^```[\w]*\n?/gm, "")  // Remove opening ```
    .replace(/\n?```$/gm, "");       // Remove closing ```
  
  // Try to find valid JSON by iterating from each { found
  let braceIndex = cleaned.indexOf("{");
  
  while (braceIndex !== -1) {
    // Extract from this brace to the end
    const candidate = cleaned.substring(braceIndex);
    
    // Find matching closing brace
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    let endIndex = -1;
    
    for (let i = 0; i < candidate.length; i++) {
      const char = candidate[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === "\\") {
        escapeNext = true;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === "{") braceCount++;
        if (char === "}") {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i + 1;
            break;
          }
        }
      }
    }
    
    // If we found a complete JSON object, try to parse it
    if (endIndex > 0) {
      const jsonStr = candidate.substring(0, endIndex);
      try {
        JSON.parse(jsonStr);
        return jsonStr; // Return the first valid JSON found
      } catch (e) {
        // This JSON object is invalid, try the next one
      }
    }
    
    // Look for next {
    braceIndex = cleaned.indexOf("{", braceIndex + 1);
  }
  
  return null;
}


/**
 * Normalize array field to array of strings
 */
function normalizeArray(value: any): string[] {
  if (!Array.isArray(value)) return [];
  
  return value
    .map(item => {
      // Handle objects with specific properties
      if (typeof item === "object" && item !== null) {
        return String(item.name || item.title || item.value || item.label || "");
      }
      return String(item);
    })
    .filter(s => s.trim().length > 0);
}

export async function interpretResume(resumeText: string, aiProvider: AIProvider = "deepseek"): Promise<ResumeProfile> {
  const prompt = createResumeInterpreterPrompt(resumeText);
  const response = await callAI(aiProvider, prompt);
  const profile = await parseResumeInterpreterResponse(response, aiProvider);
  
  return profile;
}
