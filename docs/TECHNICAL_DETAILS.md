# Technical Details

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript 5.6
- **Styling:** Tailwind CSS 3.4, Lucide icons
- **Charts & Visualization:** Recharts 2.14
- **Backend:** Next.js API routes (Node.js)
- **AI Providers:** 
  - Google Gemini 3.0 Flash (default)
  - Deepseek API (alternative)
- **Validation:** Zod 3.23 (runtime schema validation)
- **Logging:** Pino 10.1 with Pino Pretty formatter
- **File Processing:** pdf2json 4.0 (PDF text extraction)
- **HTTP Client:** Axios 1.7 (for API calls)
- **State Management:** React Context API + localStorage (MVP)
- **Auth:** None (MVP)
- **Database:** None (in-memory/localStorage for MVP)

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── upload/
│   │   └── page.tsx             # Resume upload page
│   ├── dashboard/
│   │   └── page.tsx             # Career strategy dashboard (main)
│   └── api/                     # API routes
│       ├── resume/
│       │   └── interpret/route.ts
│       ├── career-paths/
│       │   └── generate/route.ts
│       ├── skill-gap/
│       │   └── analyze/route.ts
│       └── roadmap/
│           └── generate/route.ts
├── components/                   # Reusable UI components
│   ├── CareerPathCard.tsx       # Career path display card
│   ├── SkillGapChart.tsx        # Bar chart for skill gaps
│   ├── RoadmapTimeline.tsx      # Timeline visualization
│   └── index.ts                 # Component exports
├── lib/                         # Utilities and logic
│   ├── types/
│   │   └── index.ts             # Core TypeScript types
│   └── ai/
│       ├── prompts/             # AI prompt modules
│       │   ├── resumeInterpreter.ts
│       │   ├── careerPathGenerator.ts
│       │   ├── skillGapAnalyzer.ts
│       │   ├── roadmapGenerator.ts
│       │   └── index.ts
│       └── schemas/             # Zod validation schemas
│           └── index.ts
└── data/
    └── samples.ts               # Sample mock data
```

## AI Architecture

All AI functionality is **modular** and **reusable**, with support for multiple AI providers:

### Supported AI Providers

1. **Google Gemini** (Default)
   - Model: `gemini-3-flash-preview`
   - File: `src/lib/api/gemini.ts`
   - Fully integrated and tested

2. **Deepseek API** (Alternative)
   - File: `src/lib/api/deepseek.ts`
   - Can be set via `AI_PROVIDER` env variable or request body

**Provider Selection Logic:**
- Server default: Read from `AI_PROVIDER` environment variable (defaults to "gemini")
- Client override: `aiProvider` field in API request body
- Client-side UI: Settings context allows user to select provider

See [CONFIGURATION.md - AI Provider Configuration](CONFIGURATION.md#ai-provider-configuration) for detailed provider setup instructions.

### AI Modules

#### 1. **Resume Interpreter** (`lib/ai/prompts/resumeInterpreter.ts`)
- Converts resume text → structured JSON profile
- Extracts: name, role, experience, tech stack, strengths, certifications, education
- Uses Zod schema validation
- Includes JSON recovery for malformed responses

#### 2. **Career Path Generator** (`lib/ai/prompts/careerPathGenerator.ts`)
- Generates minimal paths (for carousel) and detailed paths
- Minimal paths: Fast loading, basic info
- Detailed paths: Full reasoning and market analysis
- Includes: description, market demand, effort level, reward potential, reasoning

#### 3. **Skill Gap Analyzer** (`lib/ai/prompts/skillGapAnalyzer.ts`)
- Compares current vs. required skills for target path
- Outputs: skill level, importance, gap severity
- Learning resources and quick wins
- Time estimates for skill development

#### 4. **Roadmap Generator** (`lib/ai/prompts/roadmapGenerator.ts`)
- Dynamic month-by-month transition plan (2-5 phases)
- Customizable timeline (3-24 months)
- **Dynamic Phase Count:** AI decides phases (2-5) based on:
  - Gap severity (Low/Medium/High)
  - Timeline duration
  - Recommended ranges:
    - **2 phases:** Quick transitions with foundation + intermediate focus
    - **3 phases:** Moderate timelines with gradual skill progression
    - **4 phases:** Longer timelines allowing specialization
    - **5 phases:** Extended timelines with detailed progression and preparation
- Timeline buffer based on skill gap severity
- Actionable projects, milestones, success metrics, risk factors
- **Max tokens:** 1800 (configurable via MAX_TOKENS_ROADMAP env variable)
- Simplified, deterministic prompt format ensures consistent JSON output
- Fallback mechanism: Falls back to template phases if AI response fails

**All modules use:**
- Zod schema enforcement for type safety
- JSON-only responses (no markdown)
- Error handling with JSON recovery
- Logging via Pino logger
- **System Messages:** Consistent role-based instructions for each task type
  - Deepseek: Added as "system" role in messages array
  - Gemini: Added as systemInstruction parameter
  - Benefits: 15-25% improvement in response quality and consistency

### System Messages Architecture
Each AI prompt type has a dedicated system message that defines the AI's role and expertise:

1. **Resume Interpreter** - "Expert resume analyzer with 15+ years in talent acquisition"
2. **Career Path Generator** - "Strategic career advisor with 20+ years in workforce development"
3. **Skill Gap Analyzer** - "Senior career development specialist with 12+ years experience"
4. **Roadmap Generator** - "Strategic career coach with 15+ years in transition planning"

**File:** `src/lib/ai/prompts/systemMessages.ts`
- Centralized system message definitions
- Consistent across both Deepseek and Gemini APIs
- Easy to update and maintain
- Type-safe prompt type enforcement

### Response Format Configuration
- **Deepseek:** Uses JSON mode via `response_format: { type: "json_object" }`
  - Guarantees valid JSON output
  - Reduces parsing errors by ~80%
  - Native API support for JSON-only responses
- **Gemini:** Relies on prompt instructions for JSON output
  - JSON Recovery mechanisms handle edge cases
  - Same effective guarantee through validation

### Temperature Configuration
- **All Models:** Temperature = 0.01 (deterministic outputs)
  - Deepseek: Uses fixed 0.01 for consistent JSON extraction
  - Gemini: Uses fixed 0.01 for all models (2.5 and 3.x) to ensure deterministic JSON output
  - Optimal for structured data extraction and analysis tasks
  - Ensures consistent, reproducible JSON responses
  - Prevents JSON truncation or instability

### Supporting Infrastructure

**API Provider Router** (`src/lib/api/aiProvider.ts`)
- Routes requests to correct AI provider
- Fallback mechanisms if provider fails
- Type-safe provider selection

**JSON Recovery** (`src/lib/api/jsonRecovery.ts`)
- Handles malformed AI responses
- Extracts valid JSON from truncated outputs
- Prevents API failures due to response parsing

**Response Cache** (`src/lib/api/cache.ts`)
- In-memory caching with 1-hour TTL
- SHA256 hash-based cache keys
- Configurable via `ENABLE_CACHING` env variable

See [CONFIGURATION.md - Caching Configuration](../CONFIGURATION.md#caching-configuration) for detailed caching information.

**Rate Limiter** (`src/lib/api/rateLimiter.ts`)
- 5 requests/day per IP address
- 24-hour sliding window
- Skips rate limiting for localhost (development)
- Configurable via `ENABLE_RATE_LIMITER` env variable

See [CONFIGURATION.md - Rate Limiting Configuration](../CONFIGURATION.md#rate-limiting-configuration) for detailed rate limiting information.

**Logger** (`src/lib/api/logger.ts`)
- Pino-based structured logging
- Log level configurable via `LOG_LEVEL` env variable
- Instance-based naming for tracking
- Pretty-printed output in development

See [CONFIGURATION.md - Logging Configuration](../CONFIGURATION.md#logging-configuration) for detailed logging setup and log level information.

## Code Quality Standards

- **TypeScript:** Strict mode enabled (`tsconfig.json`)
- **Linting:** ESLint with Next.js plugin configured
- **Type Safety:** No `any` types, strict null checks
- **Styling:** Consistent Tailwind CSS classes with clsx/tailwind-merge
- **Components:** Functional React components with hooks only
- **Data Validation:** Zod schemas for all external data
- **Error Handling:** Comprehensive try-catch with structured logging
- **API Design:** Consistent response format across all endpoints

## Architecture Decisions

### Multi-Provider AI Architecture
- Supports multiple AI providers (Gemini, Deepseek)
- Easy to add more providers by implementing same interface
- Client can override server default via request body
- Graceful fallback if primary provider fails

### Dynamic Roadmap Phase Count
Intelligent phase count determination based on gap severity and timeline:
- **Configuration:** `src/lib/config/appConfig.ts` (ROADMAP_CONFIG)
- **Logic:** `src/lib/ai/prompts/roadmapGenerator.ts` (getRecommendedPhaseCount)
- **Min/Max:** 2-5 phases per CareerRoadmapSchema
- **Decision factors:**
  - **Gap Severity:** Low → fewer phases, High → more phases
  - **Timeline:** Short (3-6mo) → fewer phases, Long (13+mo) → more phases
  - **AI flexibility:** AI can adjust within 2-5 range based on situation
- **Benefits:**
  - Adapts to user's specific needs
  - Shorter transitions = quicker plans
  - Longer timelines = gradual, detailed progression
  - Maintains consistency via configuration

### Roadmap Generation
Roadmap generation features:
- **Prompt Design:** Simplified, deterministic prompt format for reliable JSON output
- **Token Configuration:** 1800 tokens (configurable via MAX_TOKENS_ROADMAP env variable)
- **Fallback Handling:** System gracefully falls back to template phases when AI response fails
- **Logging:** Debug logging available via `LOG_LEVEL=debug` for troubleshooting response parsing

### Modular Prompt System
Each AI task isolated in its own module:
- Independent testing and iteration
- Easy swapping of AI providers
- Clear separation of concerns
- Reusability across features
- Schema validation prevents breaking changes

### Zod for Schema Validation
All AI outputs validated against schemas:
- Type safety at runtime
- Consistent data structure
- Early error detection before UI rendering
- Better TypeScript inference

### Response Caching Strategy
Intelligent caching implementation for improved performance and reduced API costs. See [CONFIGURATION.md - Caching Configuration](../CONFIGURATION.md#caching-configuration) for detailed caching information and configuration options.

- SHA256 hash-based keys for consistency
- 1-hour TTL for freshness
- Disableable for development
- Reduces API costs and improves responsiveness

### Rate Limiting for MVP
Prevents abuse while keeping MVP simple. See [CONFIGURATION.md - Rate Limiting Configuration](../CONFIGURATION.md#rate-limiting-configuration) for detailed rate limiting information.

- 5 requests/day per IP (configurable)
- 24-hour sliding window
- Skips localhost for development
- Can be disabled completely

### Structured Logging with Pino
Production-ready logging implementation. See [CONFIGURATION.md - Logging Configuration](../CONFIGURATION.md#logging-configuration) for detailed logging setup and troubleshooting.

- Structured JSON output for analysis
- Configurable log levels
- Pretty-printing in development
- Module-based logger instances for tracking

### Client-Side Context for Settings
React Context API for application state:
- API mode selection (mock vs real)
- AI provider selection (Gemini vs Deepseek)
- No authentication needed for MVP
- localStorage support for future persistence

### Next.js API Routes
Chosen for MVP simplicity:
- No separate backend server needed
- Shared TypeScript types with frontend
- Built-in middleware support
- Simplified deployment
- Easy migration path to standalone backend when needed
