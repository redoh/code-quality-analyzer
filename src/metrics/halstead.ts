import { HalsteadMetrics } from "../types.js";
import { tokenize, isOperator, round } from "../utils.js";

export function analyzeHalstead(source: string): HalsteadMetrics {
  const tokens = tokenize(source);

  const operators = new Map<string, number>();
  const operands = new Map<string, number>();

  for (const token of tokens) {
    if (isOperator(token)) {
      operators.set(token, (operators.get(token) || 0) + 1);
    } else {
      operands.set(token, (operands.get(token) || 0) + 1);
    }
  }

  const n1 = operators.size; // distinct operators
  const n2 = operands.size; // distinct operands
  const N1 = Array.from(operators.values()).reduce((a, b) => a + b, 0); // total operators
  const N2 = Array.from(operands.values()).reduce((a, b) => a + b, 0); // total operands

  const vocabulary = n1 + n2;
  const length = N1 + N2;
  const volume = length > 0 && vocabulary > 0 ? length * Math.log2(vocabulary) : 0;
  const difficulty = n2 > 0 ? (n1 / 2) * (N2 / n2) : 0;
  const effort = volume * difficulty;
  const time = effort / 18; // seconds (Halstead's empirical constant)
  const bugs = volume / 3000; // estimated bugs (Halstead's formula)

  return {
    operators: { distinct: n1, total: N1 },
    operands: { distinct: n2, total: N2 },
    vocabulary: round(vocabulary),
    length: round(length),
    volume: round(volume),
    difficulty: round(difficulty),
    effort: round(effort),
    bugs: round(bugs, 3),
    time: round(time),
  };
}
