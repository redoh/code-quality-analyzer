import { describe, it, expect } from "vitest";
import { analyzeLoc } from "../metrics/loc.js";

describe("analyzeLoc", () => {
  it("should count lines correctly", () => {
    const source = `// This is a comment
const x = 1;
const y = 2;

/* Block
   comment */

function hello() {
  return "world";
}
`;
    const result = analyzeLoc(source);
    expect(result.total).toBe(11);
    expect(result.comment).toBe(3);
    expect(result.blank).toBe(3);
    expect(result.source).toBe(5);
  });

  it("should handle empty source", () => {
    const result = analyzeLoc("");
    expect(result.total).toBe(1);
    expect(result.blank).toBe(1);
    expect(result.source).toBe(0);
    expect(result.comment).toBe(0);
  });

  it("should handle source with only comments", () => {
    const source = `// comment 1
// comment 2
/* block */`;
    const result = analyzeLoc(source);
    expect(result.comment).toBe(3);
    expect(result.source).toBe(0);
  });
});
