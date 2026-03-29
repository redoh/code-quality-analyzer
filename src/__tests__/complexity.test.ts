import { describe, it, expect } from "vitest";
import { analyzeComplexity } from "../metrics/complexity.js";

describe("analyzeComplexity", () => {
  it("should detect simple functions with complexity 1", () => {
    const source = `function hello() {
  return "world";
}`;
    const result = analyzeComplexity(source);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("hello");
    expect(result[0].complexity).toBe(1);
  });

  it("should count if statements", () => {
    const source = `function check(x) {
  if (x > 0) {
    return "positive";
  } else if (x < 0) {
    return "negative";
  } else {
    return "zero";
  }
}`;
    const result = analyzeComplexity(source);
    expect(result).toHaveLength(1);
    expect(result[0].complexity).toBeGreaterThan(1);
  });

  it("should count loops and logical operators", () => {
    const source = `function process(items) {
  for (const item of items) {
    if (item.active && item.valid) {
      while (item.pending) {
        item.next();
      }
    }
  }
}`;
    const result = analyzeComplexity(source);
    expect(result).toHaveLength(1);
    expect(result[0].complexity).toBeGreaterThanOrEqual(4);
  });

  it("should detect arrow functions", () => {
    const source = `const add = (a, b) => {
  return a + b;
}`;
    const result = analyzeComplexity(source);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("add");
    expect(result[0].params).toBe(2);
  });

  it("should return empty array for source without functions", () => {
    const source = `const x = 1;\nconst y = 2;`;
    const result = analyzeComplexity(source);
    expect(result).toHaveLength(0);
  });
});
