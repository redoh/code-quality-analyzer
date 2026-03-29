# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-29

### Added

- CLI tool with `cqa analyze <path>` command
- Lines of Code (LOC) analysis: total, source, comment, blank
- Cyclomatic complexity per function
- Halstead complexity measures: volume, difficulty, effort, estimated bugs
- Maintainability Index normalized to 0-100
- Code duplication detection via line fingerprinting
- Dependency coupling analysis: afferent, efferent, instability
- Overall quality scoring with A-F grading
- Table output with colored terminal display
- JSON output for tooling integration
- Threshold enforcement with exit code 1 for CI pipelines
- Configurable file extensions and exclude patterns
- Unit tests for all metric modules
- Integration tests for CLI behavior and exit codes
- CI workflow with lint, typecheck, test, and build
- Release workflow with npm publish and GitHub releases
