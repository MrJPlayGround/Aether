import { randomUUID } from "node:crypto";
import type { BriefEntry } from "./store";
import type { MemoryEntry } from "../core/types";
import type { JournalEntry } from "../journal/store";
import type { TaskEntry } from "../tasks/store";
import type { WatchlistEntry } from "../watchlist/store";

function section(title: string, lines: string[]) {
  return [`${title}:`, ...lines.map((line) => `- ${line}`)].join("\n");
}

export function generateDailyBrief(
  memory: MemoryEntry[],
  journal: JournalEntry[],
  watchlist: WatchlistEntry[] = [],
  tasks: TaskEntry[] = [],
): BriefEntry {
  const recentGeneral = memory.filter((entry) => entry.domain === "general").slice(-3);
  const recentTrading = memory.filter((entry) => entry.domain === "trading").slice(-3);
  const recentJournal = journal.slice(-3);
  const activeWatchlist = watchlist.filter((entry) => entry.status === "active").slice(-4);
  const openTasks = tasks.filter((task) => task.status !== "done").slice(-4);

  const body = [
    section(
      "Personal context",
      recentGeneral.length > 0
        ? recentGeneral.map((entry) => `${entry.role}: ${entry.content}`)
        : ["No recent general context stored yet."],
    ),
    section(
      "Trading context",
      recentTrading.length > 0
        ? recentTrading.map((entry) => `${entry.role}: ${entry.content}`)
        : ["No recent trading context stored yet."],
    ),
    section(
      "Journal focus",
      recentJournal.length > 0
        ? recentJournal.map((entry) => `${entry.kind}: ${entry.title}`)
        : ["No journal entries stored yet."],
    ),
    section(
      "Watchlist pressure",
      activeWatchlist.length > 0
        ? activeWatchlist.map((entry) => `${entry.symbol} ${entry.timeframe}: ${entry.thesis} | invalidation: ${entry.invalidation}`)
        : ["No active watchlist entries yet."],
    ),
    section(
      "Open tasks",
      openTasks.length > 0
        ? openTasks.map((task) => `${task.priority} ${task.domain}: ${task.title}`)
        : ["No open tasks yet."],
    ),
    section("Operator note", [
      "Reduce noise.",
      "Keep trading structure-first: context, invalidation, risk, then expression.",
      "If conviction is thin, preserve capital and wait.",
    ]),
  ].join("\n\n");

  return {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    type: "daily",
    title: "Daily Aether Brief",
    body,
    tags: ["daily-brief", "system-generated"],
  };
}
