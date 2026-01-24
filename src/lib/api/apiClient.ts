/**
 * API Client Utility
 * Handles HTTP requests with built-in error handling for rate limits and MVP messaging
 */

const RATE_LIMIT_MESSAGE =
  'This is an MVP with a 5 requests/day limit per location. Try Mock mode to explore features without limits!';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string | FormData;
}

/**
 * Make an API request with built-in error handling
 * Handles 429 rate limit errors with user-friendly MVP messaging
 * @param url - The API endpoint URL
 * @param options - Fetch options
 * @returns Parsed response data
 * @throws Error with appropriate message for various failure scenarios
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body,
    });

    // Always try to parse response as JSON to get error details
    let data: ApiResponse<T> | null = null;
    try {
      data = (await response.json()) as ApiResponse<T>;
    } catch (parseError) {
      console.error('[API] Failed to parse JSON response:', parseError);
      // If JSON parsing fails and response is not ok, throw HTTP error
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to complete request`);
      }
      // If response is ok but not JSON, that's also an error
      throw new Error('Invalid response format from server');
    }

    // Handle rate limit (429) with user-friendly MVP message
    if (response.status === 429) {
      // Use backend message which already contains reset time info
      if (data?.error) {
        throw new Error(data.error);
      }
      // Fallback if backend didn't provide error
      throw new Error(RATE_LIMIT_MESSAGE);
    }

    // Handle other non-OK responses with backend error or fallback
    if (!response.ok) {
      const errorMsg = data?.error || `HTTP ${response.status}: Request failed`;
      console.error('[API] Request failed:', errorMsg);
      throw new Error(errorMsg);
    }

    // Check if API returned success: false (200 but API error)
    if (!data.success) {
      const errorMsg = data?.error || 'API request failed';
      console.error('[API] API returned success: false:', errorMsg);
      throw new Error(errorMsg);
    }

    return data.data as T;
  } catch (error) {
    const finalError =
      error instanceof Error
        ? error
        : new Error(
            typeof error === 'string' ? error : 'Unknown error occurred'
          );
    console.error('[API] Final error thrown:', finalError.message);
    throw finalError;
  }
}

/**
 * Helper to add query parameter for mock mode
 * @param baseUrl - The base URL
 * @param isMock - Whether to use mock mode
 * @returns URL with mock parameter if needed
 */
export function buildApiUrl(baseUrl: string, isMock: boolean): string {
  const url = new URL(
    baseUrl,
    typeof window !== 'undefined' ? window.location.origin : ''
  );
  if (isMock) {
    url.searchParams.set('mock', 'true');
  }
  return url.toString();
}
