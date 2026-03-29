// Sample file for integration testing
import { readFileSync } from "fs";
import { join } from "path";

interface Config {
  name: string;
  threshold: number;
  enabled: boolean;
}

function loadConfig(filePath: string): Config {
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function validateConfig(config: Config): boolean {
  if (!config.name) {
    return false;
  }
  if (config.threshold < 0 || config.threshold > 100) {
    return false;
  }
  return config.enabled;
}

function processItems(items: string[]): string[] {
  const results: string[] = [];
  for (const item of items) {
    if (item.startsWith("#")) {
      continue;
    }
    if (item.includes("=")) {
      const [key, value] = item.split("=");
      results.push(`${key.trim()}: ${value.trim()}`);
    } else {
      results.push(item.trim());
    }
  }
  return results;
}

export function main(): void {
  const configPath = join(__dirname, "config.json");
  const config = loadConfig(configPath);
  if (validateConfig(config)) {
    const items = ["name=test", "# comment", "plain"];
    const processed = processItems(items);
    console.log(processed);
  }
}
