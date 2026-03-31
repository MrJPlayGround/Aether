# Aether

Aether is a personal operator with a trading desk core.

It gives you one live surface for:

- threaded conversation
- desk state
- routines
- watchlist triage
- task triage
- journal capture
- chart intake
- Telegram-connected message flow

The current product is chat-first, memory-aware, and built to feel like one operating surface instead of a pile of tools.

## What It Does

Aether currently supports:

- gateway chat UI at `http://localhost:3787`
- persistent threads and thread messages
- `codex` as the active provider with model `gpt-5.4`
- Telegram bot connectivity
- editable desk state
- routine runs: `daily`, `london-prep`, `new-york-prep`, `weekend-review`
- watchlist create/update flow
- task create/update flow
- journal capture and journal creation
- chart upload (image + text), attachment to messages, and AI vision analysis
- chart markup overlay generation with sanitized SVG output
- thread-aware journal capture and related memory surfacing
- agent-suggested promotions from conversation into desk/watchlist/tasks/journal
- live crypto market quotes for relevant symbols and watchlist context

## Selling It

The current sellable form of Aether is a **single-tenant client edition**, not a
shared SaaS product.

That means:

- one deployment per client
- one memory surface per client
- branded metadata per deployment
- separate data and credentials per client

See [docs/client-edition.md](/Users/jay/Dev/personal/Aether/docs/client-edition.md).
Commercial docs:

- [docs/pricing-and-packaging.md](/Users/jay/Dev/personal/Aether/docs/pricing-and-packaging.md)
- [docs/license-outline.md](/Users/jay/Dev/personal/Aether/docs/license-outline.md)
- [docs/proposal-template.md](/Users/jay/Dev/personal/Aether/docs/proposal-template.md)

## Product Shape

Aether is:

- a personal command surface
- a trading-serious assistant when markets are involved
- a memory-bearing system across threads, journal, watchlist, and desk context

Aether is not:

- an execution bot
- a brokerage terminal
- a generic chatbot wrapper

## Current Interface

The live frontend is in [frontend/index.html](/Users/jay/Dev/personal/Aether/frontend/index.html).

The server serves that file from `/`, with the runtime and API living in [src/core/app.ts](/Users/jay/Dev/personal/Aether/src/core/app.ts).

Main areas in the UI:

- left rail: threads, thread search, journal access, routines
- center: active thread and message composer
- right rail: related memory, desk, watchlist, tasks, briefs
- drawers/modals: journal, briefs, chart attach/upload, thread capture to journal

## Runtime

Main scripts from [package.json](/Users/jay/Dev/personal/Aether/package.json):

```bash
bun install
bun run serve
```

Useful commands:

```bash
bun run chat
bun run serve
bun run check
bun test
```

The default server port is `3787`.

## Provider Resolution

Aether resolves providers in this order:

1. `codex` if the CLI is available
2. `anthropic` if `ANTHROPIC_API_KEY` is present
3. `openai` if `OPENAI_API_KEY` is present
4. local scaffold fallback if none is available

Common overrides:

```bash
AETHER_PROVIDER=codex bun run serve
AETHER_MODEL=gpt-5.4 bun run serve
PORT=3787 bun run serve
```

## Chart Vision

Aether can analyze uploaded chart images using Claude's vision capability.

**Required env vars:**

- `ANTHROPIC_API_KEY` — required for all vision features
- `AETHER_VISION_PROVIDER=anthropic` — set automatically when API key exists
- `AETHER_VISION_MODEL=claude-sonnet-4-20250514` — default vision model

**What chart analysis does:**

1. Sends the chart image to Claude vision with a structured analysis prompt
2. Extracts: trend, regime, key levels, thesis, invalidation, confidence, notes
3. Generates an SVG markup overlay with level lines, labels, and direction cues
4. Stores both the analysis metadata and sanitized SVG on the chart record

**What it can be trusted to do:**

- Identify general trend direction and market regime
- Detect approximate price levels visible on chart axes
- Surface setup language and invalidation conditions
- Flag uncertainty when the chart is unclear

**What it cannot be trusted to do:**

- Pixel-precise level annotation — the SVG overlay uses approximate positions
- Replace your own chart read — treat findings as a second opinion, not gospel
- Work on every chart style — unusual layouts, indicators, or annotations may confuse the model

**Markup safety:**

Model-generated SVG is sanitized before storage. The sanitizer strips scripts, event handlers, external references, and unknown elements. Only safe SVG drawing primitives are preserved. Served with `Content-Security-Policy: default-src 'none'`.

**Endpoints:**

- `POST /charts/:id/analyze` — trigger vision analysis + markup
- `GET /charts/:id` — single chart with analysis metadata
- `GET /charts/:id/image` — original chart image
- `GET /charts/:id/markup` — sanitized SVG overlay

## Environment

Aether loads variables from:

- `.env`
- `.env.local`

Recognized environment variables include:

- `AETHER_PROVIDER` — chat provider: `codex`, `anthropic`, `openai`, `local`
- `AETHER_MODEL` — chat model
- `AETHER_VISION_PROVIDER` — vision provider: `anthropic` or `none`
- `AETHER_VISION_MODEL` — vision model (default: `claude-sonnet-4-20250514`)
- `ANTHROPIC_API_KEY` — required for Anthropic chat and all vision features
- `AETHER_CODEX_PATH`
- `AETHER_PRODUCT_NAME`
- `AETHER_PRODUCT_TAGLINE`
- `AETHER_PRODUCT_AUDIENCE`
- `AETHER_DEPLOYMENT_MODE`
- `AETHER_SUPPORT_EMAIL`
- `AETHER_LEGAL_DISCLAIMER`
- `PORT`
- `OPENAI_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `DISCORD_BOT_TOKEN`

## Data Model

Persistent data lives under [/Users/jay/Dev/personal/Aether/data](/Users/jay/Dev/personal/Aether/data):

- `threads.json`
- `journal.json`
- `watchlist.json`
- `tasks.json`
- `desk.json`
- `briefs.json`
- `memory.json`
- `charts/`

## HTTP Surface

Current backend endpoints:

- `GET /health`
- `GET /product`
- `GET /market/quotes`
- `GET /threads`
- `POST /threads`
- `GET /threads/:id/messages`
- `POST /message`
- `GET /memory`
- `GET /briefs`
- `POST /briefs/daily`
- `GET /journal`
- `POST /journal`
- `GET /charts`
- `POST /charts`
- `GET /charts/:id`
- `GET /charts/:id/image`
- `GET /charts/:id/markup`
- `POST /charts/:id/analyze`
- `GET /watchlist`
- `POST /watchlist`
- `PATCH /watchlist/:id`
- `GET /tasks`
- `POST /tasks`
- `PATCH /tasks/:id`
- `GET /desk`
- `PATCH /desk`
- `POST /desk/routines`

Example `POST /message` body:

```json
{
  "message": "Review BTC reclaim status",
  "threadId": "optional-thread-id",
  "chartIds": ["optional-chart-id"]
}
```

Example `POST /journal` body:

```json
{
  "kind": "note",
  "title": "Desk takeaway",
  "content": "Need patience until reclaim proves itself.",
  "tags": ["btc", "desk"],
  "domain": "trading",
  "threadId": "optional-thread-id"
}
```

Example `GET /market/quotes` usage:

```text
/market/quotes
/market/quotes?symbols=BTC,ETH
/market/quotes?symbols=BTC-USD,ETH-USD&market=crypto
```

Notes:

- live price feeds are currently enabled for crypto symbols first
- the first provider uses Coinbase Exchange public market data
- when no symbols are supplied, Aether returns quotes for active watchlist entries

## How To Start

1. Start the server:

```bash
bun run serve
```

2. Open:

```bash
http://localhost:3787
```

3. Verify health:

- provider should show `codex`
- model should show `gpt-5.4`
- Telegram should show connected if your bot token is active

## How To Use Aether Properly

Think of Aether as an operating loop, not a chatbot tab.

### 1. Start the day with the Desk

Set:

- active focus
- market bias
- no-trade conditions
- key levels
- notes

Then run a routine:

- `Daily` for broad posture
- `London Prep` before London
- `New York Prep` before New York
- `Weekend Review` for zoomed-out reflection

### 2. Work in Threads

Use a new thread for a distinct working session:

- morning market plan
- chart review
- trade idea refinement
- system/reflection work

Use the active thread instead of starting over each time you want continuity.

### 3. Attach Charts When Context Matters

Upload a chart when the specific structure matters.

Best practice:

- include `symbol`
- include `timeframe`
- add a note about what matters on the chart
- attach it to the message where you want Aether to reason from it

### 4. Capture Important Thinking

When a thread produces something worth keeping:

- use `Capture` from the thread
- or save an individual message into journal

Use journal kinds deliberately:

- `note` for general operating memory
- `trade-idea` for setups and scenario framing
- `reflection` for behavioral review

### 5. Keep the Watchlist and Tasks Honest

Use watchlist for market structure worth tracking.

Each entry should have:

- symbol
- timeframe
- thesis
- invalidation

Use tasks for execution items, not vague intentions.

Move them between:

- `open`
- `in_progress`
- `done`

### 6. Let the Memory Build

The system is strongest when you use the surfaces together:

- threads for active reasoning
- journal for durable insight
- watchlist for market pressure
- desk for current posture

That is how Aether starts feeling continuous instead of stateless.

## Recommended Daily Flow

Morning:

1. Open Aether.
2. Update Desk state.
3. Run `London Prep` or `Daily`.
4. Review watchlist and tasks.
5. Start a thread for the session plan.

During market work:

1. Continue the active thread.
2. Upload and attach charts when needed.
3. Update watchlist/task state as the session evolves.
4. Capture strong conclusions into Journal.

End of day:

1. Log a reflection or note.
2. Clean up tasks and watchlist states.
3. Update Desk notes if posture changed.

## CLI Mode

You can still use the terminal runtime directly:

```bash
bun run chat
```

Useful commands in CLI mode:

- `/system`
- `/memory`
- `/brief`
- `/note ...`
- `exit`

## Important Files

- [frontend/index.html](/Users/jay/Dev/personal/Aether/frontend/index.html)
- [src/core/app.ts](/Users/jay/Dev/personal/Aether/src/core/app.ts)
- [src/config.ts](/Users/jay/Dev/personal/Aether/src/config.ts)
- [src/desk/routines.ts](/Users/jay/Dev/personal/Aether/src/desk/routines.ts)
- [docs/frontend-handoff.md](/Users/jay/Dev/personal/Aether/docs/frontend-handoff.md)
- [docs/architecture.md](/Users/jay/Dev/personal/Aether/docs/architecture.md)
- [docs/roadmap.md](/Users/jay/Dev/personal/Aether/docs/roadmap.md)

## Status

Current phase is complete for:

- real gateway UI
- thread UX
- desk control
- watchlist/task triage
- journal integration
- thread/journal memory cohesion

The next phase should be driven by real usage rather than more speculative polish.
