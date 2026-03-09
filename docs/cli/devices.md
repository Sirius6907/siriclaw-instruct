---
summary: "CLI reference for `SiriClaw-Instruct devices` (device pairing + token rotation/revocation)"
read_when:
  - You are approving device pairing requests
  - You need to rotate or revoke device tokens
title: "devices"
---

# `SiriClaw-Instruct devices`

Manage device pairing requests and device-scoped tokens.

## Commands

### `SiriClaw-Instruct devices list`

List pending pairing requests and paired devices.

```
SiriClaw-Instruct devices list
SiriClaw-Instruct devices list --json
```

### `SiriClaw-Instruct devices remove <deviceId>`

Remove one paired device entry.

```
SiriClaw-Instruct devices remove <deviceId>
SiriClaw-Instruct devices remove <deviceId> --json
```

### `SiriClaw-Instruct devices clear --yes [--pending]`

Clear paired devices in bulk.

```
SiriClaw-Instruct devices clear --yes
SiriClaw-Instruct devices clear --yes --pending
SiriClaw-Instruct devices clear --yes --pending --json
```

### `SiriClaw-Instruct devices approve [requestId] [--latest]`

Approve a pending device pairing request. If `requestId` is omitted, SiriClaw-Instruct
automatically approves the most recent pending request.

```
SiriClaw-Instruct devices approve
SiriClaw-Instruct devices approve <requestId>
SiriClaw-Instruct devices approve --latest
```

### `SiriClaw-Instruct devices reject <requestId>`

Reject a pending device pairing request.

```
SiriClaw-Instruct devices reject <requestId>
```

### `SiriClaw-Instruct devices rotate --device <id> --role <role> [--scope <scope...>]`

Rotate a device token for a specific role (optionally updating scopes).

```
SiriClaw-Instruct devices rotate --device <deviceId> --role operator --scope operator.read --scope operator.write
```

### `SiriClaw-Instruct devices revoke --device <id> --role <role>`

Revoke a device token for a specific role.

```
SiriClaw-Instruct devices revoke --device <deviceId> --role node
```

## Common options

- `--url <url>`: Gateway WebSocket URL (defaults to `gateway.remote.url` when configured).
- `--token <token>`: Gateway token (if required).
- `--password <password>`: Gateway password (password auth).
- `--timeout <ms>`: RPC timeout.
- `--json`: JSON output (recommended for scripting).

Note: when you set `--url`, the CLI does not fall back to config or environment credentials.
Pass `--token` or `--password` explicitly. Missing explicit credentials is an error.

## Notes

- Token rotation returns a new token (sensitive). Treat it like a secret.
- These commands require `operator.pairing` (or `operator.admin`) scope.
- `devices clear` is intentionally gated by `--yes`.
- If pairing scope is unavailable on local loopback (and no explicit `--url` is passed), list/approve can use a local pairing fallback.
