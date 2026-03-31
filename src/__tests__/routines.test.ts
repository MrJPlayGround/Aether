import { describe, expect, test } from "bun:test";
import { buildRoutineOutput } from "../desk/routines";

describe("buildRoutineOutput", () => {
  test("includes desk state and watchlist context", () => {
    const run = buildRoutineOutput({
      routine: "daily",
      deskState: {
        updatedAt: new Date().toISOString(),
        activeFocus: "BTC reclaim",
        marketBias: "Constructive above range high",
        noTradeConditions: ["No clean retest"],
        keyLevels: ["87500", "88800"],
        notes: "Stay patient.",
      },
      watchlist: [
        {
          id: "1",
          timestamp: new Date().toISOString(),
          symbol: "BTC",
          market: "crypto",
          timeframe: "4H",
          thesis: "Reclaim and hold",
          invalidation: "Accept below range high",
          tags: [],
          status: "active",
        },
      ],
      tasks: [],
    });

    expect(run.output).toContain("BTC 4H");
    expect(run.output).toContain("No clean retest");
    expect(run.output).toContain("BTC reclaim");
  });
});
