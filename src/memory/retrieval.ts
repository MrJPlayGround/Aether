import type { MemoryEntry } from "../core/types";

function scoreEntry(entry: MemoryEntry, query: string): number {
  const needle = query.toLowerCase();
  const content = entry.content.toLowerCase();
  let score = 0;

  if (content.includes(needle)) score += 5;
  for (const tag of entry.tags) {
    if (tag.toLowerCase().includes(needle)) score += 2;
  }
  if (entry.domain === "trading" && /btc|eth|trade|chart|risk|macro/.test(needle)) {
    score += 1;
  }

  return score;
}

export function retrieveRelevantMemory(entries: MemoryEntry[], query: string, limit = 5) {
  return entries
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((item) => item.entry);
}
