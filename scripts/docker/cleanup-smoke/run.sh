#!/usr/bin/env bash
set -euo pipefail

cd /repo

export SIRICLAW_STATE_DIR="/tmp/SiriClaw-Instruct-test"
export SIRICLAW_CONFIG_PATH="${SIRICLAW_STATE_DIR}/SiriClaw-Instruct.json"

echo "==> Build"
pnpm build

echo "==> Seed state"
mkdir -p "${SIRICLAW_STATE_DIR}/credentials"
mkdir -p "${SIRICLAW_STATE_DIR}/agents/main/sessions"
echo '{}' >"${SIRICLAW_CONFIG_PATH}"
echo 'creds' >"${SIRICLAW_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${SIRICLAW_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm SiriClaw-Instruct reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${SIRICLAW_CONFIG_PATH}"
test ! -d "${SIRICLAW_STATE_DIR}/credentials"
test ! -d "${SIRICLAW_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${SIRICLAW_STATE_DIR}/credentials"
echo '{}' >"${SIRICLAW_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm SiriClaw-Instruct uninstall --state --yes --non-interactive

test ! -d "${SIRICLAW_STATE_DIR}"

echo "OK"
