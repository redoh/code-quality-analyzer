# Code Quality Analyzer

## Project Overview
A CLI tool that analyzes code quality by computing industry-standard software metrics. Built with TypeScript and Node.js.

## Tech Stack
- **Language:** TypeScript
- **Runtime:** Node.js
- **Build:** tsup (bundler)
- **Testing:** Vitest
- **CLI Framework:** Commander.js
- **Output:** Chalk for colored terminal output, cli-table3 for tables

## Architecture
```
src/
  index.ts          - CLI entry point
  analyzer.ts       - Main orchestrator
  metrics/
    loc.ts          - Lines of code metrics
    complexity.ts   - Cyclomatic complexity
    halstead.ts     - Halstead complexity measures
    maintainability.ts - Maintainability index
    duplication.ts  - Code duplication detection
    coupling.ts     - Dependency/coupling analysis
  parsers/
    typescript.ts   - TypeScript/JavaScript parser
  reporters/
    console.ts      - Console output reporter
    json.ts         - JSON output reporter
  types.ts          - Shared type definitions
  utils.ts          - Utility functions
```

## Commands
```bash
# Development
npm run build       # Build the project
npm run dev         # Run in dev mode
npm test            # Run tests
npm run lint        # Run linter

# Usage
cqa analyze <path>  # Analyze a file or directory
cqa analyze . --format json  # JSON output
cqa analyze . --threshold 50 # Fail if score < threshold
```

## Key Metrics
1. **LOC** - Lines of code (total, source, comment, blank)
2. **Cyclomatic Complexity** - Control flow complexity per function
3. **Halstead Metrics** - Operator/operand based complexity
4. **Maintainability Index** - Composite score (0-100)
5. **Code Duplication** - Duplicate code block detection
6. **Dependency Coupling** - Import/require analysis

## Coding Conventions
- Use strict TypeScript (no `any`)
- Functional style where possible
- All metrics modules export a single analyze function
- Tests colocated in `__tests__` directories
