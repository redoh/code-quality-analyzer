import { describe, it, expect } from "vitest";
import { computeMaintainabilityIndex } from "../metrics/maintainability.js";

describe("computeMaintainabilityIndex", () => {
  it("should return 100 for empty files", () => {
    expect(computeMaintainabilityIndex(0, 0, 0)).toBe(100);
  });

  it("should return high MI for simple code", () => {
    const mi = computeMaintainabilityIndex(50, 1, 5);
    expect(mi).toBeGreaterThan(70);
  });

  it("should return lower MI for complex code", () => {
    const simple = computeMaintainabilityIndex(50, 1, 10);
    const complex = computeMaintainabilityIndex(500, 15, 200);
    expect(complex).toBeLessThan(simple);
  });

  it("should be between 0 and 100", () => {
    const mi = computeMaintainabilityIndex(10000, 50, 5000);
    expect(mi).toBeGreaterThanOrEqual(0);
    expect(mi).toBeLessThanOrEqual(100);
  });
});
