# Contributing to Code Quality Analyzer

Thank you for considering contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/redoh/code-quality-analyzer.git
cd code-quality-analyzer
npm install
```

## Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run the full check: `npm run ci`
5. Commit with a descriptive message
6. Push and open a pull request

## Before Submitting

Ensure all checks pass locally:

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm test            # Vitest
npm run build       # tsup
npm run format:check # Prettier
```

Or run everything at once:

```bash
npm run ci
```

## Coding Standards

- **TypeScript**: Strict mode, no `any`
- **Style**: Prettier with project config
- **Lint**: ESLint with typescript-eslint
- **Tests**: Vitest, colocated in `__tests__/` directories
- **Commits**: Use conventional commit prefixes (`feat:`, `fix:`, `docs:`, `test:`, `chore:`)

## Adding a New Metric

1. Create `src/metrics/<name>.ts` with a single exported `analyze` function
2. Define types in `src/types.ts`
3. Wire it into `src/analyzer.ts`
4. Add console output in `src/reporters/console.ts`
5. Include in JSON output via `src/reporters/json.ts` (automatic if added to `FileAnalysis`)
6. Write unit tests in `src/__tests__/<name>.test.ts`
7. Update `CLAUDE.md` and `README.md`

## Reporting Issues

- Use the bug report template for bugs
- Use the feature request template for new ideas
- Include reproduction steps when possible

## Code of Conduct

Be respectful, constructive, and welcoming. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).
