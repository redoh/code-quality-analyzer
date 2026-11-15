import { describe, expect, it } from "vitest";
import { getGrade } from "../utils.js";

describe("quality grade boundaries", () => {
  it.each([
    [0, "F"],
    [24.99, "F"],
    [25, "D"],
    [49.99, "D"],
    [50, "C"],
    [69.99, "C"],
    [70, "B"],
    [84.99, "B"],
    [85, "A"],
    [100, "A"],
  ] as const)("maps score %s to grade %s", (score, grade) => {
    expect(getGrade(score)).toBe(grade);
  });
});
