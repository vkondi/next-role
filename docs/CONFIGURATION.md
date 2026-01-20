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
```

## Environment Variables Explained

### AI Provider Configuration

#### `AI_PROVIDER` (required)
- **Type:** `"gemini"` | `"deepseek"`
- **Default:** `"gemini"`
- **Purpose:** Default AI provider for all API routes
- **Notes:**
  - Gemini is recommended for MVP (faster, better results)
  - Can be overridden per-request via `aiProvider` field in request body
  - Can be overridden in UI settings context
  - Deepseek is a cost-effective alternative

#### `GEMINI_API_KEY` (required for Gemini)
- **Type:** String
- **Purpose:** Your Google Gemini API key
- **How to get:**
  1. Visit [Google AI Studio](https://aistudio.google.com)
  2. Sign in with Google account
  3. Create new API key
  4. Copy and paste into `.env.local`

#### `DEEPSEEK_API_KEY` (optional)
- **Type:** String
- **Purpose:** Your Deepseek API key (optional, for alternative provider)
- **How to get:**
  1. Visit [Deepseek](https://deepseek.com)
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
  - **Configurable:** Can be disabled completely via environment variable
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
- **Use Cases:**
  - Use `"debug"` when troubleshooting API issues
  - Use `"error"` in development unless you need detailed logs
  - Keep at `"error"` in production

### Optional Configuration

#### `CLOUDFLARE_WEB_ANALYTICS_TOKEN` (optional)
- **Type:** String
- **Purpose:** Cloudflare Web Analytics token for tracking
- **Notes:** Optional for MVP

### Token Configuration

Control token limits for each AI operation to optimize API costs and handle different complexity levels:

```bash
# Default token limit (fallback for all operations)
MAX_TOKENS_DEFAULT=1000

# Operation-specific token limits
MAX_TOKENS_RESUME=1200              # Resume interpretation
MAX_TOKENS_CAREER_PATH=1500         # Career path generation
MAX_TOKENS_SKILL_GAP=1100           # Skill gap analysis
MAX_TOKENS_ROADMAP=1800             # Career roadmap (increased for complexity)
```

**Why Different Limits?**
- Resume interpretation: Simple extraction → 1000 tokens usually sufficient
- Career path generation: Requires analysis → 1000-1500 tokens recommended
- Skill gap analysis: Moderate complexity → 1000-1500 tokens recommended
- Roadmap generation: High complexity (2-5 phases with details) → 1800+ tokens recommended

**Token Tuning Tips:**
- Start with defaults and monitor AI responses
- If responses are truncated/incomplete: increase relevant MAX_TOKENS variable by 200-300
- Monitor API costs and adjust down if responses are verbose
- Deepseek providers benefit from higher limits (they charge per token)
- Gemini's free tier has monthly token quota to consider

### Minimal Setup

For local development with **mock data only** (no API calls needed):

```bash
AI_PROVIDER=gemini
LOG_LEVEL=error
```

Then use:
- Query parameter: `?mock=true` on API requests
- Or toggle "Mock Mode" in the application UI

## AI Provider Configuration

### Provider Selection Logic

The system uses a three-tier precedence for AI provider selection:

1. **Per-Request Override** (highest priority)
   - Set via `aiProvider` field in API request body
   - Allows different API calls to use different providers
   - Example: `{ "resumeText": "...", "aiProvider": "deepseek" }`

2. **UI Settings** (second priority)
   - User can select provider in application settings
   - Stored in React Context (localStorage in future)
   - Persists across page navigations

3. **Server Default** (lowest priority)
   - Read from `AI_PROVIDER` environment variable
   - Defaults to `"gemini"` if not set
   - Used when no other selection is made

### Gemini Configuration

**Provider:** Google Gemini 3.0 Flash

**Advantages:**
- Fastest response times
- Better results for career analysis
- Free tier available
- Recommended for MVP

**Setup:**
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your-key-here
GEMINI_MODEL=gemini-3-flash-preview
```

**Used by:**
- Resume Interpreter
- Career Path Generator
- Skill Gap Analyzer
- Roadmap Generator

### Deepseek Configuration

**Provider:** Deepseek API

**Advantages:**
- Cost-effective alternative
- Reliable for career analysis
- Easy provider switching

**Setup:**
```bash
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your-key-here
```

**Fallback:** If Deepseek fails, system can fall back to configured default provider

## Caching Configuration

### How Response Caching Works

**Overview:**
- Responses are cached in-memory for 1 hour
- Dramatically reduces API calls and costs
- Improves response time for repeated requests

**Cache Key Generation:**
- SHA256 hash-based keys for consistency
- Generated from request parameters
- Unique per unique request

**Configuration:**
```bash
ENABLE_CACHING=true    # Enable caching
# or
ENABLE_CACHING=false   # Disable for development/debugging
```

**TTL (Time to Live):**
- Default: 1 hour (3600 seconds)
- Responses older than 1 hour are discarded
- Next request will call API and cache new response

**Use Cases:**
- **Production:** Always enable (`true`)
- **Development:** Can disable (`false`) if you frequently need fresh data
- **Testing:** Can disable if testing with different API providers

**Implementation:**
- File: `src/lib/api/cache.ts`
- Type: In-memory caching
- Resets on server restart (development)
- Improves performance without persistence layer

## Rate Limiting Configuration

### How Rate Limiting Works

**Overview:**
- Prevents abuse of API
- Default: 5 requests per IP address per 24 hours
- 24-hour sliding window (most recent 24 hours)

**Request Limit:**
```
5 requests / 24 hours / IP address
```

**Sliding Window:**
- New requests reset the 24-hour window
- Example: If you make 5 requests at 2:00 PM today, you can make more at 2:01 PM tomorrow

**Development Exemption:**
- Localhost IPs (127.0.0.1, ::1) are exempt from rate limiting
- Allows unlimited requests during local development
- Only applies when using localhost

**Configuration:**
```bash
ENABLE_RATE_LIMITER=true     # Enable rate limiting
# or
ENABLE_RATE_LIMITER=false    # Disable (only for testing)
```

**Implementation:**
- File: `src/lib/api/rateLimiter.ts`
- Strategy: IP-based tracking
- Configurable: Can be disabled completely

**Error Response:**
When rate limited, API returns:
```json
{
  "success": false,
  "error": "Rate limit exceeded: 5 requests per 24 hours per IP"
}
```

**Troubleshooting:**
- Wait 24 hours before making more requests
- Or disable for local testing: `ENABLE_RATE_LIMITER=false`
- Or use mock mode: `?mock=true`

## Logging Configuration

### Logging System

**Logger:** Pino 10.1 with Pino Pretty formatter

**Overview:**
- Structured logging for production
- Pretty-printed output in development
- Module-based logger instances for tracking

### Log Levels

#### `debug`
- **Output:** Detailed logs including:
  - AI API calls and responses
  - Cache hits/misses
  - Provider routing decisions
  - Request parameters
  - Full error traces
- **Use:** Troubleshooting and debugging
- **Example Output:**
```
API:ResumeInterpret: Resume interpretation request received
API:Gemini: Calling Gemini API with parameters: {...}
API:Cache: Cache miss, generating new response
API:ProviderSelector: Routing AI call to provider: gemini
```

#### `info`
- **Output:** General information:
  - API route invocations
  - Successful operations
  - Cache behavior (hits/misses)
  - Provider selection
- **Use:** Development and monitoring
- **Example:** `API:ResumeInterpret: Resume processed successfully`

#### `warn`
- **Output:** Warning messages:
  - Degraded performance
  - API provider fallback
  - Configuration issues
- **Use:** Testing and development
- **Example:** `API:Gemini: Provider failed, falling back to deepseek`

#### `error`
- **Output:** Only errors:
  - Failed API calls
  - Validation errors
  - Server errors
- **Use:** Production (recommended)
- **Example:** `API:ResumeInterpret: Failed to interpret resume: Invalid JSON`

### Configuration

```bash
LOG_LEVEL=error    # Production (default)
LOG_LEVEL=warn     # Testing
LOG_LEVEL=info     # Development
LOG_LEVEL=debug    # Troubleshooting
```

### Logger Instances

Available loggers for tracking in logs:

```
API:ResumeInterpret      - Resume interpretation endpoint
API:CareerPathGenerate   - Career path generation endpoint
API:CareerPathDetails    - Career path details endpoint
API:SkillGapAnalyze      - Skill gap analysis endpoint
API:RoadmapGenerate      - Roadmap generation endpoint
API:Cache                - Caching system
API:RateLimiter          - Rate limiting system
API:Gemini               - Gemini API provider
API:Deepseek             - Deepseek API provider
API:ProviderSelector     - Provider selection logic
```

### Viewing Logs

**In Terminal (Development):**
```bash
# Start dev server with debug logging
LOG_LEVEL=debug yarn dev
```

You'll see pretty-printed output in your terminal.

**Example Debug Output:**
```
API:ResumeInterpret: Resume interpretation request received
API:ProviderSelector: Routing AI call to provider: gemini
API:Gemini: Calling Gemini API
API:Cache: Cache miss, generating new response
API:ResumeInterpret: Resume profile extracted successfully
```

**Testing Individual Routes with Logs:**
```bash
# With debug logging
LOG_LEVEL=debug yarn dev

# In another terminal
curl -X POST http://localhost:3000/api/resume/interpret \
  -H "Content-Type: application/json" \
  -d '{"resumeText":"..."}'
```

## Mock Mode Configuration

### What is Mock Mode?

- **Purpose:** Test application without making actual API calls
- **Data Source:** Generated mock data from `src/lib/api/mockData.ts`
- **Use Cases:**
  - Testing without API keys
  - Faster development (no API latency)
  - Development without rate limiting concerns
  - Testing UI with consistent data

### Enabling Mock Mode

#### Via Query Parameter
```
?mock=true
```

Add to any API endpoint:
```
POST http://localhost:3000/api/resume/interpret?mock=true
```

#### Via UI Settings
- Open application in browser
- Look for "API Mode" toggle in dashboard settings
- Switch to "Mock Mode"
- Toggle applies to all subsequent API calls

### How It Works

1. Request includes `?mock=true` or settings context indicates mock mode
2. API route detects mock mode flag
3. Returns generated mock data instead of calling AI provider
4. Mock data follows same schema as real responses

### Mock Data Source

- File: `src/lib/api/mockData.ts`
- Includes: Sample resume profiles, career paths, skill gaps, roadmaps
- Example resume samples in: `src/data/sampleResumesContent/`

### Sample Resumes

Pre-loaded sample resumes for testing:

- `entry-level-marketing` - Marketing professional with 2 years experience
- `mid-level-software` - Software engineer with 5 years experience
- `executive-finance` - Finance executive with 15 years experience
- `senior-healthcare` - Healthcare professional with 20 years experience

Use these in the UI for quick testing.

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
