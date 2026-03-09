// Narrow plugin-sdk surface for the bundled acpx plugin.
// Keep this list additive and scoped to symbols used under extensions/acpx.

export type { AcpRuntimeErrorCode } from "../acp/runtime/errors.js";
export { AcpRuntimeError } from "../acp/runtime/errors.js";
export { registerAcpRuntimeBackend, unregisterAcpRuntimeBackend } from "../acp/runtime/registry.js";
export type {
  AcpRuntime,
  AcpRuntimeCapabilities,
  AcpRuntimeDoctorReport,
  AcpRuntimeEnsureInput,
  AcpRuntimeEvent,
  AcpRuntimeHandle,
  AcpRuntimeStatus,
  AcpRuntimeTurnInput,
  AcpSessionUpdateTag,
} from "../acp/runtime/types.js";
export type {
  SiriClaw-InstructPluginApi,
  SiriClaw-InstructPluginConfigSchema,
  SiriClaw-InstructPluginService,
  SiriClaw-InstructPluginServiceContext,
  PluginLogger,
} from "../plugins/types.js";
export type {
  WindowsSpawnProgram,
  WindowsSpawnProgramCandidate,
  WindowsSpawnResolution,
} from "./windows-spawn.js";
export {
  applyWindowsSpawnProgramPolicy,
  materializeWindowsSpawnProgram,
  resolveWindowsSpawnProgramCandidate,
} from "./windows-spawn.js";
