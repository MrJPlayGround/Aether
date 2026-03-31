import { existsSync } from "node:fs";

export interface ThreadRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  source: "gateway" | "telegram" | "discord" | "cli";
  lastMessagePreview: string;
}

export interface ThreadMessageRecord {
  id: string;
  threadId: string;
  timestamp: string;
  role: "user" | "assistant" | "system";
  domain: "general" | "trading";
  content: string;
  tags: string[];
  attachments: Array<{
    id: string;
    kind: "chart" | "file";
    label: string;
    path?: string;
  }>;
}

interface ThreadFile {
  threads: ThreadRecord[];
  messages: ThreadMessageRecord[];
}

export class ThreadStore {
  constructor(private readonly path: string) {}

  async load(): Promise<ThreadFile> {
    if (!existsSync(this.path)) {
      return { threads: [], messages: [] };
    }

    const raw = await Bun.file(this.path).text();
    if (!raw.trim()) {
      return { threads: [], messages: [] };
    }

    const parsed = JSON.parse(raw) as ThreadFile;
    return {
      threads: parsed.threads ?? [],
      messages: parsed.messages ?? [],
    };
  }

  async save(data: ThreadFile) {
    await Bun.write(this.path, JSON.stringify(data, null, 2));
  }

  async ensureThread(input: {
    id: string;
    title: string;
    source: ThreadRecord["source"];
    lastMessagePreview: string;
  }) {
    const data = await this.load();
    const now = new Date().toISOString();
    const existing = data.threads.find((thread) => thread.id === input.id);

    if (existing) {
      existing.updatedAt = now;
      existing.lastMessagePreview = input.lastMessagePreview;
      if (!existing.title || existing.title === "New thread") {
        existing.title = input.title;
      }
    } else {
      data.threads.push({
        id: input.id,
        createdAt: now,
        updatedAt: now,
        title: input.title,
        source: input.source,
        lastMessagePreview: input.lastMessagePreview,
      });
    }

    await this.save(data);
  }

  async appendMessage(message: ThreadMessageRecord) {
    const data = await this.load();
    data.messages.push(message);
    const thread = data.threads.find((item) => item.id === message.threadId);
    if (thread) {
      thread.updatedAt = message.timestamp;
      thread.lastMessagePreview = message.content.slice(0, 120);
    }
    await this.save(data);
  }

  async listThreads(limit = 40) {
    const data = await this.load();
    return data.threads.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit);
  }

  async getThreadMessages(threadId: string, limit = 100) {
    const data = await this.load();
    return data.messages.filter((message) => message.threadId === threadId).slice(-limit);
  }
}
