#!/usr/bin/env bash
# One-time host setup for rootless SiriClaw-Instruct in Podman: creates the SiriClaw-Instruct
# user, builds the image, loads it into that user's Podman store, and installs
# the launch script. Run from repo root with sudo capability.
#
# Usage: ./setup-podman.sh [--quadlet|--container]
#   --quadlet   Install systemd Quadlet so the container runs as a user service
#   --container Only install user + image + launch script; you start the container manually (default)
#   Or set SiriClaw-Instruct_PODMAN_QUADLET=1 (or 0) to choose without a flag.
#
# After this, start the gateway manually:
#   ./scripts/run-SiriClaw-Instruct-podman.sh launch
#   ./scripts/run-SiriClaw-Instruct-podman.sh launch setup   # onboarding wizard
# Or as the SiriClaw-Instruct user: sudo -u SiriClaw-Instruct /home/SiriClaw-Instruct/run-SiriClaw-Instruct-podman.sh
# If you used --quadlet, you can also: sudo systemctl --machine SiriClaw-Instruct@ --user start SiriClaw-Instruct.service
set -euo pipefail

SiriClaw-Instruct_USER="${SiriClaw-Instruct_PODMAN_USER:-SiriClaw-Instruct}"
REPO_PATH="${SiriClaw-Instruct_REPO_PATH:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
RUN_SCRIPT_SRC="$REPO_PATH/scripts/run-SiriClaw-Instruct-podman.sh"
QUADLET_TEMPLATE="$REPO_PATH/scripts/podman/SiriClaw-Instruct.container.in"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing dependency: $1" >&2
    exit 1
  fi
}

is_writable_dir() {
  local dir="$1"
  [[ -n "$dir" && -d "$dir" && ! -L "$dir" && -w "$dir" && -x "$dir" ]]
}

is_safe_tmp_base() {
  local dir="$1"
  local mode=""
  local owner=""
  is_writable_dir "$dir" || return 1
  mode="$(stat -Lc '%a' "$dir" 2>/dev/null || true)"
  if [[ -n "$mode" ]]; then
    local perm=$((8#$mode))
    if (( (perm & 0022) != 0 && (perm & 01000) == 0 )); then
      return 1
    fi
  fi
  if is_root; then
    owner="$(stat -Lc '%u' "$dir" 2>/dev/null || true)"
    if [[ -n "$owner" && "$owner" != "0" ]]; then
      return 1
    fi
  fi
  return 0
}

resolve_image_tmp_dir() {
  if ! is_root && is_safe_tmp_base "${TMPDIR:-}"; then
    printf '%s' "$TMPDIR"
    return 0
  fi
  if is_safe_tmp_base "/var/tmp"; then
    printf '%s' "/var/tmp"
    return 0
  fi
  if is_safe_tmp_base "/tmp"; then
    printf '%s' "/tmp"
    return 0
  fi
  printf '%s' "/tmp"
}

is_root() { [[ "$(id -u)" -eq 0 ]]; }

run_root() {
  if is_root; then
    "$@"
  else
    sudo "$@"
  fi
}

run_as_user() {
  local user="$1"
  shift
  if command -v sudo >/dev/null 2>&1; then
    sudo -u "$user" "$@"
  elif is_root && command -v runuser >/dev/null 2>&1; then
    runuser -u "$user" -- "$@"
  else
    echo "Need sudo (or root+runuser) to run commands as $user." >&2
    exit 1
  fi
}

run_as_SiriClaw-Instruct() {
  # Avoid root writes into $SiriClaw-Instruct_HOME (symlink/hardlink/TOCTOU footguns).
  # Anything under the target user's home should be created/modified as that user.
  run_as_user "$SiriClaw-Instruct_USER" env HOME="$SiriClaw-Instruct_HOME" "$@"
}

escape_sed_replacement_pipe_delim() {
  # Escape replacement metacharacters for sed "s|...|...|g" replacement text.
  printf '%s' "$1" | sed -e 's/[\\&|]/\\&/g'
}

# Quadlet: opt-in via --quadlet or SiriClaw-Instruct_PODMAN_QUADLET=1
INSTALL_QUADLET=false
for arg in "$@"; do
  case "$arg" in
    --quadlet)   INSTALL_QUADLET=true ;;
    --container) INSTALL_QUADLET=false ;;
  esac
done
if [[ -n "${SiriClaw-Instruct_PODMAN_QUADLET:-}" ]]; then
  case "${SiriClaw-Instruct_PODMAN_QUADLET,,}" in
    1|yes|true)  INSTALL_QUADLET=true ;;
    0|no|false) INSTALL_QUADLET=false ;;
  esac
fi

require_cmd podman
if ! is_root; then
  require_cmd sudo
fi
if [[ ! -f "$REPO_PATH/Dockerfile" ]]; then
  echo "Dockerfile not found at $REPO_PATH. Set SiriClaw-Instruct_REPO_PATH to the repo root." >&2
  exit 1
fi
if [[ ! -f "$RUN_SCRIPT_SRC" ]]; then
  echo "Launch script not found at $RUN_SCRIPT_SRC." >&2
  exit 1
fi

generate_token_hex_32() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
    return 0
  fi
  if command -v python3 >/dev/null 2>&1; then
    python3 - <<'PY'
import secrets
print(secrets.token_hex(32))
PY
    return 0
  fi
  if command -v od >/dev/null 2>&1; then
    # 32 random bytes -> 64 lowercase hex chars
    od -An -N32 -tx1 /dev/urandom | tr -d " \n"
    return 0
  fi
  echo "Missing dependency: need openssl or python3 (or od) to generate SiriClaw-Instruct_GATEWAY_TOKEN." >&2
  exit 1
}

user_exists() {
  local user="$1"
  if command -v getent >/dev/null 2>&1; then
    getent passwd "$user" >/dev/null 2>&1 && return 0
  fi
  id -u "$user" >/dev/null 2>&1
}

resolve_user_home() {
  local user="$1"
  local home=""
  if command -v getent >/dev/null 2>&1; then
    home="$(getent passwd "$user" 2>/dev/null | cut -d: -f6 || true)"
  fi
  if [[ -z "$home" && -f /etc/passwd ]]; then
    home="$(awk -F: -v u="$user" '$1==u {print $6}' /etc/passwd 2>/dev/null || true)"
  fi
  if [[ -z "$home" ]]; then
    home="/home/$user"
  fi
  printf '%s' "$home"
}

resolve_nologin_shell() {
  for cand in /usr/sbin/nologin /sbin/nologin /usr/bin/nologin /bin/false; do
    if [[ -x "$cand" ]]; then
      printf '%s' "$cand"
      return 0
    fi
  done
  printf '%s' "/usr/sbin/nologin"
}

# Create SiriClaw-Instruct user (non-login, with home) if missing
if ! user_exists "$SiriClaw-Instruct_USER"; then
  NOLOGIN_SHELL="$(resolve_nologin_shell)"
  echo "Creating user $SiriClaw-Instruct_USER ($NOLOGIN_SHELL, with home)..."
  if command -v useradd >/dev/null 2>&1; then
    run_root useradd -m -s "$NOLOGIN_SHELL" "$SiriClaw-Instruct_USER"
  elif command -v adduser >/dev/null 2>&1; then
    # Debian/Ubuntu: adduser supports --disabled-password/--gecos. Busybox adduser differs.
    run_root adduser --disabled-password --gecos "" --shell "$NOLOGIN_SHELL" "$SiriClaw-Instruct_USER"
  else
    echo "Neither useradd nor adduser found, cannot create user $SiriClaw-Instruct_USER." >&2
    exit 1
  fi
else
  echo "User $SiriClaw-Instruct_USER already exists."
fi

SiriClaw-Instruct_HOME="$(resolve_user_home "$SiriClaw-Instruct_USER")"
SiriClaw-Instruct_UID="$(id -u "$SiriClaw-Instruct_USER" 2>/dev/null || true)"
SiriClaw-Instruct_CONFIG="$SiriClaw-Instruct_HOME/.SiriClaw-Instruct"
LAUNCH_SCRIPT_DST="$SiriClaw-Instruct_HOME/run-SiriClaw-Instruct-podman.sh"

# Prefer systemd user services (Quadlet) for production. Enable lingering early so rootless Podman can run
# without an interactive login.
if command -v loginctl &>/dev/null; then
  run_root loginctl enable-linger "$SiriClaw-Instruct_USER" 2>/dev/null || true
fi
if [[ -n "${SiriClaw-Instruct_UID:-}" && -d /run/user ]] && command -v systemctl &>/dev/null; then
  run_root systemctl start "user@${SiriClaw-Instruct_UID}.service" 2>/dev/null || true
fi

# Rootless Podman needs subuid/subgid for the run user
if ! grep -q "^${SiriClaw-Instruct_USER}:" /etc/subuid 2>/dev/null; then
  echo "Warning: $SiriClaw-Instruct_USER has no subuid range. Rootless Podman may fail." >&2
  echo "  Add a line to /etc/subuid and /etc/subgid, e.g.: $SiriClaw-Instruct_USER:100000:65536" >&2
fi

echo "Creating $SiriClaw-Instruct_CONFIG and workspace..."
run_as_SiriClaw-Instruct mkdir -p "$SiriClaw-Instruct_CONFIG/workspace"
run_as_SiriClaw-Instruct chmod 700 "$SiriClaw-Instruct_CONFIG" "$SiriClaw-Instruct_CONFIG/workspace" 2>/dev/null || true

ENV_FILE="$SiriClaw-Instruct_CONFIG/.env"
if run_as_SiriClaw-Instruct test -f "$ENV_FILE"; then
  if ! run_as_SiriClaw-Instruct grep -q '^SiriClaw-Instruct_GATEWAY_TOKEN=' "$ENV_FILE" 2>/dev/null; then
    TOKEN="$(generate_token_hex_32)"
    printf 'SiriClaw-Instruct_GATEWAY_TOKEN=%s\n' "$TOKEN" | run_as_SiriClaw-Instruct tee -a "$ENV_FILE" >/dev/null
    echo "Added SiriClaw-Instruct_GATEWAY_TOKEN to $ENV_FILE."
  fi
  run_as_SiriClaw-Instruct chmod 600 "$ENV_FILE" 2>/dev/null || true
else
  TOKEN="$(generate_token_hex_32)"
  printf 'SiriClaw-Instruct_GATEWAY_TOKEN=%s\n' "$TOKEN" | run_as_SiriClaw-Instruct tee "$ENV_FILE" >/dev/null
  run_as_SiriClaw-Instruct chmod 600 "$ENV_FILE" 2>/dev/null || true
  echo "Created $ENV_FILE with new token."
fi

# The gateway refuses to start unless gateway.mode=local is set in config.
# Make first-run non-interactive; users can run the wizard later to configure channels/providers.
SiriClaw-Instruct_JSON="$SiriClaw-Instruct_CONFIG/SiriClaw-Instruct.json"
if ! run_as_SiriClaw-Instruct test -f "$SiriClaw-Instruct_JSON"; then
  printf '%s\n' '{ gateway: { mode: "local" } }' | run_as_SiriClaw-Instruct tee "$SiriClaw-Instruct_JSON" >/dev/null
  run_as_SiriClaw-Instruct chmod 600 "$SiriClaw-Instruct_JSON" 2>/dev/null || true
  echo "Created $SiriClaw-Instruct_JSON (minimal gateway.mode=local)."
fi

echo "Building image from $REPO_PATH..."
BUILD_ARGS=()
[[ -n "${SiriClaw-Instruct_DOCKER_APT_PACKAGES:-}" ]] && BUILD_ARGS+=(--build-arg "SiriClaw-Instruct_DOCKER_APT_PACKAGES=${SiriClaw-Instruct_DOCKER_APT_PACKAGES}")
[[ -n "${SiriClaw-Instruct_EXTENSIONS:-}" ]] && BUILD_ARGS+=(--build-arg "SiriClaw-Instruct_EXTENSIONS=${SiriClaw-Instruct_EXTENSIONS}")
podman build ${BUILD_ARGS[@]+"${BUILD_ARGS[@]}"} -t SiriClaw-Instruct:local -f "$REPO_PATH/Dockerfile" "$REPO_PATH"

echo "Loading image into $SiriClaw-Instruct_USER's Podman store..."
TMP_IMAGE_DIR="$(resolve_image_tmp_dir)"
echo "Using temporary image dir: $TMP_IMAGE_DIR"
TMP_STAGE_DIR="$(mktemp -d -p "$TMP_IMAGE_DIR" SiriClaw-Instruct-image.XXXXXX)"
TMP_IMAGE="$TMP_STAGE_DIR/image.tar"
chmod 700 "$TMP_STAGE_DIR"
trap 'rm -rf "$TMP_STAGE_DIR"' EXIT
podman save SiriClaw-Instruct:local -o "$TMP_IMAGE"
chmod 600 "$TMP_IMAGE"
# Stream the image into the target user's podman load so private temp directories
# do not need to be traversable by $SiriClaw-Instruct_USER.
cat "$TMP_IMAGE" | run_as_user "$SiriClaw-Instruct_USER" env HOME="$SiriClaw-Instruct_HOME" podman load
rm -rf "$TMP_STAGE_DIR"
trap - EXIT

echo "Copying launch script to $LAUNCH_SCRIPT_DST..."
run_root cat "$RUN_SCRIPT_SRC" | run_as_SiriClaw-Instruct tee "$LAUNCH_SCRIPT_DST" >/dev/null
run_as_SiriClaw-Instruct chmod 755 "$LAUNCH_SCRIPT_DST"

# Optionally install systemd quadlet for SiriClaw-Instruct user (rootless Podman + systemd)
QUADLET_DIR="$SiriClaw-Instruct_HOME/.config/containers/systemd"
if [[ "$INSTALL_QUADLET" == true && -f "$QUADLET_TEMPLATE" ]]; then
  echo "Installing systemd quadlet for $SiriClaw-Instruct_USER..."
  run_as_SiriClaw-Instruct mkdir -p "$QUADLET_DIR"
  SiriClaw-Instruct_HOME_SED="$(escape_sed_replacement_pipe_delim "$SiriClaw-Instruct_HOME")"
  sed "s|{{SiriClaw-Instruct_HOME}}|$SiriClaw-Instruct_HOME_SED|g" "$QUADLET_TEMPLATE" | run_as_SiriClaw-Instruct tee "$QUADLET_DIR/SiriClaw-Instruct.container" >/dev/null
  run_as_SiriClaw-Instruct chmod 700 "$SiriClaw-Instruct_HOME/.config" "$SiriClaw-Instruct_HOME/.config/containers" "$QUADLET_DIR" 2>/dev/null || true
  run_as_SiriClaw-Instruct chmod 600 "$QUADLET_DIR/SiriClaw-Instruct.container" 2>/dev/null || true
  if command -v systemctl &>/dev/null; then
    run_root systemctl --machine "${SiriClaw-Instruct_USER}@" --user daemon-reload 2>/dev/null || true
    run_root systemctl --machine "${SiriClaw-Instruct_USER}@" --user enable SiriClaw-Instruct.service 2>/dev/null || true
    run_root systemctl --machine "${SiriClaw-Instruct_USER}@" --user start SiriClaw-Instruct.service 2>/dev/null || true
  fi
fi

echo ""
echo "Setup complete. Start the gateway:"
echo "  $RUN_SCRIPT_SRC launch"
echo "  $RUN_SCRIPT_SRC launch setup   # onboarding wizard"
echo "Or as $SiriClaw-Instruct_USER (e.g. from cron):"
echo "  sudo -u $SiriClaw-Instruct_USER $LAUNCH_SCRIPT_DST"
echo "  sudo -u $SiriClaw-Instruct_USER $LAUNCH_SCRIPT_DST setup"
if [[ "$INSTALL_QUADLET" == true ]]; then
  echo "Or use systemd (quadlet):"
  echo "  sudo systemctl --machine ${SiriClaw-Instruct_USER}@ --user start SiriClaw-Instruct.service"
  echo "  sudo systemctl --machine ${SiriClaw-Instruct_USER}@ --user status SiriClaw-Instruct.service"
else
  echo "To install systemd quadlet later: $0 --quadlet"
fi
