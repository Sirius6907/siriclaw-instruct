import type { SiriClaw-InstructConfig } from "./config.js";

export function ensurePluginAllowlisted(cfg: SiriClaw-InstructConfig, pluginId: string): SiriClaw-InstructConfig {
  const allow = cfg.plugins?.allow;
  if (!Array.isArray(allow) || allow.includes(pluginId)) {
    return cfg;
  }
  return {
    ...cfg,
    plugins: {
      ...cfg.plugins,
      allow: [...allow, pluginId],
    },
  };
}
