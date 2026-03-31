import type { WatchlistEntry } from "../watchlist/store";

export interface MarketQuote {
  symbol: string;
  market: WatchlistEntry["market"];
  productId?: string;
  price?: number;
  bid?: number;
  ask?: number;
  volume24h?: number;
  timestamp: string;
  source: string;
  status: "live" | "unsupported" | "unavailable";
  note?: string;
}

export interface MarketDataProvider {
  readonly name: string;
  getQuote(input: {
    symbol: string;
    market: WatchlistEntry["market"];
  }): Promise<MarketQuote>;
}
