import chalk from "chalk";
import Table from "cli-table3";
import { ProjectAnalysis, QualityGrade } from "../types.js";

export function reportToConsole(analysis: ProjectAnalysis): void {
  printHeader();
  printSummary(analysis);
  printFileDetails(analysis);
  printGrade(analysis);
}

function printHeader(): void {
  console.log();
  console.log(chalk.bold.cyan("  Code Quality Analyzer"));
  console.log(chalk.gray("  ─".repeat(30)));
  console.log();
}

function printSummary(analysis: ProjectAnalysis): void {
  const { summary } = analysis;

  const summaryTable = new Table({
    head: [chalk.white("Metric"), chalk.white("Value")],
    style: { head: [], border: [] },
    colWidths: [30, 25],
  });

  summaryTable.push(
    ["Files Analyzed", String(summary.totalFiles)],
    ["Total Lines", String(summary.totalLoc.total)],
    ["Source Lines", String(summary.totalLoc.source)],
    ["Comment Lines", String(summary.totalLoc.comment)],
    ["Blank Lines", String(summary.totalLoc.blank)],
    [
      "Comment Ratio",
      summary.totalLoc.source > 0
        ? `${Math.round((summary.totalLoc.comment / summary.totalLoc.source) * 100)}%`
        : "N/A",
    ],
    ["Avg Complexity", colorComplexity(summary.averageComplexity)],
    [
      "Max Complexity",
      `${colorComplexity(summary.maxComplexity.value)} ${chalk.gray(`(${summary.maxComplexity.function} in ${shortPath(summary.maxComplexity.file)})`)}`,
    ],
    ["Avg Maintainability", colorMaintainability(summary.averageMaintainability)],
    ["Duplicate Blocks", colorDuplicates(summary.totalDuplicates)],
    ["Overall Score", colorScore(summary.score)],
  );

  console.log(chalk.bold("  Summary"));
  console.log(summaryTable.toString());
  console.log();
}

function printFileDetails(analysis: ProjectAnalysis): void {
  const fileTable = new Table({
    head: [
      chalk.white("File"),
      chalk.white("LOC"),
      chalk.white("Funcs"),
      chalk.white("Avg Cx"),
      chalk.white("Max Cx"),
      chalk.white("MI"),
      chalk.white("Deps"),
      chalk.white("Dups"),
    ],
    style: { head: [], border: [] },
    colWidths: [35, 8, 8, 9, 9, 8, 8, 8],
  });

  const sorted = [...analysis.files].sort(
    (a, b) => a.maintainabilityIndex - b.maintainabilityIndex,
  );

  for (const file of sorted) {
    fileTable.push([
      shortPath(file.filePath),
      String(file.loc.source),
      String(file.functions.length),
      colorComplexity(file.averageComplexity),
      colorComplexity(file.maxComplexity),
      colorMaintainability(file.maintainabilityIndex),
      String(file.coupling.efferentCoupling),
      colorDuplicates(file.duplicates.length),
    ]);
  }

  console.log(chalk.bold("  File Details") + chalk.gray(" (sorted by maintainability, ascending)"));
  console.log(fileTable.toString());
  console.log();

  // Print complex functions
  printComplexFunctions(analysis);
}

function printComplexFunctions(analysis: ProjectAnalysis): void {
  const complexFunctions: Array<{
    file: string;
    name: string;
    line: number;
    complexity: number;
    loc: number;
  }> = [];

  for (const file of analysis.files) {
    for (const fn of file.functions) {
      if (fn.complexity > 5) {
        complexFunctions.push({
          file: file.filePath,
          name: fn.name,
          line: fn.line,
          complexity: fn.complexity,
          loc: fn.loc,
        });
      }
    }
  }

  if (complexFunctions.length === 0) return;

  complexFunctions.sort((a, b) => b.complexity - a.complexity);

  const table = new Table({
    head: [
      chalk.white("Function"),
      chalk.white("File"),
      chalk.white("Line"),
      chalk.white("Complexity"),
      chalk.white("LOC"),
    ],
    style: { head: [], border: [] },
    colWidths: [25, 30, 8, 13, 8],
  });

  for (const fn of complexFunctions.slice(0, 10)) {
    table.push([
      chalk.yellow(fn.name),
      shortPath(fn.file),
      String(fn.line),
      colorComplexity(fn.complexity),
      String(fn.loc),
    ]);
  }

  console.log(chalk.bold("  Complex Functions") + chalk.gray(" (complexity > 5)"));
  console.log(table.toString());
  console.log();
}

function printGrade(analysis: ProjectAnalysis): void {
  const { summary } = analysis;
  const gradeColor = getGradeColor(summary.grade);

  console.log(
    chalk.bold("  Quality Grade: ") +
      gradeColor(` ${summary.grade} `) +
      chalk.gray(` (${summary.score}/100)`),
  );
  console.log();

  if (summary.score < 50) {
    console.log(chalk.yellow("  Recommendations:"));
    if (summary.averageComplexity > 10) {
      console.log(chalk.yellow("    - Reduce function complexity (aim for < 10)"));
    }
    if (summary.totalDuplicates > 0) {
      console.log(chalk.yellow("    - Eliminate duplicate code blocks"));
    }
    if (summary.averageMaintainability < 50) {
      console.log(chalk.yellow("    - Improve maintainability: break down large functions"));
    }
    console.log();
  }
}

function shortPath(filePath: string): string {
  const cwd = process.cwd();
  if (filePath.startsWith(cwd)) {
    return filePath.slice(cwd.length + 1);
  }
  return filePath;
}

function colorComplexity(value: number): string {
  if (value <= 5) return chalk.green(String(value));
  if (value <= 10) return chalk.yellow(String(value));
  if (value <= 20) return chalk.hex("#FFA500")(String(value));
  return chalk.red(String(value));
}

function colorMaintainability(value: number): string {
  if (value >= 85) return chalk.green(String(value));
  if (value >= 65) return chalk.yellow(String(value));
  if (value >= 40) return chalk.hex("#FFA500")(String(value));
  return chalk.red(String(value));
}

function colorDuplicates(value: number): string {
  if (value === 0) return chalk.green(String(value));
  if (value <= 3) return chalk.yellow(String(value));
  return chalk.red(String(value));
}

function colorScore(value: number): string {
  if (value >= 85) return chalk.green(String(value));
  if (value >= 70) return chalk.yellow(String(value));
  if (value >= 50) return chalk.hex("#FFA500")(String(value));
  return chalk.red(String(value));
}

function getGradeColor(grade: QualityGrade) {
  switch (grade) {
    case "A":
      return chalk.bgGreen.black;
    case "B":
      return chalk.bgYellow.black;
    case "C":
      return chalk.bgHex("#FFA500").black;
    case "D":
      return chalk.bgRed.white;
    case "F":
      return chalk.bgRed.white;
  }
}
