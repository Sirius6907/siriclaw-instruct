import type { SiriClaw-InstructPluginApi } from "SiriClaw-Instruct/plugin-sdk/diagnostics-otel";
import { emptyPluginConfigSchema } from "SiriClaw-Instruct/plugin-sdk/diagnostics-otel";
import { createDiagnosticsOtelService } from "./src/service.js";

const plugin = {
  id: "diagnostics-otel",
  name: "Diagnostics OpenTelemetry",
  description: "Export diagnostics events to OpenTelemetry",
  configSchema: emptyPluginConfigSchema(),
  register(api: SiriClaw-InstructPluginApi) {
    api.registerService(createDiagnosticsOtelService());
  },
};

export default plugin;
