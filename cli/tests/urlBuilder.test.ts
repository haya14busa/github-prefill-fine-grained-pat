import { assertEquals } from "@std/assert";
import { buildUrl } from "../src/urlBuilder.ts";

Deno.test("buildUrl - minimal config with name only", () => {
  const url = buildUrl({ name: "Test Token" });
  assertEquals(
    url,
    "https://github.com/settings/personal-access-tokens/new?name=Test+Token",
  );
});

Deno.test("buildUrl - full config", () => {
  const url = buildUrl({
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

  const expected =
    "https://github.com/settings/personal-access-tokens/new?" +
    "name=CI+Token&description=Token+for+CI%2FCD&owner=myorg&" +
    "expiration=30&repo_access=selected&repos=api%2Cfrontend&" +
    "permissions=contents%3Awrite%2Cissues%3Aread%2Cmetadata%3Aread";

  assertEquals(url, expected);
});

Deno.test("buildUrl - custom expiration", () => {
  const url = buildUrl({
    name: "Custom Token",
    expiration: "custom",
    expirationDate: "2025-12-31",
  });

  assertEquals(
    url,
    "https://github.com/settings/personal-access-tokens/new?" +
      "name=Custom+Token&expiration=custom&expiration_date=2025-12-31",
  );
});

Deno.test("buildUrl - no expiration", () => {
  const url = buildUrl({
    name: "Forever Token",
    expiration: "none",
  });

  assertEquals(
    url,
    "https://github.com/settings/personal-access-tokens/new?" +
      "name=Forever+Token&expiration=none",
  );
});

Deno.test("buildUrl - repos without owner prefix", () => {
  const url = buildUrl({
    name: "Test",
    repos: ["repo1", "repo2"],
    repoAccess: "selected",
  });

  assertEquals(
    url,
    "https://github.com/settings/personal-access-tokens/new?" +
      "name=Test&repo_access=selected&repos=repo1%2Crepo2",
  );
});

Deno.test("buildUrl - repos with owner prefix are stripped", () => {
  const url = buildUrl({
    name: "Test",
    owner: "myorg",
    repos: ["myorg/repo1", "otherorg/repo2", "repo3"],
    repoAccess: "selected",
  });

  assertEquals(
    url,
    "https://github.com/settings/personal-access-tokens/new?" +
      "name=Test&owner=myorg&repo_access=selected&repos=repo1%2Crepo2%2Crepo3",
  );
});

Deno.test("buildUrl - empty config returns base URL", () => {
  const url = buildUrl({});
  assertEquals(url, "https://github.com/settings/personal-access-tokens/new");
});

Deno.test("buildUrl - special characters are encoded", () => {
  const url = buildUrl({
    name: "Test & Deploy",
    description: "Token for test/deploy & monitoring",
  });

  assertEquals(
    url,
    "https://github.com/settings/personal-access-tokens/new?" +
      "name=Test+%26+Deploy&description=Token+for+test%2Fdeploy+%26+monitoring",
  );
});