---
summary: "Run SiriClaw-Instruct in a rootless Podman container"
read_when:
  - You want a containerized gateway with Podman instead of Docker
title: "Podman"
---

# Podman

Run the SiriClaw-Instruct gateway in a **rootless** Podman container. Uses the same image as Docker (build from the repo [Dockerfile](https://github.com/SiriClaw-Instruct/SiriClaw-Instruct/blob/main/Dockerfile)).

## Requirements

- Podman (rootless)
- Sudo for one-time setup (create user, build image)

## Quick start

**1. One-time setup** (from repo root; creates user, builds image, installs launch script):

```bash
./setup-podman.sh
```

This also creates a minimal `~SiriClaw-Instruct/.SiriClaw-Instruct/SiriClaw-Instruct.json` (sets `gateway.mode="local"`) so the gateway can start without running the wizard.

By default the container is **not** installed as a systemd service, you start it manually (see below). For a production-style setup with auto-start and restarts, install it as a systemd Quadlet user service instead:

```bash
./setup-podman.sh --quadlet
```

(Or set `SiriClaw-Instruct_PODMAN_QUADLET=1`; use `--container` to install only the container and launch script.)

Optional build-time env vars (set before running `setup-podman.sh`):

- `SiriClaw-Instruct_DOCKER_APT_PACKAGES` — install extra apt packages during image build
- `SiriClaw-Instruct_EXTENSIONS` — pre-install extension dependencies (space-separated extension names, e.g. `diagnostics-otel matrix`)

**2. Start gateway** (manual, for quick smoke testing):

```bash
./scripts/run-SiriClaw-Instruct-podman.sh launch
```

**3. Onboarding wizard** (e.g. to add channels or providers):

```bash
./scripts/run-SiriClaw-Instruct-podman.sh launch setup
```

Then open `http://127.0.0.1:18789/` and use the token from `~SiriClaw-Instruct/.SiriClaw-Instruct/.env` (or the value printed by setup).

## Systemd (Quadlet, optional)

If you ran `./setup-podman.sh --quadlet` (or `SiriClaw-Instruct_PODMAN_QUADLET=1`), a [Podman Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) unit is installed so the gateway runs as a systemd user service for the SiriClaw-Instruct user. The service is enabled and started at the end of setup.

- **Start:** `sudo systemctl --machine SiriClaw-Instruct@ --user start SiriClaw-Instruct.service`
- **Stop:** `sudo systemctl --machine SiriClaw-Instruct@ --user stop SiriClaw-Instruct.service`
- **Status:** `sudo systemctl --machine SiriClaw-Instruct@ --user status SiriClaw-Instruct.service`
- **Logs:** `sudo journalctl --machine SiriClaw-Instruct@ --user -u SiriClaw-Instruct.service -f`

The quadlet file lives at `~SiriClaw-Instruct/.config/containers/systemd/SiriClaw-Instruct.container`. To change ports or env, edit that file (or the `.env` it sources), then `sudo systemctl --machine SiriClaw-Instruct@ --user daemon-reload` and restart the service. On boot, the service starts automatically if lingering is enabled for SiriClaw-Instruct (setup does this when loginctl is available).

To add quadlet **after** an initial setup that did not use it, re-run: `./setup-podman.sh --quadlet`.

## The SiriClaw-Instruct user (non-login)

`setup-podman.sh` creates a dedicated system user `SiriClaw-Instruct`:

- **Shell:** `nologin` — no interactive login; reduces attack surface.
- **Home:** e.g. `/home/SiriClaw-Instruct` — holds `~/.SiriClaw-Instruct` (config, workspace) and the launch script `run-SiriClaw-Instruct-podman.sh`.
- **Rootless Podman:** The user must have a **subuid** and **subgid** range. Many distros assign these automatically when the user is created. If setup prints a warning, add lines to `/etc/subuid` and `/etc/subgid`:

  ```text
  SiriClaw-Instruct:100000:65536
  ```

  Then start the gateway as that user (e.g. from cron or systemd):

  ```bash
  sudo -u SiriClaw-Instruct /home/SiriClaw-Instruct/run-SiriClaw-Instruct-podman.sh
  sudo -u SiriClaw-Instruct /home/SiriClaw-Instruct/run-SiriClaw-Instruct-podman.sh setup
  ```

- **Config:** Only `SiriClaw-Instruct` and root can access `/home/SiriClaw-Instruct/.SiriClaw-Instruct`. To edit config: use the Control UI once the gateway is running, or `sudo -u SiriClaw-Instruct $EDITOR /home/SiriClaw-Instruct/.SiriClaw-Instruct/SiriClaw-Instruct.json`.

## Environment and config

- **Token:** Stored in `~SiriClaw-Instruct/.SiriClaw-Instruct/.env` as `SiriClaw-Instruct_GATEWAY_TOKEN`. `setup-podman.sh` and `run-SiriClaw-Instruct-podman.sh` generate it if missing (uses `openssl`, `python3`, or `od`).
- **Optional:** In that `.env` you can set provider keys (e.g. `GROQ_API_KEY`, `OLLAMA_API_KEY`) and other SiriClaw-Instruct env vars.
- **Host ports:** By default the script maps `18789` (gateway) and `18790` (bridge). Override the **host** port mapping with `SiriClaw-Instruct_PODMAN_GATEWAY_HOST_PORT` and `SiriClaw-Instruct_PODMAN_BRIDGE_HOST_PORT` when launching.
- **Gateway bind:** By default, `run-SiriClaw-Instruct-podman.sh` starts the gateway with `--bind loopback` for safe local access. To expose on LAN, set `SiriClaw-Instruct_GATEWAY_BIND=lan` and configure `gateway.controlUi.allowedOrigins` (or explicitly enable host-header fallback) in `SiriClaw-Instruct.json`.
- **Paths:** Host config and workspace default to `~SiriClaw-Instruct/.SiriClaw-Instruct` and `~SiriClaw-Instruct/.SiriClaw-Instruct/workspace`. Override the host paths used by the launch script with `SiriClaw-Instruct_CONFIG_DIR` and `SiriClaw-Instruct_WORKSPACE_DIR`.

## Storage model

- **Persistent host data:** `SiriClaw-Instruct_CONFIG_DIR` and `SiriClaw-Instruct_WORKSPACE_DIR` are bind-mounted into the container and retain state on the host.
- **Ephemeral sandbox tmpfs:** if you enable `agents.defaults.sandbox`, the tool sandbox containers mount `tmpfs` at `/tmp`, `/var/tmp`, and `/run`. Those paths are memory-backed and disappear with the sandbox container; the top-level Podman container setup does not add its own tmpfs mounts.
- **Disk growth hotspots:** the main paths to watch are `media/`, `agents/<agentId>/sessions/sessions.json`, transcript JSONL files, `cron/runs/*.jsonl`, and rolling file logs under `/tmp/SiriClaw-Instruct/` (or your configured `logging.file`).

`setup-podman.sh` now stages the image tar in a private temp directory and prints the chosen base dir during setup. For non-root runs it accepts `TMPDIR` only when that base is safe to use; otherwise it falls back to `/var/tmp`, then `/tmp`. The saved tar stays owner-only and is streamed into the target user’s `podman load`, so private caller temp dirs do not block setup.

## Useful commands

- **Logs:** With quadlet: `sudo journalctl --machine SiriClaw-Instruct@ --user -u SiriClaw-Instruct.service -f`. With script: `sudo -u SiriClaw-Instruct podman logs -f SiriClaw-Instruct`
- **Stop:** With quadlet: `sudo systemctl --machine SiriClaw-Instruct@ --user stop SiriClaw-Instruct.service`. With script: `sudo -u SiriClaw-Instruct podman stop SiriClaw-Instruct`
- **Start again:** With quadlet: `sudo systemctl --machine SiriClaw-Instruct@ --user start SiriClaw-Instruct.service`. With script: re-run the launch script or `podman start SiriClaw-Instruct`
- **Remove container:** `sudo -u SiriClaw-Instruct podman rm -f SiriClaw-Instruct` — config and workspace on the host are kept

## Troubleshooting

- **Permission denied (EACCES) on config or auth-profiles:** The container defaults to `--userns=keep-id` and runs as the same uid/gid as the host user running the script. Ensure your host `SiriClaw-Instruct_CONFIG_DIR` and `SiriClaw-Instruct_WORKSPACE_DIR` are owned by that user.
- **Gateway start blocked (missing `gateway.mode=local`):** Ensure `~SiriClaw-Instruct/.SiriClaw-Instruct/SiriClaw-Instruct.json` exists and sets `gateway.mode="local"`. `setup-podman.sh` creates this file if missing.
- **Rootless Podman fails for user SiriClaw-Instruct:** Check `/etc/subuid` and `/etc/subgid` contain a line for `SiriClaw-Instruct` (e.g. `SiriClaw-Instruct:100000:65536`). Add it if missing and restart.
- **Container name in use:** The launch script uses `podman run --replace`, so the existing container is replaced when you start again. To clean up manually: `podman rm -f SiriClaw-Instruct`.
- **Script not found when running as SiriClaw-Instruct:** Ensure `setup-podman.sh` was run so that `run-SiriClaw-Instruct-podman.sh` is copied to SiriClaw-Instruct’s home (e.g. `/home/SiriClaw-Instruct/run-SiriClaw-Instruct-podman.sh`).
- **Quadlet service not found or fails to start:** Run `sudo systemctl --machine SiriClaw-Instruct@ --user daemon-reload` after editing the `.container` file. Quadlet requires cgroups v2: `podman info --format '{{.Host.CgroupsVersion}}'` should show `2`.

## Optional: run as your own user

To run the gateway as your normal user (no dedicated SiriClaw-Instruct user): build the image, create `~/.SiriClaw-Instruct/.env` with `SiriClaw-Instruct_GATEWAY_TOKEN`, and run the container with `--userns=keep-id` and mounts to your `~/.SiriClaw-Instruct`. The launch script is designed for the SiriClaw-Instruct-user flow; for a single-user setup you can instead run the `podman run` command from the script manually, pointing config and workspace to your home. Recommended for most users: use `setup-podman.sh` and run as the SiriClaw-Instruct user so config and process are isolated.
