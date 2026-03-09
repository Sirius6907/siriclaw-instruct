// Narrow plugin-sdk surface for the bundled llm-task plugin.
// Keep this list additive and scoped to symbols used under extensions/llm-task.

export { resolvePreferredSiriClawInstructTmpDir } from "../infra/tmp-siriclaw-instruct-dir.js";
export type { AnyAgentTool, SiriClawInstructPluginApi } from "../plugins/types.js";

