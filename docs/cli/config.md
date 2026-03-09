---
summary: "CLI reference for `SiriClaw-Instruct config` (get/set/unset/file/validate)"
read_when:
  - You want to read or edit config non-interactively
title: "config"
---

# `SiriClaw-Instruct config`

Config helpers: get/set/unset/validate values by path and print the active
config file. Run without a subcommand to open
the configure wizard (same as `SiriClaw-Instruct configure`).

## Examples

```bash
SiriClaw-Instruct config file
SiriClaw-Instruct config get browser.executablePath
SiriClaw-Instruct config set browser.executablePath "/usr/bin/google-chrome"
SiriClaw-Instruct config set agents.defaults.heartbeat.every "2h"
SiriClaw-Instruct config set agents.list[0].tools.exec.node "node-id-or-name"
SiriClaw-Instruct config unset tools.web.search.apiKey
SiriClaw-Instruct config validate
SiriClaw-Instruct config validate --json
```

## Paths

Paths use dot or bracket notation:

```bash
SiriClaw-Instruct config get agents.defaults.workspace
SiriClaw-Instruct config get agents.list[0].id
```

Use the agent list index to target a specific agent:

```bash
SiriClaw-Instruct config get agents.list
SiriClaw-Instruct config set agents.list[1].tools.exec.node "node-id-or-name"
```

## Values

Values are parsed as JSON5 when possible; otherwise they are treated as strings.
Use `--strict-json` to require JSON5 parsing. `--json` remains supported as a legacy alias.

```bash
SiriClaw-Instruct config set agents.defaults.heartbeat.every "0m"
SiriClaw-Instruct config set gateway.port 19001 --strict-json
SiriClaw-Instruct config set channels.whatsapp.groups '["*"]' --strict-json
```

## Subcommands

- `config file`: Print the active config file path (resolved from `SiriClaw-Instruct_CONFIG_PATH` or default location).

Restart the gateway after edits.

## Validate

Validate the current config against the active schema without starting the
gateway.

```bash
SiriClaw-Instruct config validate
SiriClaw-Instruct config validate --json
```
