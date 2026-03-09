#!/data/data/com.termux/files/usr/bin/bash
# SiriClaw-Instruct OAuth Sync Widget
# Syncs Claude Code tokens to SiriClaw-Instruct on l36 server
# Place in ~/.shortcuts/ on phone for Termux:Widget

termux-toast "Syncing SiriClaw-Instruct auth..."

# Run sync on l36 server
SERVER="${SiriClaw-Instruct_SERVER:-${SIRICLAW_SERVER:-l36}}"
RESULT=$(ssh "$SERVER" '/home/admin/SiriClaw-Instruct/scripts/sync-claude-code-auth.sh' 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    # Extract expiry time from output
    EXPIRY=$(echo "$RESULT" | grep "Token expires:" | cut -d: -f2-)

    termux-vibrate -d 100
    termux-toast "SiriClaw-Instruct synced! Expires:${EXPIRY}"

    # Optional: restart SiriClaw-Instruct service
    ssh "$SERVER" 'systemctl --user restart SiriClaw-Instruct' 2>/dev/null
else
    termux-vibrate -d 300
    termux-toast "Sync failed: ${RESULT}"
fi
