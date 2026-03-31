import { existsSync } from "node:fs";

export interface WatchlistEntry {
  id: string;
  timestamp: string;
  symbol: string;
  market: "crypto" | "indices" | "forex" | "stocks";
  timeframe: string;
  thesis: string;
  invalidation: string;
  tags: string[];
  status: "active" | "paused" | "done";
}

interface WatchlistFile {
  entries: WatchlistEntry[];
}

export class WatchlistStore {
  constructor(private readonly path: string) {}

  async load(): Promise<WatchlistEntry[]> {
    if (!existsSync(this.path)) {
      return [];
    }

    const raw = await Bun.file(this.path).text();
    if (!raw.trim()) {
      return [];
    }

    const parsed = JSON.parse(raw) as WatchlistFile;
    return parsed.entries ?? [];
  }

  async save(entries: WatchlistEntry[]) {
    await Bun.write(this.path, JSON.stringify({ entries }, null, 2));
  }

  async append(entry: WatchlistEntry) {
    const entries = await this.load();
    entries.push(entry);
    await this.save(entries);
  }

  async updateStatus(id: string, status: WatchlistEntry["status"]) {
    const entries = await this.load();
    const next = entries.map((entry) => (entry.id === id ? { ...entry, status } : entry));
    await this.save(next);
    return next.find((entry) => entry.id === id) ?? null;
  }

  async recent(limit = 20) {
    const entries = await this.load();
    return entries.slice(-limit);
  }
}
