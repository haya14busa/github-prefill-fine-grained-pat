#!/usr/bin/env -S deno run --allow-read --allow-run

import { buildConfigFromCliOptions, parseCliArgs } from "./cli.ts";
import { mergeConfigs, parseConfigFile } from "./config.ts";
import { getCurrentGitRemote } from "./git.ts";
import { buildUrl } from "./urlBuilder.ts";
import { generateDefaultTokenName, validateTokenName } from "./utils.ts";
import type { PatConfig } from "./types.ts";

const HELP_TEXT = `GitHub Personal Access Token URL Generator

Usage: github-pat-cli [OPTIONS]

If no options are provided, interactive mode will prompt for required values.

Options:
  -n, --name <name>              Token name
  -o, --owner <owner>            Repository owner (auto-detected from git if not specified)
      --description <desc>       Token description
      --config <file>            Load configuration from YAML/JSON file
      --expiration <days>        Token expiration (number of days, "none", or "custom")
      --expiration-date <date>   Custom expiration date (YYYY-MM-DD)
      --repo-access <access>     Repository access ("none", "all", or "selected", default: "selected")
      --repos <repos>            Comma-separated list of repositories
      --permissions <perms>      Comma-separated permissions (format: resource:level)
      --copy                     Copy URL to clipboard (requires pbcopy/xclip)
      --open                     Open URL in browser
  -h, --help                     Show this help message

Examples:
  # Interactive mode (prompts for required values)
  github-pat-cli

  # Generate URL with auto-detected git repository
  github-pat-cli --name "CI Token"

  # Use configuration file
  github-pat-cli --config token.yaml

  # Specify repositories and permissions
  github-pat-cli --name "Deploy Token" --repos "api,frontend" --permissions "contents:write,issues:read"

  # Custom expiration
  github-pat-cli --name "Temp Token" --expiration custom --expiration-date 2025-12-31
`;

async function main() {
  const args = Deno.args;
  const options = parseCliArgs(args);

  // Show help
  if (options.help) {
    console.log(HELP_TEXT);
    Deno.exit(0);
  }

  try {
    let config: PatConfig = {};

    // Load config file if specified
    if (options.config) {
      try {
        const fileConfig = await parseConfigFile(options.config);
        config = fileConfig;
      } catch (_error) {
        console.error(
          `Error loading config file: ${_error instanceof Error ? _error.message : String(_error)}`,
        );
        Deno.exit(1);
      }
    }

    // Convert CLI options to config
    const cliConfig = buildConfigFromCliOptions(options);

    // Merge configs (CLI overrides file)
    config = mergeConfigs(config, cliConfig);

    // Set default repo-access to "selected" if not specified
    if (!config.repoAccess) {
      config.repoAccess = "selected";
    }

    // Auto-detect git repository
    let detectedRepo: { owner: string; repo: string } | null = null;
    try {
      detectedRepo = await getCurrentGitRemote();

      // Use detected owner if not specified
      if (!config.owner) {
        config.owner = detectedRepo.owner;
      }

      // If repos not specified and we're in a git repo, suggest current repo
      if (!config.repos && config.repoAccess === "selected") {
        config.repos = [`${detectedRepo.owner}/${detectedRepo.repo}`];
      }
    } catch (_error) {
      // Git detection failed, continue without it
      if (!config.owner && !options.config) {
        console.warn("Warning: Could not detect git repository. Consider specifying --owner");
      }
    }

    // Prompt for name if not provided
    if (!config.name) {
      const defaultName = generateDefaultTokenName(detectedRepo?.repo);
      const inputName = prompt(`Token name (max 40 chars):`, defaultName);

      const trimmedName = inputName?.trim() || "";
      const validationError = validateTokenName(trimmedName);
      
      if (validationError) {
        console.error(`Error: ${validationError}`);
        Deno.exit(1);
      }

      config.name = trimmedName;
    }

    // Optionally prompt for description if not provided
    if (!config.description && !options.config) {
      const defaultDescription =
        "Created by https://haya14busa.github.io/github-prefill-fine-grained-pat/";

      const inputDescription = prompt(`Token description (optional):`, defaultDescription);
      if (inputDescription && inputDescription.trim() !== "") {
        config.description = inputDescription.trim();
      }
    }

    // Build URL
    const url = buildUrl(config);
    console.log(url);

    // Copy to clipboard if requested
    if (options.copy) {
      try {
        const copyCommand = Deno.build.os === "darwin" ? "pbcopy" : "xclip -selection clipboard";
        const process = new Deno.Command("sh", {
          args: ["-c", `echo -n "${url}" | ${copyCommand}`],
          stdin: "piped",
          stdout: "piped",
          stderr: "piped",
        });

        const { success } = await process.output();
        if (success) {
          console.log("✓ URL copied to clipboard");
        } else {
          console.warn("Warning: Failed to copy to clipboard");
        }
      } catch {
        console.warn("Warning: Clipboard command not available");
      }
    }

    // Open in browser if requested
    if (options.open) {
      try {
        const openCommand = Deno.build.os === "darwin" ? "open" : "xdg-open";
        const process = new Deno.Command(openCommand, {
          args: [url],
          stdout: "piped",
          stderr: "piped",
        });

        const { success } = await process.output();
        if (success) {
          console.log("✓ Opening in browser...");
        } else {
          console.warn("Warning: Failed to open browser");
        }
      } catch {
        console.warn("Warning: Browser open command not available");
      }
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
