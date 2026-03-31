import { afterEach, describe, expect, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { ThreadStore } from "../threads/store";

describe("ThreadStore", () => {
  const path = join(tmpdir(), `aether-threads-${Date.now()}.json`);

  afterEach(() => {
    rmSync(path, { force: true });
  });

  test("creates thread and stores messages", async () => {
    const store = new ThreadStore(path);
    await store.ensureThread({
      id: "thread-1",
      title: "BTC reclaim",
      source: "gateway",
      lastMessagePreview: "hello",
    });

    await store.appendMessage({
      id: "msg-1",
      threadId: "thread-1",
      timestamp: new Date().toISOString(),
      role: "user",
      domain: "trading",
      content: "Check BTC",
      tags: ["input"],
      attachments: [],
    });

    const threads = await store.listThreads();
    const messages = await store.getThreadMessages("thread-1");

    expect(threads).toHaveLength(1);
    expect(threads[0]?.title).toBe("BTC reclaim");
    expect(messages).toHaveLength(1);
    expect(messages[0]?.content).toBe("Check BTC");
  });
});
