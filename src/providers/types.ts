export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ProviderResponse {
  content: string;
  model: string;
  provider: string;
  tokensIn: number;
  tokensOut: number;
  finishReason?: string;
}

export interface CompletionParams {
  messages: Message[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface Provider {
  name: string;
  complete(params: CompletionParams): Promise<ProviderResponse>;
}
