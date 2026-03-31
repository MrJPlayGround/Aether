import { detectDomain, collectTradingSignals } from "../domains/trading/intake";
import { buildTradingBrief } from "../domains/trading/brief";
import { retrieveRelevantMemory } from "../memory/retrieval";
import type { AssistantResponse, RuntimeContext } from "./types";

function summarizeRecentContext(context: RuntimeContext): string[] {
  return context.memory.slice(-4).map((entry) => `${entry.role}: ${entry.content}`);
}

function buildGeneralResponse(input: string, context: RuntimeContext): AssistantResponse {
  const recent = summarizeRecentContext(context);
  const relevant = retrieveRelevantMemory(context.memory, input);
  const lines = [
    "Aether runtime scaffold is active.",
    "Right now this system is using a local response engine, not a live model provider.",
    "I can still keep continuity, route trading inputs, and preserve memory while the real model layer is wired in.",
  ];

  if (recent.length > 0) {
    lines.push(`Recent context in memory: ${recent.join(" | ")}`);
  }

  if (relevant.length > 0) {
    lines.push(`Relevant recall: ${relevant.map((entry) => entry.content).join(" | ")}`);
  }

  lines.push(`Current focus: ${input}`);

  return {
    text: lines.join("\n"),
    domain: "general",
    tags: ["runtime-scaffold", "general"],
    memoryNotes: ["Stored as general context."],
  };
}

function buildTradingResponse(input: string, context: RuntimeContext): AssistantResponse {
  const signals = collectTradingSignals(input);
  const brief = buildTradingBrief(input, context.memory);
  const relevant = retrieveRelevantMemory(context.memory, input);

  const lines = [
    "Trading desk mode is active.",
    "This is still the local scaffold, so treat the output as structure-first until the live model layer is added.",
    "What I would anchor on:",
    "- context and timeframe before bias",
    "- invalidation before target",
    "- no-trade is valid if the setup is being manufactured",
  ];

  if (signals.length > 0) {
    lines.push(`Detected focus: ${signals.join(", ")}`);
  }

  if (relevant.length > 0) {
    lines.push(`Relevant recall: ${relevant.map((entry) => entry.content).join(" | ")}`);
  }

  lines.push("Working brief:");
  lines.push(brief);

  return {
    text: lines.join("\n"),
    domain: "trading",
    tags: ["runtime-scaffold", "trading", ...signals],
    memoryNotes: ["Stored as trading context."],
  };
}

export function buildResponse(input: string, context: RuntimeContext): AssistantResponse {
  const domain = detectDomain(input);
  return domain === "trading"
    ? buildTradingResponse(input, context)
    : buildGeneralResponse(input, context);
}
