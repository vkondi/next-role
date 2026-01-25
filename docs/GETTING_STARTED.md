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

Create a `.env.local` file in the project root. See [CONFIGURATION.md](CONFIGURATION.md) for a comprehensive guide to all environment variables and configuration options.

**Quick Setup:**
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your-key-from-google-ai-studio
LOG_LEVEL=error
```

**For Mock Mode Only** (no API keys needed):
```bash
AI_PROVIDER=gemini
LOG_LEVEL=error
```

Then use `?mock=true` query param or toggle "Mock Mode" in the UI.

For detailed configuration options including caching, rate limiting, logging levels, and AI provider setup, see [CONFIGURATION.md](CONFIGURATION.md).

### 2. Start Development Server

```bash
yarn dev
```

This will:
- Start Next.js development server on `http://localhost:3000`
- Enable hot module reloading for rapid development
- Watch for file changes automatically

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

1. **Get API Keys:**
   - **Gemini:** Get free key at [Google AI Studio](https://aistudio.google.com)
   - **Deepseek:** Sign up at [Deepseek](https://deepseek.com) and get API key

2. **Configure `.env.local`:**
   See [CONFIGURATION.md](CONFIGURATION.md) for all configuration options.
   
   ```bash
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your-actual-key
   LOG_LEVEL=debug
   ```

3. **Toggle to Real Mode:**
   - In dashboard, switch API mode from Mock to Real
   - System will use real AI providers

### Debugging

**View Detailed Logs:**
See [CONFIGURATION.md - Logging Configuration](CONFIGURATION.md#logging-configuration) for comprehensive logging setup and troubleshooting.

Set `LOG_LEVEL=debug` in `.env.local`, then restart dev server:

```bash
LOG_LEVEL=debug yarn dev
```

See terminal for detailed logs showing API calls, caching behavior, and provider routing.

## Troubleshooting

For detailed troubleshooting of configuration issues, see [CONFIGURATION.md - Troubleshooting Configuration](CONFIGURATION.md#troubleshooting-configuration).

### Common Setup Issues

**"No API Key Found" Error**
- Verify `.env.local` exists in project root (not in `src/`)
- Restart dev server after updating `.env.local`
- See [CONFIGURATION.md](CONFIGURATION.md#no-api-key-found-error) for details

**Port 3000 Already in Use**
```bash
yarn dev -p 3001
```

**Module Not Found Errors**
```bash
yarn install
rm -rf node_modules/.cache
yarn dev
```

For additional troubleshooting including slow responses, rate limiting, and caching issues, see [CONFIGURATION.md](CONFIGURATION.md#troubleshooting-configuration).

### Hot Reload Not Working
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

For comprehensive performance optimization and configuration tips, see [CONFIGURATION.md - Performance Optimization Tips](CONFIGURATION.md#performance-optimization-tips).

Quick tips:
- Use **mock mode** during development (no API calls)
- Enable **caching** (default: true) for faster repeated requests
- Use **Gemini** by default (fastest)
- Keep **log level at error** unless debugging

## Getting Help

- **Setup Issues:** Check the Troubleshooting section above
- **Architecture Questions:** See [Technical Details](./TECHNICAL_DETAILS.md)
- **API Integration:** See [API Specification](./API_SPEC.md)
- **Feature Requests:** See [Development Roadmap](./ROADMAP.md)
- **Code Contribution:** See [Contributing Guidelines](./CONTRIBUTING.md)
