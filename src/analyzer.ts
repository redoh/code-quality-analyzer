import * as fs from "node:fs";
import * as path from "node:path";
import { glob } from "glob";
import { analyzeLoc } from "./metrics/loc.js";
import { analyzeComplexity } from "./metrics/complexity.js";
import { analyzeHalstead } from "./metrics/halstead.js";
import { computeMaintainabilityIndex } from "./metrics/maintainability.js";
import { analyzeDuplication } from "./metrics/duplication.js";
import { analyzeCoupling } from "./metrics/coupling.js";
import {
  FileAnalysis,
  ProjectAnalysis,
  ProjectSummary,
  LocMetrics,
  AnalyzeOptions,
} from "./types.js";
import { getGrade, round } from "./utils.js";

export async function analyze(options: AnalyzeOptions): Promise<ProjectAnalysis> {
  const files = await discoverFiles(options);

  if (files.length === 0) {
    throw new Error(`No files found matching extensions: ${options.extensions.join(", ")}`);
  }

  // Read all source files
  const allSources = new Map<string, string>();
  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    allSources.set(file, content);
  }

  // Analyze each file
  const fileAnalyses: FileAnalysis[] = [];
  for (const [filePath, source] of allSources) {
    const analysis = analyzeFile(filePath, source, allSources);
    fileAnalyses.push(analysis);
  }

  const summary = computeSummary(fileAnalyses);

  return {
    files: fileAnalyses,
    summary,
    timestamp: new Date().toISOString(),
  };
}

function analyzeFile(
  filePath: string,
  source: string,
  allSources: Map<string, string>,
): FileAnalysis {
  const loc = analyzeLoc(source);
  const functions = analyzeComplexity(source);
  const halstead = analyzeHalstead(source);
  const duplicates = analyzeDuplication(filePath, source, allSources);
  const coupling = analyzeCoupling(filePath, source, allSources);

  const avgComplexity =
    functions.length > 0
      ? round(functions.reduce((sum, f) => sum + f.complexity, 0) / functions.length)
      : 0;

  const maxComplexity =
    functions.length > 0 ? Math.max(...functions.map((f) => f.complexity)) : 0;

  const maintainabilityIndex = computeMaintainabilityIndex(
    halstead.volume,
    avgComplexity,
    loc.source,
  );

  return {
    filePath,
    loc,
    functions,
    averageComplexity: avgComplexity,
    maxComplexity,
    halstead,
    maintainabilityIndex,
    duplicates,
    coupling,
  };
}

function computeSummary(files: FileAnalysis[]): ProjectSummary {
  const totalLoc: LocMetrics = {
    total: 0,
    source: 0,
    comment: 0,
    blank: 0,
  };

  let totalComplexity = 0;
  let totalFunctions = 0;
  let maxComplexity = { value: 0, file: "", function: "" };
  let totalMaintainability = 0;
  let totalDuplicates = 0;

  for (const file of files) {
    totalLoc.total += file.loc.total;
    totalLoc.source += file.loc.source;
    totalLoc.comment += file.loc.comment;
    totalLoc.blank += file.loc.blank;

    for (const fn of file.functions) {
      totalComplexity += fn.complexity;
      totalFunctions++;

      if (fn.complexity > maxComplexity.value) {
        maxComplexity = {
          value: fn.complexity,
          file: file.filePath,
          function: fn.name,
        };
      }
    }

    totalMaintainability += file.maintainabilityIndex;
    totalDuplicates += file.duplicates.length;
  }

  const averageComplexity =
    totalFunctions > 0 ? round(totalComplexity / totalFunctions) : 0;
  const averageMaintainability =
    files.length > 0 ? round(totalMaintainability / files.length) : 100;

  const score = computeOverallScore(
    averageMaintainability,
    averageComplexity,
    totalDuplicates,
    files.length,
  );

  return {
    totalFiles: files.length,
    totalLoc,
    averageComplexity,
    maxComplexity,
    averageMaintainability,
    totalDuplicates,
    grade: getGrade(score),
    score: round(score),
  };
}

function computeOverallScore(
  maintainability: number,
  avgComplexity: number,
  duplicates: number,
  totalFiles: number,
): number {
  // Weighted score:
  // 50% maintainability index
  // 30% complexity score (inverse, lower is better)
  // 20% duplication score (fewer duplicates is better)

  const maintScore = maintainability;
  const complexityScore = Math.max(0, 100 - (avgComplexity - 1) * 10);
  const duplicationScore =
    totalFiles > 0
      ? Math.max(0, 100 - (duplicates / totalFiles) * 25)
      : 100;

  return 0.5 * maintScore + 0.3 * complexityScore + 0.2 * duplicationScore;
}

async function discoverFiles(options: AnalyzeOptions): Promise<string[]> {
  const targetPath = path.resolve(options.path);
  const stat = fs.statSync(targetPath);

  if (stat.isFile()) {
    return [targetPath];
  }

  const patterns = options.extensions.map(
    (ext) => `${targetPath}/**/*${ext}`,
  );

  const ignorePatterns = [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.git/**",
    "**/coverage/**",
    ...options.exclude.map((e) => `**/${e}/**`),
  ];

  const files = await glob(patterns, {
    ignore: ignorePatterns,
    nodir: true,
    absolute: true,
  });

  return files.sort();
}
