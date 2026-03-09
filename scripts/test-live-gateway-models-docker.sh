#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_NAME="${SiriClaw-Instruct_IMAGE:-${SIRICLAW_IMAGE:-SiriClaw-Instruct:local}}"
CONFIG_DIR="${SiriClaw-Instruct_CONFIG_DIR:-${SIRICLAW_CONFIG_DIR:-$HOME/.SiriClaw-Instruct}}"
WORKSPACE_DIR="${SiriClaw-Instruct_WORKSPACE_DIR:-${SIRICLAW_WORKSPACE_DIR:-$HOME/.SiriClaw-Instruct/workspace}}"
PROFILE_FILE="${SiriClaw-Instruct_PROFILE_FILE:-${SIRICLAW_PROFILE_FILE:-$HOME/.profile}}"

PROFILE_MOUNT=()
if [[ -f "$PROFILE_FILE" ]]; then
  PROFILE_MOUNT=(-v "$PROFILE_FILE":/home/node/.profile:ro)
fi

read -r -d '' LIVE_TEST_CMD <<'EOF' || true
set -euo pipefail
[ -f "$HOME/.profile" ] && source "$HOME/.profile" || true
tmp_dir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT
tar -C /src \
  --exclude=.git \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=ui/dist \
  --exclude=ui/node_modules \
  -cf - . | tar -C "$tmp_dir" -xf -
ln -s /app/node_modules "$tmp_dir/node_modules"
ln -s /app/dist "$tmp_dir/dist"
cd "$tmp_dir"
pnpm test:live
EOF

echo "==> Build image: $IMAGE_NAME"
docker build -t "$IMAGE_NAME" -f "$ROOT_DIR/Dockerfile" "$ROOT_DIR"

echo "==> Run gateway live model tests (profile keys)"
docker run --rm -t \
  --entrypoint bash \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e HOME=/home/node \
  -e NODE_OPTIONS=--disable-warning=ExperimentalWarning \
  -e SiriClaw-Instruct_LIVE_TEST=1 \
  -e SiriClaw-Instruct_LIVE_GATEWAY_MODELS="${SiriClaw-Instruct_LIVE_GATEWAY_MODELS:-${SIRICLAW_LIVE_GATEWAY_MODELS:-modern}}" \
  -e SiriClaw-Instruct_LIVE_GATEWAY_PROVIDERS="${SiriClaw-Instruct_LIVE_GATEWAY_PROVIDERS:-${SIRICLAW_LIVE_GATEWAY_PROVIDERS:-}}" \
  -e SiriClaw-Instruct_LIVE_GATEWAY_MAX_MODELS="${SiriClaw-Instruct_LIVE_GATEWAY_MAX_MODELS:-${SIRICLAW_LIVE_GATEWAY_MAX_MODELS:-24}}" \
  -e SiriClaw-Instruct_LIVE_GATEWAY_MODEL_TIMEOUT_MS="${SiriClaw-Instruct_LIVE_GATEWAY_MODEL_TIMEOUT_MS:-${SIRICLAW_LIVE_GATEWAY_MODEL_TIMEOUT_MS:-}}" \
  -v "$ROOT_DIR":/src:ro \
  -v "$CONFIG_DIR":/home/node/.SiriClaw-Instruct \
  -v "$WORKSPACE_DIR":/home/node/.SiriClaw-Instruct/workspace \
  "${PROFILE_MOUNT[@]}" \
  "$IMAGE_NAME" \
  -lc "$LIVE_TEST_CMD"
