import { randomUUID } from "node:crypto";
import type { TaskEntry } from "../tasks/store";
import type { WatchlistEntry } from "../watchlist/store";
import type { DeskState, RoutineRun } from "./store";

function block(title: string, lines: string[]) {
  return [`${title}:`, ...lines.map((line) => `- ${line}`)].join("\n");
}

export function buildRoutineOutput(input: {
  routine: RoutineRun["routine"];
  deskState: DeskState;
  watchlist: WatchlistEntry[];
  tasks: TaskEntry[];
}): RoutineRun {
  const { routine, deskState, watchlist, tasks } = input;
  const activeWatchlist = watchlist.filter((entry) => entry.status === "active").slice(-5);
  const openTasks = tasks.filter((task) => task.status !== "done").slice(-5);

  const intros: Record<RoutineRun["routine"], string> = {
    daily: "Start broad. Sharpen later.",
    "london-prep": "Prepare for London, not for fantasy entries.",
    "new-york-prep": "Carry only what still has structure into New York.",
    "weekend-review": "Step back far enough to see your own patterning.",
  };

  const output = [
    intros[routine],
    "",
    block("Desk state", [
      `Focus: ${deskState.activeFocus}`,
      `Bias: ${deskState.marketBias}`,
      ...(deskState.keyLevels.length > 0 ? [`Levels: ${deskState.keyLevels.join(", ")}`] : ["Levels: none set"]),
    ]),
    "",
    block(
      "Watchlist",
      activeWatchlist.length > 0
        ? activeWatchlist.map((entry) => `${entry.symbol} ${entry.timeframe}: ${entry.thesis} | invalidation: ${entry.invalidation}`)
        : ["No active entries."],
    ),
    "",
    block(
      "Tasks",
      openTasks.length > 0
        ? openTasks.map((task) => `${task.priority} ${task.domain}: ${task.title}`)
        : ["No open tasks."],
    ),
    "",
    block(
      "No-trade conditions",
      deskState.noTradeConditions.length > 0 ? deskState.noTradeConditions : ["None defined yet."],
    ),
  ].join("\n");

  return {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    routine,
    output,
  };
}
