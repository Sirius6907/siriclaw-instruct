import type { AnyAgentTool, SiriClaw-InstructPluginApi } from "SiriClaw-Instruct/plugin-sdk/llm-task";
import { createLlmTaskTool } from "./src/llm-task-tool.js";

export default function register(api: SiriClaw-InstructPluginApi) {
  api.registerTool(createLlmTaskTool(api) as unknown as AnyAgentTool, { optional: true });
}
