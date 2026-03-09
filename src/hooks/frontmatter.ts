import { parseFrontmatterBlock } from "../markdown/frontmatter.js";
import {
  applySiriClaw-InstructManifestInstallCommonFields,
  getFrontmatterString,
  normalizeStringList,
  parseSiriClaw-InstructManifestInstallBase,
  parseFrontmatterBool,
  resolveSiriClaw-InstructManifestBlock,
  resolveSiriClaw-InstructManifestInstall,
  resolveSiriClaw-InstructManifestOs,
  resolveSiriClaw-InstructManifestRequires,
} from "../shared/frontmatter.js";
import type {
  SiriClaw-InstructHookMetadata,
  HookEntry,
  HookInstallSpec,
  HookInvocationPolicy,
  ParsedHookFrontmatter,
} from "./types.js";

export function parseFrontmatter(content: string): ParsedHookFrontmatter {
  return parseFrontmatterBlock(content);
}

function parseInstallSpec(input: unknown): HookInstallSpec | undefined {
  const parsed = parseSiriClaw-InstructManifestInstallBase(input, ["bundled", "npm", "git"]);
  if (!parsed) {
    return undefined;
  }
  const { raw } = parsed;
  const spec = applySiriClaw-InstructManifestInstallCommonFields<HookInstallSpec>(
    {
      kind: parsed.kind as HookInstallSpec["kind"],
    },
    parsed,
  );
  if (typeof raw.package === "string") {
    spec.package = raw.package;
  }
  if (typeof raw.repository === "string") {
    spec.repository = raw.repository;
  }

  return spec;
}

export function resolveSiriClaw-InstructMetadata(
  frontmatter: ParsedHookFrontmatter,
): SiriClaw-InstructHookMetadata | undefined {
  const metadataObj = resolveSiriClaw-InstructManifestBlock({ frontmatter });
  if (!metadataObj) {
    return undefined;
  }
  const requires = resolveSiriClaw-InstructManifestRequires(metadataObj);
  const install = resolveSiriClaw-InstructManifestInstall(metadataObj, parseInstallSpec);
  const osRaw = resolveSiriClaw-InstructManifestOs(metadataObj);
  const eventsRaw = normalizeStringList(metadataObj.events);
  return {
    always: typeof metadataObj.always === "boolean" ? metadataObj.always : undefined,
    emoji: typeof metadataObj.emoji === "string" ? metadataObj.emoji : undefined,
    homepage: typeof metadataObj.homepage === "string" ? metadataObj.homepage : undefined,
    hookKey: typeof metadataObj.hookKey === "string" ? metadataObj.hookKey : undefined,
    export: typeof metadataObj.export === "string" ? metadataObj.export : undefined,
    os: osRaw.length > 0 ? osRaw : undefined,
    events: eventsRaw.length > 0 ? eventsRaw : [],
    requires: requires,
    install: install.length > 0 ? install : undefined,
  };
}

export function resolveHookInvocationPolicy(
  frontmatter: ParsedHookFrontmatter,
): HookInvocationPolicy {
  return {
    enabled: parseFrontmatterBool(getFrontmatterString(frontmatter, "enabled"), true),
  };
}

export function resolveHookKey(hookName: string, entry?: HookEntry): string {
  return entry?.metadata?.hookKey ?? hookName;
}
