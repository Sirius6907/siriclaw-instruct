import type { SiriClawInstructConfig } from "../../config/config.js";

export function createPerSenderSessionConfig(
  overrides: Partial<NonNullable<SiriClawInstructConfig["session"]>> = {},
): NonNullable<SiriClawInstructConfig["session"]> {
  return {
    mainKey: "main",
    scope: "per-sender",
    ...overrides,
  };
}

