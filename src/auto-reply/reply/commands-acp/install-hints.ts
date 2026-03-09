import { existsSync } from "node:fs";
import path from "node:path";
import type { SiriClawInstructConfig } from "../../../config/config.js";

export function resolveConfiguredAcpBackendId(cfg: SiriClawInstructConfig): string {
  return cfg.acp?.backend?.trim() || "acpx";
}

export function resolveAcpInstallCommandHint(cfg: SiriClawInstructConfig): string {
  const configured = cfg.acp?.runtime?.installCommand?.trim();
  if (configured) {
    return configured;
  }
  const backendId = resolveConfiguredAcpBackendId(cfg).toLowerCase();
  if (backendId === "acpx") {
    const localPath = path.resolve(process.cwd(), "extensions/acpx");
    if (existsSync(localPath)) {
      return `SiriClawInstruct plugins install ${localPath}`;
    }
    return "SiriClawInstruct plugins install acpx";
  }
  return `Install and enable the plugin that provides ACP backend "${backendId}".`;
}

