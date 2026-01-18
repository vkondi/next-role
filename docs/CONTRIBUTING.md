# Contributing Guidelines

## Code Quality Standards

All contributions should adhere to these quality standards:

- **TypeScript:** Strict mode enabled
- **Linting:** ESLint configured - run `yarn lint` before committing
- **Type Safety:** No `any` types without explicit justification
- **Styling:** Consistent Tailwind CSS classes
- **Components:** Functional components with React hooks only
- **Data:** No hardcoded data - all responses from AI or configuration
- **Separation of Concerns:** UI ↔ Business Logic ↔ Data

## Development Principles

### 1. Modular Design
- Keep components focused and reusable
- Extract business logic into separate utility functions
- AI prompts should be isolated in `lib/ai/prompts/`

### 2. Type Safety
- Always define TypeScript types for data structures
- Use Zod schemas for API validation
- Leverage TypeScript's strict mode for catching errors early

### 3. Clear Code
- Use descriptive variable and function names
- Add comments for non-obvious logic
- Keep functions small and focused
- Prefer clarity over cleverness

### 4. Structured Data
- All AI responses must be structured JSON
- Validate all external data with Zod schemas
- No prose-only responses from AI models
- Use consistent naming conventions across types

## Contribution Workflow

### 1. Fork and Branch
```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Changes
- Follow the code quality standards above
- Keep commits focused and descriptive
- Reference issue numbers in commit messages

### 3. Test Locally
```bash
# Run development server
yarn dev

# Check for linting issues
yarn lint

# Type check
yarn type-check
```

### 4. Submit Pull Request
- Provide clear description of changes
- Link related issues
- Include before/after screenshots for UI changes
- Request review from maintainers

## Code Style Guide

### TypeScript
```typescript
// ✅ Good: Clear, typed, descriptive
const extractCareerProfile = (resumeText: string): CareerProfile => {
  // Implementation
};

// ❌ Avoid: Unclear, any types, vague naming
const extract = (text: any): any => {
  // Implementation
};
```

### Components
```typescript
// ✅ Good: Functional component with hooks
export const CareerPathCard = ({ path }: { path: CareerPath }) => {
  const [isSelected, setIsSelected] = useState(false);
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

// ❌ Avoid: Class components, inline styles, untyped props
class Card extends React.Component {
  render() {
    return <div style={{ color: 'red' }}>Card</div>;
  }
}
```

### API Routes
```typescript
// ✅ Good: Validated input, typed response, error handling
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = ResumeInputSchema.parse(body);
    
    const result = await processResume(validated);
    
    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Invalid input' },
      { status: 400 }
    );
  }
}

// ❌ Avoid: No validation, untyped, poor error handling
export async function POST(req: Request) {
  const body = await req.json();
  const result = await processResume(body);
  return Response.json(result);
}
```

## File Organization

### New Features
- Create feature in appropriate `src/` subdirectory
- Add types to `src/lib/types/index.ts`
- Add validation schema to `src/lib/api/schemas/` if needed
- Create component in `src/components/`
- Export from `src/components/index.ts`

### API Routes
```
src/app/api/
├── [feature]/
│   └── [action]/
│       └── route.ts
```

Example: `src/app/api/career-paths/generate/route.ts`

## Testing Guidelines

While comprehensive test suite is in the roadmap, test locally:

1. **Functional Testing**
   - Test normal flow in browser
   - Test with sample data
   - Check error handling

2. **Type Safety**
   - Run `yarn type-check`
   - No TypeScript errors

3. **Linting**
   - Run `yarn lint`
   - Fix all linting issues

4. **Mock Data Testing**
   - Test with multiple resume samples
   - Verify API responses match schema

## Commit Message Convention

Follow conventional commits for clarity:

```bash
# Feature
git commit -m "feat: add PDF export functionality"

# Bug fix
git commit -m "fix: resolve skill gap chart rendering issue"

# Documentation
git commit -m "docs: update API specification"

# Code improvement
git commit -m "refactor: extract career path logic into utility"

# Dependencies
git commit -m "chore: upgrade tailwind to latest version"
```

## Before Submitting PR

Checklist:
- [ ] Code follows TypeScript strict mode
- [ ] All components are functional with hooks
- [ ] No hardcoded data
- [ ] Zod schemas validate all external inputs
- [ ] Proper error handling implemented
- [ ] Types are comprehensive (no `any`)
- [ ] No linting errors (`yarn lint`)
- [ ] Type check passes (`yarn type-check`)
- [ ] Tested in browser with mock data
- [ ] Commit messages follow convention
- [ ] PR description explains changes clearly

## Getting Help

- **Architecture questions:** See [Technical Details](./TECHNICAL_DETAILS.md)
- **API integration:** See [API Specification](./API_SPEC.md)
- **Setup issues:** See [Getting Started](./GETTING_STARTED.md)
- **Project status:** See [Development Roadmap](./ROADMAP.md)

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on ideas, not individuals
- Help others learn and grow

Thank you for contributing to NextRole! 🚀
