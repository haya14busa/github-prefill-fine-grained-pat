// Types for GitHub PAT CLI

export interface PatConfig {
  name?: string;
  description?: string;
  owner?: string;
  expiration?: number | "none" | "custom";
  expirationDate?: string;
  repoAccess?: "none" | "all" | "selected";
  repos?: string[];
  permissions?: Record<string, "none" | "read" | "write">;
}

export interface GitRemote {
  owner: string;
  repo: string;
}

export interface CliOptions {
  config?: string;
  name?: string;
  description?: string;
  owner?: string;
  expiration?: string;
  expirationDate?: string;
  repoAccess?: string;
  repos?: string;
  permissions?: string;
  copy?: boolean;
  open?: boolean;
  help?: boolean;
}
