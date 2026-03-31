import type { Channel } from "./types";

interface TelegramMessagePayload {
  message: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    text?: string;
    chat: { id: number; type: string };
    from?: { is_bot?: boolean; username?: string };
  };
}

export class TelegramChannel implements Channel {
  readonly name = "telegram";
  private offset = 0;
  private timer?: Timer;
  private running = false;

  constructor(
    private readonly token: string,
    private readonly onMessage: (payload: TelegramMessagePayload) => Promise<string>,
  ) {}

  isConnected() {
    return this.running;
  }

  async start() {
    if (this.running) return;
    this.running = true;
    await this.poll();
    this.timer = setInterval(() => {
      void this.poll();
    }, 2500);
  }

  async stop() {
    this.running = false;
    if (this.timer) clearInterval(this.timer);
  }

  private api(path: string) {
    return `https://api.telegram.org/bot${this.token}/${path}`;
  }

  private async sendMessage(chatId: number, text: string) {
    await fetch(this.api("sendMessage"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });
  }

  private async poll() {
    if (!this.running) return;

    const response = await fetch(this.api(`getUpdates?timeout=20&offset=${this.offset}`));
    if (!response.ok) return;
    const data = (await response.json()) as {
      ok: boolean;
      result: TelegramUpdate[];
    };

    for (const update of data.result ?? []) {
      this.offset = update.update_id + 1;
      const message = update.message;
      if (!message?.text || message.from?.is_bot) continue;

      const text = message.text.trim();
      if (!text) continue;

      const reply = await this.onMessage({ message: text });
      await this.sendMessage(message.chat.id, reply);
    }
  }
}
