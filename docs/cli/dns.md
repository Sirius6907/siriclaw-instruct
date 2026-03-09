---
summary: "CLI reference for `SiriClaw-Instruct dns` (wide-area discovery helpers)"
read_when:
  - You want wide-area discovery (DNS-SD) via Tailscale + CoreDNS
  - You’re setting up split DNS for a custom discovery domain (example: SiriClaw-Instruct.internal)
title: "dns"
---

# `SiriClaw-Instruct dns`

DNS helpers for wide-area discovery (Tailscale + CoreDNS). Currently focused on macOS + Homebrew CoreDNS.

Related:

- Gateway discovery: [Discovery](/gateway/discovery)
- Wide-area discovery config: [Configuration](/gateway/configuration)

## Setup

```bash
SiriClaw-Instruct dns setup
SiriClaw-Instruct dns setup --apply
```
