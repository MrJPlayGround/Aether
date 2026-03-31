import { randomUUID } from "node:crypto";
import type { JournalEntry, JournalKind } from "../journal/store";

export function createJournalEntry(input: {
  kind: JournalKind;
  title: string;
  content: string;
  tags?: string[];
  domain: "general" | "trading";
  threadId?: string;
}): JournalEntry {
  const entry: JournalEntry = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    kind: input.kind,
    title: input.title,
    content: input.content,
    tags: input.tags ?? [],
    domain: input.domain,
  };
  if (input.threadId) entry.threadId = input.threadId;
  return entry;
}
