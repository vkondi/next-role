# NextRole - Career Strategy Copilot

**Your next role, planned with clarity.**

A production-quality web application that helps professionals analyze their career path, discover strategic next moves, and execute a personalized 6-12 month career roadmap.

## Project Goal

NextRole is **not** a job portal or ATS score checker. It's a **career intelligence and planning tool** that:

- Analyzes your current career profile from your resume
- Simulates 4-6 strategic future career paths
- Identifies skill gaps for each path
- Generates a **month-by-month actionable career roadmap**

The output feels like guidance from a **career consultant + strategist**, not a chatbot.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Backend:** Next.js API routes (Node.js)
- **AI:** Deepseek (structured JSON outputs)
- **State:** React state + localStorage
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

## Core Pages

### 1. **Landing Page** (`/`)
- Clear value proposition
- CTA: "Analyze Your Resume"
- Features overview
- Professional, minimal UI

### 2. **Resume Upload** (`/upload`)
- Upload/paste resume text
- Preview extracted profile
- Allow manual edits (future enhancement)
- Structured data extraction:
  - Current role
  - Years of experience
  - Tech stack
  - Strength areas

### 3. **Career Strategy Dashboard** (`/dashboard`)
Main analysis page with four sections:

#### A. Career Paths Section
- Display 4-6 possible future roles
- Each role shows:
  - Role name and description
  - Market demand score (0-100)
  - Effort vs. reward indicator
  - Industry alignment score

#### B. Skill Gap Analysis
- For selected career path:
  - Required skills
  - Current skill estimation
  - Gap severity
  - Learning resources
- Bar chart visualization

#### C. Career Roadmap
- Timeline view (month-wise)
- Each phase includes:
  - Skills to focus on
  - Learning direction
  - Project ideas
  - Milestones
  - Action items

#### D. Success Metrics & Risk Factors
- Metrics to measure success
- Potential challenges
- Support resources

## AI Architecture

All AI functionality is **modular** and **reusable**:

### 1. **Resume Interpreter** (`lib/ai/prompts/resumeInterpreter.ts`)
- Converts resume text → structured JSON
- Extracts: role, experience, tech, strengths, industry
- Uses JSON schema validation

### 2. **Career Path Generator** (`lib/ai/prompts/careerPathGenerator.ts`)
- Suggests 4-6 future roles
- Includes: description, market demand, effort level, reward potential
- Reasoning for each path

### 3. **Skill Gap Analyzer** (`lib/ai/prompts/skillGapAnalyzer.ts`)
- Compares current vs. required skills
- Importance levels
- Learning resources
- Time to close gaps

### 4. **Roadmap Generator** (`lib/ai/prompts/roadmapGenerator.ts`)
- Month-by-month transition plan
- Actionable projects
- Milestones and success metrics
- Risk factors and resources

**All modules use:**
- JSON schema enforcement via Zod
- No markdown or prose-only responses
- Structured outputs for UI rendering

## API Routes

### `POST /api/resume/interpret`
Interprets resume text and extracts structured profile.

**Request:**
```json
{
  "resumeText": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentRole": "string",
    "yearsOfExperience": number,
    "techStack": ["string"],
    "strengthAreas": ["string"],
    "industryBackground": "string"
  }
}
```

### `POST /api/career-paths/generate`
Generates career path suggestions.

**Request:**
```json
{
  "resumeProfile": { /* ResumeProfile */ },
  "numberOfPaths": 5
}
```

### `POST /api/skill-gap/analyze`
Analyzes skill gaps for a selected path.

**Request:**
```json
{
  "resumeProfile": { /* ResumeProfile */ },
  "careerPath": { /* CareerPath */ }
}
```

### `POST /api/roadmap/generate`
Generates actionable roadmap.

**Request:**
```json
{
  "resumeProfile": { /* ResumeProfile */ },
  "careerPath": { /* CareerPath */ },
  "skillGapAnalysis": { /* SkillGapAnalysis */ },
  "timelineMonths": 6
}
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Configure environment variables:**
   ```bash
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:3000
   # DEEPSEEK_API_KEY=your-key-here (when ready)
   ```

3. **Run development server:**
   ```bash
   yarn dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
yarn build
yarn start
```

## Development Status

### ✅ Completed
- [x] Project structure and configuration
- [x] TypeScript type definitions
- [x] Zod validation schemas
- [x] AI prompt modules (with placeholders)
- [x] API route skeletons with mock responses
- [x] Landing page
- [x] Resume upload page with preview
- [x] Career strategy dashboard
- [x] Reusable UI components (CareerPathCard, SkillGapChart, RoadmapTimeline)
- [x] Tailwind CSS styling and design system
- [x] Sample mock data

### 🚧 TODO - Next Priority

#### 1. **Deepseek API Integration** (HIGH PRIORITY)
- [ ] Implement actual API calls to Deepseek API
- [ ] Add error handling and retry logic
- [ ] Test with real resume data
- [ ] Optimize prompt engineering
- [ ] Add request/response logging

#### 2. **Data Persistence** (HIGH PRIORITY)
- [ ] Replace localStorage with database (Supabase/Firebase/Postgres)
- [ ] User authentication (optional for MVP)
- [ ] Save analysis history
- [ ] Allow resume updates

#### 3. **UI Enhancements**
- [ ] Add loading states and skeleton screens
- [ ] Implement edit functionality for profile data
- [ ] Add tooltips explaining AI reasoning
- [ ] Radar chart for skill visualization (alternative to bar chart)
- [ ] Mobile responsiveness improvements
- [ ] Dark mode support (optional)

#### 4. **Features to Add**
- [ ] PDF export of career strategy
- [ ] Share analysis with mentor
- [ ] Comparison view for multiple paths
- [ ] Learning resource recommendations
- [ ] Progress tracking (mark milestones complete)

#### 5. **Testing & QA**
- [ ] Unit tests for API routes (Jest)
- [ ] Integration tests for AI prompts
- [ ] E2E tests for user flows (Playwright/Cypress)
- [ ] Performance testing
- [ ] Accessibility audit (WCAG compliance)

#### 6. **Performance & Optimization**
- [ ] Optimize bundle size
- [ ] Image optimization
- [ ] API response caching
- [ ] Lazy load components
- [ ] Code splitting

#### 7. **Monitoring & Analytics**
- [ ] Error tracking (Sentry)
- [ ] Analytics (Posthog/Mixpanel)
- [ ] Performance monitoring (Web Vitals)

#### 8. **Documentation**
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Component Storybook
- [ ] Deployment guide
- [ ] Contributing guide

## Code Quality Standards

- **TypeScript:** Strict mode enabled
- **Linting:** ESLint configured
- **Styling:** Consistent Tailwind classes
- **Components:** Functional, React hooks only
- **No hardcoded data:** All responses from AI
- **Clear separation:** UI ↔ Business Logic ↔ Data

## Non-Goals (Explicitly Excluded)

- ❌ Job listings or job board functionality
- ❌ Resume ATS scoring
- ❌ Auto-apply features
- ❌ Authentication (MVP)
- ❌ Payment processing (MVP)
- ❌ Social features (MVP)

## Example Usage

### Sample Resume
See `src/data/samples.ts` for example resume data and mock career paths.

### Testing the Dashboard
1. Go to `/upload`
2. Paste sample resume from `samples.ts`
3. Click "Analyze Resume"
4. View career paths and select one
5. Review skill gaps and roadmap

## Notes for Development

### Mock Data
Currently using mock responses from API routes. The actual Deepseek API integration is marked with `TODO` comments in:
- `src/lib/ai/prompts/resumeInterpreter.ts`
- `src/lib/ai/prompts/careerPathGenerator.ts`
- `src/lib/ai/prompts/skillGapAnalyzer.ts`
- `src/lib/ai/prompts/roadmapGenerator.ts`
- All API routes in `src/app/api/*/`

### Next Steps
1. Integrate Deepseek API with proper authentication
2. Test prompt outputs with real resumes
3. Add error handling for API failures
4. Implement data persistence layer
5. Build comprehensive test suite

## License

MIT

---

**Built for professionals who want clarity on their next move.**
