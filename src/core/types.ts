export type Domain = "general" | "trading";

export interface SoulProfile {
  leadIdentity: string;
  leadPersonality: string;
  leadRules: string;
  tradingIdentity: string;
  tradingRules: string;
}

export interface MemoryEntry {
  id: string;
  timestamp: string;
  role: "user" | "assistant" | "system";
  domain: Domain;
  content: string;
  tags: string[];
}

export interface AssistantResponse {
  text: string;
  domain: Domain;
  tags: string[];
  memoryNotes: string[];
}

export interface RuntimeContext {
  memory: MemoryEntry[];
  souls: SoulProfile;
}

export interface MarketQuoteContext {
  symbol: string;
  market: "crypto" | "indices" | "forex" | "stocks";
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

export interface MessageRequest {
  message: string;
  chartIds?: string[];
  threadId?: string;
  source?: "gateway" | "telegram" | "discord" | "cli";
}
