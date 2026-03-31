import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadLocalEnv } from "../env";

describe("loadLocalEnv", () => {
  const root = join(tmpdir(), `aether-env-${Date.now()}`);

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
    delete process.env.TEST_ENV_EXAMPLE;
    delete process.env.TEST_ENV_LOCAL;
  });

  test("loads values from .env and .env.local", () => {
    mkdirSync(root, { recursive: true });
    writeFileSync(join(root, ".env"), "TEST_ENV_EXAMPLE=one\n");
    writeFileSync(join(root, ".env.local"), "TEST_ENV_LOCAL=two\n");

    loadLocalEnv(root);

    expect(process.env.TEST_ENV_EXAMPLE).toBe("one");
    expect(process.env.TEST_ENV_LOCAL).toBe("two");
  });
});
