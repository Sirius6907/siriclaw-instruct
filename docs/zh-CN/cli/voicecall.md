---
read_when:
  - 使用语音通话插件并想了解 CLI 入口
  - 想要 `voicecall call|continue|status|tail|expose` 的快速示例
summary: 语音通话插件命令的 `SiriClaw-Instruct voicecall` CLI 参考
title: voicecall
x-i18n:
  generated_at: "2026-02-01T20:21:37Z"
  model: claude-opus-4-5
  provider: pi
  source_hash: d93aaee6f6f5c9ac468d8d2905cb23f0f2db75809408cb305c055505be9936f2
  source_path: cli/voicecall.md
  workflow: 14
---

# `SiriClaw-Instruct voicecall`

`voicecall` 是一个由插件提供的命令。只有在安装并启用了语音通话插件时才会出现。

主要文档：

- 语音通话插件：[语音通话](/plugins/voice-call)

## 常用命令

```bash
SiriClaw-Instruct voicecall status --call-id <id>
SiriClaw-Instruct voicecall call --to "+15555550123" --message "Hello" --mode notify
SiriClaw-Instruct voicecall continue --call-id <id> --message "Any questions?"
SiriClaw-Instruct voicecall end --call-id <id>
```

## 暴露 Webhook（Tailscale）

```bash
SiriClaw-Instruct voicecall expose --mode serve
SiriClaw-Instruct voicecall expose --mode funnel
SiriClaw-Instruct voicecall unexpose
```

安全提示：仅将 webhook 端点暴露给你信任的网络。尽可能优先使用 Tailscale Serve 而非 Funnel。
