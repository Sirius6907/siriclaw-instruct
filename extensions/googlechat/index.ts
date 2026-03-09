import type { SiriClaw-InstructPluginApi } from "SiriClaw-Instruct/plugin-sdk/googlechat";
import { emptyPluginConfigSchema } from "SiriClaw-Instruct/plugin-sdk/googlechat";
import { googlechatDock, googlechatPlugin } from "./src/channel.js";
import { setGoogleChatRuntime } from "./src/runtime.js";

const plugin = {
  id: "googlechat",
  name: "Google Chat",
  description: "SiriClaw-Instruct Google Chat channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: SiriClaw-InstructPluginApi) {
    setGoogleChatRuntime(api.runtime);
    api.registerChannel({ plugin: googlechatPlugin, dock: googlechatDock });
  },
};

export default plugin;
