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
  it("prefers SiriClawInstruct_OAUTH_DIR over SiriClawInstruct_STATE_DIR", () => {
    const env = {
      SiriClawInstruct_OAUTH_DIR: "/custom/oauth",
      SiriClawInstruct_STATE_DIR: "/custom/state",
    } as NodeJS.ProcessEnv;

    expect(resolveOAuthDir(env, "/custom/state")).toBe(path.resolve("/custom/oauth"));
    expect(resolveOAuthPath(env, "/custom/state")).toBe(
      path.join(path.resolve("/custom/oauth"), "oauth.json"),
    );
  });

  it("derives oauth path from SiriClawInstruct_STATE_DIR when unset", () => {
    const env = {
      SiriClawInstruct_STATE_DIR: "/custom/state",
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

  function expectSiriClawInstructHomeDefaults(env: NodeJS.ProcessEnv): void {
    const configuredHome = env.SiriClawInstruct_HOME;
    if (!configuredHome) {
      throw new Error("SiriClawInstruct_HOME must be set for this assertion helper");
    }
    const resolvedHome = path.resolve(configuredHome);
    expect(resolveStateDir(env)).toBe(path.join(resolvedHome, ".SiriClawInstruct"));

    const candidates = resolveDefaultConfigCandidates(env);
    expect(candidates[0]).toBe(path.join(resolvedHome, ".SiriClawInstruct", "SiriClawInstruct.json"));
  }

  it("uses SiriClawInstruct_STATE_DIR when set", () => {
    const env = {
      SiriClawInstruct_STATE_DIR: "/new/state",
    } as NodeJS.ProcessEnv;

    expect(resolveStateDir(env, () => "/home/test")).toBe(path.resolve("/new/state"));
  });

  it("uses SiriClawInstruct_HOME for default state/config locations", () => {
    const env = {
      SiriClawInstruct_HOME: "/srv/SiriClawInstruct-home",
    } as NodeJS.ProcessEnv;
    expectSiriClawInstructHomeDefaults(env);
  });

  it("prefers SiriClawInstruct_HOME over HOME for default state/config locations", () => {
    const env = {
      SiriClawInstruct_HOME: "/srv/SiriClawInstruct-home",
      HOME: "/home/other",
    } as NodeJS.ProcessEnv;
    expectSiriClawInstructHomeDefaults(env);
  });

  it("orders default config candidates in a stable order", () => {
    const home = "/home/test";
    const resolvedHome = path.resolve(home);
    const candidates = resolveDefaultConfigCandidates({} as NodeJS.ProcessEnv, () => home);
    const expected = [
      path.join(resolvedHome, ".SiriClawInstruct", "SiriClawInstruct.json"),
      path.join(resolvedHome, ".SiriClawInstruct", "clawdbot.json"),
      path.join(resolvedHome, ".SiriClawInstruct", "moldbot.json"),
      path.join(resolvedHome, ".SiriClawInstruct", "moltbot.json"),
      path.join(resolvedHome, ".clawdbot", "SiriClawInstruct.json"),
      path.join(resolvedHome, ".clawdbot", "clawdbot.json"),
      path.join(resolvedHome, ".clawdbot", "moldbot.json"),
      path.join(resolvedHome, ".clawdbot", "moltbot.json"),
      path.join(resolvedHome, ".moldbot", "SiriClawInstruct.json"),
      path.join(resolvedHome, ".moldbot", "clawdbot.json"),
      path.join(resolvedHome, ".moldbot", "moldbot.json"),
      path.join(resolvedHome, ".moldbot", "moltbot.json"),
      path.join(resolvedHome, ".moltbot", "SiriClawInstruct.json"),
      path.join(resolvedHome, ".moltbot", "clawdbot.json"),
      path.join(resolvedHome, ".moltbot", "moldbot.json"),
      path.join(resolvedHome, ".moltbot", "moltbot.json"),
    ];
    expect(candidates).toEqual(expected);
  });

  it("prefers ~/.SiriClawInstruct when it exists and legacy dir is missing", async () => {
    await withTempRoot("SiriClawInstruct-state-", async (root) => {
      const newDir = path.join(root, ".SiriClawInstruct");
      await fs.mkdir(newDir, { recursive: true });
      const resolved = resolveStateDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(newDir);
    });
  });

  it("falls back to existing legacy state dir when ~/.SiriClawInstruct is missing", async () => {
    await withTempRoot("SiriClawInstruct-state-legacy-", async (root) => {
      const legacyDir = path.join(root, ".clawdbot");
      await fs.mkdir(legacyDir, { recursive: true });
      const resolved = resolveStateDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(legacyDir);
    });
  });

  it("CONFIG_PATH prefers existing config when present", async () => {
    await withTempRoot("SiriClawInstruct-config-", async (root) => {
      const legacyDir = path.join(root, ".SiriClawInstruct");
      await fs.mkdir(legacyDir, { recursive: true });
      const legacyPath = path.join(legacyDir, "SiriClawInstruct.json");
      await fs.writeFile(legacyPath, "{}", "utf-8");

      const resolved = resolveConfigPathCandidate({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(legacyPath);
    });
  });

  it("respects state dir overrides when config is missing", async () => {
    await withTempRoot("SiriClawInstruct-config-override-", async (root) => {
      const legacyDir = path.join(root, ".SiriClawInstruct");
      await fs.mkdir(legacyDir, { recursive: true });
      const legacyConfig = path.join(legacyDir, "SiriClawInstruct.json");
      await fs.writeFile(legacyConfig, "{}", "utf-8");

      const overrideDir = path.join(root, "override");
      const env = { SiriClawInstruct_STATE_DIR: overrideDir } as NodeJS.ProcessEnv;
      const resolved = resolveConfigPath(env, overrideDir, () => root);
      expect(resolved).toBe(path.join(overrideDir, "SiriClawInstruct.json"));
    });
  });
});

