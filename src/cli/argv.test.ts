import { describe, expect, it } from "vitest";
import {
  buildParseArgv,
  getFlagValue,
  getCommandPath,
  getCommandPositionalsWithRootOptions,
  getCommandPathWithRootOptions,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasHelpOrVersion,
  hasFlag,
  isRootHelpInvocation,
  isRootVersionInvocation,
  shouldMigrateState,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it.each([
    {
      name: "help flag",
      argv: ["node", "SiriClaw-Instruct", "--help"],
      expected: true,
    },
    {
      name: "version flag",
      argv: ["node", "SiriClaw-Instruct", "-V"],
      expected: true,
    },
    {
      name: "normal command",
      argv: ["node", "SiriClaw-Instruct", "status"],
      expected: false,
    },
    {
      name: "root -v alias",
      argv: ["node", "SiriClaw-Instruct", "-v"],
      expected: true,
    },
    {
      name: "root -v alias with profile",
      argv: ["node", "SiriClaw-Instruct", "--profile", "work", "-v"],
      expected: true,
    },
    {
      name: "root -v alias with log-level",
      argv: ["node", "SiriClaw-Instruct", "--log-level", "debug", "-v"],
      expected: true,
    },
    {
      name: "subcommand -v should not be treated as version",
      argv: ["node", "SiriClaw-Instruct", "acp", "-v"],
      expected: false,
    },
    {
      name: "root -v alias with equals profile",
      argv: ["node", "SiriClaw-Instruct", "--profile=work", "-v"],
      expected: true,
    },
    {
      name: "subcommand path after global root flags should not be treated as version",
      argv: ["node", "SiriClaw-Instruct", "--dev", "skills", "list", "-v"],
      expected: false,
    },
  ])("detects help/version flags: $name", ({ argv, expected }) => {
    expect(hasHelpOrVersion(argv)).toBe(expected);
  });

  it.each([
    {
      name: "root --version",
      argv: ["node", "SiriClaw-Instruct", "--version"],
      expected: true,
    },
    {
      name: "root -V",
      argv: ["node", "SiriClaw-Instruct", "-V"],
      expected: true,
    },
    {
      name: "root -v alias with profile",
      argv: ["node", "SiriClaw-Instruct", "--profile", "work", "-v"],
      expected: true,
    },
    {
      name: "subcommand version flag",
      argv: ["node", "SiriClaw-Instruct", "status", "--version"],
      expected: false,
    },
    {
      name: "unknown root flag with version",
      argv: ["node", "SiriClaw-Instruct", "--unknown", "--version"],
      expected: false,
    },
  ])("detects root-only version invocations: $name", ({ argv, expected }) => {
    expect(isRootVersionInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "root --help",
      argv: ["node", "SiriClaw-Instruct", "--help"],
      expected: true,
    },
    {
      name: "root -h",
      argv: ["node", "SiriClaw-Instruct", "-h"],
      expected: true,
    },
    {
      name: "root --help with profile",
      argv: ["node", "SiriClaw-Instruct", "--profile", "work", "--help"],
      expected: true,
    },
    {
      name: "subcommand --help",
      argv: ["node", "SiriClaw-Instruct", "status", "--help"],
      expected: false,
    },
    {
      name: "help before subcommand token",
      argv: ["node", "SiriClaw-Instruct", "--help", "status"],
      expected: false,
    },
    {
      name: "help after -- terminator",
      argv: ["node", "SiriClaw-Instruct", "nodes", "run", "--", "git", "--help"],
      expected: false,
    },
    {
      name: "unknown root flag before help",
      argv: ["node", "SiriClaw-Instruct", "--unknown", "--help"],
      expected: false,
    },
    {
      name: "unknown root flag after help",
      argv: ["node", "SiriClaw-Instruct", "--help", "--unknown"],
      expected: false,
    },
  ])("detects root-only help invocations: $name", ({ argv, expected }) => {
    expect(isRootHelpInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "single command with trailing flag",
      argv: ["node", "SiriClaw-Instruct", "status", "--json"],
      expected: ["status"],
    },
    {
      name: "two-part command",
      argv: ["node", "SiriClaw-Instruct", "agents", "list"],
      expected: ["agents", "list"],
    },
    {
      name: "terminator cuts parsing",
      argv: ["node", "SiriClaw-Instruct", "status", "--", "ignored"],
      expected: ["status"],
    },
  ])("extracts command path: $name", ({ argv, expected }) => {
    expect(getCommandPath(argv, 2)).toEqual(expected);
  });

  it("extracts command path while skipping known root option values", () => {
    expect(
      getCommandPathWithRootOptions(
        ["node", "SiriClaw-Instruct", "--profile", "work", "--no-color", "config", "validate"],
        2,
      ),
    ).toEqual(["config", "validate"]);
  });

  it("extracts routed config get positionals with interleaved root options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "SiriClaw-Instruct", "config", "get", "--log-level", "debug", "update.channel", "--json"],
        {
          commandPath: ["config", "get"],
          booleanFlags: ["--json"],
        },
      ),
    ).toEqual(["update.channel"]);
  });

  it("extracts routed config unset positionals with interleaved root options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "SiriClaw-Instruct", "config", "unset", "--profile", "work", "update.channel"],
        {
          commandPath: ["config", "unset"],
        },
      ),
    ).toEqual(["update.channel"]);
  });

  it("returns null when routed command sees unknown options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "SiriClaw-Instruct", "config", "get", "--mystery", "value", "update.channel"],
        {
          commandPath: ["config", "get"],
          booleanFlags: ["--json"],
        },
      ),
    ).toBeNull();
  });

  it.each([
    {
      name: "returns first command token",
      argv: ["node", "SiriClaw-Instruct", "agents", "list"],
      expected: "agents",
    },
    {
      name: "returns null when no command exists",
      argv: ["node", "SiriClaw-Instruct"],
      expected: null,
    },
    {
      name: "skips known root option values",
      argv: ["node", "SiriClaw-Instruct", "--log-level", "debug", "status"],
      expected: "status",
    },
  ])("returns primary command: $name", ({ argv, expected }) => {
    expect(getPrimaryCommand(argv)).toBe(expected);
  });

  it.each([
    {
      name: "detects flag before terminator",
      argv: ["node", "SiriClaw-Instruct", "status", "--json"],
      flag: "--json",
      expected: true,
    },
    {
      name: "ignores flag after terminator",
      argv: ["node", "SiriClaw-Instruct", "--", "--json"],
      flag: "--json",
      expected: false,
    },
  ])("parses boolean flags: $name", ({ argv, flag, expected }) => {
    expect(hasFlag(argv, flag)).toBe(expected);
  });

  it.each([
    {
      name: "value in next token",
      argv: ["node", "SiriClaw-Instruct", "status", "--timeout", "5000"],
      expected: "5000",
    },
    {
      name: "value in equals form",
      argv: ["node", "SiriClaw-Instruct", "status", "--timeout=2500"],
      expected: "2500",
    },
    {
      name: "missing value",
      argv: ["node", "SiriClaw-Instruct", "status", "--timeout"],
      expected: null,
    },
    {
      name: "next token is another flag",
      argv: ["node", "SiriClaw-Instruct", "status", "--timeout", "--json"],
      expected: null,
    },
    {
      name: "flag appears after terminator",
      argv: ["node", "SiriClaw-Instruct", "--", "--timeout=99"],
      expected: undefined,
    },
  ])("extracts flag values: $name", ({ argv, expected }) => {
    expect(getFlagValue(argv, "--timeout")).toBe(expected);
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "SiriClaw-Instruct", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "SiriClaw-Instruct", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "SiriClaw-Instruct", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it.each([
    {
      name: "missing flag",
      argv: ["node", "SiriClaw-Instruct", "status"],
      expected: undefined,
    },
    {
      name: "missing value",
      argv: ["node", "SiriClaw-Instruct", "status", "--timeout"],
      expected: null,
    },
    {
      name: "valid positive integer",
      argv: ["node", "SiriClaw-Instruct", "status", "--timeout", "5000"],
      expected: 5000,
    },
    {
      name: "invalid integer",
      argv: ["node", "SiriClaw-Instruct", "status", "--timeout", "nope"],
      expected: undefined,
    },
  ])("parses positive integer flag values: $name", ({ argv, expected }) => {
    expect(getPositiveIntFlagValue(argv, "--timeout")).toBe(expected);
  });

  it("builds parse argv from raw args", () => {
    const cases = [
      {
        rawArgs: ["node", "SiriClaw-Instruct", "status"],
        expected: ["node", "SiriClaw-Instruct", "status"],
      },
      {
        rawArgs: ["node-22", "SiriClaw-Instruct", "status"],
        expected: ["node-22", "SiriClaw-Instruct", "status"],
      },
      {
        rawArgs: ["node-22.2.0.exe", "SiriClaw-Instruct", "status"],
        expected: ["node-22.2.0.exe", "SiriClaw-Instruct", "status"],
      },
      {
        rawArgs: ["node-22.2", "SiriClaw-Instruct", "status"],
        expected: ["node-22.2", "SiriClaw-Instruct", "status"],
      },
      {
        rawArgs: ["node-22.2.exe", "SiriClaw-Instruct", "status"],
        expected: ["node-22.2.exe", "SiriClaw-Instruct", "status"],
      },
      {
        rawArgs: ["/usr/bin/node-22.2.0", "SiriClaw-Instruct", "status"],
        expected: ["/usr/bin/node-22.2.0", "SiriClaw-Instruct", "status"],
      },
      {
        rawArgs: ["node24", "SiriClaw-Instruct", "status"],
        expected: ["node24", "SiriClaw-Instruct", "status"],
      },
      {
        rawArgs: ["/usr/bin/node24", "SiriClaw-Instruct", "status"],
        expected: ["/usr/bin/node24", "SiriClaw-Instruct", "status"],
      },
      {
        rawArgs: ["node24.exe", "SiriClaw-Instruct", "status"],
        expected: ["node24.exe", "SiriClaw-Instruct", "status"],
      },
      {
        rawArgs: ["nodejs", "SiriClaw-Instruct", "status"],
        expected: ["nodejs", "SiriClaw-Instruct", "status"],
      },
      {
        rawArgs: ["node-dev", "SiriClaw-Instruct", "status"],
        expected: ["node", "SiriClaw-Instruct", "node-dev", "SiriClaw-Instruct", "status"],
      },
      {
        rawArgs: ["SiriClaw-Instruct", "status"],
        expected: ["node", "SiriClaw-Instruct", "status"],
      },
      {
        rawArgs: ["bun", "src/entry.ts", "status"],
        expected: ["bun", "src/entry.ts", "status"],
      },
    ] as const;

    for (const testCase of cases) {
      const parsed = buildParseArgv({
        programName: "SiriClaw-Instruct",
        rawArgs: [...testCase.rawArgs],
      });
      expect(parsed).toEqual([...testCase.expected]);
    }
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "SiriClaw-Instruct",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "SiriClaw-Instruct", "status"]);
  });

  it("decides when to migrate state", () => {
    const nonMutatingArgv = [
      ["node", "SiriClaw-Instruct", "status"],
      ["node", "SiriClaw-Instruct", "health"],
      ["node", "SiriClaw-Instruct", "sessions"],
      ["node", "SiriClaw-Instruct", "config", "get", "update"],
      ["node", "SiriClaw-Instruct", "config", "unset", "update"],
      ["node", "SiriClaw-Instruct", "models", "list"],
      ["node", "SiriClaw-Instruct", "models", "status"],
      ["node", "SiriClaw-Instruct", "memory", "status"],
      ["node", "SiriClaw-Instruct", "agent", "--message", "hi"],
    ] as const;
    const mutatingArgv = [
      ["node", "SiriClaw-Instruct", "agents", "list"],
      ["node", "SiriClaw-Instruct", "message", "send"],
    ] as const;

    for (const argv of nonMutatingArgv) {
      expect(shouldMigrateState([...argv])).toBe(false);
    }
    for (const argv of mutatingArgv) {
      expect(shouldMigrateState([...argv])).toBe(true);
    }
  });

  it.each([
    { path: ["status"], expected: false },
    { path: ["config", "get"], expected: false },
    { path: ["models", "status"], expected: false },
    { path: ["agents", "list"], expected: true },
  ])("reuses command path for migrate state decisions: $path", ({ path, expected }) => {
    expect(shouldMigrateStateFromPath(path)).toBe(expected);
  });
});
