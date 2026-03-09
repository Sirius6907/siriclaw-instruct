import type { SiriClaw-InstructConfig } from "../../config/config.js";

export function createPerSenderSessionConfig(
  overrides: Partial<NonNullable<SiriClaw-InstructConfig["session"]>> = {},
): NonNullable<SiriClaw-InstructConfig["session"]> {
  return {
    mainKey: "main",
    scope: "per-sender",
    ...overrides,
  };
}
