import type { WatchlistEntry } from "../watchlist/store";
import type { MarketDataProvider, MarketQuote } from "./types";

interface CoinbaseProduct {
  id: string;
  base_currency: string;
  quote_currency: string;
  status: "online" | "offline" | "internal" | "delisted";
  trading_disabled?: boolean;
}

interface CoinbaseTicker {
  price: string;
  bid: string;
  ask: string;
  volume: string;
  time: string;
}

function toNumber(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeCryptoCandidates(symbol: string) {
  const trimmed = symbol.trim().toUpperCase();
  const clean = trimmed.replace("/", "-").replace("_", "-");

  if (clean.includes("-")) {
    return [clean];
  }

  return [
    `${clean}-USD`,
    `${clean}-USDT`,
    `${clean}-EUR`,
  ];
}

export class CoinbaseExchangeProvider implements MarketDataProvider {
  readonly name = "coinbase-exchange";
  private productMapPromise: Promise<Map<string, CoinbaseProduct>> | null = null;

  constructor(
    private readonly baseUrl = "https://api.exchange.coinbase.com",
  ) {}

  private async loadProducts() {
    if (!this.productMapPromise) {
      this.productMapPromise = (async () => {
        const response = await fetch(`${this.baseUrl}/products`);
        if (!response.ok) {
          throw new Error(`Coinbase products request failed: ${response.status}`);
        }
        const products = await response.json() as CoinbaseProduct[];
        const map = new Map<string, CoinbaseProduct>();
        for (const product of products) {
          map.set(product.id.toUpperCase(), product);
        }
        return map;
      })();
    }

    return this.productMapPromise;
  }

  private unsupportedQuote(
    symbol: string,
    market: WatchlistEntry["market"],
    note: string,
  ): MarketQuote {
    return {
      symbol,
      market,
      timestamp: new Date().toISOString(),
      source: this.name,
      status: "unsupported",
      note,
    };
  }

  async getQuote(input: {
    symbol: string;
    market: WatchlistEntry["market"];
  }): Promise<MarketQuote> {
    const { symbol, market } = input;

    if (market !== "crypto") {
      return this.unsupportedQuote(symbol, market, "Live feed is currently enabled for crypto symbols only.");
    }

    try {
      const products = await this.loadProducts();
      const productId = normalizeCryptoCandidates(symbol).find((candidate) => {
        const product = products.get(candidate);
        return product && product.status === "online" && !product.trading_disabled;
      });

      if (!productId) {
        return this.unsupportedQuote(symbol, market, "No matching live Coinbase market was found for this symbol.");
      }

      const response = await fetch(`${this.baseUrl}/products/${productId}/ticker`);
      if (!response.ok) {
        return {
          symbol,
          market,
          productId,
          timestamp: new Date().toISOString(),
          source: this.name,
          status: "unavailable",
          note: `Ticker request failed: ${response.status}`,
        };
      }

      const ticker = await response.json() as CoinbaseTicker;

      return {
        symbol,
        market,
        productId,
        price: toNumber(ticker.price),
        bid: toNumber(ticker.bid),
        ask: toNumber(ticker.ask),
        volume24h: toNumber(ticker.volume),
        timestamp: ticker.time ?? new Date().toISOString(),
        source: this.name,
        status: "live",
      };
    } catch (error) {
      return {
        symbol,
        market,
        timestamp: new Date().toISOString(),
        source: this.name,
        status: "unavailable",
        note: error instanceof Error ? error.message : "Unknown live market data failure.",
      };
    }
  }
}
