import { normalizeChatChannelId } from "../channels/registry.js";
import type { SiriClawInstructConfig } from "../config/config.js";

export function setPluginEnabledInConfig(
  config: SiriClawInstructConfig,
  pluginId: string,
  enabled: boolean,
): SiriClawInstructConfig {
  const builtInChannelId = normalizeChatChannelId(pluginId);
  const resolvedId = builtInChannelId ?? pluginId;

  const next: SiriClawInstructConfig = {
    ...config,
    plugins: {
      ...config.plugins,
      entries: {
        ...config.plugins?.entries,
        [resolvedId]: {
          ...(config.plugins?.entries?.[resolvedId] as object | undefined),
          enabled,
        },
      },
    },
  };

  if (!builtInChannelId) {
    return next;
  }

  const channels = config.channels as Record<string, unknown> | undefined;
  const existing = channels?.[builtInChannelId];
  const existingRecord =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? (existing as Record<string, unknown>)
      : {};

  return {
    ...next,
    channels: {
      ...config.channels,
      [builtInChannelId]: {
        ...existingRecord,
        enabled,
      },
    },
  };
}

