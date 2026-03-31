import type { ChartEntry } from "../charts/store";
import type { WatchlistEntry } from "../watchlist/store";
import type { MarketDataProvider, MarketQuote } from "./types";

function uniqueByKey<T>(items: T[], keyFn: (item: T) => string) {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

function extractUpperTickerLikeTokens(input: string) {
  return Array.from(
    new Set(
      (input.toUpperCase().match(/\b[A-Z]{2,10}\b/g) ?? [])
        .filter((token) => !["USD", "LONG", "SHORT", "TP"].includes(token)),
    ),
  );
}

export class MarketDataService {
  constructor(private readonly provider: MarketDataProvider | null) {}

  async getQuotes(items: Array<{ symbol: string; market: WatchlistEntry["market"] }>) {
    const unique = uniqueByKey(items, (item) => `${item.market}:${item.symbol.toUpperCase()}`);

    if (!this.provider) {
      return unique.map<MarketQuote>((item) => ({
        symbol: item.symbol,
        market: item.market,
        timestamp: new Date().toISOString(),
        source: "none",
        status: "unavailable",
        note: "No market data provider configured.",
      }));
    }

    const provider = this.provider;
    return Promise.all(unique.map((item) => provider.getQuote(item)));
  }

  async getQuotesForWatchlist(entries: WatchlistEntry[], limit = 8) {
    const active = entries
      .filter((entry) => entry.status === "active")
      .slice(-limit)
      .map((entry) => ({ symbol: entry.symbol, market: entry.market }));
    return this.getQuotes(active);
  }

  async getRelevantQuotes(input: {
    message: string;
    charts: ChartEntry[];
    watchlist: WatchlistEntry[];
  }) {
    const tickerTokens = extractUpperTickerLikeTokens(input.message).map((symbol) => ({
      symbol,
      market: "crypto" as const,
    }));
    const chartSymbols = input.charts.map((chart) => ({
      symbol: chart.symbol,
      market: "crypto" as const,
    }));
    const watchlistSymbols = input.watchlist
      .filter((entry) => entry.status === "active")
      .slice(-5)
      .map((entry) => ({
        symbol: entry.symbol,
        market: entry.market,
      }));

    return this.getQuotes([
      ...tickerTokens,
      ...chartSymbols,
      ...watchlistSymbols,
    ]);
  }
}
