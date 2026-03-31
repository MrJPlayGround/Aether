import { join } from "node:path";
import type { SoulProfile } from "./types";

async function readSoul(path: string): Promise<string> {
  return Bun.file(path).text();
}

export async function loadSouls(root: string): Promise<SoulProfile> {
  return {
    leadIdentity: await readSoul(join(root, "lead/identity.md")),
    leadPersonality: await readSoul(join(root, "lead/personality.md")),
    leadRules: await readSoul(join(root, "lead/rules.md")),
    tradingIdentity: await readSoul(join(root, "trading-desk/identity.md")),
    tradingRules: await readSoul(join(root, "trading-desk/rules.md")),
  };
}

export function compileSystemBrief(souls: SoulProfile): string {
  return [
    souls.leadIdentity,
    souls.leadPersonality,
    souls.leadRules,
    souls.tradingIdentity,
    souls.tradingRules,
  ].join("\n\n");
}
