import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function applyEnvFile(path: string) {
  if (!existsSync(path)) return;

  const raw = readFileSync(path, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

export function loadLocalEnv(cwd = process.cwd()) {
  applyEnvFile(join(cwd, ".env"));
  applyEnvFile(join(cwd, ".env.local"));
}
