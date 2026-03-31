import type { Channel } from "./types";
import { DiscordChannel } from "./discord";
import { TelegramChannel } from "./telegram";

export interface ChannelManager {
  channels: Channel[];
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function createChannelManager(input: {
  telegramToken?: string;
  discordToken?: string;
  onMessage: (payload: { message: string }) => Promise<string>;
}): ChannelManager {
  const channels: Channel[] = [];

  if (input.telegramToken) {
    channels.push(new TelegramChannel(input.telegramToken, input.onMessage));
  }

  if (input.discordToken) {
    channels.push(new DiscordChannel(input.discordToken, input.onMessage));
  }

  return {
    channels,
    async start() {
      for (const channel of channels) {
        await channel.start();
      }
    },
    async stop() {
      for (const channel of channels) {
        await channel.stop();
      }
    },
  };
}
