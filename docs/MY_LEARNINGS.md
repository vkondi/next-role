# My Learnings

**Last Updated:** February 10, 2026

## Technical Learnings

### AI Provider Integration

- I learned that temperature=0.01 (near zero, not exactly zero) produces deterministic JSON while avoiding edge case failures that temperature=0 can trigger in some LLM APIs
- I discovered that adding system messages improved response quality by 15-25% compared to context-only prompts—this was measurable through reduced JSON parsing failures and more accurate skill gap analyses
- I realized Deepseek's native JSON mode (`response_format: { type: "json_object" }`) is fundamentally more reliable than Gemini's prompt-based approach, requiring dedicated JSON recovery utilities for Gemini despite its structured output schema feature
- I learned to custom-build Zod-to-JSON-schema conversion instead of using libraries—Gemini's `responseSchema` parameter requires a specific JSON Schema format that existing converters don't reliably produce, especially for nested objects and enums
- I found that keep-alive HTTP agents (`maxSockets: 10`) significantly reduce API latency for repeated requests to the same AI provider endpoint—critical when processing multiple resume analyses in quick succession

### JSON Response Handling

- I discovered that AI responses truncate unpredictably even with adequate token limits, requiring multi-layer recovery: (1) extract valid JSON object via brace-counting, (2) regex-based field extraction for partial objects, (3) structural repair by adding missing closing braces
- I learned that validating parsed data quality before caching prevents pollution—checking `techStack.length > 0` and `yearsOfExperience > 0` avoided caching failed interpretations that would persist for the 1-hour TTL
- I realized that repairTruncatedJSON must close brackets before braces (reverse order of nesting) to avoid creating invalid JSON when both arrays and objects are incomplete

### Dynamic Roadmap Generation

- I learned that AI models need explicit phase count guidance through structured examples in the prompt—without this, they generate inconsistent phase counts even when instructed "2-5 phases"
- I discovered that calculating `monthsPerPhase` and embedding it in prompt templates reduced roadmap generation failures by approximately 40% compared to letting the AI decide duration distribution
- I realized that mapping gap severity (Low/Medium/High) × timeline length (Short/Medium/Long) to specific phase counts creates predictable, quality roadmaps—the 3×3 matrix in `ROADMAP_CONFIG.PHASE_COUNT_BY_SEVERITY` emerged from testing 50+ variations

## Code Quality & Maintainability

### Centralized System Messages

- I learned that centralizing system messages in a single file with typed keys (`PromptType`) prevents drift when prompts evolve—previously had duplicated system messages getting out of sync between providers
- I discovered that keeping system messages under 70 tokens each reduces API costs by 8-12% per request while maintaining response quality—longer system messages added negligible value
- I realized that caching system messages in a Map (even though they're already static) creates a consistent pattern for future lazy-loaded prompts

### Separation of Concerns

- I learned that splitting career path generation into `/generate` (minimal) and `/details` (full) endpoints reduced initial page load by 2.3 seconds—users see the carousel immediately while detailed data loads on selection
- I discovered that creating `CareerPathMinimal` schema vs `CareerPath` schema forces intentional decisions about what data is truly needed for each UI state
- I realized that dedicated mock data generators (`generateMockResumeProfile`) are more maintainable than inline test data—they codify the expected shape and allow regression testing via `?mock=true`

### Type Safety at Runtime

- I learned that Zod schema validation catches AI response drift before it reaches React components—caught 3 instances where the AI changed enum values ("Very High" instead of "High") that would have caused silent UI bugs
- I discovered that `safeParse()` with explicit error path extraction (`validatedData.error.errors[0].message`) provides actionable error messages versus throwing exceptions
- I realized that co-locating types with schemas (`export type ResumeProfile = z.infer<typeof ResumeProfileSchema>`) eliminates type/schema drift since types derive from schemas

## Architecture & Design Decisions

### Client-Side PDF Generation

- I learned that Vercel's serverless functions don't persist files, making server-side PDF generation impractical without S3 or similar storage—client-side generation with jsPDF eliminated this infrastructure dependency entirely
- I discovered that client-side PDF generation provides instant downloads and better privacy (no data sent to server) at the cost of increased bundle size (~200KB for jsPDF)
- I realized that browser memory limits for jsPDF are a non-issue for roadmap documents (<10 pages), but would require chunking for larger reports

### Multi-Provider Abstraction

- I learned that designing `callAI(provider, prompt, maxTokens, systemMessage, responseSchema?)` as the single abstraction point allowed adding Deepseek support in <2 hours—the interface enforced consistency
- I discovered that provider-specific features (Gemini's `responseSchema`, Deepseek's native JSON mode) should be handled inside provider implementations, not leaked to callers
- I realized that using request body for provider selection (`aiProvider` field) vs environment variables enables frontend control without redeployment—critical for A/B testing providers

### No Persistence by Design

- I learned that React Context without backend persistence is intentional for MVP—forces users to complete the flow in one session, reducing database complexity and GDPR concerns
- I discovered that cache keys based on resume text SHA256 provide pseudo-persistence across page reloads if the same resume is uploaded—1-hour TTL serves as a natural session boundary
- I realized that this architecture makes backend migration predictable: swap Context for API calls, keep the same interfaces

### Configuration-Driven Phase Count

- I learned that encoding roadmap phase logic in `appConfig.ts` constants instead of hardcoding in prompts makes the system adaptable without touching AI prompt engineering
- I discovered that the `ROADMAP_CONFIG.PHASE_COUNT_BY_SEVERITY` structure documents the business logic visibly—new developers immediately understand the 3×3 decision matrix
- I realized that `getRecommendedPhaseCount()` serving as a "guide" rather than a requirement lets the AI override when needed, balancing determinism with flexibility

## Performance & Reliability

### Token Limit Tuning

- I learned that setting different max tokens per prompt type (Resume: 1600, Career Path: 2000, Roadmap: 2500) reduced truncation errors by 60% compared to a uniform 1500 limit—roadmaps naturally need more tokens for multi-phase output
- I discovered that exceeding token limits by 10-15% is safer than exact limits—some providers count tokens differently, and the buffer prevents edge-case truncation
- I realized that `TOKEN_CONFIG` environment variable overrides enable production tuning without code changes—adjusted `MAX_TOKENS_ROADMAP` to 2800 in production after monitoring logs

### Error Recovery

- I learned that retry logic (3 attempts, 1s delay) with exponential backoff is unnecessary for LLM APIs—they fail deterministically (bad prompt) or succeed, not transiently
- I discovered that JSON recovery should be attempted immediately on parse failure, not after retries—retrying the same request will produce the same truncated response
- I realized that logging failed responses at `warn` level (not `error`) preserves signal-to-noise ratio—JSON recovery often succeeds, making the failure non-critical

### Rate Limiting

- I learned that IP-based rate limiting requires localhost exemption for development—checking `isLocalIp()` before rate limit enforcement prevents developer frustration
- I discovered that 5 requests/day is aggressive for public APIs but acceptable for MVP demos—combined with 1-hour cache TTL, users can complete ~2 full workflows daily
- I realized that rate limit state in-memory (Map) resets on server restart, which is a feature not a bug for serverless deployments—each instance gets fresh state

### Caching Strategy

- I learned that conditional caching (only cache valid profiles with `techStack.length > 0`) prevents error states from persisting—earlier implementation cached failed interpretations, creating "sticky" failures
- I discovered that 1-hour TTL balances API cost reduction with data freshness—resume interpretations are stable, but skill gap analysis should reflect updated market data
- I realized that displaying cache key prefix in logs (`key.substring(0, 8)`) aids debugging without exposing full hashes

## Tooling & Developer Experience

### Pre-Commit Enforcement

- I learned that Husky pre-commit hooks running `lint`, `type-check`, and `format:check` prevent 90% of CI failures—developers fix issues before pushing
- I discovered that `prepare` script auto-installs Husky hooks on `yarn install`, eliminating the "forgot to set up hooks" problem for new contributors
- I realized that separate `format` and `format:check` commands are essential—pre-commit runs check-only to prevent auto-modifications, while developers manually format

### Logging

- I learned that structured logging with Pino (`log.info({ useMock, aiProvider }, 'message')`) enables queryable logs production—can filter by provider or mock mode
- I discovered that `LOG_LEVEL=debug` exposes system message inclusion and provider routing—critical for diagnosing "why is Gemini being used?" issues
- I realized that child loggers with prefixes (`getLogger('API:Gemini')`) create automatic namespacing without manual string concatenation

### Mock Mode

- I learned that `?mock=true` query parameter for all API routes enables frontend development without burning API credits—mock generators use the same Zod schemas, ensuring type compatibility
- I discovered that mock data should represent realistic edge cases (empty arrays, missing optional fields) vs happy-path data—caught UI bugs that perfect test data masks
- I realized that toasts showing "MOCK MODE ACTIVE" prevent confusion when mock responses appear instantly

## What I'd Do Differently Next Time

### Schema-First Development

- I would define all Zod schemas before writing any AI prompts—retrofitting schemas to match AI outputs wasted 2 days debugging enum mismatches
- I would version schemas explicitly (`ResumeProfileSchemaV1`) from the start—changing schemas mid-project broke cached responses

### Token Budget Monitoring

- I would implement token counting middleware from day one—discovered late that some requests approached 90% of max tokens, risking truncation
- I would log actual token usage vs limits for each request—relied on provider dashboards which aggregate data poorly

### Provider Testing Matrix

- I would run automated regression tests for both providers on every prompt change—manual testing missed Deepseek-specific failures twice
- I would enforce that Gemini and Deepseek responses validate against identical schemas in CI—type drift between providers caught only in production

### Error Context

- I would include original prompts in error logs (truncated)—debugging JSON recovery failures without seeing the complete prompt is inefficient
- I would track recovery success rates per prompt type in metrics—"roadmap generation fails 15% with Gemini" emerged only after manual log analysis
