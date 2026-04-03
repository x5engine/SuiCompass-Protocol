# Contributing to SuiCompass
**Thank you for your interest in contributing!**

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Pull Request Process](#pull-request-process)
6. [Bug Reports](#bug-reports)
7. [Feature Requests](#feature-requests)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

---

## Getting Started

### 1. Fork the Repository

```bash
# Click "Fork" on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/SuiCompass-Protocol.git
cd SuiCompass-Protocol
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your API keys

# Start development server
npm run dev
```

### 3. Create a Branch

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Or bug fix branch
git checkout -b fix/bug-description
```

**Branch Naming Convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

---

## Development Workflow

### 1. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 2. Test Your Changes

```bash
# Run the app locally
npm run dev

# Build to verify
npm run build

# Test in browser
- Connect wallet
- Test your changes thoroughly
- Check for console errors
```

### 3. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>: <description>

git commit -m "feat: add social trading leaderboard sorting"
git commit -m "fix: correct bridge fee calculation"
git commit -m "docs: update API documentation"
git commit -m "refactor: simplify error handling logic"
```

**Commit Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting, no logic change)
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `test:` - Adding tests
- `chore:` - Maintenance

### 4. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request

Go to GitHub and create a Pull Request from your fork to the main repository.

---

## Coding Standards

### TypeScript

**✅ DO:**
```typescript
// Use explicit types
function calculateReward(amount: number): number {
  return amount * 0.05;
}

// Use interfaces for objects
interface User {
  address: string;
  balance: number;
}

// Use type guards
if (typeof value === 'string') {
  // ...
}
```

**❌ DON'T:**
```typescript
// Avoid 'any' type
function process(data: any) { }  // Bad

// Avoid implicit any
function calculate(value) { }  // Bad
```

---

### React Components

**✅ DO:**
```typescript
// Use functional components
function MyComponent({ title }: { title: string }) {
  return <div>{title}</div>;
}

// Destructure props
function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// Use hooks properly
function useCustomHook() {
  const [state, setState] = useState(0);
  return { state, setState };
}
```

**❌ DON'T:**
```typescript
// Avoid class components (unless necessary)
class MyComponent extends React.Component { }  // Avoid

// Don't inline complex logic in JSX
<div>
  {data.map(x => x.items.filter(y => y.active).map(z => <Item key={z.id} {...z} />))}
</div>  // Bad - extract to variable/function
```

---

### File Organization

```
src/
├── components/
│   └── MyComponent/
│       ├── MyComponent.tsx      # Main component
│       ├── MyComponent.test.tsx # Tests (future)
│       └── index.ts             # Re-export
```

**Naming:**
- Components: `PascalCase` (e.g., `UserProfile.tsx`)
- Utilities: `camelCase` (e.g., `formatAmount.ts`)
- Hooks: `useCamelCase` (e.g., `useWallet.ts`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_AMOUNT`)

---

### Code Style

**Formatting:**
- Indentation: 2 spaces
- Max line length: 100 characters (soft limit)
- Semicolons: Yes
- Quotes: Single quotes for strings
- Trailing commas: Yes

**Example:**
```typescript
import { useState, useEffect } from 'react';

interface Props {
  amount: number;
  onComplete: () => void;
}

export function StakeForm({ amount, onComplete }: Props) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Effect logic
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await performStake(amount);
      onComplete();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  );
}
```

---

### Error Handling

**✅ DO:**
```typescript
import { useErrorHandler } from './hooks/useErrorHandler';

function MyComponent() {
  const { handleError, handleSuccess } = useErrorHandler();

  const performAction = async () => {
    try {
      await riskyOperation();
      handleSuccess('Success!');
    } catch (error) {
      handleError(error, 'MyComponent');
    }
  };
}
```

**❌ DON'T:**
```typescript
// Don't silently catch errors
try {
  await action();
} catch (e) { }  // Bad - at least log it

// Don't use alert()
alert('Error occurred');  // Bad - use toast notifications
```

---

### Performance

**✅ DO:**
```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);

// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Use callback for event handlers
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);
```

---

## Pull Request Process

### PR Checklist

Before submitting, ensure:

- [ ] Code follows style guidelines
- [ ] No console.log() left in code (except intentional logging)
- [ ] No TypeScript errors (`npm run build` succeeds)
- [ ] Changes are tested locally
- [ ] Documentation is updated (if needed)
- [ ] Commit messages follow convention
- [ ] PR title is descriptive

### PR Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Changes tested locally
- [ ] Documentation updated
```

### Review Process

1. **Automatic Checks**
   - Build must succeed
   - TypeScript must compile

2. **Code Review**
   - Maintainer will review code
   - May request changes
   - Discussion happens in PR comments

3. **Approval & Merge**
   - Once approved, maintainer will merge
   - Branch will be deleted automatically

---

## Bug Reports

### How to Report a Bug

1. **Search Existing Issues**
   - Check if bug is already reported
   - Add comment if you have additional info

2. **Create New Issue**
   - Use "Bug Report" template
   - Provide detailed information

### Bug Report Template

```markdown
**Describe the Bug**
Clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- Browser: [e.g., Chrome 120]
- Wallet: [e.g., Sui Wallet 1.0.0]
- Network: [testnet/mainnet]

**Additional Context**
Any other relevant information.
```

---

## Feature Requests

### How to Request a Feature

1. **Check Roadmap**
   - See if feature is already planned
   - Check existing feature requests

2. **Create New Issue**
   - Use "Feature Request" template
   - Explain use case clearly

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other information or mockups.
```

---

## Areas We Need Help

### Priority Areas

1. **Testing**
   - Unit tests for components
   - Integration tests
   - E2E test scenarios

2. **Documentation**
   - API examples
   - Tutorial content
   - Video guides

3. **UI/UX**
   - Accessibility improvements
   - Mobile responsiveness
   - Animation/transitions

4. **Features**
   - See open issues labeled "help wanted"
   - New contract integrations
   - Performance optimizations

---

## Development Tips

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# CLI
npm run cli              # Run SuiCompass CLI

# Git
git status               # Check status
git diff                 # See changes
git log --oneline        # See commits
```

### Debugging

```typescript
// Use React DevTools
// Chrome extension: React Developer Tools

// Use performance monitoring
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';

function MyComponent() {
  const { renderCount } = usePerformanceMonitor('MyComponent');
  // Check render count in development
}
```

### Common Pitfalls

1. **Forgetting to handle errors**
   - Always use try/catch or error handlers

2. **Not validating inputs**
   - Use validation utilities

3. **Hardcoding values**
   - Use constants from `src/lib/constants.ts`

4. **Memory leaks**
   - Clean up useEffect subscriptions
   - Cancel pending requests on unmount

---

## Getting Help

### Where to Ask Questions

- **GitHub Discussions:** General questions
- **GitHub Issues:** Bug reports, feature requests
- **Discord/Telegram:** Real-time chat (if available)

### Response Time

- Bug reports: Within 48 hours
- Feature requests: Within 1 week
- Pull requests: Within 1 week

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Eligible for contributor NFT (future)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to SuiCompass! 🙏**

---

**Last Updated:** March 22, 2026
