import type { CompletionParams, Message, Provider, ProviderResponse } from "./types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string | null;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  model: string;
}

export class OpenAIProvider implements Provider {
  readonly name = "openai";

  constructor(
    private readonly apiKey: string,
    private readonly defaultModel: string,
  ) {}

  async complete(params: CompletionParams): Promise<ProviderResponse> {
    const messages: OpenAIMessage[] = params.messages.map((message: Message) => ({
      role: message.role,
      content: message.content,
    }));

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: params.model ?? this.defaultModel,
        messages,
        max_tokens: params.maxTokens ?? 800,
        temperature: params.temperature ?? 0.5,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${text}`);
    }

    const data = (await response.json()) as OpenAIResponse;
    const choice = data.choices[0];
    if (!choice) {
      throw new Error("OpenAI returned no choices");
    }

    return {
      content: choice.message.content ?? "",
      model: data.model,
      provider: this.name,
      tokensIn: data.usage?.prompt_tokens ?? 0,
      tokensOut: data.usage?.completion_tokens ?? 0,
      finishReason: choice.finish_reason,
    };
  }
}
