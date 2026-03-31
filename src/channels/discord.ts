import type { Channel } from "./types";

const DISCORD_GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json";
const DISCORD_API_BASE = "https://discord.com/api/v10";
const INTENTS = 1 << 9 | 1 << 12 | 1 << 15;

interface DiscordGatewayPayload {
  op: number;
  t?: string;
  s?: number;
  d: any;
}

export class DiscordChannel implements Channel {
  readonly name = "discord";
  private ws?: WebSocket;
  private heartbeatTimer?: Timer;
  private heartbeatInterval = 0;
  private lastSequence: number | null = null;
  private running = false;
  private botUserId: string | null = null;

  constructor(
    private readonly token: string,
    private readonly onMessage: (payload: { message: string }) => Promise<string>,
  ) {}

  isConnected() {
    return this.running && this.ws?.readyState === WebSocket.OPEN;
  }

  async start() {
    if (this.running) return;
    this.running = true;
    this.connect();
  }

  async stop() {
    this.running = false;
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.ws?.close();
  }

  private connect() {
    this.ws = new WebSocket(DISCORD_GATEWAY_URL);

    this.ws.onmessage = (event) => {
      const payload = JSON.parse(String(event.data)) as DiscordGatewayPayload;
      if (typeof payload.s === "number") this.lastSequence = payload.s;

      if (payload.op === 10) {
        this.heartbeatInterval = payload.d.heartbeat_interval;
        this.startHeartbeat();
        this.identify();
        return;
      }

      if (payload.op === 0 && payload.t === "READY") {
        this.botUserId = payload.d.user?.id ?? null;
        return;
      }

      if (payload.op === 0 && payload.t === "MESSAGE_CREATE") {
        void this.handleMessage(payload.d);
      }
    };

    this.ws.onclose = () => {
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      if (this.running) {
        setTimeout(() => this.connect(), 3000);
      }
    };
  }

  private startHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      this.ws?.send(JSON.stringify({ op: 1, d: this.lastSequence }));
    }, this.heartbeatInterval);
  }

  private identify() {
    this.ws?.send(
      JSON.stringify({
        op: 2,
        d: {
          token: this.token,
          intents: INTENTS,
          properties: {
            os: "macos",
            browser: "aether",
            device: "aether",
          },
        },
      }),
    );
  }

  private async handleMessage(message: any) {
    if (message.author?.bot) return;

    const content = String(message.content ?? "").trim();
    const isDM = message.guild_id == null;
    const mentionsBot = this.botUserId ? content.includes(`<@${this.botUserId}>`) || content.includes(`<@!${this.botUserId}>`) : false;
    if (!isDM && !mentionsBot) return;

    const cleaned = this.botUserId
      ? content.replace(new RegExp(`<@!?${this.botUserId}>`, "g"), "").trim()
      : content;

    if (!cleaned) return;

    const reply = await this.onMessage({ message: cleaned });
    await fetch(`${DISCORD_API_BASE}/channels/${message.channel_id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${this.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ content: reply }),
    });
  }
}
