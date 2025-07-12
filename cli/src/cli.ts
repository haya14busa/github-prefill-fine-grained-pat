import { parse } from "@std/flags";
import type { CliOptions, PatConfig } from "./types.ts";

export function parseCliArgs(args: string[]): CliOptions {
  const parsed = parse(args, {
    string: [
      "config",
      "name", 
      "description",
      "owner",
      "expiration",
      "expiration-date",
      "repo-access",
      "repos",
      "permissions",
    ],
    boolean: ["copy", "open", "help"],
    alias: {
      n: "name",
      o: "owner",
      h: "help",
    },
  });

  const options: CliOptions = {};

  // Map parsed values to CliOptions
  if (parsed.config) options.config = parsed.config;
  if (parsed.name) options.name = parsed.name;
  if (parsed.description) options.description = parsed.description;
  if (parsed.owner) options.owner = parsed.owner;
  if (parsed.expiration) options.expiration = parsed.expiration;
  if (parsed["expiration-date"]) options.expirationDate = parsed["expiration-date"];
  if (parsed["repo-access"]) options.repoAccess = parsed["repo-access"];
  if (parsed.repos) options.repos = parsed.repos;
  if (parsed.permissions) options.permissions = parsed.permissions;
  if (parsed.copy) options.copy = true;
  if (parsed.open) options.open = true;
  if (parsed.help) options.help = true;

  return options;
}

export function buildConfigFromCliOptions(options: CliOptions): PatConfig {
  const config: PatConfig = {};

  // Direct mappings
  if (options.name) config.name = options.name;
  if (options.description) config.description = options.description;
  if (options.owner) config.owner = options.owner;
  if (options.expirationDate) config.expirationDate = options.expirationDate;

  // Parse expiration
  if (options.expiration) {
    const num = parseInt(options.expiration, 10);
    if (!isNaN(num)) {
      config.expiration = num;
    } else if (options.expiration === "none" || options.expiration === "custom") {
      config.expiration = options.expiration;
    }
  }

  // Repo access
  if (options.repoAccess && ["none", "all", "selected"].includes(options.repoAccess)) {
    config.repoAccess = options.repoAccess as "none" | "all" | "selected";
  }

  // Parse repos
  if (options.repos) {
    config.repos = options.repos.split(",").map(r => r.trim()).filter(r => r);
  }

  // Parse permissions
  if (options.permissions) {
    const permissions: Record<string, "none" | "read" | "write"> = {};
    const pairs = options.permissions.split(",");
    
    for (const pair of pairs) {
      const [resource, level] = pair.split(":");
      if (resource && level && ["none", "read", "write"].includes(level)) {
        permissions[resource] = level as "none" | "read" | "write";
      }
    }
    
    if (Object.keys(permissions).length > 0) {
      config.permissions = permissions;
    }
  }

  return config;
}