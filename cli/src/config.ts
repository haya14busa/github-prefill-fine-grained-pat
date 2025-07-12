import { parse as parseYaml } from "@std/yaml";
import type { PatConfig } from "./types.ts";

export async function parseConfigFile(filePath: string): Promise<PatConfig> {
  // Check file extension
  const ext = filePath.split(".").pop()?.toLowerCase();
  if (!ext || !["yaml", "yml", "json"].includes(ext)) {
    throw new Error("Unsupported file type. Use .yaml, .yml, or .json");
  }

  // Read file content
  let content: string;
  try {
    content = await Deno.readTextFile(filePath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error(`Config file not found: ${filePath}`);
    }
    throw error;
  }

  // Handle empty files
  if (!content.trim()) {
    return {};
  }

  // Parse based on file type
  if (ext === "json") {
    try {
      return JSON.parse(content) as PatConfig;
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    // YAML
    try {
      const parsed = parseYaml(content) as PatConfig;
      return parsed || {};
    } catch (error) {
      throw new Error(`Failed to parse YAML: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export function mergeConfigs(fileConfig: PatConfig, cliConfig: PatConfig): PatConfig {
  const merged: PatConfig = { ...fileConfig };

  // Override with CLI config values
  if (cliConfig.name !== undefined) merged.name = cliConfig.name;
  if (cliConfig.description !== undefined) merged.description = cliConfig.description;
  if (cliConfig.owner !== undefined) merged.owner = cliConfig.owner;
  if (cliConfig.expiration !== undefined) merged.expiration = cliConfig.expiration;
  if (cliConfig.expirationDate !== undefined) merged.expirationDate = cliConfig.expirationDate;
  if (cliConfig.repoAccess !== undefined) merged.repoAccess = cliConfig.repoAccess;
  if (cliConfig.repos !== undefined) merged.repos = cliConfig.repos;

  // Merge permissions
  if (cliConfig.permissions) {
    merged.permissions = {
      ...fileConfig.permissions,
      ...cliConfig.permissions,
    };
  }

  return merged;
}