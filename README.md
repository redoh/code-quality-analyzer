# Code Quality Analyzer

> CLI tool that analyzes code quality by computing industry-standard software metrics.

[![CI](https://github.com/redoh/code-quality-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/redoh/code-quality-analyzer/actions/workflows/ci.yml)

## Features

- **Lines of Code (LOC)** - Total, source, comment, and blank line counts
- **Cyclomatic Complexity** - Control flow complexity per function
- **Halstead Metrics** - Operator/operand based complexity (volume, difficulty, effort, estimated bugs)
- **Maintainability Index** - Composite score normalized to 0-100
- **Code Duplication** - Duplicate block detection via line fingerprinting
- **Dependency Coupling** - Import analysis with afferent/efferent coupling and instability ratio
- **Quality Grading** - Overall A-F grade with weighted scoring
- **Threshold Enforcement** - Exit code 1 when score falls below a threshold (CI-friendly)

## Installation

```bash
# From source
git clone https://github.com/redoh/code-quality-analyzer.git
cd code-quality-analyzer
npm install
npm run build

# Link globally (optional)
npm link
```

## Usage

### Analyze a directory (table output)

```bash
cqa analyze src/
```

Output:

```
  Code Quality Analyzer
  ────────────────────────────────

  Summary
┌──────────────────────────────┬─────────────────────────┐
│ Metric                       │ Value                   │
├──────────────────────────────┼─────────────────────────┤
│ Files Analyzed               │ 17                      │
│ Total Lines                  │ 1345                    │
│ Source Lines                 │ 1101                    │
│ Avg Complexity               │ 3.95                    │
│ Avg Maintainability          │ 40.14                   │
│ Duplicate Blocks             │ 3                       │
│ Overall Score                │ 60.34                   │
└──────────────────────────────┴─────────────────────────┘

  Quality Grade:  C  (60.34/100)
```

### Analyze a single file

```bash
cqa analyze src/analyzer.ts
```

### JSON output

```bash
cqa analyze src/ --format json
```

Returns a structured JSON object with all metrics per file and project summary — useful for dashboards and custom tooling.

### Threshold enforcement

```bash
cqa analyze src/ --threshold 70
```

Exits with code **1** if the overall quality score is below the given threshold. Ideal for CI pipelines.

### Custom file extensions

```bash
cqa analyze . --extensions .ts,.js,.tsx,.jsx
```

### Exclude directories

```bash
cqa analyze . --exclude test,fixtures
```

## CLI Reference

```
cqa analyze <path> [options]

Arguments:
  path                         File or directory to analyze

Options:
  -f, --format <format>        Output format: table or json (default: "table")
  -t, --threshold <number>     Minimum quality score 0-100 (default: "0")
  -e, --extensions <exts>      File extensions, comma-separated (default: ".ts,.js,.tsx,.jsx")
  --exclude <dirs>             Additional directories to exclude, comma-separated
  -V, --version                Output the version number
  -h, --help                   Display help
```

## Metrics Explained

| Metric | Description | Good | Warning | Bad |
|--------|-------------|------|---------|-----|
| Cyclomatic Complexity | Number of independent paths through a function | 1-5 | 6-10 | >10 |
| Maintainability Index | Composite of Halstead volume, complexity, and LOC | 85-100 | 65-84 | <65 |
| Halstead Volume | Information content based on operators and operands | Low | Medium | High |
| Code Duplication | Number of duplicated blocks (6+ lines) | 0 | 1-3 | >3 |
| Instability | Efferent / (Afferent + Efferent) coupling ratio | 0-0.3 | 0.3-0.7 | >0.7 |
| Overall Score | Weighted: 50% MI + 30% complexity + 20% duplication | 85-100 (A) | 50-84 (B/C) | <50 (D/F) |

## CI Integration

### GitHub Actions

```yaml
- name: Code Quality Check
  run: npx cqa analyze src/ --threshold 60
```

Full workflow example:

```yaml
name: Quality Gate
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
      - name: Quality gate
        run: node dist/index.js analyze src/ --threshold 60
```

## Development

```bash
npm install          # Install dependencies
npm run dev          # Run in dev mode (tsx)
npm run build        # Build with tsup
npm test             # Run tests
npm run test:coverage # Run tests with coverage
npm run lint         # Lint with ESLint
npm run typecheck    # Type check with tsc
npm run format       # Format with Prettier
npm run format:check # Check formatting
npm run ci           # Run full CI pipeline locally
```

## Architecture

```
src/
  index.ts              CLI entry point (Commander.js)
  analyzer.ts           Main orchestrator
  types.ts              Shared type definitions
  utils.ts              Utility functions
  metrics/
    loc.ts              Lines of code analysis
    complexity.ts       Cyclomatic complexity per function
    halstead.ts         Halstead complexity measures
    maintainability.ts  Maintainability index calculation
    duplication.ts      Code duplication detection
    coupling.ts         Dependency coupling analysis
  reporters/
    console.ts          Colored table output (Chalk + cli-table3)
    json.ts             JSON output
  __tests__/            Unit tests (Vitest)
```

## Author

[@redoh](https://github.com/redoh)
