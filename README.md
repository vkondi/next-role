# NextRole - Career Strategy Copilot

[![CI](https://github.com/vkondi/next-role/actions/workflows/ci.yml/badge.svg)](https://github.com/vkondi/next-role/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Your next role, planned with clarity.**

A production-quality web application that helps professionals analyze their career path, discover strategic next moves, and execute a personalized 6-12 month career roadmap.

## Table of Contents

- **[Getting Started](./docs/GETTING_STARTED.md)** - Installation, setup, and local development
- **[Configuration](./docs/CONFIGURATION.md)** - Environment variables, AI providers, caching, rate limiting, logging
- **[Features](./docs/FEATURES.md)** - Core features and user journey
- **[API Specification](./docs/API_SPEC.md)** - Complete API documentation
- **[Technical Details](./docs/TECHNICAL_DETAILS.md)** - Architecture, tech stack, and AI design
- **[Development Roadmap](./docs/ROADMAP.md)** - Project status and upcoming features
- **[Contributing Guidelines](./docs/CONTRIBUTING.md)** - Code standards and contribution process

## Project Goal

NextRole is **not** a job portal or ATS score checker. It's a **career intelligence and planning tool** that:

- Analyzes your current career profile from your resume
- Simulates 4-6 strategic future career paths
- Identifies skill gaps for each path
- Generates a **month-by-month actionable career roadmap**

The output feels like guidance from a **career consultant + strategist**, not a chatbot.

## Quick Start

1. **Clone and install:**
   ```bash
   git clone https://github.com/vkondi/next-role.git
   cd next-role
   yarn install
   ```

2. **Start development server:**
   ```bash
   yarn dev
   ```

3. **Open browser:** Navigate to `http://localhost:3000`

See [Getting Started](./docs/GETTING_STARTED.md) for detailed installation and configuration instructions.

## Tech Stack

**Frontend:** Next.js 15, React 19, TypeScript 5.6, Tailwind CSS  
**AI:** Google Gemini & Deepseek API  
**Validation:** Zod | **Visualization:** Recharts | **Testing:** Vitest

For complete technical details and architecture, see [Technical Details](./docs/TECHNICAL_DETAILS.md).

## Key Features

- **Resume Analysis:** Intelligent extraction and profiling of career background
- **Multi-Path Simulation:** Explore 4-6 different strategic career trajectories
- **Skill Gap Analysis:** Detailed comparison of required vs. current skills
- **Actionable Roadmap:** Month-by-month plan with concrete milestones and projects
- **Market Intelligence:** Real demand scores and industry alignment insights
- **PDF Export & Sharing:** Download comprehensive career strategy reports and share on social media

See [Features](./docs/FEATURES.md) for complete feature documentation.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact & Support

Have questions, feedback, or found a bug? We'd love to hear from you!

### Get in Touch

- **📧 Email:** [vkondi@gmail.com](mailto:vkondi@gmail.com)
- **🐛 Bug Reports:** [GitHub Issues](https://github.com/vkondi/next-role/issues)

### Contributing

We welcome contributions! Please read our [Contributing Guidelines](./docs/CONTRIBUTING.md) before submitting pull requests.

---

**Built for professionals who want clarity on their next move.**
