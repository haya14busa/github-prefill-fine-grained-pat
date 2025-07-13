import type { PatConfig } from "./types.ts";

const BASE_URL = "https://github.com/settings/personal-access-tokens/new";

export function buildUrl(config: PatConfig): string {
  const params = new URLSearchParams();

  // Add basic fields
  if (config.name) {
    params.set("name", config.name);
  }

  if (config.description) {
    params.set("description", config.description);
  }

  if (config.owner) {
    params.set("owner", config.owner);
  }

  // Handle expiration
  if (config.expiration !== undefined) {
    if (typeof config.expiration === "number") {
      params.set("expiration", config.expiration.toString());
    } else {
      params.set("expiration", config.expiration);
    }
  }

  if (config.expirationDate) {
    params.set("expiration_date", config.expirationDate);
  }

  // Repository access
  if (config.repoAccess) {
    params.set("repo_access", config.repoAccess);
  }

  // Repositories - strip owner prefix if present
  if (config.repos && config.repos.length > 0) {
    const repoNames = config.repos.map((repo) => {
      // Remove owner prefix if it exists
      const parts = repo.split("/");
      return parts.length > 1 ? parts[parts.length - 1] : repo;
    });
    params.set("repos", repoNames.join(","));
  }

  // Permissions
  if (config.permissions && Object.keys(config.permissions).length > 0) {
    const permissionPairs = Object.entries(config.permissions)
      .map(([resource, level]) => `${resource}:${level}`)
      .join(",");
    params.set("permissions", permissionPairs);
  }

  // Build final URL
  const queryString = params.toString();
  return queryString ? `${BASE_URL}?${queryString}` : BASE_URL;
}
