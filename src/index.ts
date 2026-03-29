import { Command } from "commander";
import chalk from "chalk";
import { analyze } from "./analyzer.js";
import { reportToConsole } from "./reporters/console.js";
import { reportToJson } from "./reporters/json.js";
import { AnalyzeOptions } from "./types.js";

const program = new Command();

program
  .name("cqa")
  .description("Code Quality Analyzer - Analyze code quality with industry-standard metrics")
  .version("1.0.0");

program
  .command("analyze")
  .description("Analyze code quality of a file or directory")
  .argument("<path>", "File or directory to analyze")
  .option("-f, --format <format>", "Output format: table or json", "table")
  .option(
    "-t, --threshold <number>",
    "Minimum quality score (0-100). Exit with code 1 if below",
    "0",
  )
  .option(
    "-e, --extensions <exts>",
    "File extensions to analyze (comma-separated)",
    ".ts,.js,.tsx,.jsx",
  )
  .option("--exclude <dirs>", "Additional directories to exclude (comma-separated)", "")
  .action(async (targetPath: string, opts) => {
    try {
      const options: AnalyzeOptions = {
        path: targetPath,
        format: opts.format as "table" | "json",
        threshold: parseInt(opts.threshold, 10),
        extensions: opts.extensions.split(",").map((e: string) => e.trim()),
        exclude: opts.exclude ? opts.exclude.split(",").map((e: string) => e.trim()) : [],
      };

      const result = await analyze(options);

      if (options.format === "json") {
        console.log(reportToJson(result));
      } else {
        reportToConsole(result);
      }

      if (options.threshold > 0 && result.summary.score < options.threshold) {
        console.log(
          chalk.red(
            `\n  Quality score ${result.summary.score} is below threshold ${options.threshold}`,
          ),
        );
        process.exit(1);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red(`\n  Error: ${error.message}\n`));
      }
      process.exit(1);
    }
  });

program.parse();
