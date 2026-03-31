import { existsSync } from "node:fs";

export interface BriefEntry {
  id: string;
  timestamp: string;
  type: "daily" | "trading" | "personal";
  title: string;
  body: string;
  tags: string[];
}

interface BriefFile {
  briefs: BriefEntry[];
}

export class BriefStore {
  constructor(private readonly path: string) {}

  async load(): Promise<BriefEntry[]> {
    if (!existsSync(this.path)) {
      return [];
    }

    const raw = await Bun.file(this.path).text();
    if (!raw.trim()) {
      return [];
    }

    const parsed = JSON.parse(raw) as BriefFile;
    return parsed.briefs ?? [];
  }

  async save(briefs: BriefEntry[]) {
    await Bun.write(this.path, JSON.stringify({ briefs }, null, 2));
  }

  async append(brief: BriefEntry) {
    const briefs = await this.load();
    briefs.push(brief);
    await this.save(briefs);
  }

  async recent(limit = 10) {
    const briefs = await this.load();
    return briefs.slice(-limit);
  }
}
