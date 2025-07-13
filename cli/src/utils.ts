/**
 * Truncate a token name to fit GitHub's 40 character limit
 * @param name The token name to truncate
 * @returns The truncated name (max 40 characters)
 */
export function truncateTokenName(name: string): string {
  const MAX_LENGTH = 40;
  if (name.length <= MAX_LENGTH) {
    return name;
  }
  return name.substring(0, MAX_LENGTH);
}

/**
 * Generate a default token name with date
 * @param repoName Optional repository name
 * @returns A default token name with current date
 */
export function generateDefaultTokenName(repoName?: string): string {
  const dateStr = new Date().toISOString().split("T")[0];
  const baseName = repoName || "GitHub PAT";
  const fullName = `${baseName} ${dateStr}`;
  
  // If the full name is too long, truncate the base name
  if (fullName.length > 40) {
    const maxBaseLength = 40 - dateStr.length - 1; // -1 for space
    const truncatedBase = baseName.substring(0, maxBaseLength);
    return `${truncatedBase} ${dateStr}`;
  }
  
  return fullName;
}

/**
 * Validate a token name
 * @param name The token name to validate
 * @returns An error message if invalid, undefined if valid
 */
export function validateTokenName(name: string): string | undefined {
  if (!name || name.trim() === "") {
    return "Token name is required";
  }
  if (name.length > 40) {
    return "Token name must be 40 characters or less";
  }
  return undefined;
}