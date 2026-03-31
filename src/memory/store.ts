import { existsSync } from "node:fs";
import type { MemoryEntry } from "../core/types";

interface MemoryFile {
  entries: MemoryEntry[];
}

export class MemoryStore {
  constructor(private readonly path: string) {}

  async load(): Promise<MemoryEntry[]> {
    if (!existsSync(this.path)) {
      return [];
    }

    const raw = await Bun.file(this.path).text();
    if (!raw.trim()) {
      return [];
    }

    const parsed = JSON.parse(raw) as MemoryFile;
    return parsed.entries ?? [];
  }

  async save(entries: MemoryEntry[]) {
    const payload: MemoryFile = { entries };
    await Bun.write(this.path, JSON.stringify(payload, null, 2));
  }

  async append(entry: MemoryEntry) {
    const entries = await this.load();
    entries.push(entry);
    await this.save(entries);
  }

  async recent(limit = 12) {
    const entries = await this.load();
    return entries.slice(-limit);
  }

  async search(query: string, limit = 6) {
    const entries = await this.load();
    const needle = query.toLowerCase();
    return entries
      .filter((entry) => entry.content.toLowerCase().includes(needle))
      .slice(-limit);
  }
}
