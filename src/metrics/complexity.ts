import { FunctionMetrics } from "../types.js";
import { stripComments } from "../utils.js";

interface FunctionBlock {
  name: string;
  startLine: number;
  body: string;
  params: number;
  loc: number;
}

export function analyzeComplexity(source: string): FunctionMetrics[] {
  const functions = extractFunctions(source);
  return functions.map((fn) => ({
    name: fn.name,
    line: fn.startLine,
    complexity: computeCyclomaticComplexity(fn.body),
    loc: fn.loc,
    params: fn.params,
  }));
}

function extractFunctions(source: string): FunctionBlock[] {
  const functions: FunctionBlock[] = [];
  const lines = source.split("\n");
  const cleaned = stripComments(source);
  const cleanedLines = cleaned.split("\n");

  const functionPatterns = [
    // function declarations: function name(...)
    /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/,
    // method definitions: name(...) { or async name(...)
    /(?:(?:public|private|protected|static|async|get|set)\s+)*(\w+)\s*\(([^)]*)\)\s*(?::\s*\S+\s*)?{/,
    // arrow functions assigned to const/let/var: const name = (...) =>
    /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\(([^)]*)\)|(\w+))\s*=>/,
  ];

  for (let i = 0; i < cleanedLines.length; i++) {
    const line = cleanedLines[i];

    for (const pattern of functionPatterns) {
      const match = line.match(pattern);
      if (match) {
        const name = match[1];
        if (isKeyword(name)) continue;

        const params = match[2] || match[3] || "";
        const paramCount = params.trim() === "" ? 0 : params.split(",").length;

        const bodyEnd = findBlockEnd(cleanedLines, i);
        const body = cleanedLines.slice(i, bodyEnd + 1).join("\n");
        const loc = bodyEnd - i + 1;

        functions.push({
          name,
          startLine: i + 1,
          body,
          params: paramCount,
          loc,
        });
        break;
      }
    }
  }

  return functions;
}

function findBlockEnd(lines: string[], startLine: number): number {
  let braceCount = 0;
  let started = false;

  for (let i = startLine; i < lines.length; i++) {
    for (const char of lines[i]) {
      if (char === "{") {
        braceCount++;
        started = true;
      } else if (char === "}") {
        braceCount--;
        if (started && braceCount === 0) {
          return i;
        }
      }
    }
  }

  return Math.min(startLine + 20, lines.length - 1);
}

function computeCyclomaticComplexity(body: string): number {
  const cleaned = stripComments(body);

  let complexity = 1;

  // Decision points
  const patterns = [
    /\bif\b/g,
    /\belse\s+if\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bcase\b/g,
    /\bcatch\b/g,
    /\b\?\?/g,
    /\?\./g,
    /&&/g,
    /\|\|/g,
    /\?\s*[^.:]/g, // ternary (approximate)
  ];

  for (const pattern of patterns) {
    const matches = cleaned.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  }

  // Subtract double-counted `else if` (counted in both `if` and `else if`)
  const elseIfMatches = cleaned.match(/\belse\s+if\b/g);
  if (elseIfMatches) {
    complexity -= elseIfMatches.length;
  }

  return complexity;
}

function isKeyword(name: string): boolean {
  const keywords = new Set([
    "if", "else", "for", "while", "do", "switch", "case",
    "break", "continue", "return", "throw", "try", "catch",
    "finally", "new", "delete", "typeof", "instanceof",
    "import", "export", "default", "from", "class", "extends",
    "super", "this", "void", "with", "debugger",
  ]);
  return keywords.has(name);
}
