import { ProjectAnalysis } from "../types.js";

export function reportToJson(analysis: ProjectAnalysis): string {
  return JSON.stringify(analysis, null, 2);
}
