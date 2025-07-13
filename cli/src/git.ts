import type { GitRemote } from "./types.ts";

export function parseGitRemote(url: string): GitRemote {
  // SSH format: git@github.com:owner/repo.git
  const sshMatch = url.match(/^git@github\.com:([^/]+)\/([^/.]+)(\.git)?$/);
  if (sshMatch) {
    return {
      owner: sshMatch[1],
      repo: sshMatch[2],
    };
  }

  // HTTPS format: https://github.com/owner/repo.git
  // Also handles auth: https://user:token@github.com/owner/repo.git
  const httpsMatch = url.match(/^https:\/\/(?:[^@]+@)?github\.com\/([^/]+)\/([^/.]+)(\.git)?$/);
  if (httpsMatch) {
    return {
      owner: httpsMatch[1],
      repo: httpsMatch[2],
    };
  }

  // Check if it's a non-GitHub URL
  if (url.includes("gitlab.com") || url.includes("bitbucket.org")) {
    throw new Error("Only GitHub remotes are supported");
  }

  throw new Error("Invalid git remote URL");
}

export async function getCurrentGitRemote(): Promise<GitRemote> {
  const command = new Deno.Command("git", {
    args: ["remote", "get-url", "origin"],
    stdout: "piped",
    stderr: "piped",
  });

  const { stdout, stderr, success } = await command.output();

  if (!success) {
    const errorText = new TextDecoder().decode(stderr);
    throw new Error(`Failed to get git remote: ${errorText}`);
  }

  const remoteUrl = new TextDecoder().decode(stdout).trim();
  return parseGitRemote(remoteUrl);
}
