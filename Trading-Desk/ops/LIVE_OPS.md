# Aether Live Ops

## Runtime State

Local runtime state should be created under `.runtime/` and kept out of git.

Examples:

- websocket cursor state
- dedup buckets
- recent alert suppression state
- local process metadata

## Reset Rules

- deleting local runtime state resets cursors and dedup history
- after reset, repeated alerts or replays may occur until state rebuilds
- resets must be logged in reports if they affect paper-trading observations

