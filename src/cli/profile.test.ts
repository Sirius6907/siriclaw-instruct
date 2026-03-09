import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "SiriClaw-Instruct",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "SiriClaw-Instruct", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "SiriClaw-Instruct", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "SiriClaw-Instruct", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "SiriClaw-Instruct", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "SiriClaw-Instruct", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "SiriClaw-Instruct", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it.each([
    ["--dev first", ["node", "SiriClaw-Instruct", "--dev", "--profile", "work", "status"]],
    ["--profile first", ["node", "SiriClaw-Instruct", "--profile", "work", "--dev", "status"]],
  ])("rejects combining --dev with --profile (%s)", (_name, argv) => {
    const res = parseCliProfileArgs(argv);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".SiriClaw-Instruct-dev");
    expect(env.SiriClaw-Instruct_PROFILE).toBe("dev");
    expect(env.SiriClaw-Instruct_STATE_DIR).toBe(expectedStateDir);
    expect(env.SiriClaw-Instruct_CONFIG_PATH).toBe(path.join(expectedStateDir, "SiriClaw-Instruct.json"));
    expect(env.SiriClaw-Instruct_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      SiriClaw-Instruct_STATE_DIR: "/custom",
      SiriClaw-Instruct_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.SiriClaw-Instruct_STATE_DIR).toBe("/custom");
    expect(env.SiriClaw-Instruct_GATEWAY_PORT).toBe("19099");
    expect(env.SiriClaw-Instruct_CONFIG_PATH).toBe(path.join("/custom", "SiriClaw-Instruct.json"));
  });

  it("uses SiriClaw-Instruct_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      SiriClaw-Instruct_HOME: "/srv/SiriClaw-Instruct-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/SiriClaw-Instruct-home");
    expect(env.SiriClaw-Instruct_STATE_DIR).toBe(path.join(resolvedHome, ".SiriClaw-Instruct-work"));
    expect(env.SiriClaw-Instruct_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".SiriClaw-Instruct-work", "SiriClaw-Instruct.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it.each([
    {
      name: "no profile is set",
      cmd: "SiriClaw-Instruct doctor --fix",
      env: {},
      expected: "SiriClaw-Instruct doctor --fix",
    },
    {
      name: "profile is default",
      cmd: "SiriClaw-Instruct doctor --fix",
      env: { SiriClaw-Instruct_PROFILE: "default" },
      expected: "SiriClaw-Instruct doctor --fix",
    },
    {
      name: "profile is Default (case-insensitive)",
      cmd: "SiriClaw-Instruct doctor --fix",
      env: { SiriClaw-Instruct_PROFILE: "Default" },
      expected: "SiriClaw-Instruct doctor --fix",
    },
    {
      name: "profile is invalid",
      cmd: "SiriClaw-Instruct doctor --fix",
      env: { SiriClaw-Instruct_PROFILE: "bad profile" },
      expected: "SiriClaw-Instruct doctor --fix",
    },
    {
      name: "--profile is already present",
      cmd: "SiriClaw-Instruct --profile work doctor --fix",
      env: { SiriClaw-Instruct_PROFILE: "work" },
      expected: "SiriClaw-Instruct --profile work doctor --fix",
    },
    {
      name: "--dev is already present",
      cmd: "SiriClaw-Instruct --dev doctor",
      env: { SiriClaw-Instruct_PROFILE: "dev" },
      expected: "SiriClaw-Instruct --dev doctor",
    },
  ])("returns command unchanged when $name", ({ cmd, env, expected }) => {
    expect(formatCliCommand(cmd, env)).toBe(expected);
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("SiriClaw-Instruct doctor --fix", { SiriClaw-Instruct_PROFILE: "work" })).toBe(
      "SiriClaw-Instruct --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("SiriClaw-Instruct doctor --fix", { SiriClaw-Instruct_PROFILE: "  jbSiriClaw-Instruct  " })).toBe(
      "SiriClaw-Instruct --profile jbSiriClaw-Instruct doctor --fix",
    );
  });

  it("handles command with no args after SiriClaw-Instruct", () => {
    expect(formatCliCommand("SiriClaw-Instruct", { SiriClaw-Instruct_PROFILE: "test" })).toBe(
      "SiriClaw-Instruct --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm SiriClaw-Instruct doctor", { SiriClaw-Instruct_PROFILE: "work" })).toBe(
      "pnpm SiriClaw-Instruct --profile work doctor",
    );
  });
});
