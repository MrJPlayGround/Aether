import { existsSync } from "node:fs";

export interface DeskState {
  updatedAt: string;
  activeFocus: string;
  marketBias: string;
  noTradeConditions: string[];
  keyLevels: string[];
  notes: string;
}

export interface RoutineRun {
  id: string;
  timestamp: string;
  routine: "daily" | "london-prep" | "new-york-prep" | "weekend-review";
  output: string;
}

interface DeskFile {
  state: DeskState;
  routines: RoutineRun[];
}

const DEFAULT_STATE: DeskState = {
  updatedAt: new Date(0).toISOString(),
  activeFocus: "No active desk focus set.",
  marketBias: "Neutral until proven otherwise.",
  noTradeConditions: [],
  keyLevels: [],
  notes: "",
};

export class DeskStore {
  constructor(private readonly path: string) {}

  async load(): Promise<DeskFile> {
    if (!existsSync(this.path)) {
      return { state: DEFAULT_STATE, routines: [] };
    }

    const raw = await Bun.file(this.path).text();
    if (!raw.trim()) {
      return { state: DEFAULT_STATE, routines: [] };
    }

    const parsed = JSON.parse(raw) as Partial<DeskFile>;
    return {
      state: parsed.state ?? DEFAULT_STATE,
      routines: parsed.routines ?? [],
    };
  }

  async save(data: DeskFile) {
    await Bun.write(this.path, JSON.stringify(data, null, 2));
  }

  async getState() {
    const data = await this.load();
    return data.state;
  }

  async updateState(next: Partial<Omit<DeskState, "updatedAt">>) {
    const data = await this.load();
    data.state = {
      ...data.state,
      ...next,
      updatedAt: new Date().toISOString(),
    };
    await this.save(data);
    return data.state;
  }

  async appendRoutine(run: RoutineRun) {
    const data = await this.load();
    data.routines.push(run);
    await this.save(data);
  }

  async recentRoutines(limit = 20) {
    const data = await this.load();
    return data.routines.slice(-limit);
  }
}
