import type { SiriClaw-InstructPluginApi } from "SiriClaw-Instruct/plugin-sdk/imessage";
import { emptyPluginConfigSchema } from "SiriClaw-Instruct/plugin-sdk/imessage";
import { imessagePlugin } from "./src/channel.js";
import { setIMessageRuntime } from "./src/runtime.js";

const plugin = {
  id: "imessage",
  name: "iMessage",
  description: "iMessage channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: SiriClaw-InstructPluginApi) {
    setIMessageRuntime(api.runtime);
    api.registerChannel({ plugin: imessagePlugin });
  },
};

export default plugin;
