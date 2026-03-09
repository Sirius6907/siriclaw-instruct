---
summary: "CLI reference for `SiriClaw-Instruct voicecall` (voice-call plugin command surface)"
read_when:
  - You use the voice-call plugin and want the CLI entry points
  - You want quick examples for `voicecall call|continue|status|tail|expose`
title: "voicecall"
---

# `SiriClaw-Instruct voicecall`

`voicecall` is a plugin-provided command. It only appears if the voice-call plugin is installed and enabled.

Primary doc:

- Voice-call plugin: [Voice Call](/plugins/voice-call)

## Common commands

```bash
SiriClaw-Instruct voicecall status --call-id <id>
SiriClaw-Instruct voicecall call --to "+15555550123" --message "Hello" --mode notify
SiriClaw-Instruct voicecall continue --call-id <id> --message "Any questions?"
SiriClaw-Instruct voicecall end --call-id <id>
```

## Exposing webhooks (Tailscale)

```bash
SiriClaw-Instruct voicecall expose --mode serve
SiriClaw-Instruct voicecall expose --mode funnel
SiriClaw-Instruct voicecall expose --mode off
```

Security note: only expose the webhook endpoint to networks you trust. Prefer Tailscale Serve over Funnel when possible.
