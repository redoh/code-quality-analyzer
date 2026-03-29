import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import * as path from "node:path";

const CLI = path.resolve("src/index.ts");
const FIXTURE_DIR = path.resolve("src/__tests__/fixtures");
const FIXTURE_FILE = path.resolve("src/__tests__/fixtures/sample.ts");

function run(args: string): { stdout: string; exitCode: number } {
  try {
    const stdout = execSync(`npx tsx ${CLI} ${args}`, {
      encoding: "utf-8",
      env: { ...process.env, NO_COLOR: "1" },
    });
    return { stdout, exitCode: 0 };
  } catch (error) {
    const err = error as { stdout: string; status: number };
    return { stdout: err.stdout || "", exitCode: err.status };
  }
}

describe("CLI integration", () => {
  it("should analyze a single file with table output", () => {
    const { stdout, exitCode } = run(`analyze ${FIXTURE_FILE}`);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("Code Quality Analyzer");
    expect(stdout).toContain("Files Analyzed");
    expect(stdout).toContain("1");
    expect(stdout).toContain("Quality Grade");
  });

  it("should analyze a directory", () => {
    const { stdout, exitCode } = run(`analyze ${FIXTURE_DIR}`);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("Code Quality Analyzer");
  });

  it("should output valid JSON with --format json", () => {
    const { stdout, exitCode } = run(`analyze ${FIXTURE_FILE} --format json`);
    expect(exitCode).toBe(0);
    const result = JSON.parse(stdout);
    expect(result).toHaveProperty("files");
    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("timestamp");
    expect(result.files).toHaveLength(1);
    expect(result.summary.totalFiles).toBe(1);
  });

  it("should include all metrics in JSON output", () => {
    const { stdout } = run(`analyze ${FIXTURE_FILE} --format json`);
    const result = JSON.parse(stdout);
    const file = result.files[0];

    expect(file).toHaveProperty("loc");
    expect(file.loc).toHaveProperty("total");
    expect(file.loc).toHaveProperty("source");
    expect(file.loc).toHaveProperty("comment");
    expect(file.loc).toHaveProperty("blank");

    expect(file).toHaveProperty("functions");
    expect(file.functions.length).toBeGreaterThan(0);
    expect(file.functions[0]).toHaveProperty("name");
    expect(file.functions[0]).toHaveProperty("complexity");

    expect(file).toHaveProperty("halstead");
    expect(file.halstead).toHaveProperty("volume");
    expect(file.halstead).toHaveProperty("difficulty");
    expect(file.halstead).toHaveProperty("bugs");

    expect(file).toHaveProperty("maintainabilityIndex");
    expect(file).toHaveProperty("coupling");
    expect(file.coupling).toHaveProperty("imports");
    expect(file.coupling).toHaveProperty("instability");
  });

  it("should exit with code 0 when score is above threshold", () => {
    const { exitCode } = run(`analyze ${FIXTURE_FILE} --threshold 1`);
    expect(exitCode).toBe(0);
  });

  it("should exit with code 1 when score is below threshold", () => {
    const { exitCode } = run(`analyze ${FIXTURE_FILE} --threshold 99`);
    expect(exitCode).toBe(1);
  });

  it("should exit with code 1 for non-existent path", () => {
    const { exitCode } = run("analyze /nonexistent/path");
    expect(exitCode).toBe(1);
  });

  it("should respect --extensions filter", () => {
    const { exitCode } = run(`analyze ${FIXTURE_DIR} --extensions .xyz`);
    // No .xyz files exist, should error
    expect(exitCode).toBe(1);
  });

  it("should detect functions in fixture file", () => {
    const { stdout } = run(`analyze ${FIXTURE_FILE} --format json`);
    const result = JSON.parse(stdout);
    const functionNames = result.files[0].functions.map((f: { name: string }) => f.name);
    expect(functionNames).toContain("loadConfig");
    expect(functionNames).toContain("validateConfig");
    expect(functionNames).toContain("processItems");
  });

  it("should compute reasonable metrics for fixture", () => {
    const { stdout } = run(`analyze ${FIXTURE_FILE} --format json`);
    const result = JSON.parse(stdout);
    const summary = result.summary;

    expect(summary.score).toBeGreaterThan(0);
    expect(summary.score).toBeLessThanOrEqual(100);
    expect(summary.averageComplexity).toBeGreaterThan(0);
    expect(summary.averageMaintainability).toBeGreaterThan(0);
    expect(summary.grade).toMatch(/^[ABCDF]$/);
  });
});
