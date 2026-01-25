# AI Agent Instructions for NextRole

## Project Overview

**NextRole** is a career strategy copilot built with Next.js 15, React 19, and TypeScript 5.6. It analyzes resumes, simulates career paths, identifies skill gaps, and generates month-by-month career roadmaps using AI (Gemini or Deepseek APIs).

**Core principle:** Output feels like guidance from a career consultant, not a chatbot.

## Architecture & Data Flow

### Three-Phase Processing Pipeline

1. **Resume Upload & Interpretation** (`/api/resume/interpret`)
   - Accepts resume text or file upload (PDF/DOCX via `mammoth` and `pdf2json`)
   - Uses `resumeInterpreter` prompt to extract structured `ResumeProfile`
   - Cached for 1 hour to reduce redundant API calls
   - Stored in React Context (`ResumeContext`) - NOT persisted

2. **Career Path Generation** (`/api/career-paths/{details|generate}`)
   - Takes user profile and generates 4-6 strategic next roles
   - Each path includes demand scores (0-100), effort level, and industry alignment
   - Two endpoints: `/generate` (minimal for carousel) and `/details` (full with reasoning)
   - Minimal version uses dedicated `generateCareerPathsMinimal` for faster UI feedback

3. **Skill Gap Analysis** (`/api/skill-gap/analyze`)
   - For each career path, compares current vs. required skills
   - Returns proficiency levels, importance ratings, and learning timelines
   - Groups skills by severity (Low/Medium/High) for roadmap prioritization

4. **Roadmap Generation** (`/api/roadmap/generate`)
   - Creates 2-5 month-by-month phases based on skill gaps and timeline
   - Phase count varies: Low severity gaps → fewer phases; High severity → more phases
   - Includes concrete projects, milestones, success metrics, and risk factors

### AI Provider Routing

- **Provider selection precedence:** Per-request body → UI Settings (SettingsContext) → Server env var (default: gemini)
- **Both APIs standardized:** Fixed temperature 0.01 for deterministic JSON, both receive identical system messages
- **System messages:** Centralized in `src/lib/ai/prompts/systemMessages.ts` (condensed, cached)
  - Deepseek: Added as "system" role in messages array
  - Gemini: Added as `systemInstruction` parameter
- **Token config:** DEFAULT 1500, RESUME 1600, CAREER_PATH 2000, SKILL_GAP 1600, ROADMAP 2500
- **JSON guarantees:** Deepseek uses native JSON mode; Gemini + JSON recovery fallback in `jsonRecovery.ts`

## Critical Type System

All domain types in `src/lib/types/index.ts`:

- **ResumeProfile:** Current career state (role, experience, stack, industry)
- **CareerPath / CareerPathMinimal:** Future opportunity with demand/alignment scores
- **SkillGap:** Proficiency comparison with timeline estimate
- **RoadmapPhase:** Month-by-month actions with milestones and metrics

All API payloads validated with Zod schemas in `src/lib/ai/schemas/index.ts`.

## Developer Workflows

### Setup & Running

```bash
yarn install           # Install dependencies
yarn dev             # Start dev server (http://localhost:3000)
yarn build           # Build for production
yarn lint            # ESLint check
yarn type-check      # TypeScript compilation check
yarn format:check    # Check code formatting
yarn format          # Auto-format code
```

**Pre-commit Hooks:** Husky automatically runs lint, type-check, and format checks before each commit. Commits are rejected if checks fail.

**CI/CD:** GitHub Actions runs automated checks (lint, type-check, build) on all pull requests to main/develop branches.

### Environment Variables

See [CONFIGURATION.md](../docs/CONFIGURATION.md) for complete configuration details.

**Essential:** `GEMINI_API_KEY` or `DEEPSEEK_API_KEY`, `AI_PROVIDER`  
**Optional:** `MAX_TOKENS_*`, `ENABLE_CACHING`, `ENABLE_RATE_LIMITER`, `LOG_LEVEL`

### Testing APIs

Sample resumes available in `src/data/sampleResumesContent/`. For regression testing:
1. Use `?mock=true` query param to test with mock data (no API calls)
2. Test both Gemini and Deepseek by setting `AI_PROVIDER` env var
3. Monitor logs: `LOG_LEVEL=debug` shows system message inclusion and provider routing

### Adding New AI Prompts

1. Create prompt function in `src/lib/ai/prompts/{promptName}.ts`
2. Add Zod schema in `src/lib/ai/schemas/index.ts`
3. Export from `src/lib/ai/prompts/index.ts`
4. Call: `getSystemMessage("promptType")` then pass `systemMessage` to `callAI(provider, prompt, maxTokens, systemMessage)`
5. Update `src/lib/ai/prompts/systemMessages.ts` with condensed role definition (60-70 tokens max)

## Project-Specific Patterns

### Error Handling & Resilience

**API failures:** Automatic retry (3x, 1s delay) | **JSON parsing:** Recovery from truncated responses | **Rate limiting:** 5/day per IP (localhost skipped) | **Logging:** Pino with configurable levels

See [TECHNICAL_DETAILS.md](../docs/TECHNICAL_DETAILS.md) and [CONFIGURATION.md](../docs/CONFIGURATION.md) for implementation details.

### State Management

- **Resume profile:** React Context only (no persistence by design)
- **User settings:** SettingsContext for AI provider selection
- **Caching:** Automatic in-memory with 1-hour TTL; SHA256 hash-based keys

### UI Conventions

- **Tailwind + CVA:** Class-variance-authority for component variants (see `CareerPathCard.tsx`)
- **Icons:** Lucide React; emoji for sample resumes (📊, 💻, 💰, 🏥)
- **Charts:** Recharts for skill gap visualization
- **Toast notifications:** Custom Toast component for user feedback

## Common Mistakes to Avoid

1. **Not passing system messages to callAI()** - Will degrade response quality 15-25%
2. **Changing temperature above 0.01 for JSON tasks** - Causes JSON truncation/parsing failures
3. **Forgetting Zod validation** - Type safety only works if schema validates at runtime
4. **Missing error boundaries for async operations** - JSON parsing errors crash UI without fallback handling
5. **Assuming ResumeProfile persists** - Lost on page reload; store in backend if needed
6. **Ignoring cache invalidation** - Old responses cached for 1 hour; manual cache clear needed for testing

## Developer Guidelines & Workflow

### Pre-Development & Communication

- **Context First:** Read all files in `/docs` folder to gain comprehensive understanding of features and technical architecture before writing code
- **Clarify Doubts:** If requirements or logic flows are unclear, consult with project lead before proceeding
- **Validation:** Ensure no type-check or linting errors are introduced by new changes (`yarn type-check` and `yarn lint`)
- **Code Quality:** Pre-commit hooks automatically enforce lint, type-check, and formatting standards

### AI Integration & Cross-Compatibility

- **Regression Testing:** Since Deepseek and Gemini API flows are deeply integrated, any change to one model must be verified against the other to ensure no regressions occur

### Documentation Standards

- **Synchronized Updates:** Documentation must always reflect current state of the application. If code is added, removed, or updated, corresponding documentation must be updated immediately
- **No Changelogs in Docs:** Do not use documentation folder to track version history or change logs
- **Clean Code:** Remove non-essential comments

### Commenting Protocol

- **Functional Focus:** Comments should describe the present logic of the code
- **Avoid Metadata:** Do not use code comments as a changelog or to track "who changed what"


## Integration Points

- **File Upload:** Uses `mammoth` (DOCX) and `pdf2json` (PDF) → text extraction → resume interpret API
- **Gemini API:** REST endpoint, uses `systemInstruction` parameter for context injection
- **Deepseek API:** REST endpoint with JSON mode guarantee; no SDK (custom implementation)
- **External Data:** Skill/role/timeline recommendations derived from AI outputs (no external DB)

## Debugging Tips

- **JSON parsing failures:** Check `LOG_LEVEL=debug` for response truncation; increase `MAX_TOKENS_*`
- **API provider not routing correctly:** Verify request body has `aiProvider` field; check `aiProvider.ts` getAIProviderFromBody()
- **Resume parsing errors:** Test with sample resumes first; check file format (PDF/DOCX/TXT)
- **Type errors:** Ensure Zod schemas match domain types exactly; run `yarn type-check`
- **Performance:** Check cache hit rate in logs; monitor token usage per operation

## Key Dependencies

- **Next.js 15:** App Router, Server Components, API routes
- **TypeScript 5.6:** Strict mode for type safety
- **Zod:** Runtime schema validation
- **Axios:** API calls (with retry logic)
- **Pino:** Structured logging
- **Recharts:** Data visualization
- **Tailwind + CVA:** UI styling with variants
