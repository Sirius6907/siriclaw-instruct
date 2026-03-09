---
summary: "Uninstall SiriClaw-Instruct completely (CLI, service, state, workspace)"
read_when:
  - You want to remove SiriClaw-Instruct from a machine
  - The gateway service is still running after uninstall
title: "Uninstall"
---

# Uninstall

Two paths:

- **Easy path** if `SiriClaw-Instruct` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
SiriClaw-Instruct uninstall
```

Non-interactive (automation / npx):

```bash
SiriClaw-Instruct uninstall --all --yes --non-interactive
npx -y SiriClaw-Instruct uninstall --all --yes --non-interactive
```

Manual steps (same result):

1. Stop the gateway service:

```bash
SiriClaw-Instruct gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash
SiriClaw-Instruct gateway uninstall
```

3. Delete state + config:

```bash
rm -rf "${SiriClaw-Instruct_STATE_DIR:-$HOME/.SiriClaw-Instruct}"
```

If you set `SiriClaw-Instruct_CONFIG_PATH` to a custom location outside the state dir, delete that file too.

4. Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/.SiriClaw-Instruct/workspace
```

5. Remove the CLI install (pick the one you used):

```bash
npm rm -g SiriClaw-Instruct
pnpm remove -g SiriClaw-Instruct
bun remove -g SiriClaw-Instruct
```

6. If you installed the macOS app:

```bash
rm -rf /Applications/SiriClaw-Instruct.app
```

Notes:

- If you used profiles (`--profile` / `SiriClaw-Instruct_PROFILE`), repeat step 3 for each state dir (defaults are `~/.SiriClaw-Instruct-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `SiriClaw-Instruct` is missing.

### macOS (launchd)

Default label is `ai.SiriClaw-Instruct.gateway` (or `ai.SiriClaw-Instruct.<profile>`; legacy `com.SiriClaw-Instruct.*` may still exist):

```bash
launchctl bootout gui/$UID/ai.SiriClaw-Instruct.gateway
rm -f ~/Library/LaunchAgents/ai.SiriClaw-Instruct.gateway.plist
```

If you used a profile, replace the label and plist name with `ai.SiriClaw-Instruct.<profile>`. Remove any legacy `com.SiriClaw-Instruct.*` plists if present.

### Linux (systemd user unit)

Default unit name is `SiriClaw-Instruct-gateway.service` (or `SiriClaw-Instruct-gateway-<profile>.service`):

```bash
systemctl --user disable --now SiriClaw-Instruct-gateway.service
rm -f ~/.config/systemd/user/SiriClaw-Instruct-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `SiriClaw-Instruct Gateway` (or `SiriClaw-Instruct Gateway (<profile>)`).
The task script lives under your state dir.

```powershell
schtasks /Delete /F /TN "SiriClaw-Instruct Gateway"
Remove-Item -Force "$env:USERPROFILE\.SiriClaw-Instruct\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.SiriClaw-Instruct-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://SiriClaw-Instruct.ai/install.sh` or `install.ps1`, the CLI was installed with `npm install -g SiriClaw-Instruct@latest`.
Remove it with `npm rm -g SiriClaw-Instruct` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `SiriClaw-Instruct ...` / `bun run SiriClaw-Instruct ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.
