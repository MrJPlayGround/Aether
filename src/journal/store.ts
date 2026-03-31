import { existsSync } from "node:fs";

export type JournalKind =
  | "note"
  | "trade-idea"
  | "brief"
  | "reflection"
  | "chart-note";

export interface JournalEntry {
  id: string;
  timestamp: string;
  kind: JournalKind;
  title: string;
  content: string;
  tags: string[];
  domain: "general" | "trading";
  threadId?: string;
}

interface JournalFile {
  entries: JournalEntry[];
}

export class JournalStore {
  constructor(private readonly path: string) {}

  async load(): Promise<JournalEntry[]> {
    if (!existsSync(this.path)) {
      return [];
    }

    const raw = await Bun.file(this.path).text();
    if (!raw.trim()) {
      return [];
    }

    const parsed = JSON.parse(raw) as JournalFile;
    return parsed.entries ?? [];
  }

  async save(entries: JournalEntry[]) {
    await Bun.write(this.path, JSON.stringify({ entries }, null, 2));
  }

  async append(entry: JournalEntry) {
    const entries = await this.load();
    entries.push(entry);
    await this.save(entries);
  }

  async recent(limit = 20) {
    const entries = await this.load();
    return entries.slice(-limit);
  }
}
