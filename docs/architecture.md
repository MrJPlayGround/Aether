# Architecture Draft

## References

- `NyxHive`: runtime, scheduler, memory, channels, soul system
- `NyxLabs`: trade/account vocabulary, journal workflows, exchange concepts
- `Morph`: front-facing tone, directness, and conversational realism

## System Shape

The system should present as one lead assistant with internal domain modules.

```text
User
  -> Lead Assistant
     -> Personal memory
     -> Trading desk
     -> Research tools
     -> Scheduler / briefings
     -> Notifications / channels
```

## Major Layers

### Identity Layer

Defines:

- who the lead assistant is
- how it speaks
- what it values
- how it handles uncertainty
- when it becomes strict, warm, brief, or expansive

This should live in `souls/`.

### Capability Layer

Structured domains behind the lead assistant:

- trading desk
- research
- planning
- memory maintenance

This layer can use internal specialists later, but the lead should remain the
main voice.

### Runtime Layer

Inspired by NyxHive:

- message intake
- routing and classification
- optional delegation
- scheduled tasks
- memory retrieval
- response assembly

### Data Layer

Combines:

- personal memory
- trading memory
- journal references
- chart attachments and notes
- market data snapshots
- scheduled briefings and alerts

## Early Module Plan

```text
docs/
  vision.md
  architecture.md
  roadmap.md

souls/
  lead/
    identity.md
    personality.md
    rules.md
  trading-desk/
    identity.md
    rules.md

src/
  core/
  memory/
  scheduler/
  domains/
    trading/
  channels/
  ui/
```

## Key Design Constraints

- Singular experience over visible orchestration
- Strong separation between identity and capabilities
- Trading posture must be serious, risk-aware, and non-delusional
- Personal context and trading context should share memory selectively
- The system should be useful from chat-first interaction before a full UI exists

## V1 Runtime Priorities

1. Lead assistant interaction loop
2. Memory store and retrieval
3. Trading-desk prompts and chart intake
4. Scheduler for briefings and reminders
5. Minimal API or terminal interface
