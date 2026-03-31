import type { CompletionParams, Provider, ProviderResponse } from "./types";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } };

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

interface AnthropicResponse {
  content: Array<{ type: "text"; text: string }>;
  model: string;
  usage: { input_tokens: number; output_tokens: number };
  stop_reason: string;
}

export interface VisionParams {
  system?: string;
  userText: string;
  images?: Array<{ base64: string; mediaType: string }>;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export class AnthropicProvider implements Provider {
  readonly name = "anthropic";

  constructor(
    private readonly apiKey: string,
    private readonly defaultModel: string,
  ) {}

  async complete(params: CompletionParams): Promise<ProviderResponse> {
    const systemMsg = params.messages.find(m => m.role === "system");
    const nonSystem = params.messages.filter(m => m.role !== "system");

    const messages: AnthropicMessage[] = nonSystem.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    return this.call({
      system: systemMsg?.content,
      messages,
      model: params.model ?? this.defaultModel,
      maxTokens: params.maxTokens ?? 800,
      temperature: params.temperature ?? 0.5,
    });
  }

  async vision(params: VisionParams): Promise<ProviderResponse> {
    const content: ContentBlock[] = [];

    if (params.images) {
      for (const img of params.images) {
        content.push({
          type: "image",
          source: { type: "base64", media_type: img.mediaType, data: img.base64 },
        });
      }
    }

    content.push({ type: "text", text: params.userText });

    const messages: AnthropicMessage[] = [{ role: "user", content }];

    return this.call({
      system: params.system,
      messages,
      model: params.model ?? this.defaultModel,
      maxTokens: params.maxTokens ?? 2000,
      temperature: params.temperature ?? 0.3,
    });
  }

  private async call(opts: {
    system?: string;
    messages: AnthropicMessage[];
    model: string;
    maxTokens: number;
    temperature: number;
  }): Promise<ProviderResponse> {
    const body: Record<string, unknown> = {
      model: opts.model,
      messages: opts.messages,
      max_tokens: opts.maxTokens,
      temperature: opts.temperature,
    };
    if (opts.system) body.system = opts.system;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${text}`);
    }

    const data = (await response.json()) as AnthropicResponse;
    const textBlock = data.content.find(b => b.type === "text");

    return {
      content: textBlock?.text ?? "",
      model: data.model,
      provider: this.name,
      tokensIn: data.usage.input_tokens,
      tokensOut: data.usage.output_tokens,
      finishReason: data.stop_reason,
    };
  }
}
