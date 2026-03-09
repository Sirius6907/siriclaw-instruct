import type { SiriClaw-InstructConfig } from "../config/config.js";
import { getMemorySearchManager, type MemoryIndexManager } from "./index.js";

export async function createMemoryManagerOrThrow(
  cfg: SiriClaw-InstructConfig,
  agentId = "main",
): Promise<MemoryIndexManager> {
  const result = await getMemorySearchManager({ cfg, agentId });
  if (!result.manager) {
    throw new Error("manager missing");
  }
  return result.manager as unknown as MemoryIndexManager;
}
