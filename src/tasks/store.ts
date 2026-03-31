import { existsSync } from "node:fs";

export interface TaskEntry {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  domain: "general" | "trading";
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "done";
  tags: string[];
}

interface TaskFile {
  tasks: TaskEntry[];
}

export class TaskStore {
  constructor(private readonly path: string) {}

  async load(): Promise<TaskEntry[]> {
    if (!existsSync(this.path)) {
      return [];
    }

    const raw = await Bun.file(this.path).text();
    if (!raw.trim()) {
      return [];
    }

    const parsed = JSON.parse(raw) as TaskFile;
    return parsed.tasks ?? [];
  }

  async save(tasks: TaskEntry[]) {
    await Bun.write(this.path, JSON.stringify({ tasks }, null, 2));
  }

  async append(task: TaskEntry) {
    const tasks = await this.load();
    tasks.push(task);
    await this.save(tasks);
  }

  async updateStatus(id: string, status: TaskEntry["status"]) {
    const tasks = await this.load();
    const next = tasks.map((task) => (task.id === id ? { ...task, status } : task));
    await this.save(next);
    return next.find((task) => task.id === id) ?? null;
  }

  async recent(limit = 20) {
    const tasks = await this.load();
    return tasks.slice(-limit);
  }
}
