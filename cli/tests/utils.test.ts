import { assertEquals } from "@std/assert";
import {
  generateDefaultTokenName,
  truncateTokenName,
  validateTokenName,
} from "../src/utils.ts";

Deno.test("truncateTokenName - returns unchanged name if under limit", () => {
  const name = "Short name";
  assertEquals(truncateTokenName(name), name);
});

Deno.test("truncateTokenName - truncates long names to 40 chars", () => {
  const longName = "This is a very long token name that exceeds the 40 character limit";
  const result = truncateTokenName(longName);
  assertEquals(result.length, 40);
  assertEquals(result, "This is a very long token name that exce");
});

Deno.test("truncateTokenName - handles exactly 40 chars", () => {
  const name = "x".repeat(40);
  assertEquals(truncateTokenName(name), name);
  assertEquals(truncateTokenName(name).length, 40);
});

Deno.test("generateDefaultTokenName - generates name with date", () => {
  const dateStr = new Date().toISOString().split("T")[0];
  
  // Without repo name
  const defaultName = generateDefaultTokenName();
  assertEquals(defaultName, `GitHub PAT ${dateStr}`);
  
  // With short repo name
  const withRepo = generateDefaultTokenName("my-repo");
  assertEquals(withRepo, `my-repo ${dateStr}`);
});

Deno.test("generateDefaultTokenName - truncates long repo names", () => {
  const dateStr = new Date().toISOString().split("T")[0];
  const longRepoName = "this-is-a-very-long-repository-name-that-will-be-truncated";
  
  const result = generateDefaultTokenName(longRepoName);
  assertEquals(result.length, 40);
  
  // Should end with the date
  assertEquals(result.endsWith(dateStr), true);
  
  // Should start with truncated repo name
  const expectedMaxRepoLength = 40 - dateStr.length - 1;
  assertEquals(result.startsWith(longRepoName.substring(0, expectedMaxRepoLength)), true);
});

Deno.test("generateDefaultTokenName - handles edge case with very long date", () => {
  // Even though unlikely, ensure it works if date format changes
  const longRepoName = "x".repeat(50);
  const result = generateDefaultTokenName(longRepoName);
  assertEquals(result.length <= 40, true);
});

Deno.test("validateTokenName - accepts valid names", () => {
  assertEquals(validateTokenName("Valid Token Name"), undefined);
  assertEquals(validateTokenName("x"), undefined);
  assertEquals(validateTokenName("x".repeat(40)), undefined);
});

Deno.test("validateTokenName - rejects empty names", () => {
  assertEquals(validateTokenName(""), "Token name is required");
  assertEquals(validateTokenName("   "), "Token name is required");
});

Deno.test("validateTokenName - rejects names over 40 chars", () => {
  const longName = "x".repeat(41);
  assertEquals(validateTokenName(longName), "Token name must be 40 characters or less");
});

Deno.test("validateTokenName - handles null/undefined gracefully", () => {
  assertEquals(validateTokenName(null as any), "Token name is required");
  assertEquals(validateTokenName(undefined as any), "Token name is required");
});