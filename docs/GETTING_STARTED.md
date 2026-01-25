# Getting Started

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- A text editor or IDE (VS Code recommended)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/vkondi/next-role.git
cd next-role
```

### 2. Install Dependencies

Using Yarn (recommended):
```bash
yarn install
```

Or using npm:
```bash
npm install
```

## Local Development

### 1. Configure Environment Variables

Create a `.env.local` file in the project root:

**Minimal Setup (Mock Mode - No API needed):**
```bash
AI_PROVIDER=gemini
LOG_LEVEL=error
```

**Production Setup:**
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your-key-from-google-ai-studio
LOG_LEVEL=error
```

For complete configuration options (AI providers, caching, rate limiting, token limits, logging), see [CONFIGURATION.md](CONFIGURATION.md).

### 2. Start Development Server

```bash
yarn dev
```

This will:
- Start Next.js development server on `http://localhost:3000`

### 3. Open in Browser

Navigate to `http://localhost:3000` in your browser.

## Project Structure Quick Reference

- **`src/app/`** - Next.js pages and API routes
- **`src/components/`** - Reusable React components
- **`src/lib/`** - Utilities, AI prompts, and business logic
- **`src/data/`** - Sample data and mock responses
- **`public/`** - Static assets
- **`docs/`** - Documentation files

## Testing the Application

### Quick Start with Mock Data
The easiest way to test is with mock mode (no API keys needed):

1. **Start the dev server:**
   ```bash
   yarn dev
   ```

2. **Go to Landing Page:**
   - Navigate to `http://localhost:3000`
   - Click "Get Started"

3. **Upload a Resume:**
   - Go to `/upload`
   - Click "Load Sample" to load one of the sample resumes
   - Or paste your own resume text
   - Click "Analyze Resume"

4. **View the Dashboard:**
   - System will generate mock career paths
   - Select a path to see skill gaps
   - View the personalized roadmap

5. **Toggle Settings:**
   - Look for "API Mode" toggle in dashboard
   - Switch between Mock and Real modes
   - Select different AI providers (if API keys configured)

### Testing with Real APIs

For API key setup and configuration options, see [CONFIGURATION.md](CONFIGURATION.md).

1. **Get API Keys:** [Google AI Studio](https://aistudio.google.com) (Gemini) or [Deepseek](https://deepseek.com)
2. **Add to `.env.local`:** `AI_PROVIDER=gemini` and `GEMINI_API_KEY=your-key`
3. **Toggle to Real Mode:** Switch API mode in dashboard settings

### Debugging

For detailed logging configuration and troubleshooting, see [CONFIGURATION.md](CONFIGURATION.md).

**Quick Debug:**
Set `LOG_LEVEL=debug` in `.env.local`, then restart:
```bash
LOG_LEVEL=debug yarn dev
```

## Troubleshooting

For comprehensive troubleshooting (API keys, slow responses, caching, rate limiting), see [CONFIGURATION.md - Troubleshooting](CONFIGURATION.md#troubleshooting-configuration).

**Common Issues:**

**Port 3000 in Use:**
```bash
yarn dev -p 3001
```

**Module Not Found:**
```bash
yarn install
nrm -rf node_modules/.cache
yarn dev
```

**Hot Reload Issues:**
```bash
rm -rf .next
yarn dev
```

## Build for Production

### Build the Application
```bash
yarn build
```

This creates an optimized production build in `.next/` directory.

### Run Production Build
```bash
yarn start
```

Starts the Next.js server with the production build.

## Useful Commands

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Build for production |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn type-check` | Run TypeScript type checking |
| `yarn format` | Auto-format code with Prettier |
| `yarn format:check` | Check code formatting without modifying |
| `yarn test` | Run tests |
| `yarn test:coverage` | Run tests with coverage report |

**Note:** Husky automatically runs lint, type-check, and format checks before each commit to maintain code quality.

## Next Steps

After setting up locally:

1. **Understand the Architecture:**
   - Review [Technical Details](./TECHNICAL_DETAILS.md) for system design
   - Check out AI provider implementations in `src/lib/api/`

2. **Explore the Code:**
   - API routes in `src/app/api/`
   - Components in `src/components/`
   - AI prompts in `src/lib/ai/prompts/`
   - Validation schemas in `src/lib/ai/schemas/`

3. **Review Available Features:**
   - See [Features](./FEATURES.md) for complete feature list
   - Check [API Specification](./API_SPEC.md) for all endpoints

4. **Check Development Status:**
   - See [Development Roadmap](./ROADMAP.md) for planned work
   - Understand current limitations in MVP

5. **Start Contributing:**
   - Read [Contributing Guidelines](./CONTRIBUTING.md)
   - Follow code standards before making changes

## Performance Tips

For comprehensive optimization guidance, see [CONFIGURATION.md](CONFIGURATION.md).

**Quick Tips:** Use mock mode during development | Enable caching | Use Gemini (fastest) | Keep log level at error

## Getting Help

- **Setup Issues:** Check the Troubleshooting section above
- **Architecture Questions:** See [Technical Details](./TECHNICAL_DETAILS.md)
- **API Integration:** See [API Specification](./API_SPEC.md)
- **Feature Requests:** See [Development Roadmap](./ROADMAP.md)
- **Code Contribution:** See [Contributing Guidelines](./CONTRIBUTING.md)
