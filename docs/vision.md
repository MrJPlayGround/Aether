# Vision

## What This Is

This project is a personal command system.

Its primary job is to act as a sharp, high-context assistant for one user. It
should help think, plan, remember, brief, challenge, organize, and synthesize.
One of its strongest built-in domains is trading, so it should be able to shift
into a serious trading-desk mode without turning into a narrow trading bot.

The intended feeling is:

- one counterpart
- one memory
- one point of contact
- multiple internal capabilities

## Product Thesis

Most assistants fail in one of two ways:

1. They feel personal, but they are shallow.
2. They are useful in one domain, but they feel like a tool instead of a real
   counterpart.

This system should avoid both failures.

It should feel like a real operator with memory, taste, and judgment, while
still being technically capable enough to work as a trading desk, research
partner, and general personal assistant.

## Role Split

### Lead Assistant

The lead assistant owns the relationship with the user.

Responsibilities:

- maintain conversational continuity
- remember priorities, routines, preferences, and ongoing threads
- synthesize information across domains
- decide when to answer directly and when to invoke internal specialist logic
- protect the overall tone and quality of the interaction

### Trading Desk

The trading desk is the lead assistant's strongest specialist mode.

Responsibilities:

- monitor markets and events
- reason over charts and user-supplied context
- discuss setups, scenarios, and invalidations
- frame risk clearly
- detect recurring patterns in the user's trading behavior
- help produce briefings, trade plans, and review loops

### Other Domains

The system should remain open to other domains later:

- coding and technical planning
- personal operations and reminders
- research and writing
- idea capture and synthesis

## Experience Goals

- It should not feel like customer support.
- It should not feel like a generic "AI assistant."
- It should not overexplain.
- It should be calm, sharp, and context-aware.
- It should challenge bad reasoning when needed.
- It should become more useful as memory compounds over time.

## Non-Goals For V1

- fully autonomous trade execution
- public multi-user SaaS product
- fully generalized life operating system
- huge UI surface before the core interaction model is right

## V1 Success Criteria

- The user can talk to one assistant that feels coherent and real.
- The assistant can discuss markets seriously and analyze charts.
- The assistant can produce daily and on-demand briefings.
- The assistant can retain useful memory across trading and personal contexts.
- The assistant can push back on bad trades, weak plans, and emotional drift.
