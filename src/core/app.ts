import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createChannelManager } from "../channels";
import type { AppConfig } from "../config";
import { buildRoutineOutput } from "../desk/routines";
import { DeskStore } from "../desk/store";
import { renderDashboardHtml } from "../dashboard/page";
import { generateDailyBrief } from "../briefs/generator";
import { BriefStore } from "../briefs/store";
import { ChartStore } from "../charts/store";
import { createJournalEntry } from "./journal";
import { JournalStore } from "../journal/store";
import { MemoryStore } from "../memory/store";
import { CoinbaseExchangeProvider } from "../marketdata/coinbase";
import { MarketDataService } from "../marketdata/service";
import { sanitizeSvg } from "../charts/sanitize-svg";
import { AnthropicProvider } from "../providers/anthropic";
import { CodexProvider } from "../providers/codex";
import { OpenAIProvider } from "../providers/openai";
import { RuntimeEngine } from "../runtime/engine";
import { startScheduler } from "../scheduler";
import { TaskStore } from "../tasks/store";
import { ThreadStore } from "../threads/store";
import { Logger } from "../utils/logger";
import { WatchlistStore } from "../watchlist/store";
import { compileSystemBrief, loadSouls } from "./souls";
import type { MemoryEntry, MessageRequest } from "./types";

function createEntry(
  role: MemoryEntry["role"],
  domain: MemoryEntry["domain"],
  content: string,
  tags: string[],
): MemoryEntry {
  return {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    role,
    domain,
    content,
    tags,
  };
}

export async function createApp(config: AppConfig) {
  const souls = await loadSouls(config.soulsDir);
  const memoryStore = new MemoryStore(config.memoryPath);
  const briefStore = new BriefStore(config.briefsPath);
  const journalStore = new JournalStore(config.journalPath);
  const watchlistStore = new WatchlistStore(config.watchlistPath);
  const taskStore = new TaskStore(config.tasksPath);
  const threadStore = new ThreadStore(config.threadsPath);
  const deskStore = new DeskStore(config.deskPath);
  const chartStore = new ChartStore(config.chartsDir);
  const logger = new Logger(config.logPath);
  const scheduler = startScheduler(
    briefStore,
    memoryStore,
    journalStore,
    watchlistStore,
    taskStore,
  );
  const provider = config.provider === "codex"
    ? new CodexProvider(config.model, process.cwd())
    : config.provider === "anthropic" && process.env.ANTHROPIC_API_KEY
      ? new AnthropicProvider(process.env.ANTHROPIC_API_KEY, config.model)
      : config.provider === "openai" && process.env.OPENAI_API_KEY
        ? new OpenAIProvider(process.env.OPENAI_API_KEY, config.model)
        : null;

  // Vision provider — explicit config, requires ANTHROPIC_API_KEY
  const visionProvider = config.visionProvider === "anthropic" && process.env.ANTHROPIC_API_KEY
    ? new AnthropicProvider(process.env.ANTHROPIC_API_KEY, config.visionModel)
    : null;
  const engine = new RuntimeEngine(provider, config.model);
  const marketData = new MarketDataService(new CoinbaseExchangeProvider());
  const channelManager = createChannelManager({
    telegramToken: config.telegramBotToken,
    discordToken: config.discordBotToken,
    onMessage: async ({ message }) => {
      const response = await handleMessage({
        message,
        source: "telegram",
      });
      return response.text;
    },
  });

  async function handleMessage(inputPayload: MessageRequest) {
    const message = inputPayload.message;
    const threadId = inputPayload.threadId ?? randomUUID();
    const source = inputPayload.source ?? "gateway";
    const memory = await memoryStore.load();
    const journal = await journalStore.recent(8);
    const briefs = await briefStore.recent(4);
    const charts = inputPayload.chartIds?.length ? await chartStore.findByIds(inputPayload.chartIds) : [];
    const watchlist = await watchlistStore.recent(20);
    const marketQuotes = await marketData.getRelevantQuotes({
      message,
      charts,
      watchlist,
    });
    const response = await engine.respond(message, { memory, souls }, journal, briefs, charts, marketQuotes);
    const now = new Date().toISOString();

    await threadStore.ensureThread({
      id: threadId,
      title: message.slice(0, 60) || "New thread",
      source,
      lastMessagePreview: message.slice(0, 120),
    });

    await memoryStore.append(createEntry("user", response.domain, message, ["input"]));
    await memoryStore.append(createEntry("assistant", response.domain, response.text, response.tags));
    await threadStore.appendMessage({
      id: randomUUID(),
      threadId,
      timestamp: now,
      role: "user",
      domain: response.domain,
      content: message,
      tags: ["input", source],
      attachments: charts.map((chart) => ({
        id: chart.id,
        kind: "chart" as const,
        label: `${chart.symbol} ${chart.timeframe}`,
        path: chart.path,
      })),
    });
    await threadStore.appendMessage({
      id: randomUUID(),
      threadId,
      timestamp: new Date().toISOString(),
      role: "assistant",
      domain: response.domain,
      content: response.text,
      tags: response.tags,
      attachments: [],
    });
    logger.info("message_processed", {
      threadId,
      source,
      domain: response.domain,
      provider: response.provider,
      model: response.model,
    });

    return {
      ...response,
      threadId,
      systemBrief: compileSystemBrief(souls),
      attachedCharts: charts,
      marketQuotes,
    };
  }

  return {
    async runChat() {
      const rl = createInterface({ input, output });

      console.log(`${config.leadName} is online. Type 'exit' to leave.`);

      while (true) {
        let line: string;

        try {
          line = await rl.question("> ");
        } catch {
          rl.close();
          return;
        }

        const trimmed = line.trim();

        if (!trimmed) {
          continue;
        }

        if (trimmed === "exit") {
          rl.close();
          return;
        }

        if (trimmed === "/memory") {
          const recent = await memoryStore.recent();
          console.log(JSON.stringify(recent, null, 2));
          continue;
        }

        if (trimmed === "/brief") {
          const brief = generateDailyBrief(
            await memoryStore.load(),
            await journalStore.load(),
            await watchlistStore.load(),
            await taskStore.load(),
          );
          await briefStore.append(brief);
          console.log(`\n${brief.title}\n${brief.body}\n`);
          continue;
        }

        if (trimmed.startsWith("/note ")) {
          const content = trimmed.slice(6).trim();
          const note = createJournalEntry({
            kind: "note",
            title: content.slice(0, 48) || "Quick note",
            content,
            domain: "general",
            tags: ["manual-note"],
          });
          await journalStore.append(note);
          console.log("\nNote stored.\n");
          continue;
        }

        if (trimmed === "/system") {
          console.log(compileSystemBrief(souls));
          continue;
        }

        const response = await handleMessage({
          message: trimmed,
          source: "cli",
        });
        console.log(`\n${config.leadName}: ${response.text}\n`);
      }
    },

    runServer() {
      void channelManager.start();
      Bun.serve({
        port: config.port,
        fetch: async (request) => {
          const url = new URL(request.url);

          if (request.method === "GET" && url.pathname === "/") {
            const frontendPath = join(process.cwd(), "frontend", "index.html");
            const file = Bun.file(frontendPath);
            if (await file.exists()) {
              return new Response(file, {
                headers: { "content-type": "text/html; charset=utf-8" },
              });
            }
            return new Response(renderDashboardHtml(), {
              headers: { "content-type": "text/html; charset=utf-8" },
            });
          }

          if (request.method === "GET" && url.pathname === "/landing") {
            const landingPath = join(process.cwd(), "frontend", "landing.html");
            const file = Bun.file(landingPath);
            if (await file.exists()) {
              return new Response(file, {
                headers: { "content-type": "text/html; charset=utf-8" },
              });
            }
            return new Response("Not found", { status: 404 });
          }

          if (request.method === "GET" && url.pathname === "/health") {
            return Response.json({
              ok: true,
              name: config.name,
              productName: config.productName,
              deploymentMode: config.deploymentMode,
              provider: provider?.name ?? "local-scaffold",
              model: config.model,
              vision: {
                provider: visionProvider?.name ?? "none",
                model: config.visionModel,
                available: !!visionProvider,
              },
              logs: config.logPath,
              channels: channelManager.channels.map((channel) => ({
                name: channel.name,
                connected: channel.isConnected(),
              })),
            });
          }

          if (request.method === "GET" && url.pathname === "/product") {
            return Response.json({
              name: config.productName,
              assistantName: config.leadName,
              tagline: config.productTagline,
              audience: config.productAudience,
              deploymentMode: config.deploymentMode,
              supportEmail: config.supportEmail ?? null,
              legalDisclaimer: config.legalDisclaimer,
              provider: provider?.name ?? "local-scaffold",
              model: config.model,
              channels: channelManager.channels.map((channel) => ({
                name: channel.name,
                connected: channel.isConnected(),
              })),
              capabilities: [
                "threads",
                "desk-state",
                "routines",
                "watchlist",
                "tasks",
                "journal",
                "chart-intake",
                "live-market-data",
                "telegram",
              ],
            });
          }

          if (request.method === "GET" && url.pathname === "/market/quotes") {
            const symbols = (url.searchParams.get("symbols") ?? "")
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);
            const market = (url.searchParams.get("market") ?? "crypto") as "crypto" | "indices" | "forex" | "stocks";

            const quotes = symbols.length > 0
              ? await marketData.getQuotes(symbols.map((symbol) => ({ symbol, market })))
              : await marketData.getQuotesForWatchlist(await watchlistStore.load());

            return Response.json({ quotes });
          }

          if (request.method === "GET" && url.pathname === "/threads") {
            return Response.json({ threads: await threadStore.listThreads(60) });
          }

          if (request.method === "POST" && url.pathname === "/threads") {
            const body = (await request.json()) as {
              title?: string;
              source?: "gateway" | "telegram" | "discord" | "cli";
            };
            const id = randomUUID();
            const title = body.title?.trim() || "New thread";
            const source = body.source ?? "gateway";
            await threadStore.ensureThread({
              id,
              title,
              source,
              lastMessagePreview: "",
            });
            return Response.json({ id, title, source });
          }

          if (request.method === "GET" && url.pathname.startsWith("/threads/") && url.pathname.endsWith("/messages")) {
            const parts = url.pathname.split("/");
            const threadId = parts[2] ?? "";
            return Response.json({ messages: await threadStore.getThreadMessages(threadId, 200) });
          }

          if (request.method === "GET" && url.pathname === "/memory") {
            return Response.json({ entries: await memoryStore.recent(30) });
          }

          if (request.method === "GET" && url.pathname === "/briefs") {
            return Response.json({ briefs: await briefStore.recent(20) });
          }

          if (request.method === "POST" && url.pathname === "/briefs/daily") {
            const brief = generateDailyBrief(
              await memoryStore.load(),
              await journalStore.load(),
              await watchlistStore.load(),
              await taskStore.load(),
            );
            await briefStore.append(brief);
            return Response.json(brief);
          }

          if (request.method === "GET" && url.pathname === "/journal") {
            return Response.json({ entries: await journalStore.recent(30) });
          }

          if (request.method === "GET" && url.pathname === "/desk") {
            return Response.json({
              state: await deskStore.getState(),
              routines: await deskStore.recentRoutines(20),
            });
          }

          if (request.method === "PATCH" && url.pathname === "/desk") {
            const body = (await request.json()) as {
              activeFocus?: string;
              marketBias?: string;
              noTradeConditions?: string[];
              keyLevels?: string[];
              notes?: string;
            };
            const state = await deskStore.updateState(body);
            return Response.json(state);
          }

          if (request.method === "POST" && url.pathname === "/desk/routines") {
            const body = (await request.json()) as {
              routine?: "daily" | "london-prep" | "new-york-prep" | "weekend-review";
            };
            const routine = body.routine ?? "daily";
            const run = buildRoutineOutput({
              routine,
              deskState: await deskStore.getState(),
              watchlist: await watchlistStore.load(),
              tasks: await taskStore.load(),
            });
            await deskStore.appendRoutine(run);
            return Response.json(run);
          }

          if (request.method === "POST" && url.pathname === "/journal") {
            const body = (await request.json()) as {
              kind?: "note" | "trade-idea" | "brief" | "reflection" | "chart-note";
              title?: string;
              content?: string;
              tags?: string[];
              domain?: "general" | "trading";
              threadId?: string;
            };

            if (!body.content?.trim()) {
              return Response.json({ error: "content is required" }, { status: 400 });
            }

            const entry = createJournalEntry({
              kind: body.kind ?? "note",
              title: body.title?.trim() || body.content.trim().slice(0, 48),
              content: body.content.trim(),
              tags: body.tags ?? [],
              domain: body.domain ?? "general",
              threadId: body.threadId,
            });

            await journalStore.append(entry);
            return Response.json(entry);
          }

          if (request.method === "GET" && url.pathname === "/charts") {
            return Response.json({ charts: await chartStore.load() });
          }

          // GET /charts/:id — single chart with analysis
          {
            const chartIdMatch = url.pathname.match(/^\/charts\/([^/]+)$/);
            if (request.method === "GET" && chartIdMatch) {
              const chart = await chartStore.findById(chartIdMatch[1]);
              if (!chart) return Response.json({ error: "chart not found" }, { status: 404 });
              return Response.json(chart);
            }
          }

          // GET /charts/:id/image — serve the chart image file
          {
            const imgMatch = url.pathname.match(/^\/charts\/([^/]+)\/image$/);
            if (request.method === "GET" && imgMatch) {
              const chart = await chartStore.findById(imgMatch[1]);
              if (!chart || !chart.imagePath) return Response.json({ error: "no image" }, { status: 404 });
              const file = Bun.file(chart.imagePath);
              if (!await file.exists()) return Response.json({ error: "image file missing" }, { status: 404 });
              return new Response(file, {
                headers: { "Content-Type": chart.contentType || "image/png" },
              });
            }
          }

          // GET /charts/:id/markup — serve sanitized SVG markup overlay
          {
            const mkMatch = url.pathname.match(/^\/charts\/([^/]+)\/markup$/);
            if (request.method === "GET" && mkMatch) {
              const chart = await chartStore.findById(mkMatch[1]);
              if (!chart || !chart.markupPath) return Response.json({ error: "no markup" }, { status: 404 });
              const file = Bun.file(chart.markupPath);
              if (!await file.exists()) return Response.json({ error: "markup file missing" }, { status: 404 });
              return new Response(file, {
                headers: {
                  "Content-Type": "image/svg+xml",
                  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
                  "X-Content-Type-Options": "nosniff",
                },
              });
            }
          }

          // POST /charts/:id/analyze — vision analysis + optional SVG markup
          {
            const analyzeMatch = url.pathname.match(/^\/charts\/([^/]+)\/analyze$/);
            if (request.method === "POST" && analyzeMatch) {
              const chart = await chartStore.findById(analyzeMatch[1]);
              if (!chart) return Response.json({ error: "chart not found" }, { status: 404 });
              if (!chart.imagePath) return Response.json({ error: "chart has no image to analyze" }, { status: 400 });
              if (!visionProvider) return Response.json({ error: "vision not configured — set ANTHROPIC_API_KEY and AETHER_VISION_PROVIDER=anthropic" }, { status: 503 });

              const imgFile = Bun.file(chart.imagePath);
              if (!await imgFile.exists()) return Response.json({ error: "image file missing" }, { status: 404 });

              // Mark as analyzing
              await chartStore.update(chart.id, { analysisStatus: "analyzing", markupStatus: "none" });

              const imgBytes = await imgFile.arrayBuffer();
              const base64 = Buffer.from(imgBytes).toString("base64");
              const mediaType = chart.contentType || "image/png";

              // ── Step 1: Structured analysis (required) ──
              let analysis: import("../charts/store").ChartAnalysis;
              try {
                const analysisPrompt = `You are a professional technical analyst inspecting a trading chart image.

Analyze this chart and return ONLY a JSON object with these fields (no markdown, no explanation outside the JSON):
{
  "symbol": "detected symbol or '${chart.symbol}' if unclear",
  "timeframe": "detected timeframe or '${chart.timeframe}' if unclear",
  "trend": "overall trend direction — bullish / bearish / ranging / transitioning",
  "regime": "market regime — trending / range-bound / breakout / breakdown / accumulation / distribution",
  "keyLevels": [
    { "price": "numeric price level as string", "label": "what this level represents", "type": "support | resistance | level" }
  ],
  "thesis": "one-sentence setup thesis if a tradeable setup is visible, otherwise 'No clear setup'",
  "invalidation": "what would invalidate the thesis, with specific price if possible",
  "confidence": "high / medium / low — how confident you are in your read",
  "notes": "any caveats, uncertainties, or additional observations — be honest about what's unclear"
}

Important:
- Be honest about uncertainty. If the chart is blurry, unclear, or you can't determine something, say so.
- Extract actual price levels visible on the chart axes.
- Focus on what is objectively visible, not speculation.
- Use trading-specific language: reclaim, breakdown, breakout, sweep, liquidity, acceptance.`;

                const analysisResult = await visionProvider.vision({
                  userText: analysisPrompt,
                  images: [{ base64, mediaType }],
                  maxTokens: 1500,
                  temperature: 0.2,
                });

                let jsonStr = analysisResult.content.trim();
                const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
                if (jsonMatch) jsonStr = jsonMatch[0];
                const parsed = JSON.parse(jsonStr);

                // Validate keyLevels shape
                const keyLevels = Array.isArray(parsed.keyLevels)
                  ? parsed.keyLevels
                      .filter((l: unknown) => l && typeof l === "object")
                      .map((l: Record<string, unknown>) => ({
                        price: String(l.price ?? ""),
                        label: String(l.label ?? ""),
                        type: (["support", "resistance", "level"].includes(String(l.type)) ? l.type : "level") as "support" | "resistance" | "level",
                      }))
                  : [];

                analysis = {
                  symbol: String(parsed.symbol || chart.symbol),
                  timeframe: String(parsed.timeframe || chart.timeframe),
                  trend: String(parsed.trend || "unclear"),
                  regime: String(parsed.regime || "unclear"),
                  keyLevels,
                  thesis: String(parsed.thesis || "No clear setup"),
                  invalidation: String(parsed.invalidation || ""),
                  confidence: String(parsed.confidence || "low"),
                  notes: String(parsed.notes || ""),
                  analyzedAt: new Date().toISOString(),
                };
              } catch (analysisError) {
                // Analysis itself failed — mark and return
                const updated = await chartStore.update(chart.id, {
                  analysisStatus: "failed",
                  markupStatus: "none",
                });
                return Response.json({
                  ...updated,
                  _error: `Analysis failed: ${analysisError instanceof Error ? analysisError.message : "unknown"}`,
                }, { status: 502 });
              }

              // Analysis succeeded — persist immediately
              await chartStore.update(chart.id, {
                analysis,
                analysisStatus: "ready",
              });

              // ── Step 2: SVG markup (optional, best-effort) ──
              let markupPath: string | undefined;
              let markupStatus: "none" | "ready" | "failed" | "sanitized" = "none";

              try {
                const markupPrompt = `You are generating an SVG overlay for a trading chart analysis.

Based on these analysis findings, generate ONLY a valid SVG element (no markdown, no explanation):

Analysis:
- Trend: ${analysis.trend}
- Regime: ${analysis.regime}
- Key Levels: ${analysis.keyLevels.map(l => `${l.price} (${l.label}, ${l.type})`).join(", ") || "none detected"}
- Thesis: ${analysis.thesis}
- Invalidation: ${analysis.invalidation || "none"}

Generate an SVG with viewBox="0 0 800 500" that includes:
- Horizontal lines for each key level, colored: green for support, red for resistance, blue for neutral levels
- A small label next to each line showing the price and description
- An arrow showing the expected direction if there's a thesis
- A text label in the top-left showing the trend and regime
- A small "Confidence: ${analysis.confidence}" label in the bottom-right
- Semi-transparent backgrounds behind text for readability
- Use these colors: support=#22c55e, resistance=#ef4444, level=#3b82f6, text=#e8eef6, bg=rgba(8,12,18,0.75)
- Font: monospace, sizes 11-14px
- Keep it clean and readable
- Do NOT include any scripts, event handlers, or external references

Return ONLY the <svg>...</svg> element.`;

                const markupResult = await visionProvider.vision({
                  userText: markupPrompt,
                  images: [{ base64, mediaType }],
                  maxTokens: 2000,
                  temperature: 0.2,
                });

                // Sanitize the model-generated SVG
                const sanitized = sanitizeSvg(markupResult.content);
                if (sanitized) {
                  markupPath = `${config.chartsDir}/${chart.id}-markup.svg`;
                  await Bun.write(markupPath, sanitized);
                  markupStatus = "sanitized";
                } else {
                  markupStatus = "failed";
                }
              } catch {
                markupStatus = "failed";
              }

              // Final update with markup status
              const updated = await chartStore.update(chart.id, {
                ...(markupPath ? { markupPath } : {}),
                markupStatus,
              });

              return Response.json(updated);
            }
          }

          if (request.method === "GET" && url.pathname === "/watchlist") {
            return Response.json({ entries: await watchlistStore.recent(40) });
          }

          if (request.method === "POST" && url.pathname === "/watchlist") {
            const body = (await request.json()) as {
              symbol?: string;
              market?: "crypto" | "indices" | "forex" | "stocks";
              timeframe?: string;
              thesis?: string;
              invalidation?: string;
              tags?: string[];
              status?: "active" | "paused" | "done";
            };

            if (!body.symbol?.trim() || !body.timeframe?.trim() || !body.thesis?.trim() || !body.invalidation?.trim()) {
              return Response.json(
                { error: "symbol, timeframe, thesis, and invalidation are required" },
                { status: 400 },
              );
            }

            const entry = {
              id: randomUUID(),
              timestamp: new Date().toISOString(),
              symbol: body.symbol.trim(),
              market: body.market ?? "crypto",
              timeframe: body.timeframe.trim(),
              thesis: body.thesis.trim(),
              invalidation: body.invalidation.trim(),
              tags: body.tags ?? [],
              status: body.status ?? "active",
            };

            await watchlistStore.append(entry);
            await journalStore.append(
              createJournalEntry({
                kind: "trade-idea",
                title: `${entry.symbol} ${entry.timeframe}`,
                content: `${entry.thesis}\nInvalidation: ${entry.invalidation}`,
                domain: "trading",
                tags: ["watchlist", ...entry.tags],
              }),
            );

            return Response.json(entry);
          }

          if (request.method === "PATCH" && url.pathname.startsWith("/watchlist/")) {
            const id = url.pathname.split("/").at(-1) ?? "";
            const body = (await request.json()) as {
              status?: "active" | "paused" | "done";
            };

            if (!body.status) {
              return Response.json({ error: "status is required" }, { status: 400 });
            }

            const entry = await watchlistStore.updateStatus(id, body.status);
            if (!entry) {
              return Response.json({ error: "not found" }, { status: 404 });
            }

            return Response.json(entry);
          }

          if (request.method === "GET" && url.pathname === "/tasks") {
            return Response.json({ tasks: await taskStore.recent(40) });
          }

          if (request.method === "POST" && url.pathname === "/tasks") {
            const body = (await request.json()) as {
              title?: string;
              detail?: string;
              domain?: "general" | "trading";
              priority?: "low" | "medium" | "high";
              status?: "open" | "in_progress" | "done";
              tags?: string[];
            };

            if (!body.title?.trim()) {
              return Response.json({ error: "title is required" }, { status: 400 });
            }

            const task = {
              id: randomUUID(),
              timestamp: new Date().toISOString(),
              title: body.title.trim(),
              detail: body.detail?.trim() ?? "",
              domain: body.domain ?? "general",
              priority: body.priority ?? "medium",
              status: body.status ?? "open",
              tags: body.tags ?? [],
            };

            await taskStore.append(task);
            return Response.json(task);
          }

          if (request.method === "PATCH" && url.pathname.startsWith("/tasks/")) {
            const id = url.pathname.split("/").at(-1) ?? "";
            const body = (await request.json()) as {
              status?: "open" | "in_progress" | "done";
            };

            if (!body.status) {
              return Response.json({ error: "status is required" }, { status: 400 });
            }

            const task = await taskStore.updateStatus(id, body.status);
            if (!task) {
              return Response.json({ error: "not found" }, { status: 404 });
            }

            return Response.json(task);
          }

          if (request.method === "POST" && url.pathname === "/charts") {
            let symbol = "";
            let timeframe = "";
            let note = "";
            let content = "";
            let tags: string[] = [];
            let imageFile: File | null = null;

            const contentType = request.headers.get("content-type") ?? "";
            if (contentType.includes("multipart/form-data")) {
              const form = await request.formData();
              symbol = String(form.get("symbol") ?? "").trim();
              timeframe = String(form.get("timeframe") ?? "").trim();
              note = String(form.get("note") ?? "").trim();
              tags = String(form.get("tags") ?? "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
              const file = form.get("file");
              if (file instanceof File) {
                const ft = file.type || "";
                if (ft.startsWith("image/")) {
                  imageFile = file;
                } else {
                  content = await file.text();
                }
              }
            } else {
              const body = (await request.json()) as {
                symbol?: string;
                timeframe?: string;
                note?: string;
                content?: string;
                tags?: string[];
              };
              symbol = body.symbol?.trim() ?? "";
              timeframe = body.timeframe?.trim() ?? "";
              note = body.note?.trim() ?? "";
              content = body.content?.trim() ?? "";
              tags = body.tags ?? [];
            }

            if (!symbol || !timeframe) {
              return Response.json({ error: "symbol and timeframe are required" }, { status: 400 });
            }
            if (!content && !imageFile) {
              return Response.json({ error: "content or image file is required" }, { status: 400 });
            }

            const id = randomUUID();
            let path = "";
            let imagePath: string | undefined;
            let chartContentType = "text";

            if (imageFile) {
              const ext = imageFile.type === "image/png" ? "png" : "jpg";
              const imgFilename = `${id}.${ext}`;
              imagePath = `${config.chartsDir}/${imgFilename}`;
              const buf = await imageFile.arrayBuffer();
              await Bun.write(imagePath, buf);
              path = imagePath;
              chartContentType = imageFile.type;
            } else {
              const filename = `${id}.txt`;
              path = `${config.chartsDir}/${filename}`;
              await Bun.write(path, content);
            }

            const chart: import("../charts/store").ChartEntry = {
              id,
              timestamp: new Date().toISOString(),
              symbol,
              timeframe,
              note,
              path,
              tags,
              contentType: chartContentType,
              ...(imagePath ? { imagePath } : {}),
            };

            await chartStore.append(chart);
            await journalStore.append(
              createJournalEntry({
                kind: "chart-note",
                title: `${chart.symbol} ${chart.timeframe}`,
                content: [chart.note, `Stored chart ${imageFile ? "image" : "reference"}: ${chart.path}`].filter(Boolean).join("\n"),
                domain: "trading",
                tags: ["chart-intake", chart.symbol, chart.timeframe],
              }),
            );

            return Response.json(chart);
          }

          if (request.method === "POST" && url.pathname === "/message") {
            const body = (await request.json()) as MessageRequest;
            const message = body.message?.trim();

            if (!message) {
              return Response.json({ error: "message is required" }, { status: 400 });
            }

            return Response.json(await handleMessage(body));
          }

          return Response.json({ error: "not found" }, { status: 404 });
        },
      });

      console.log(`${config.name} listening on http://localhost:${config.port}`);
    },

    stop() {
      scheduler.stop();
      void channelManager.stop();
    },
  };
}
