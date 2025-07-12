import { assertEquals } from "@std/assert";
import { parseCliArgs, buildConfigFromCliOptions } from "../src/cli.ts";
import type { CliOptions, PatConfig } from "../src/types.ts";

// Test parseCliArgs
Deno.test("parseCliArgs - no arguments returns empty options", () => {
  const options = parseCliArgs([]);
  assertEquals(options, {});
});

Deno.test("parseCliArgs - basic flags", () => {
  const args = [
    "--name", "Test Token",
    "--description", "My token",
    "--owner", "myorg",
  ];
  
  const options = parseCliArgs(args);
  assertEquals(options, {
    name: "Test Token",
    description: "My token",
    owner: "myorg",
  });
});

Deno.test("parseCliArgs - all flags", () => {
  const args = [
    "--config", "config.yaml",
    "--name", "Test Token",
    "--description", "My token",
    "--owner", "myorg",
    "--expiration", "30",
    "--expiration-date", "2025-12-31",
    "--repo-access", "selected",
    "--repos", "repo1,repo2,repo3",
    "--permissions", "contents:write,issues:read",
    "--copy",
    "--open",
  ];
  
  const options = parseCliArgs(args);
  assertEquals(options, {
    config: "config.yaml",
    name: "Test Token",
    description: "My token",
    owner: "myorg",
    expiration: "30",
    expirationDate: "2025-12-31",
    repoAccess: "selected",
    repos: "repo1,repo2,repo3",
    permissions: "contents:write,issues:read",
    copy: true,
    open: true,
  });
});

Deno.test("parseCliArgs - help flag", () => {
  const options = parseCliArgs(["--help"]);
  assertEquals(options.help, true);
});

Deno.test("parseCliArgs - short flags", () => {
  const args = ["-n", "Test", "-o", "myorg"];
  const options = parseCliArgs(args);
  assertEquals(options, {
    name: "Test",
    owner: "myorg",
  });
});

// Test buildConfigFromCliOptions
Deno.test("buildConfigFromCliOptions - empty options returns empty config", () => {
  const config = buildConfigFromCliOptions({});
  assertEquals(config, {});
});

Deno.test("buildConfigFromCliOptions - basic conversion", () => {
  const options: CliOptions = {
    name: "Test Token",
    description: "My token",
    owner: "myorg",
  };
  
  const config = buildConfigFromCliOptions(options);
  assertEquals(config, {
    name: "Test Token",
    description: "My token",
    owner: "myorg",
  });
});

Deno.test("buildConfigFromCliOptions - numeric expiration", () => {
  const options: CliOptions = {
    expiration: "30",
  };
  
  const config = buildConfigFromCliOptions(options);
  assertEquals(config, {
    expiration: 30,
  });
});

Deno.test("buildConfigFromCliOptions - string expiration", () => {
  const options: CliOptions = {
    expiration: "none",
  };
  
  const config = buildConfigFromCliOptions(options);
  assertEquals(config, {
    expiration: "none",
  });
});

Deno.test("buildConfigFromCliOptions - custom expiration", () => {
  const options: CliOptions = {
    expiration: "custom",
    expirationDate: "2025-12-31",
  };
  
  const config = buildConfigFromCliOptions(options);
  assertEquals(config, {
    expiration: "custom",
    expirationDate: "2025-12-31",
  });
});

Deno.test("buildConfigFromCliOptions - repos parsing", () => {
  const options: CliOptions = {
    repos: "repo1,repo2,repo3",
    repoAccess: "selected",
  };
  
  const config = buildConfigFromCliOptions(options);
  assertEquals(config, {
    repos: ["repo1", "repo2", "repo3"],
    repoAccess: "selected",
  });
});

Deno.test("buildConfigFromCliOptions - permissions parsing", () => {
  const options: CliOptions = {
    permissions: "contents:write,issues:read,metadata:read",
  };
  
  const config = buildConfigFromCliOptions(options);
  assertEquals(config, {
    permissions: {
      contents: "write",
      issues: "read",
      metadata: "read",
    },
  });
});

Deno.test("buildConfigFromCliOptions - invalid permissions format", () => {
  const options: CliOptions = {
    permissions: "invalid-format",
  };
  
  const config = buildConfigFromCliOptions(options);
  assertEquals(config, {});
});

Deno.test("buildConfigFromCliOptions - complete config", () => {
  const options: CliOptions = {
    name: "CI Token",
    description: "Token for CI/CD",
    owner: "myorg",
    expiration: "30",
    repoAccess: "selected",
    repos: "api,frontend",
    permissions: "contents:write,issues:read",
  };
  
  const config = buildConfigFromCliOptions(options);
  assertEquals(config, {
    name: "CI Token",
    description: "Token for CI/CD",
    owner: "myorg",
    expiration: 30,
    repoAccess: "selected",
    repos: ["api", "frontend"],
    permissions: {
      contents: "write",
      issues: "read",
    },
  });
});