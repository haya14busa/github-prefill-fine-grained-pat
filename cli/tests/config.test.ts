import { assertEquals, assertRejects } from "@std/assert";
import { parseConfigFile, mergeConfigs } from "../src/config.ts";
import type { PatConfig } from "../src/types.ts";

// Test YAML parsing
Deno.test("parseConfigFile - valid YAML config", async () => {
  const yamlContent = `
name: CI Token
description: Token for CI/CD
owner: myorg
expiration: 30
repoAccess: selected
repos:
  - myorg/api
  - myorg/frontend
permissions:
  contents: write
  issues: read
  metadata: read
`;

  // Create a temporary YAML file
  const tempFile = await Deno.makeTempFile({ suffix: ".yaml" });
  await Deno.writeTextFile(tempFile, yamlContent);

  const config = await parseConfigFile(tempFile);
  
  assertEquals(config, {
    name: "CI Token",
    description: "Token for CI/CD",
    owner: "myorg",
    expiration: 30,
    repoAccess: "selected",
    repos: ["myorg/api", "myorg/frontend"],
    permissions: {
      contents: "write",
      issues: "read",
      metadata: "read",
    },
  });

  // Clean up
  await Deno.remove(tempFile);
});

// Test JSON parsing
Deno.test("parseConfigFile - valid JSON config", async () => {
  const jsonContent = JSON.stringify({
    name: "API Token",
    description: "Token for API access",
    owner: "myuser",
    expiration: "none",
    permissions: {
      contents: "read",
      metadata: "read",
    },
  });

  const tempFile = await Deno.makeTempFile({ suffix: ".json" });
  await Deno.writeTextFile(tempFile, jsonContent);

  const config = await parseConfigFile(tempFile);
  
  assertEquals(config, {
    name: "API Token",
    description: "Token for API access",
    owner: "myuser",
    expiration: "none",
    permissions: {
      contents: "read",
      metadata: "read",
    },
  });

  await Deno.remove(tempFile);
});

// Test custom expiration
Deno.test("parseConfigFile - custom expiration", async () => {
  const yamlContent = `
name: Custom Token
expiration: custom
expirationDate: "2025-12-31"
`;

  const tempFile = await Deno.makeTempFile({ suffix: ".yml" });
  await Deno.writeTextFile(tempFile, yamlContent);

  const config = await parseConfigFile(tempFile);
  
  assertEquals(config, {
    name: "Custom Token",
    expiration: "custom",
    expirationDate: "2025-12-31",
  });

  await Deno.remove(tempFile);
});

// Test empty file
Deno.test("parseConfigFile - empty file returns empty config", async () => {
  const tempFile = await Deno.makeTempFile({ suffix: ".yaml" });
  await Deno.writeTextFile(tempFile, "");

  const config = await parseConfigFile(tempFile);
  assertEquals(config, {});

  await Deno.remove(tempFile);
});

// Test invalid YAML
Deno.test("parseConfigFile - invalid YAML throws error", async () => {
  const tempFile = await Deno.makeTempFile({ suffix: ".yaml" });
  await Deno.writeTextFile(tempFile, "invalid: yaml: content:");

  await assertRejects(
    async () => await parseConfigFile(tempFile),
    Error,
    "Failed to parse YAML",
  );

  await Deno.remove(tempFile);
});

// Test unsupported file type
Deno.test("parseConfigFile - unsupported file type throws error", async () => {
  await assertRejects(
    async () => await parseConfigFile("config.txt"),
    Error,
    "Unsupported file type",
  );
});

// Test non-existent file
Deno.test("parseConfigFile - non-existent file throws error", async () => {
  await assertRejects(
    async () => await parseConfigFile("/does/not/exist.yaml"),
    Error,
  );
});

// Test mergeConfigs
Deno.test("mergeConfigs - CLI options override file config", () => {
  const fileConfig: PatConfig = {
    name: "File Token",
    description: "From file",
    owner: "fileowner",
    expiration: 30,
    permissions: {
      contents: "read",
      issues: "read",
    },
  };

  const cliConfig: PatConfig = {
    name: "CLI Token",
    owner: "cliowner",
    expiration: "none",
    repos: ["repo1", "repo2"],
  };

  const merged = mergeConfigs(fileConfig, cliConfig);

  assertEquals(merged, {
    name: "CLI Token", // CLI overrides
    description: "From file", // File kept
    owner: "cliowner", // CLI overrides
    expiration: "none", // CLI overrides
    repos: ["repo1", "repo2"], // CLI adds
    permissions: {
      contents: "read",
      issues: "read",
    }, // File kept
  });
});

Deno.test("mergeConfigs - empty configs", () => {
  assertEquals(mergeConfigs({}, {}), {});
  assertEquals(mergeConfigs({ name: "Test" }, {}), { name: "Test" });
  assertEquals(mergeConfigs({}, { name: "Test" }), { name: "Test" });
});

Deno.test("mergeConfigs - permissions merge", () => {
  const fileConfig: PatConfig = {
    permissions: {
      contents: "read",
      issues: "write",
    },
  };

  const cliConfig: PatConfig = {
    permissions: {
      issues: "read", // Override
      metadata: "read", // Add new
    },
  };

  const merged = mergeConfigs(fileConfig, cliConfig);

  assertEquals(merged, {
    permissions: {
      contents: "read", // From file
      issues: "read", // CLI override
      metadata: "read", // CLI addition
    },
  });
});