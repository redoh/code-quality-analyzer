import { DuplicateBlock } from "../types.js";

const MIN_DUPLICATE_LINES = 6;

/**
 * Detects duplicate code blocks within a set of files.
 * Uses a line-based fingerprinting approach.
 */
export function analyzeDuplication(
  filePath: string,
  source: string,
  allSources: Map<string, string>,
): DuplicateBlock[] {
  const duplicates: DuplicateBlock[] = [];
  const lines = normalizeLines(source);

  for (const [otherPath, otherSource] of allSources) {
    if (otherPath === filePath) continue;

    const otherLines = normalizeLines(otherSource);
    const found = findDuplicateBlocks(lines, otherLines, filePath, otherPath);
    duplicates.push(...found);
  }

  // Also check for self-duplication
  const selfDuplicates = findSelfDuplication(lines, filePath);
  duplicates.push(...selfDuplicates);

  return duplicates;
}

function normalizeLines(source: string): string[] {
  return source.split("\n").map((line) =>
    line
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\/\/.*$/, "")
  );
}

function findDuplicateBlocks(
  linesA: string[],
  linesB: string[],
  fileA: string,
  fileB: string,
): DuplicateBlock[] {
  const duplicates: DuplicateBlock[] = [];
  const seen = new Set<string>();

  for (let i = 0; i <= linesA.length - MIN_DUPLICATE_LINES; i++) {
    if (isBlankOrTrivial(linesA[i])) continue;

    for (let j = 0; j <= linesB.length - MIN_DUPLICATE_LINES; j++) {
      if (linesA[i] !== linesB[j]) continue;

      let matchLen = 0;
      while (
        i + matchLen < linesA.length &&
        j + matchLen < linesB.length &&
        linesA[i + matchLen] === linesB[j + matchLen]
      ) {
        matchLen++;
      }

      if (matchLen >= MIN_DUPLICATE_LINES) {
        const key = `${i}:${j}:${matchLen}`;
        if (!seen.has(key)) {
          seen.add(key);
          duplicates.push({
            lines: [i + 1, i + matchLen],
            matchedIn: fileB,
            matchedLines: [j + 1, j + matchLen],
            fragment: linesA.slice(i, i + matchLen).join("\n"),
          });
        }
        i += matchLen - 1;
        break;
      }
    }
  }

  return duplicates;
}

function findSelfDuplication(lines: string[], filePath: string): DuplicateBlock[] {
  const duplicates: DuplicateBlock[] = [];
  const seen = new Set<string>();

  for (let i = 0; i <= lines.length - MIN_DUPLICATE_LINES; i++) {
    if (isBlankOrTrivial(lines[i])) continue;

    for (let j = i + MIN_DUPLICATE_LINES; j <= lines.length - MIN_DUPLICATE_LINES; j++) {
      if (lines[i] !== lines[j]) continue;

      let matchLen = 0;
      while (
        i + matchLen < j &&
        j + matchLen < lines.length &&
        lines[i + matchLen] === lines[j + matchLen]
      ) {
        matchLen++;
      }

      if (matchLen >= MIN_DUPLICATE_LINES) {
        const key = `${i}:${j}:${matchLen}`;
        if (!seen.has(key)) {
          seen.add(key);
          duplicates.push({
            lines: [i + 1, i + matchLen],
            matchedIn: filePath,
            matchedLines: [j + 1, j + matchLen],
            fragment: lines.slice(i, i + matchLen).join("\n"),
          });
        }
      }
    }
  }

  return duplicates;
}

function isBlankOrTrivial(line: string): boolean {
  return line === "" || line === "{" || line === "}" || line === ");";
}
