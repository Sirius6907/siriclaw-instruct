// Narrow plugin-sdk surface for the bundled diffs plugin.
// Keep this list additive and scoped to symbols used under extensions/diffs.

export type { SiriClawInstructConfig } from "../config/config.js";
export { resolvePreferredSiriClawInstructTmpDir } from "../infra/tmp-siriclaw-instruct-dir.js";
export type {
  AnyAgentTool,
  SiriClawInstructPluginApi,
  SiriClawInstructPluginConfigSchema,
  PluginLogger,
} from "../plugins/types.js";

