import { describe, expect, test } from "bun:test";
import { RuntimeEngine } from "../runtime/engine";

describe("RuntimeEngine", () => {
  test("falls back when provider throws", async () => {
    const engine = new RuntimeEngine(
      {
        name: "broken",
        async complete() {
          throw new Error("provider down");
        },
      },
      "gpt-5.4",
    );

    const result = await engine.respond(
      "Need BTC invalidation",
      {
        memory: [],
        souls: {
          leadIdentity: "lead",
          leadPersonality: "tone",
          leadRules: "rules",
          tradingIdentity: "trading",
          tradingRules: "trading-rules",
        },
      },
      [],
      [],
      [],
    );

    expect(result.provider).toBe("local-fallback");
    expect(result.text).toContain("Provider fallback");
  });
});
