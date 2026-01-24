# Configuration Guide

This document covers all configuration options for NextRole, including environment variables, AI providers, caching, rate limiting, and logging.

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# AI Provider Configuration
AI_PROVIDER=gemini                          # or "deepseek" for Deepseek API
GEMINI_API_KEY=your-gemini-key             # Get from https://aistudio.google.com
DEEPSEEK_API_KEY=your-deepseek-key        # Optional, for Deepseek provider
GEMINI_MODEL=gemini-3-flash-preview       # Optional, Gemini model selection

# Infrastructure Configuration
ENABLE_CACHING=true                        # Response caching (1-hour TTL)
ENABLE_RATE_LIMITER=true                   # Rate limiting (5 requests/day per IP)
LOG_LEVEL=error                            # Logging level: debug|info|warn|error

# Optional: Analytics
CLOUDFLARE_WEB_ANALYTICS_TOKEN=your-token

NEXT_PUBLIC_SITE_URL=https://my-next-role.vercel.app
```

## Environment Variables Explained

### AI Provider Configuration

#### `AI_PROVIDER` (required)
- **Type:** `"gemini"` | `"deepseek"`
- **Default:** `"gemini"`
- **Purpose:** Default AI provider for all API routes if not provided by client payload

#### `GEMINI_API_KEY` (required for Gemini)
- **Type:** String
- **Purpose:** Your Google Gemini API key
- **How to get:**
  1. Visit [Google AI Studio](https://aistudio.google.com)
  2. Sign in with Google account
  3. Create new API key
  4. Copy and paste into `.env.local`

#### `DEEPSEEK_API_KEY` (required for Deepseek)
- **Type:** String
- **Purpose:** Your Deepseek API key
- **How to get:**
  1. Visit [Deepseek](https://platform.deepseek.com)
  2. Sign up and navigate to API section
  3. Create API key
  4. Copy and paste into `.env.local`

#### `GEMINI_MODEL` (optional)
- **Type:** String
- **Default:** `"gemini-3-flash-preview"`
- **Purpose:** Specific Gemini model to use
- **Notes:** Used by Resume Interpreter, Career Path Generator, Skill Gap Analyzer, and Roadmap Generator

### Infrastructure Configuration

#### `ENABLE_CACHING` (optional)
- **Type:** Boolean (`true` | `false`)
- **Default:** `true`
- **Purpose:** Enable/disable response caching
- **Details:**
  - **TTL:** 1 hour (responses cached for 60 minutes)
  - **Strategy:** SHA256 hash-based cache keys for consistency
  - **Benefits:** Reduces API calls and costs, improves response time for repeated requests
  - **Use Case:** Enable in production, can disable for development/debugging
  - **Note:** Intelligent cache key generation based on request parameters

#### `ENABLE_RATE_LIMITER` (optional)
- **Type:** Boolean (`true` | `false`)
- **Default:** `true`
- **Purpose:** Enable/disable rate limiting
- **Details:**
  - **Limit:** 5 requests per IP address
  - **Window:** 24-hour sliding window
  - **Localhost:** Rate limiting is skipped for localhost (127.0.0.1, ::1) for development
  - **Rationale:** Prevents abuse while keeping MVP simple

#### `LOG_LEVEL` (optional)
- **Type:** `"debug"` | `"info"` | `"warn"` | `"error"`
- **Default:** `"error"`
- **Purpose:** Control logging verbosity
- **Recommended Settings:**
  - **`"error"`** (production, default): Only errors
  - **`"warn"`** (testing): Warnings and errors
  - **`"info"`** (development): General info, warnings, errors
  - **`"debug"`** (troubleshooting): All logs including detailed API calls, caching behavior, provider routing

### Other Configuration

#### `CLOUDFLARE_WEB_ANALYTICS_TOKEN`
- **Type:** String
- **Purpose:** Cloudflare Web Analytics token for tracking

#### `NEXT_PUBLIC_SITE_URL`
- **Type:** String
- **Default:** `"https://my-next-role.vercel.app"`
- **Purpose:** Production URL for canonical links, Open Graph metadata, and sitemap
- **Notes:**
  - Must be set in production for correct SEO metadata
  - Used by sitemap generation and social sharing previews
  - Prefix `NEXT_PUBLIC_` makes it available to client-side code

### Token Configuration

Control token limits for each AI operation to optimize API costs and handle different complexity levels:

```bash
# Default token limit (fallback for all operations)
MAX_TOKENS_DEFAULT=1500

# Operation-specific token limits
MAX_TOKENS_RESUME=1600               # Resume interpretation
MAX_TOKENS_CAREER_PATH=2000          # Career path generation
MAX_TOKENS_SKILL_GAP=1600            # Skill gap analysis
MAX_TOKENS_ROADMAP=2500              # Career roadmap
```

**What These Control:**
- Resume interpretation: Extraction and structured analysis
- Career path generation: Analysis with multiple options and recommendations
- Skill gap analysis: Assessment of gaps and learning resources
- Roadmap generation: Multi-phase transition plans with timelines and milestones

**Token Tuning Tips:**
- Start with defaults and monitor AI responses for completeness
- If responses are truncated/incomplete: increase relevant MAX_TOKENS variable by 200-300
- Monitor API costs and adjust if needed
- Deepseek charges per token; Gemini's free tier has monthly quota to consider

### Minimal Setup

For local development with **mock data only** (no API calls needed):

```bash
AI_PROVIDER=gemini
LOG_LEVEL=error
```

Then use:
- Query parameter: `?mock=true` on API requests
- Or toggle "Mock Mode" in the application UI

## AI Provider Selection

**Architecture:** See [TECHNICAL_DETAILS.md - AI Architecture](./TECHNICAL_DETAILS.md#ai-architecture) for implementation details

**Provider Precedence:**
1. Per-request override (`aiProvider` field in request body)
2. UI settings (React Context)
3. Server default (`AI_PROVIDER` environment variable)

## Mock Mode Configuration

**Purpose:** Test without API calls using pre-generated data

**Enable:**
- Query parameter: `?mock=true`
- UI toggle: "API Mode" in dashboard settings

**Data Source:** `src/lib/api/mockData.ts` and `src/data/sampleResumesContent/`

**Benefits:** No API keys required, faster iteration, consistent test data

## Troubleshooting Configuration

### "No API Key Found" Error

**Cause:** `GEMINI_API_KEY` or `DEEPSEEK_API_KEY` not set

**Solution:**
1. Verify `.env.local` exists in project root (not in `src/`)
2. Check that API key is set correctly
3. Restart dev server after updating `.env.local`

### Slow Responses

**Possible Causes:**

1. **Caching disabled:**
   ```bash
   ENABLE_CACHING=true  # Enable for faster repeated requests
   ```

2. **Using Deepseek instead of Gemini:**
   ```bash
   AI_PROVIDER=gemini   # Gemini is faster
   ```

3. **Debug logging enabled:**
   ```bash
   LOG_LEVEL=error      # Use error level unless troubleshooting
   ```

4. **Rate limited:**
   - If you've made 5 requests, wait 24 hours
   - Or set `ENABLE_RATE_LIMITER=false` for local testing

### Rate Limit Exceeded

**Error:** `"Rate limit exceeded: 5 requests per 24 hours per IP"`

**Solutions:**

Option 1: Wait 24 hours

Option 2: Disable rate limiting locally
```bash
ENABLE_RATE_LIMITER=false
```

Option 3: Use mock mode
```
?mock=true
```

### Cannot Override AI Provider per Request

**Ensure:** Using correct request body format
```json
{
  "resumeText": "...",
  "aiProvider": "deepseek"
}
```

**Note:** Provider override only works if both keys are configured

### Cache Not Working

**Check:**
1. Caching is enabled: `ENABLE_CACHING=true`
2. Making identical requests
3. Within 1-hour TTL

**Debug:** Set `LOG_LEVEL=debug` and look for `API:Cache` messages

## Performance Optimization Tips

1. **Enable Caching** (default: true)
   - Dramatically improves repeated request performance
   - 1-hour cache TTL ensures fresh data

2. **Use Gemini Provider** (faster than Deepseek)
   ```bash
   AI_PROVIDER=gemini
   ```

3. **Minimize Logging in Production** (default: error)
   ```bash
   LOG_LEVEL=error
   ```

4. **Use Mock Mode During Development**
   - No API latency
   - No rate limiting concerns
   - Faster iteration

5. **Batch Requests Strategically**
   - Consider user workflow
   - Cache will reduce API calls for repeated analysis

## Security Considerations

1. **Never commit `.env.local`** to version control
2. **Keep API keys private** - don't share or log them
3. **Use strong API key values** from official providers
4. **Rotate API keys periodically** for production use
5. **Rate limiting** prevents abuse of your API keys
6. **Disable logging** in production to avoid exposing sensitive data

## Next Steps

- See [GETTING_STARTED.md](GETTING_STARTED.md) for initial setup
- See [TECHNICAL_DETAILS.md](TECHNICAL_DETAILS.md) for architecture
- See [API_SPEC.md](API_SPEC.md) for API endpoints
