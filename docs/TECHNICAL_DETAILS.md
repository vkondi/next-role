# Technical Details

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript 5.6
- **Styling:** Tailwind CSS 3.4, Lucide icons
- **Charts & Visualization:** Recharts 2.14
- **PDF Generation:** jsPDF 4.1 (client-side PDF creation)
- **Backend:** Next.js API routes (Node.js)
- **AI Providers:** 
  - Google Gemini 3.0 Flash (default)
  - Deepseek API (alternative)
- **Validation:** Zod 3.23 (runtime schema validation)
- **Logging:** Pino 10.1 with Pino Pretty formatter
- **File Processing:** pdf2json 4.0 (PDF text extraction)
- **HTTP Client:** Axios 1.7 (for API calls)
- **State Management:** React Context API (MVP)
- **Auth:** None (MVP)
- **Database:** None


## AI Architecture

All AI functionality is **modular** and **reusable**, with support for multiple AI providers:

### Supported AI Providers

1. **Google Gemini** (Default)
   - Model: `gemini-3-flash-preview`
   - File: `src/lib/api/gemini.ts`

2. **Deepseek API** (Alternative)
   - File: `src/lib/api/deepseek.ts`

**Provider Selection Logic:**
- Server default: `AI_PROVIDER` environment variable (defaults to "gemini")
- Client override: `aiProvider` field in API request body
- Client-side UI: Settings context

For API keys, configuration, and setup instructions, see [CONFIGURATION.md](CONFIGURATION.md).

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

### Response Format
- **Temperature:** 0.01 for both providers (deterministic outputs)
- **Deepseek:** Native JSON mode via `response_format: { type: "json_object" }`
- **Gemini:** JSON output via prompt instructions + JSON recovery fallback
- **Validation:** All responses validated with Zod schemas

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
In-memory caching with 1-hour TTL, SHA256 hash-based keys. See [CONFIGURATION.md](CONFIGURATION.md) for configuration.

**Rate Limiter** (`src/lib/api/rateLimiter.ts`)  
5 requests/day per IP, skips localhost. See [CONFIGURATION.md](CONFIGURATION.md) for configuration.

**Logger** (`src/lib/api/logger.ts`)  
Pino-based structured logging with configurable levels. See [CONFIGURATION.md](CONFIGURATION.md) for log levels.

## Code Quality Standards

- **TypeScript:** Strict mode enabled (`tsconfig.json`)
- **Linting:** ESLint with Next.js plugin configured
- **Type Safety:** No `any` types, strict null checks
- **Styling:** Consistent Tailwind CSS classes with clsx/tailwind-merge
- **Components:** Functional React components with hooks only
  - **Server components (default):** No client-side JavaScript, runs on server at build/request time
  - **Client components:** Marked with `'use client'` directive when using hooks/browser APIs
  - Examples: CareerPathsCarousel, SkillGapChart (Recharts requires client), DashboardContent (useState/useEffect)
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



### Client-Side PDF Generation
All PDF generation happens on the client-side:
- **Library:** jsPDF 4.1.0 for client-side PDF creation
- **Architecture Decision:** Client-side approach chosen for:
  - Vercel free tier compatibility (no server-side file storage)
  - Instant download with no API latency
  - User privacy - no data sent to server
  - Reduced server load and infrastructure costs
- **Implementation Files:**
  - Core utility: `src/lib/utils/pdfExport.ts` (526 lines)
  - React component: `src/components/ExportPdfButton.tsx`
  - Export function: `generateCareerStrategyPDF(data: PDFExportData): Promise<void>`
- **PDF Structure:**
  - Brand-consistent styling using emerald theme (#059669)
  - Multi-page layout with automatic page breaks
  - Section headers with background color strips
  - Structured content: Career profile → Selected path → Skill gaps (with learning resources) → Roadmap (phases + milestones)
  - Footer on every page: Generation date, AI provider, copyright notice, page numbers
- **File Naming Convention:** `NextRole_{PathTitle}_{UserName}_{Date}.pdf`
- **TypeScript Interface:** `PDFExportData` with ResumeProfile, CareerPath, SkillGapAnalysis, CareerRoadmap, aiProvider

### Social Media Integration
Native platform sharing without backend:
- **Platforms Supported:** Twitter/X, LinkedIn, Facebook, WhatsApp, Telegram
- **Implementation Strategy:** Direct URL schemes via `window.open()` for each platform API
- **Message Generation:**
  - Function: `shareOnSocialMedia(platform: string, data: PDFExportData): void`
  - Dynamic message formatting with user name and target role
  - URL encoding for special characters
- **Platform-Specific Handling:**
  - Twitter/X: `twitter.com/intent/tweet` with text + url parameters
  - LinkedIn: `linkedin.com/sharing/share-offsite` (URL only - platform limitation)
  - Facebook: `facebook.com/sharer/sharer.php` with quote + url
  - WhatsApp: `wa.me/?text=` with message + link
  - Telegram: `t.me/share/url` with text + url parameters
- **Privacy:** No tracking, analytics, or cookies - simple share links only

### Client-Side Context for Settings
React Context API for application state:
- API mode selection (mock vs real)
- AI provider selection (Gemini vs Deepseek)
- No authentication needed for MVP

### Next.js API Routes
Chosen for MVP simplicity:
- No separate backend server needed
- Built-in middleware support
- Simplified deployment

### SSR Optimization Patterns

**Server Component by Default:**
- Next.js 15 App Router uses Server Components by default
- No `'use client'` directive needed for server components
- Reduces client-side JavaScript bundle
- Enables pre-rendering at build time or request time

**Server Wrapper + Client Content Pattern:**
- Pages split into minimal server wrapper + client component for interactivity
- Example: [dashboard/page.tsx](../src/app/dashboard/page.tsx) (server wrapper) + [dashboard/dashboard-content.tsx](../src/app/dashboard/dashboard-content.tsx) (client logic)
- Benefits: SEO metadata rendered on server, interactive features sent to client only when needed
- Server wrapper handles: Metadata, layout, static content
- Client component handles: useState, useEffect, API calls, user interactions

**Force Static Generation:**
- Use `export const dynamic = 'force-static';` for pages without dynamic data
- Example: [page.tsx](../src/app/page.tsx) (homepage) pre-rendered at build time
- Benefits: Fastest possible loading, better SEO crawling, reduced server load

**Client Directive Strategy:**
- Add `'use client'` only when needed for:
  - React hooks (useState, useEffect, useContext)
  - Browser APIs (localStorage, window, document)
  - Event handlers that require client-side state
  - Third-party libraries requiring browser environment (e.g., Recharts)
- Keep components server-rendered when possible (e.g., Footer with Date API runs at build time)

## SEO Implementation

Next.js 15 Metadata API with global/page-specific metadata, JSON-LD structured data, dynamic sitemap, and robots.txt.

**Implementation Details:** See [SEO_GUIDE.md](./SEO_GUIDE.md)

## Deployment

### Vercel
Application deployed on Vercel with:
- Automatic HTTPS, HTTP/2, Edge CDN
- Security headers via `vercel.json`
- Environment variables for configuration
- Image optimization and compression

**Configuration:** See [CONFIGURATION.md](CONFIGURATION.md) for environment setup