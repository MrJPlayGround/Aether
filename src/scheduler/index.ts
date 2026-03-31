import { generateDailyBrief } from "../briefs/generator";
import type { BriefStore } from "../briefs/store";
import type { TaskStore } from "../tasks/store";
import type { WatchlistStore } from "../watchlist/store";
import type { MemoryStore } from "../memory/store";
import type { JournalStore } from "../journal/store";

export interface SchedulerHandle {
  stop(): void;
}

export function startScheduler(
  briefStore: BriefStore,
  memoryStore: MemoryStore,
  journalStore: JournalStore,
  watchlistStore: WatchlistStore,
  taskStore: TaskStore,
): SchedulerHandle {
  const timer = setInterval(async () => {
    const memory = await memoryStore.load();
    const journal = await journalStore.load();
    const watchlist = await watchlistStore.load();
    const tasks = await taskStore.load();
    const brief = generateDailyBrief(memory, journal, watchlist, tasks);
    await briefStore.append(brief);
  }, 1000 * 60 * 60 * 12);

  return {
    stop() {
      clearInterval(timer);
    },
  };
}
