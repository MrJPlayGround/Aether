import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { existsSync } from "node:fs";

export interface AppConfig {
  name: string;
  leadName: string;
  productName: string;
  productTagline: string;
  productAudience: string;
  deploymentMode: "personal" | "client-single-tenant";
  supportEmail?: string;
  legalDisclaimer: string;
  port: number;
  provider: "codex" | "openai" | "anthropic" | "local";
  model: string;
  visionProvider: "anthropic" | "none";
  visionModel: string;
  dataDir: string;
  memoryPath: string;
  briefsPath: string;
  journalPath: string;
  watchlistPath: string;
  tasksPath: string;
  threadsPath: string;
  deskPath: string;
  logPath: string;
  chartsDir: string;
  soulsDir: string;
  telegramBotToken?: string;
  discordBotToken?: string;
}

export function loadConfig(): AppConfig {
  const cwd = process.cwd();
  const dataDir = join(cwd, "data");
  const chartsDir = join(dataDir, "charts");
  const codexPath = process.env.AETHER_CODEX_PATH ?? "/Users/jay/.bun/bin/codex";

  mkdirSync(dataDir, { recursive: true });
  mkdirSync(chartsDir, { recursive: true });

  return {
    name: "Aether",
    leadName: "Aether",
    productName: process.env.AETHER_PRODUCT_NAME ?? "Aether",
    productTagline: process.env.AETHER_PRODUCT_TAGLINE ?? "Personal operator. Trading desk. One surface.",
    productAudience: process.env.AETHER_PRODUCT_AUDIENCE ?? "Discretionary traders and high-context operators",
    deploymentMode: (
      process.env.AETHER_DEPLOYMENT_MODE ?? "personal"
    ) as "personal" | "client-single-tenant",
    supportEmail: process.env.AETHER_SUPPORT_EMAIL,
    legalDisclaimer: process.env.AETHER_LEGAL_DISCLAIMER
      ?? "Aether provides decision support and operational memory. It does not execute trades or provide guaranteed outcomes.",
    port: Number(process.env.PORT ?? 3787),
    provider: (
      process.env.AETHER_PROVIDER
      ?? (existsSync(codexPath) ? "codex" : process.env.ANTHROPIC_API_KEY ? "anthropic" : process.env.OPENAI_API_KEY ? "openai" : "local")
    ) as "codex" | "openai" | "anthropic" | "local",
    model: process.env.AETHER_MODEL ?? "gpt-5.4",
    visionProvider: (
      process.env.AETHER_VISION_PROVIDER
      ?? (process.env.ANTHROPIC_API_KEY ? "anthropic" : "none")
    ) as "anthropic" | "none",
    visionModel: process.env.AETHER_VISION_MODEL ?? "claude-sonnet-4-20250514",
    dataDir,
    memoryPath: join(dataDir, "memory.json"),
    briefsPath: join(dataDir, "briefs.json"),
    journalPath: join(dataDir, "journal.json"),
    watchlistPath: join(dataDir, "watchlist.json"),
    tasksPath: join(dataDir, "tasks.json"),
    threadsPath: join(dataDir, "threads.json"),
    deskPath: join(dataDir, "desk.json"),
    logPath: join(dataDir, "logs", "runtime.log"),
    chartsDir,
    soulsDir: join(cwd, "souls"),
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    discordBotToken: process.env.DISCORD_BOT_TOKEN,
  };
}
