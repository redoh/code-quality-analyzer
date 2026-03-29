import { LocMetrics } from "../types.js";

export function analyzeLoc(source: string): LocMetrics {
  const lines = source.split("\n");
  const total = lines.length;
  let blank = 0;
  let comment = 0;
  let source_lines = 0;
  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      blank++;
      continue;
    }

    if (inBlockComment) {
      comment++;
      if (trimmed.includes("*/")) {
        inBlockComment = false;
      }
      continue;
    }

    if (trimmed.startsWith("/*")) {
      comment++;
      if (!trimmed.includes("*/")) {
        inBlockComment = true;
      }
      continue;
    }

    if (trimmed.startsWith("//")) {
      comment++;
      continue;
    }

    source_lines++;
  }

  return {
    total,
    source: source_lines,
    comment,
    blank,
  };
}
