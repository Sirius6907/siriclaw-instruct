import path from "node:path";
import { resolveStateDir } from "../config/paths.js";
import { DEFAULT_AGENT_ID } from "../routing/session-key.js";
import { resolveUserPath } from "../utils.js";

export function resolveSiriClawInstructAgentDir(): string {
  const override =
    process.env.SiriClawInstruct_AGENT_DIR?.trim() || process.env.PI_CODING_AGENT_DIR?.trim();
  if (override) {
    return resolveUserPath(override);
  }
  const defaultAgentDir = path.join(resolveStateDir(), "agents", DEFAULT_AGENT_ID, "agent");
  return resolveUserPath(defaultAgentDir);
}

export function ensureSiriClawInstructAgentEnv(): string {
  const dir = resolveSiriClawInstructAgentDir();
  if (!process.env.SiriClawInstruct_AGENT_DIR) {
    process.env.SiriClawInstruct_AGENT_DIR = dir;
  }
  if (!process.env.PI_CODING_AGENT_DIR) {
    process.env.PI_CODING_AGENT_DIR = dir;
  }
  return dir;
}

