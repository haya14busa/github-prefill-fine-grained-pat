import { assertEquals, assertThrows } from "@std/assert";
import { parseGitRemote, getCurrentGitRemote } from "../src/git.ts";

Deno.test("parseGitRemote - SSH format", () => {
  const result = parseGitRemote("git@github.com:haya14busa/github-prefill-fine-grained-pat.git");
  assertEquals(result, {
    owner: "haya14busa",
    repo: "github-prefill-fine-grained-pat",
  });
});

Deno.test("parseGitRemote - SSH format without .git", () => {
  const result = parseGitRemote("git@github.com:owner/repo");
  assertEquals(result, {
    owner: "owner",
    repo: "repo",
  });
});

Deno.test("parseGitRemote - HTTPS format", () => {
  const result = parseGitRemote("https://github.com/owner/repo.git");
  assertEquals(result, {
    owner: "owner",
    repo: "repo",
  });
});

Deno.test("parseGitRemote - HTTPS format without .git", () => {
  const result = parseGitRemote("https://github.com/owner/repo");
  assertEquals(result, {
    owner: "owner",
    repo: "repo",
  });
});

Deno.test("parseGitRemote - HTTPS format with auth", () => {
  const result = parseGitRemote("https://user:token@github.com/owner/repo.git");
  assertEquals(result, {
    owner: "owner",
    repo: "repo",
  });
});

Deno.test("parseGitRemote - invalid format throws error", () => {
  assertThrows(
    () => parseGitRemote("not-a-git-url"),
    Error,
    "Invalid git remote URL",
  );
});

Deno.test("parseGitRemote - non-GitHub URL throws error", () => {
  assertThrows(
    () => parseGitRemote("git@gitlab.com:owner/repo.git"),
    Error,
    "Only GitHub remotes are supported",
  );
});

// getCurrentGitRemote tests require git command and real repo
Deno.test("getCurrentGitRemote - returns current repo info", async () => {
  try {
    const result = await getCurrentGitRemote();
    // We're in the github-prefill-fine-grained-pat repo
    assertEquals(result.owner, "haya14busa");
    assertEquals(result.repo, "github-prefill-fine-grained-pat");
  } catch (error) {
    // Skip test if not in a git repo
    if (error instanceof Error && error.message.includes("not a git repository")) {
      console.log("Skipping test: not in a git repository");
    } else {
      throw error;
    }
  }
});