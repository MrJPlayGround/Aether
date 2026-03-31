import { loadConfig } from "./config";
import { createApp } from "./core/app";
import { loadLocalEnv } from "./env";

async function main() {
  loadLocalEnv();
  const config = loadConfig();
  const app = await createApp(config);
  const command = Bun.argv[2] ?? "chat";

  if (command === "chat") {
    await app.runChat();
    return;
  }

  if (command === "serve") {
    app.runServer();
    return;
  }

  console.error(`Unknown command: ${command}`);
  process.exitCode = 1;
}

void main();
