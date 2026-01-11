/**
 * JSON Recovery Utilities
 * Provides reusable functions for recovering from truncated or malformed JSON responses
 * from AI providers, gracefully handling incomplete API responses.
 */

/**
 * Extract JSON object from text containing markdown, prefixes, etc.
 * Returns the first valid JSON object found, or null.
 * Reusable across all AI response handlers.
 */
export function extractJSONObject(text: string): string | null {
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
 * Extract JSON array from text containing markdown, prefixes, etc.
 * Returns the first valid JSON array found, or null.
 * Reusable across all AI response handlers that expect arrays.
 */
export function extractJSONArray(text: string): string | null {
  // Remove common markdown wrappers
  let cleaned = text
    .replace(/^```[\w]*\n?/gm, "")  // Remove opening ```
    .replace(/\n?```$/gm, "");       // Remove closing ```
  
  // Try to find valid JSON array by iterating from each [ found
  let bracketIndex = cleaned.indexOf("[");
  
  while (bracketIndex !== -1) {
    // Extract from this bracket to the end
    const candidate = cleaned.substring(bracketIndex);
    
    // Find matching closing bracket
    let bracketCount = 0;
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
        if (char === "[") bracketCount++;
        if (char === "]") {
          bracketCount--;
          if (bracketCount === 0) {
            endIndex = i + 1;
            break;
          }
        }
      }
    }
    
    // If we found a complete JSON array, try to parse it
    if (endIndex > 0) {
      const jsonStr = candidate.substring(0, endIndex);
      try {
        JSON.parse(jsonStr);
        return jsonStr; // Return the first valid JSON array found
      } catch (e) {
        // This JSON array is invalid, try the next one
      }
    }
    
    // Look for next [
    bracketIndex = cleaned.indexOf("[", bracketIndex + 1);
  }
  
  return null;
}

/**
 * Clean text by removing markdown code block markers
 * Used as a preprocessing step before JSON extraction
 */
export function removeMarkdownBlocks(text: string): string {
  return text
    .replace(/^```[\w]*[\s\n]*/m, "")   // Remove opening backticks with optional language
    .replace(/[\s\n]*```$/m, "")       // Remove closing backticks with optional whitespace
    .replace(/^`+/m, "")                // Remove any leading backticks
    .replace(/`+$/m, "");              // Remove any trailing backticks
}

/**
 * Extract string value from potentially truncated JSON field
 * Used to safely extract string values that may have been cut off
 * Example: "field": "value with possible" -> extracts "value with possible"
 */
export function extractStringField(jsonPart: string, fieldName: string): string | null {
  const pattern = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)`, 'i');
  const match = pattern.exec(jsonPart);
  
  if (match && match[1]) {
    // Take the value up to the next quote or end
    return match[1].split('"')[0];
  }
  
  return null;
}

/**
 * Extract numeric value from potentially truncated JSON field
 * Example: "years": 5 -> extracts 5
 */
export function extractNumberField(jsonPart: string, fieldName: string): number | null {
  const pattern = new RegExp(`"${fieldName}"\\s*:\\s*(\\d+)`, 'i');
  const match = pattern.exec(jsonPart);
  
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  return null;
}

/**
 * Extract array field from potentially truncated JSON
 * Handles incomplete arrays by extracting until ] or end
 * Example: "skills": ["js", "ts", "py" -> extracts ["js", "ts", "py"]
 */
export function extractArrayField(jsonPart: string, fieldName: string): string[] {
  const pattern = new RegExp(`"${fieldName}"\\s*:\\s*\\[([^\\]]*(?:\\]|$))`, 'i');
  const match = pattern.exec(jsonPart);
  
  if (!match || !match[1]) {
    return [];
  }
  
  const arrayContent = match[1];
  const items = arrayContent
    .split(",")
    .map(item => {
      // Remove quotes and whitespace
      return item.replace(/["\s]/g, "").trim();
    })
    .filter(item => item.length > 0);
  
  return items;
}

/**
 * Repair truncated JSON by adding missing closing braces/brackets
 * Counts open braces/brackets and adds missing closing ones
 */
export function repairTruncatedJSON(jsonString: string): string {
  let repaired = jsonString;
  
  const openBraces = (repaired.match(/{/g) || []).length;
  const closeBraces = (repaired.match(/}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/]/g) || []).length;
  
  // Add missing closing brackets
  repaired += "]".repeat(Math.max(0, openBrackets - closeBrackets));
  // Add missing closing braces
  repaired += "}".repeat(Math.max(0, openBraces - closeBraces));
  
  return repaired;
}

/**
 * Normalize string array values, filtering empty ones
 * Handles mixed types (objects with name property, strings, etc.)
 */
export function normalizeStringArray(value: any): string[] {
  if (!Array.isArray(value)) return [];
  
  return value
    .map(item => {
      if (typeof item === "object" && item !== null) {
        return String(item.name || item.title || item.value || item.label || "");
      }
      return String(item);
    })
    .filter(s => s.trim().length > 0);
}

/**
 * Normalize enum values that AI may provide with different casing or variations
 * Examples: "Very High" -> "High", "very low" -> "Low", "MEDIUM" -> "Medium"
 */
export function normalizeEnumValue(value: unknown, enumValues: string[]): string | null {
  if (typeof value !== "string") return null;
  
  const cleaned = value.trim();
  
  // Direct match
  if (enumValues.includes(cleaned)) return cleaned;
  
  // Case-insensitive match
  const lowerCleaned = cleaned.toLowerCase();
  const match = enumValues.find(ev => ev.toLowerCase() === lowerCleaned);
  if (match) return match;
  
  // Special case: "Very High" -> "High", "Very Low" -> "Low"
  if (cleaned === "Very High") return "High";
  if (cleaned === "Very Low") return "Low";
  
  return null;
}
