import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export class Logger {
  constructor(private readonly path: string) {
    mkdirSync(dirname(path), { recursive: true });
  }

  log(level: "info" | "warn" | "error", message: string, meta?: Record<string, unknown>) {
    const line = JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      meta: meta ?? {},
    });
    appendFileSync(this.path, `${line}\n`);
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log("warn", message, meta);
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.log("error", message, meta);
  }
}
