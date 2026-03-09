---
summary: "CLI reference for `SiriClaw-Instruct logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
title: "logs"
---

# `SiriClaw-Instruct logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:

- Logging overview: [Logging](/logging)

## Examples

```bash
SiriClaw-Instruct logs
SiriClaw-Instruct logs --follow
SiriClaw-Instruct logs --json
SiriClaw-Instruct logs --limit 500
SiriClaw-Instruct logs --local-time
SiriClaw-Instruct logs --follow --local-time
```

Use `--local-time` to render timestamps in your local timezone.
