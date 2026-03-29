export interface LocMetrics {
  total: number;
  source: number;
  comment: number;
  blank: number;
}

export interface FunctionMetrics {
  name: string;
  line: number;
  complexity: number;
  loc: number;
  params: number;
}

export interface HalsteadMetrics {
  operators: { distinct: number; total: number };
  operands: { distinct: number; total: number };
  vocabulary: number;
  length: number;
  volume: number;
  difficulty: number;
  effort: number;
  bugs: number;
  time: number;
}

export interface DuplicateBlock {
  lines: [number, number];
  matchedIn: string;
  matchedLines: [number, number];
  fragment: string;
}

export interface DependencyInfo {
  source: string;
  type: "import" | "require";
  isRelative: boolean;
}

export interface CouplingMetrics {
  imports: DependencyInfo[];
  afferentCoupling: number;
  efferentCoupling: number;
  instability: number;
}

export interface FileAnalysis {
  filePath: string;
  loc: LocMetrics;
  functions: FunctionMetrics[];
  averageComplexity: number;
  maxComplexity: number;
  halstead: HalsteadMetrics;
  maintainabilityIndex: number;
  duplicates: DuplicateBlock[];
  coupling: CouplingMetrics;
}

export interface ProjectAnalysis {
  files: FileAnalysis[];
  summary: ProjectSummary;
  timestamp: string;
}

export interface ProjectSummary {
  totalFiles: number;
  totalLoc: LocMetrics;
  averageComplexity: number;
  maxComplexity: { value: number; file: string; function: string };
  averageMaintainability: number;
  totalDuplicates: number;
  grade: QualityGrade;
  score: number;
}

export type QualityGrade = "A" | "B" | "C" | "D" | "F";

export interface AnalyzeOptions {
  path: string;
  format: "table" | "json";
  threshold: number;
  extensions: string[];
  exclude: string[];
}
