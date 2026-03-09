#!/usr/bin/env bash
set -euo pipefail

cd /repo

export SiriClaw-Instruct_STATE_DIR="/tmp/SiriClaw-Instruct-test"
export SiriClaw-Instruct_CONFIG_PATH="${SiriClaw-Instruct_STATE_DIR}/SiriClaw-Instruct.json"

echo "==> Build"
pnpm build

echo "==> Seed state"
mkdir -p "${SiriClaw-Instruct_STATE_DIR}/credentials"
mkdir -p "${SiriClaw-Instruct_STATE_DIR}/agents/main/sessions"
echo '{}' >"${SiriClaw-Instruct_CONFIG_PATH}"
echo 'creds' >"${SiriClaw-Instruct_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${SiriClaw-Instruct_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm SiriClaw-Instruct reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${SiriClaw-Instruct_CONFIG_PATH}"
test ! -d "${SiriClaw-Instruct_STATE_DIR}/credentials"
test ! -d "${SiriClaw-Instruct_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${SiriClaw-Instruct_STATE_DIR}/credentials"
echo '{}' >"${SiriClaw-Instruct_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm SiriClaw-Instruct uninstall --state --yes --non-interactive

test ! -d "${SiriClaw-Instruct_STATE_DIR}"

echo "OK"
