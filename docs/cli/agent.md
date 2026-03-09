---
summary: "CLI reference for `SiriClaw-Instruct agent` (send one agent turn via the Gateway)"
read_when:
  - You want to run one agent turn from scripts (optionally deliver reply)
title: "agent"
---

# `SiriClaw-Instruct agent`

Run an agent turn via the Gateway (use `--local` for embedded).
Use `--agent <id>` to target a configured agent directly.

Related:

- Agent send tool: [Agent send](/tools/agent-send)

## Examples

```bash
SiriClaw-Instruct agent --to +15555550123 --message "status update" --deliver
SiriClaw-Instruct agent --agent ops --message "Summarize logs"
SiriClaw-Instruct agent --session-id 1234 --message "Summarize inbox" --thinking medium
SiriClaw-Instruct agent --agent ops --message "Generate report" --deliver --reply-channel slack --reply-to "#reports"
```

## Notes

- When this command triggers `models.json` regeneration, SecretRef-managed provider credentials are persisted as non-secret markers (for example env var names or `secretref-managed`), not resolved secret plaintext.
