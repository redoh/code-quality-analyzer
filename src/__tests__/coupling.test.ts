import { describe, it, expect } from "vitest";
import { analyzeCoupling } from "../metrics/coupling.js";

describe("analyzeCoupling", () => {
  it("should detect ES imports", () => {
    const source = `import { foo } from "./foo";
import bar from "bar";
import * as path from "path";`;

    const result = analyzeCoupling("test.ts", source, new Map());
    expect(result.imports).toHaveLength(3);
    expect(result.imports[0].isRelative).toBe(true);
    expect(result.imports[1].isRelative).toBe(false);
    expect(result.efferentCoupling).toBe(3);
  });

  it("should detect require calls", () => {
    const source = `const fs = require("fs");
const utils = require("./utils");`;

    const result = analyzeCoupling("test.js", source, new Map());
    expect(result.imports).toHaveLength(2);
    expect(result.efferentCoupling).toBe(2);
  });

  it("should compute instability", () => {
    const source = `import { a } from "./a";
import { b } from "./b";`;

    const otherSource = `import { test } from "./test";`;
    const allSources = new Map([
      ["test.ts", source],
      ["other.ts", otherSource],
    ]);

    const result = analyzeCoupling("test.ts", source, allSources);
    expect(result.efferentCoupling).toBe(2);
    expect(result.instability).toBeGreaterThan(0);
  });

  it("should return 0 instability for no dependencies", () => {
    const source = `const x = 1;`;
    const result = analyzeCoupling("test.ts", source, new Map());
    expect(result.instability).toBe(0);
  });
});
