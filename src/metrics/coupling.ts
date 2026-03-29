import { CouplingMetrics, DependencyInfo } from "../types.js";

/**
 * Analyzes dependency coupling by examining import/require statements.
 *
 * - Efferent Coupling (Ce): Number of modules this module depends on
 * - Afferent Coupling (Ca): Number of modules that depend on this module
 * - Instability: Ce / (Ca + Ce) — ranges from 0 (stable) to 1 (unstable)
 */
export function analyzeCoupling(
  filePath: string,
  source: string,
  allSources: Map<string, string>,
): CouplingMetrics {
  const imports = extractImports(source);

  const efferentCoupling = imports.length;

  // Count how many other files import this file
  let afferentCoupling = 0;
  for (const [otherPath, otherSource] of allSources) {
    if (otherPath === filePath) continue;
    const otherImports = extractImports(otherSource);
    const importsThisFile = otherImports.some(
      (dep) => dep.isRelative && isMatchingImport(otherPath, dep.source, filePath),
    );
    if (importsThisFile) {
      afferentCoupling++;
    }
  }

  const total = afferentCoupling + efferentCoupling;
  const instability = total > 0 ? efferentCoupling / total : 0;

  return {
    imports,
    afferentCoupling,
    efferentCoupling,
    instability: Math.round(instability * 100) / 100,
  };
}

function extractImports(source: string): DependencyInfo[] {
  const imports: DependencyInfo[] = [];
  const seen = new Set<string>();

  // ES module imports
  const importRegex = /import\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(source)) !== null) {
    const src = match[1];
    if (!seen.has(src)) {
      seen.add(src);
      imports.push({
        source: src,
        type: "import",
        isRelative: src.startsWith("."),
      });
    }
  }

  // CommonJS require
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(source)) !== null) {
    const src = match[1];
    if (!seen.has(src)) {
      seen.add(src);
      imports.push({
        source: src,
        type: "require",
        isRelative: src.startsWith("."),
      });
    }
  }

  return imports;
}

function isMatchingImport(
  fromFile: string,
  importPath: string,
  targetFile: string,
): boolean {
  // Simplified path resolution
  const fromDir = fromFile.substring(0, fromFile.lastIndexOf("/"));
  const resolved = resolvePath(fromDir, importPath);

  const targetWithoutExt = targetFile.replace(/\.[^.]+$/, "");
  const resolvedWithoutExt = resolved.replace(/\.[^.]+$/, "");

  return (
    targetWithoutExt === resolvedWithoutExt ||
    targetWithoutExt === resolved ||
    targetFile === resolved
  );
}

function resolvePath(base: string, relative: string): string {
  const parts = base.split("/").filter(Boolean);
  const relParts = relative.split("/");

  for (const part of relParts) {
    if (part === ".") continue;
    if (part === "..") {
      parts.pop();
    } else {
      parts.push(part);
    }
  }

  return parts.join("/");
}
