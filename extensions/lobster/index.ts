import type {
  AnyAgentTool,
  SiriClaw-InstructPluginApi,
  SiriClaw-InstructPluginToolFactory,
} from "SiriClaw-Instruct/plugin-sdk/lobster";
import { createLobsterTool } from "./src/lobster-tool.js";

export default function register(api: SiriClaw-InstructPluginApi) {
  api.registerTool(
    ((ctx) => {
      if (ctx.sandboxed) {
        return null;
      }
      return createLobsterTool(api) as AnyAgentTool;
    }) as SiriClaw-InstructPluginToolFactory,
    { optional: true },
  );
}
