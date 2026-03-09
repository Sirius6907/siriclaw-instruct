import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  resolveDefaultConfigCandidates,
  resolveConfigPathCandidate,
  resolveConfigPath,
  resolveOAuthDir,
  resolveOAuthPath,
  resolveStateDir,
} from "./paths.js";

describe("oauth paths", () => {
  it("prefers SiriClaw-Instruct_OAUTH_DIR over SiriClaw-Instruct_STATE_DIR", () => {
    const env = {
      SiriClaw-Instruct_OAUTH_DIR: "/custom/oauth",
      SiriClaw-Instruct_STATE_DIR: "/custom/state",
    } as NodeJS.ProcessEnv;

    expect(resolveOAuthDir(env, "/custom/state")).toBe(path.resolve("/custom/oauth"));
    expect(resolveOAuthPath(env, "/custom/state")).toBe(
      path.join(path.resolve("/custom/oauth"), "oauth.json"),
    );
  });

  it("derives oauth path from SiriClaw-Instruct_STATE_DIR when unset", () => {
    const env = {
      SiriClaw-Instruct_STATE_DIR: "/custom/state",
    } as NodeJS.ProcessEnv;

    expect(resolveOAuthDir(env, "/custom/state")).toBe(path.join("/custom/state", "credentials"));
    expect(resolveOAuthPath(env, "/custom/state")).toBe(
      path.join("/custom/state", "credentials", "oauth.json"),
    );
  });
});

describe("state + config path candidates", () => {
  async function withTempRoot(prefix: string, run: (root: string) => Promise<void>): Promise<void> {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
    try {
      await run(root);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  }

  function expectSiriClaw-InstructHomeDefaults(env: NodeJS.ProcessEnv): void {
    const configuredHome = env.SiriClaw-Instruct_HOME;
    if (!configuredHome) {
      throw new Error("SiriClaw-Instruct_HOME must be set for this assertion helper");
    }
    const resolvedHome = path.resolve(configuredHome);
    expect(resolveStateDir(env)).toBe(path.join(resolvedHome, ".SiriClaw-Instruct"));

    const candidates = resolveDefaultConfigCandidates(env);
    expect(candidates[0]).toBe(path.join(resolvedHome, ".SiriClaw-Instruct", "SiriClaw-Instruct.json"));
  }

  it("uses SiriClaw-Instruct_STATE_DIR when set", () => {
    const env = {
      SiriClaw-Instruct_STATE_DIR: "/new/state",
    } as NodeJS.ProcessEnv;

    expect(resolveStateDir(env, () => "/home/test")).toBe(path.resolve("/new/state"));
  });

  it("uses SiriClaw-Instruct_HOME for default state/config locations", () => {
    const env = {
      SiriClaw-Instruct_HOME: "/srv/SiriClaw-Instruct-home",
    } as NodeJS.ProcessEnv;
    expectSiriClaw-InstructHomeDefaults(env);
  });

  it("prefers SiriClaw-Instruct_HOME over HOME for default state/config locations", () => {
    const env = {
      SiriClaw-Instruct_HOME: "/srv/SiriClaw-Instruct-home",
      HOME: "/home/other",
    } as NodeJS.ProcessEnv;
    expectSiriClaw-InstructHomeDefaults(env);
  });

  it("orders default config candidates in a stable order", () => {
    const home = "/home/test";
    const resolvedHome = path.resolve(home);
    const candidates = resolveDefaultConfigCandidates({} as NodeJS.ProcessEnv, () => home);
    const expected = [
      path.join(resolvedHome, ".SiriClaw-Instruct", "SiriClaw-Instruct.json"),
      path.join(resolvedHome, ".SiriClaw-Instruct", "clawdbot.json"),
      path.join(resolvedHome, ".SiriClaw-Instruct", "moldbot.json"),
      path.join(resolvedHome, ".SiriClaw-Instruct", "moltbot.json"),
      path.join(resolvedHome, ".clawdbot", "SiriClaw-Instruct.json"),
      path.join(resolvedHome, ".clawdbot", "clawdbot.json"),
      path.join(resolvedHome, ".clawdbot", "moldbot.json"),
      path.join(resolvedHome, ".clawdbot", "moltbot.json"),
      path.join(resolvedHome, ".moldbot", "SiriClaw-Instruct.json"),
      path.join(resolvedHome, ".moldbot", "clawdbot.json"),
      path.join(resolvedHome, ".moldbot", "moldbot.json"),
      path.join(resolvedHome, ".moldbot", "moltbot.json"),
      path.join(resolvedHome, ".moltbot", "SiriClaw-Instruct.json"),
      path.join(resolvedHome, ".moltbot", "clawdbot.json"),
      path.join(resolvedHome, ".moltbot", "moldbot.json"),
      path.join(resolvedHome, ".moltbot", "moltbot.json"),
    ];
    expect(candidates).toEqual(expected);
  });

  it("prefers ~/.SiriClaw-Instruct when it exists and legacy dir is missing", async () => {
    await withTempRoot("SiriClaw-Instruct-state-", async (root) => {
      const newDir = path.join(root, ".SiriClaw-Instruct");
      await fs.mkdir(newDir, { recursive: true });
      const resolved = resolveStateDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(newDir);
    });
  });

  it("falls back to existing legacy state dir when ~/.SiriClaw-Instruct is missing", async () => {
    await withTempRoot("SiriClaw-Instruct-state-legacy-", async (root) => {
      const legacyDir = path.join(root, ".clawdbot");
      await fs.mkdir(legacyDir, { recursive: true });
      const resolved = resolveStateDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(legacyDir);
    });
  });

  it("CONFIG_PATH prefers existing config when present", async () => {
    await withTempRoot("SiriClaw-Instruct-config-", async (root) => {
      const legacyDir = path.join(root, ".SiriClaw-Instruct");
      await fs.mkdir(legacyDir, { recursive: true });
      const legacyPath = path.join(legacyDir, "SiriClaw-Instruct.json");
      await fs.writeFile(legacyPath, "{}", "utf-8");

      const resolved = resolveConfigPathCandidate({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(legacyPath);
    });
  });

  it("respects state dir overrides when config is missing", async () => {
    await withTempRoot("SiriClaw-Instruct-config-override-", async (root) => {
      const legacyDir = path.join(root, ".SiriClaw-Instruct");
      await fs.mkdir(legacyDir, { recursive: true });
      const legacyConfig = path.join(legacyDir, "SiriClaw-Instruct.json");
      await fs.writeFile(legacyConfig, "{}", "utf-8");

      const overrideDir = path.join(root, "override");
      const env = { SiriClaw-Instruct_STATE_DIR: overrideDir } as NodeJS.ProcessEnv;
      const resolved = resolveConfigPath(env, overrideDir, () => root);
      expect(resolved).toBe(path.join(overrideDir, "SiriClaw-Instruct.json"));
    });
  });
});
