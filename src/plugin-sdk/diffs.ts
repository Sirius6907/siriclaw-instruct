// Narrow plugin-sdk surface for the bundled diffs plugin.
// Keep this list additive and scoped to symbols used under extensions/diffs.

export type { SiriClaw-InstructConfig } from "../config/config.js";
export { resolvePreferredSiriClaw-InstructTmpDir } from "../infra/tmp-SiriClaw-Instruct-dir.js";
export type {
  AnyAgentTool,
  SiriClaw-InstructPluginApi,
  SiriClaw-InstructPluginConfigSchema,
  PluginLogger,
} from "../plugins/types.js";
