# Frontend Handoff

## Goal

Build a gateway-style frontend for Aether that feels like a personal command
surface, not an ops dashboard. It should center on conversation, desk state,
watchlist, tasks, routines, and chart intake.

## Existing Backend Surface

Use these endpoints as the contract:

- `GET /health`
- `GET /threads`
- `POST /threads`
- `GET /threads/:id/messages`
- `POST /message`
- `GET /briefs`
- `POST /briefs/daily`
- `GET /journal`
- `POST /journal`
- `GET /charts`
- `POST /charts`
- `GET /watchlist`
- `POST /watchlist`
- `PATCH /watchlist/:id`
- `GET /tasks`
- `POST /tasks`
- `PATCH /tasks/:id`
- `GET /desk`
- `PATCH /desk`
- `POST /desk/routines`

`POST /message` request shape:

```json
{
  "message": "Review BTC reclaim status",
  "threadId": "optional-existing-thread-id",
  "chartIds": ["optional-chart-id"]
}
```

## Product Direction

This is not NyxHive’s gateway with different labels.

It should feel:

- intimate
- sharp
- personal
- trading-serious without becoming a brokerage UI

It should not feel:

- like an admin console
- like a generic AI chat wrapper
- like a crypto exchange terminal clone

## Primary Screens

### 1. Command Center

Default landing page.

Layout:

- left rail: threads, routines, channel status
- center: active conversation with Aether
- right rail: desk state, watchlist, tasks, selected chart context

Key actions:

- start thread
- continue existing thread
- attach chart to current thread
- trigger routine
- quick-add task or watchlist item

### 2. Desk

Trading-first screen.

Content:

- active focus
- market bias
- no-trade conditions
- watchlist cards
- key levels
- latest brief

### 3. Journal

Content:

- recent entries
- filter by kind
- add note / reflection / trade idea
- thread-linked journal entries later

## Interaction Model

### Threads

- thread list should feel like message threads, not tickets
- show title, source, last activity, preview
- clicking a thread loads `GET /threads/:id/messages`

### Message Composer

Needs:

- multiline text
- attach existing charts
- upload new chart
- submit into current thread

When no thread exists:

- create one implicitly or call `POST /threads` first

### Chart Upload UX

Use multipart `POST /charts`.

Fields:

- `symbol`
- `timeframe`
- `note`
- `tags`
- `file`

After upload:

- keep returned `chart.id`
- allow sending that chart through `POST /message`

## Visual Direction

Keep it bold and intentional.

- dark steel / deep navy base is fine
- mint/cyan accents from the current HTML shell are a good starting direction
- typography should feel editorial, not SaaS-default
- avoid purple-heavy AI styling

Suggested mood:

- command room
- late-session desk
- premium but restrained

## State Management

Frontend should keep:

- active thread id
- thread list
- messages for current thread
- selected chart ids
- health and channel state
- desk state
- watchlist
- tasks
- briefs

## First Frontend Milestone

Ship this first:

1. command-center layout
2. thread list + thread messages
3. message composer calling `/message`
4. watchlist panel
5. tasks panel
6. desk state panel
7. brief drawer

Do not start with:

- auth
- websocket streaming
- deep settings
- heavy routing complexity

## Notes For Opus

- Backend already exists; do not redesign the server contract unless necessary.
- Prioritize conversation and desk usability over generic dashboard completeness.
- Keep the interface singular around Aether, even if multiple panels exist.
