import { collectTradingSignals, detectDomain } from "../domains/trading/intake";
import { buildResponse } from "../core/response";
import { compileSystemBrief } from "../core/souls";
import type { BriefEntry } from "../briefs/store";
import type { ChartEntry } from "../charts/store";
import type { MarketQuoteContext, RuntimeContext } from "../core/types";
import type { JournalEntry } from "../journal/store";
import type { Provider } from "../providers/types";

function formatMemoryBlock(context: RuntimeContext, limit = 8): string {
  const entries = context.memory.slice(-limit);
  if (entries.length === 0) {
    return "No prior memory yet.";
  }

  return entries
    .map((entry) => `[${entry.domain}] ${entry.role}: ${entry.content}`)
    .join("\n");
}

function formatJournalBlock(entries: JournalEntry[], limit = 5): string {
  if (entries.length === 0) {
    return "No journal context yet.";
  }

  return entries
    .slice(-limit)
    .map((entry) => `[${entry.domain}/${entry.kind}] ${entry.title}: ${entry.content}`)
    .join("\n");
}

function formatBriefBlock(briefs: BriefEntry[], limit = 2): string {
  if (briefs.length === 0) {
    return "No brief history yet.";
  }

  return briefs
    .slice(-limit)
    .map((brief) => `[${brief.type}] ${brief.title}\n${brief.body}`)
    .join("\n\n");
}

function formatChartBlock(charts: ChartEntry[]): string {
  if (charts.length === 0) {
    return "No chart references attached.";
  }

  return charts
    .map((chart) =>
      `[${chart.symbol} ${chart.timeframe}] note=${chart.note || "none"} path=${chart.path}`,
    )
    .join("\n");
}

function buildUserPrompt(
  input: string,
  context: RuntimeContext,
  journal: JournalEntry[],
  briefs: BriefEntry[],
  charts: ChartEntry[],
  marketQuotes: MarketQuoteContext[],
): string {
  const memoryBlock = formatMemoryBlock(context);
  const journalBlock = formatJournalBlock(journal);
  const briefBlock = formatBriefBlock(briefs);
  const chartBlock = formatChartBlock(charts);
  const marketBlock = marketQuotes.length === 0
    ? "No live market snapshot attached."
    : marketQuotes
        .map((quote) => {
          if (quote.status !== "live") {
            return `[${quote.market}] ${quote.symbol}: ${quote.status}${quote.note ? ` (${quote.note})` : ""}`;
          }
          return `[${quote.market}] ${quote.symbol} price=${quote.price ?? "n/a"} bid=${quote.bid ?? "n/a"} ask=${quote.ask ?? "n/a"} volume24h=${quote.volume24h ?? "n/a"} asOf=${quote.timestamp}`;
        })
        .join("\n");

  return [
    "Context memory:",
    memoryBlock,
    "",
    "Journal context:",
    journalBlock,
    "",
    "Brief context:",
    briefBlock,
    "",
    "Attached chart references:",
    chartBlock,
    "",
    "Live market context:",
    marketBlock,
    "",
    "Current user input:",
    input,
    "",
    "Requirements:",
    "- Stay in character as the lead assistant.",
    "- If this is trading-related, respond with context, scenario, invalidation, and risk.",
    "- Do not sound like a bot.",
    "- Be concise unless depth is necessary.",
  ].join("\n");
}

export class RuntimeEngine {
  constructor(
    private readonly provider: Provider | null,
    private readonly model: string,
  ) {}

  async respond(
    input: string,
    context: RuntimeContext,
    journal: JournalEntry[] = [],
    briefs: BriefEntry[] = [],
    charts: ChartEntry[] = [],
    marketQuotes: MarketQuoteContext[] = [],
  ) {
    if (!this.provider) {
      return {
        ...buildResponse(input, context),
        provider: "local-scaffold",
        model: "local-scaffold",
      };
    }

    try {
      const system = compileSystemBrief(context.souls);
      const userPrompt = buildUserPrompt(input, context, journal, briefs, charts, marketQuotes);
      const result = await this.provider.complete({
        model: this.model,
        maxTokens: 900,
        temperature: 0.45,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
      });

      const domain = detectDomain(input);
      const tradingSignals = domain === "trading" ? collectTradingSignals(input) : [];
      const fallback = buildResponse(input, context);

      return {
        text: result.content.trim() || fallback.text,
        domain,
        tags: [
          domain,
          ...tradingSignals,
          `provider:${result.provider}`,
          `model:${result.model}`,
        ],
        memoryNotes: [`Stored as ${domain} context.`],
        provider: result.provider,
        model: result.model,
      };
    } catch (error) {
      const fallback = buildResponse(input, context);
      const message = error instanceof Error ? error.message : "Unknown provider error";

      return {
        text: `${fallback.text}\nProvider fallback: ${message}`,
        domain: fallback.domain,
        tags: [...fallback.tags, "provider:fallback"],
        memoryNotes: [...fallback.memoryNotes, "Live model failed; local fallback used."],
        provider: "local-fallback",
        model: this.model,
      };
    }
  }
}
