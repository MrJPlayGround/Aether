import type { Domain } from "../../core/types";

const tradingKeywords = [
  "btc",
  "eth",
  "crypto",
  "trade",
  "trading",
  "chart",
  "long",
  "short",
  "setup",
  "risk",
  "entry",
  "stop",
  "tp",
  "take profit",
  "macro",
  "funding",
  "indices",
  "nq",
  "spx",
  "es",
  "sol",
  "xrp",
  "liquidity",
  "session",
];

export function detectDomain(input: string): Domain {
  const normalized = input.toLowerCase();
  return tradingKeywords.some((keyword) => normalized.includes(keyword))
    ? "trading"
    : "general";
}

export function collectTradingSignals(input: string): string[] {
  const normalized = input.toLowerCase();
  const signals: string[] = [];

  if (normalized.includes("chart")) signals.push("chart-review");
  if (normalized.includes("long") || normalized.includes("short")) signals.push("directional-bias");
  if (normalized.includes("risk") || normalized.includes("stop")) signals.push("risk-framing");
  if (normalized.includes("idea") || normalized.includes("setup")) signals.push("setup-discussion");
  if (normalized.includes("macro") || normalized.includes("news")) signals.push("macro-context");

  return signals;
}
