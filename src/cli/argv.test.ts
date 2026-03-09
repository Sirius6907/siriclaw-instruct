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
      argv: ["node", "SiriClawInstruct", "--help"],
      expected: true,
    },
    {
      name: "version flag",
      argv: ["node", "SiriClawInstruct", "-V"],
      expected: true,
    },
    {
      name: "normal command",
      argv: ["node", "SiriClawInstruct", "status"],
      expected: false,
    },
    {
      name: "root -v alias",
      argv: ["node", "SiriClawInstruct", "-v"],
      expected: true,
    },
    {
      name: "root -v alias with profile",
      argv: ["node", "SiriClawInstruct", "--profile", "work", "-v"],
      expected: true,
    },
    {
      name: "root -v alias with log-level",
      argv: ["node", "SiriClawInstruct", "--log-level", "debug", "-v"],
      expected: true,
    },
    {
      name: "subcommand -v should not be treated as version",
      argv: ["node", "SiriClawInstruct", "acp", "-v"],
      expected: false,
    },
    {
      name: "root -v alias with equals profile",
      argv: ["node", "SiriClawInstruct", "--profile=work", "-v"],
      expected: true,
    },
    {
      name: "subcommand path after global root flags should not be treated as version",
      argv: ["node", "SiriClawInstruct", "--dev", "skills", "list", "-v"],
      expected: false,
    },
  ])("detects help/version flags: $name", ({ argv, expected }) => {
    expect(hasHelpOrVersion(argv)).toBe(expected);
  });

  it.each([
    {
      name: "root --version",
      argv: ["node", "SiriClawInstruct", "--version"],
      expected: true,
    },
    {
      name: "root -V",
      argv: ["node", "SiriClawInstruct", "-V"],
      expected: true,
    },
    {
      name: "root -v alias with profile",
      argv: ["node", "SiriClawInstruct", "--profile", "work", "-v"],
      expected: true,
    },
    {
      name: "subcommand version flag",
      argv: ["node", "SiriClawInstruct", "status", "--version"],
      expected: false,
    },
    {
      name: "unknown root flag with version",
      argv: ["node", "SiriClawInstruct", "--unknown", "--version"],
      expected: false,
    },
  ])("detects root-only version invocations: $name", ({ argv, expected }) => {
    expect(isRootVersionInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "root --help",
      argv: ["node", "SiriClawInstruct", "--help"],
      expected: true,
    },
    {
      name: "root -h",
      argv: ["node", "SiriClawInstruct", "-h"],
      expected: true,
    },
    {
      name: "root --help with profile",
      argv: ["node", "SiriClawInstruct", "--profile", "work", "--help"],
      expected: true,
    },
    {
      name: "subcommand --help",
      argv: ["node", "SiriClawInstruct", "status", "--help"],
      expected: false,
    },
    {
      name: "help before subcommand token",
      argv: ["node", "SiriClawInstruct", "--help", "status"],
      expected: false,
    },
    {
      name: "help after -- terminator",
      argv: ["node", "SiriClawInstruct", "nodes", "run", "--", "git", "--help"],
      expected: false,
    },
    {
      name: "unknown root flag before help",
      argv: ["node", "SiriClawInstruct", "--unknown", "--help"],
      expected: false,
    },
    {
      name: "unknown root flag after help",
      argv: ["node", "SiriClawInstruct", "--help", "--unknown"],
      expected: false,
    },
  ])("detects root-only help invocations: $name", ({ argv, expected }) => {
    expect(isRootHelpInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "single command with trailing flag",
      argv: ["node", "SiriClawInstruct", "status", "--json"],
      expected: ["status"],
    },
    {
      name: "two-part command",
      argv: ["node", "SiriClawInstruct", "agents", "list"],
      expected: ["agents", "list"],
    },
    {
      name: "terminator cuts parsing",
      argv: ["node", "SiriClawInstruct", "status", "--", "ignored"],
      expected: ["status"],
    },
  ])("extracts command path: $name", ({ argv, expected }) => {
    expect(getCommandPath(argv, 2)).toEqual(expected);
  });

  it("extracts command path while skipping known root option values", () => {
    expect(
      getCommandPathWithRootOptions(
        ["node", "SiriClawInstruct", "--profile", "work", "--no-color", "config", "validate"],
        2,
      ),
    ).toEqual(["config", "validate"]);
  });

  it("extracts routed config get positionals with interleaved root options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "SiriClawInstruct", "config", "get", "--log-level", "debug", "update.channel", "--json"],
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
        ["node", "SiriClawInstruct", "config", "unset", "--profile", "work", "update.channel"],
        {
          commandPath: ["config", "unset"],
        },
      ),
    ).toEqual(["update.channel"]);
  });

  it("returns null when routed command sees unknown options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "SiriClawInstruct", "config", "get", "--mystery", "value", "update.channel"],
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
      argv: ["node", "SiriClawInstruct", "agents", "list"],
      expected: "agents",
    },
    {
      name: "returns null when no command exists",
      argv: ["node", "SiriClawInstruct"],
      expected: null,
    },
    {
      name: "skips known root option values",
      argv: ["node", "SiriClawInstruct", "--log-level", "debug", "status"],
      expected: "status",
    },
  ])("returns primary command: $name", ({ argv, expected }) => {
    expect(getPrimaryCommand(argv)).toBe(expected);
  });

  it.each([
    {
      name: "detects flag before terminator",
      argv: ["node", "SiriClawInstruct", "status", "--json"],
      flag: "--json",
      expected: true,
    },
    {
      name: "ignores flag after terminator",
      argv: ["node", "SiriClawInstruct", "--", "--json"],
      flag: "--json",
      expected: false,
    },
  ])("parses boolean flags: $name", ({ argv, flag, expected }) => {
    expect(hasFlag(argv, flag)).toBe(expected);
  });

  it.each([
    {
      name: "value in next token",
      argv: ["node", "SiriClawInstruct", "status", "--timeout", "5000"],
      expected: "5000",
    },
    {
      name: "value in equals form",
      argv: ["node", "SiriClawInstruct", "status", "--timeout=2500"],
      expected: "2500",
    },
    {
      name: "missing value",
      argv: ["node", "SiriClawInstruct", "status", "--timeout"],
      expected: null,
    },
    {
      name: "next token is another flag",
      argv: ["node", "SiriClawInstruct", "status", "--timeout", "--json"],
      expected: null,
    },
    {
      name: "flag appears after terminator",
      argv: ["node", "SiriClawInstruct", "--", "--timeout=99"],
      expected: undefined,
    },
  ])("extracts flag values: $name", ({ argv, expected }) => {
    expect(getFlagValue(argv, "--timeout")).toBe(expected);
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "SiriClawInstruct", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "SiriClawInstruct", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "SiriClawInstruct", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it.each([
    {
      name: "missing flag",
      argv: ["node", "SiriClawInstruct", "status"],
      expected: undefined,
    },
    {
      name: "missing value",
      argv: ["node", "SiriClawInstruct", "status", "--timeout"],
      expected: null,
    },
    {
      name: "valid positive integer",
      argv: ["node", "SiriClawInstruct", "status", "--timeout", "5000"],
      expected: 5000,
    },
    {
      name: "invalid integer",
      argv: ["node", "SiriClawInstruct", "status", "--timeout", "nope"],
      expected: undefined,
    },
  ])("parses positive integer flag values: $name", ({ argv, expected }) => {
    expect(getPositiveIntFlagValue(argv, "--timeout")).toBe(expected);
  });

  it("builds parse argv from raw args", () => {
    const cases = [
      {
        rawArgs: ["node", "SiriClawInstruct", "status"],
        expected: ["node", "SiriClawInstruct", "status"],
      },
      {
        rawArgs: ["node-22", "SiriClawInstruct", "status"],
        expected: ["node-22", "SiriClawInstruct", "status"],
      },
      {
        rawArgs: ["node-22.2.0.exe", "SiriClawInstruct", "status"],
        expected: ["node-22.2.0.exe", "SiriClawInstruct", "status"],
      },
      {
        rawArgs: ["node-22.2", "SiriClawInstruct", "status"],
        expected: ["node-22.2", "SiriClawInstruct", "status"],
      },
      {
        rawArgs: ["node-22.2.exe", "SiriClawInstruct", "status"],
        expected: ["node-22.2.exe", "SiriClawInstruct", "status"],
      },
      {
        rawArgs: ["/usr/bin/node-22.2.0", "SiriClawInstruct", "status"],
        expected: ["/usr/bin/node-22.2.0", "SiriClawInstruct", "status"],
      },
      {
        rawArgs: ["node24", "SiriClawInstruct", "status"],
        expected: ["node24", "SiriClawInstruct", "status"],
      },
      {
        rawArgs: ["/usr/bin/node24", "SiriClawInstruct", "status"],
        expected: ["/usr/bin/node24", "SiriClawInstruct", "status"],
      },
      {
        rawArgs: ["node24.exe", "SiriClawInstruct", "status"],
        expected: ["node24.exe", "SiriClawInstruct", "status"],
      },
      {
        rawArgs: ["nodejs", "SiriClawInstruct", "status"],
        expected: ["nodejs", "SiriClawInstruct", "status"],
      },
      {
        rawArgs: ["node-dev", "SiriClawInstruct", "status"],
        expected: ["node", "SiriClawInstruct", "node-dev", "SiriClawInstruct", "status"],
      },
      {
        rawArgs: ["SiriClawInstruct", "status"],
        expected: ["node", "SiriClawInstruct", "status"],
      },
      {
        rawArgs: ["bun", "src/entry.ts", "status"],
        expected: ["bun", "src/entry.ts", "status"],
      },
    ] as const;

    for (const testCase of cases) {
      const parsed = buildParseArgv({
        programName: "SiriClawInstruct",
        rawArgs: [...testCase.rawArgs],
      });
      expect(parsed).toEqual([...testCase.expected]);
    }
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "SiriClawInstruct",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "SiriClawInstruct", "status"]);
  });

  it("decides when to migrate state", () => {
    const nonMutatingArgv = [
      ["node", "SiriClawInstruct", "status"],
      ["node", "SiriClawInstruct", "health"],
      ["node", "SiriClawInstruct", "sessions"],
      ["node", "SiriClawInstruct", "config", "get", "update"],
      ["node", "SiriClawInstruct", "config", "unset", "update"],
      ["node", "SiriClawInstruct", "models", "list"],
      ["node", "SiriClawInstruct", "models", "status"],
      ["node", "SiriClawInstruct", "memory", "status"],
      ["node", "SiriClawInstruct", "agent", "--message", "hi"],
    ] as const;
    const mutatingArgv = [
      ["node", "SiriClawInstruct", "agents", "list"],
      ["node", "SiriClawInstruct", "message", "send"],
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

