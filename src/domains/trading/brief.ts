import type { MemoryEntry } from "../../core/types";

export function buildTradingBrief(input: string, memory: MemoryEntry[]): string {
  const recentTrading = memory
    .filter((entry) => entry.domain === "trading")
    .slice(-3)
    .map((entry) => `- ${entry.role}: ${entry.content}`)
    .join("\n");

  const sections = [
    "Trading posture:",
    "State the read cleanly. If conviction is weak, say so.",
    "Separate current context, trade idea, invalidation, and risk.",
    "Do not force a setup if the input is thin.",
  ];

  if (recentTrading) {
    sections.push("Relevant recent trading memory:");
    sections.push(recentTrading);
  }

  sections.push("Current user input:");
  sections.push(input);

  return sections.join("\n");
}
