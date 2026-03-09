---
summary: "CLI reference for `SiriClaw-Instruct reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `SiriClaw-Instruct reset`

Reset local config/state (keeps the CLI installed).

```bash
SiriClaw-Instruct reset
SiriClaw-Instruct reset --dry-run
SiriClaw-Instruct reset --scope config+creds+sessions --yes --non-interactive
```
