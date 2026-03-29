import { describe, it, expect } from "vitest";
import { analyzeHalstead } from "../metrics/halstead.js";

describe("analyzeHalstead", () => {
  it("should compute basic Halstead metrics", () => {
    const source = `const x = 1 + 2;`;
    const result = analyzeHalstead(source);

    expect(result.operators.distinct).toBeGreaterThan(0);
    expect(result.operands.distinct).toBeGreaterThan(0);
    expect(result.vocabulary).toBeGreaterThan(0);
    expect(result.length).toBeGreaterThan(0);
    expect(result.volume).toBeGreaterThan(0);
  });

  it("should handle empty source", () => {
    const result = analyzeHalstead("");
    expect(result.volume).toBe(0);
    expect(result.difficulty).toBe(0);
    expect(result.effort).toBe(0);
    expect(result.bugs).toBe(0);
  });

  it("should compute higher volume for more complex code", () => {
    const simple = `const x = 1;`;
    const complex = `function calc(a, b, c) {
  if (a > b) {
    return a * c + b;
  } else {
    return b * c - a;
  }
}`;
    const simpleResult = analyzeHalstead(simple);
    const complexResult = analyzeHalstead(complex);

    expect(complexResult.volume).toBeGreaterThan(simpleResult.volume);
  });
});
