import { QualityGrade } from "./types.js";

export function getGrade(score: number): QualityGrade {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  if (score >= 25) return "D";
  return "F";
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function tokenize(code: string): string[] {
  return code
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(['"`])(?:(?!\1|\\).|\\.)*\1/g, "STRING")
    .match(/[a-zA-Z_$][\w$]*|\d+\.?\d*|[^\s\w]/g) || [];
}

export function stripComments(code: string): string {
  return code
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

const JS_OPERATORS = new Set([
  "+", "-", "*", "/", "%", "**",
  "=", "+=", "-=", "*=", "/=", "%=",
  "==", "!=", "===", "!==", ">", "<", ">=", "<=",
  "&&", "||", "!", "??",
  "&", "|", "^", "~", "<<", ">>", ">>>",
  "?", ":", ".",
  "++", "--",
  "=>",
  "if", "else", "for", "while", "do", "switch", "case",
  "break", "continue", "return", "throw", "try", "catch", "finally",
  "new", "delete", "typeof", "instanceof", "void", "in", "of",
  "function", "class", "const", "let", "var",
  "import", "export", "default", "from",
  "async", "await", "yield",
]);

export function isOperator(token: string): boolean {
  return JS_OPERATORS.has(token) || /^[^\w\s]$/.test(token);
}
