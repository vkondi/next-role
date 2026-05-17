/**
 * Utility to convert Zod schemas to JSON Schema format for Gemini API
 * Gemini requires JSON Schema for structured outputs
 */

import { z } from 'zod';

type JsonSchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'array'
  | 'object'
  | 'null';

export interface JsonSchemaProperty {
  type?: JsonSchemaType | JsonSchemaType[];
  description?: string;
  enum?: (string | number | boolean)[];
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
  minLength?: number;
  maxLength?: number;
}

/**
 * Convert a Zod schema to JSON Schema format that Gemini API expects
 * This is a simplified converter focused on the schemas used in this project
 */
export function zodToJsonSchema(schema: z.ZodTypeAny): JsonSchemaProperty {
  // Handle ZodObject
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, JsonSchemaProperty> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value as z.ZodTypeAny);

      // Check if field is required (not optional)
      if (!(value instanceof z.ZodOptional)) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }

  // Handle ZodArray
  if (schema instanceof z.ZodArray) {
    const items = zodToJsonSchema(schema.element as unknown as z.ZodTypeAny);
    const result: JsonSchemaProperty = {
      type: 'array',
      items,
    };

    return result;
  }

  // Handle ZodString
  if (schema instanceof z.ZodString) {
    const result: JsonSchemaProperty = { type: 'string' };

    if (schema.minLength !== null) {
      result.minLength = schema.minLength;
    }
    if (schema.maxLength !== null) {
      result.maxLength = schema.maxLength;
    }

    return result;
  }

  // Handle ZodNumber
  if (schema instanceof z.ZodNumber) {
    const result: JsonSchemaProperty = { type: 'number' };

    const { minimum, maximum, format } = schema._zod.bag;

    if (format && ['int32', 'uint32', 'safeint'].includes(format)) {
      result.type = 'integer';
    }
    if (minimum !== undefined) result.minimum = minimum;
    if (maximum !== undefined) result.maximum = maximum;

    return result;
  }

  // Handle ZodBoolean
  if (schema instanceof z.ZodBoolean) {
    return { type: 'boolean' };
  }

  // Handle ZodEnum
  if (schema instanceof z.ZodEnum) {
    return {
      type: 'string',
      enum: Object.values(schema._zod.def.entries) as string[],
    };
  }

  // Handle ZodOptional
  if (schema instanceof z.ZodOptional) {
    const innerSchema = zodToJsonSchema(
      schema.unwrap() as unknown as z.ZodTypeAny
    );
    return innerSchema;
  }

  // Handle ZodNullable
  if (schema instanceof z.ZodNullable) {
    const innerSchema = zodToJsonSchema(
      schema.unwrap() as unknown as z.ZodTypeAny
    );
    // Add null as valid type
    if (innerSchema.type && typeof innerSchema.type === 'string') {
      innerSchema.type = [innerSchema.type, 'null'];
    }
    return innerSchema;
  }

  // Handle ZodLiteral
  if (schema instanceof z.ZodLiteral) {
    const value = schema._def.values[0];
    if (typeof value === 'string') {
      return { type: 'string', enum: [value] };
    } else if (typeof value === 'number') {
      return { type: 'number', enum: [value] };
    } else if (typeof value === 'boolean') {
      return { type: 'boolean', enum: [value] };
    }
  }

  // Handle ZodDefault - extract the inner type
  if (schema instanceof z.ZodDefault) {
    return zodToJsonSchema(schema._def.innerType as unknown as z.ZodTypeAny);
  }

  // Fallback for unknown types
  console.warn(
    `[zodToJsonSchema] Unsupported Zod type: ${schema.constructor.name}`
  );
  return { type: 'string' };
}

/**
 * Add description to JSON schema properties based on Zod descriptions
 * Zod descriptions are extracted from .describe() calls
 */
export function addDescriptionsToSchema(
  zodSchema: z.ZodTypeAny,
  jsonSchema: JsonSchemaProperty
): JsonSchemaProperty {
  // Extract description from Zod schema if available
  const description = zodSchema.description;

  if (description) {
    jsonSchema.description = description;
  }

  // Recursively add descriptions to object properties
  if (zodSchema instanceof z.ZodObject && jsonSchema.properties) {
    const shape = zodSchema.shape;
    for (const [key, value] of Object.entries(shape)) {
      if (jsonSchema.properties[key]) {
        jsonSchema.properties[key] = addDescriptionsToSchema(
          value as z.ZodTypeAny,
          jsonSchema.properties[key]
        );
      }
    }
  }

  // Recursively add descriptions to array items
  if (zodSchema instanceof z.ZodArray && jsonSchema.items) {
    jsonSchema.items = addDescriptionsToSchema(
      zodSchema.element as unknown as z.ZodTypeAny,
      jsonSchema.items
    );
  }

  return jsonSchema;
}

/**
 * Main converter function that handles both conversion and description extraction
 */
export function convertZodToJsonSchema(
  zodSchema: z.ZodTypeAny
): JsonSchemaProperty {
  const jsonSchema = zodToJsonSchema(zodSchema);
  return addDescriptionsToSchema(zodSchema, jsonSchema);
}
