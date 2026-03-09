import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          SiriClaw-Instruct_STATE_DIR: "/tmp/SiriClaw-Instruct-state",
          SiriClaw-Instruct_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "SiriClaw-Instruct-gateway",
        windowsTaskName: "SiriClaw-Instruct Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /tmp/SiriClaw-Instruct-state/logs/gateway.log",
      "Launchd stderr (if installed): /tmp/SiriClaw-Instruct-state/logs/gateway.err.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        systemdServiceName: "SiriClaw-Instruct-gateway",
        windowsTaskName: "SiriClaw-Instruct Gateway",
      }),
    ).toEqual(["Logs: journalctl --user -u SiriClaw-Instruct-gateway.service -n 200 --no-pager"]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        systemdServiceName: "SiriClaw-Instruct-gateway",
        windowsTaskName: "SiriClaw-Instruct Gateway",
      }),
    ).toEqual(['Logs: schtasks /Query /TN "SiriClaw-Instruct Gateway" /V /FO LIST']);
  });
});

describe("buildPlatformServiceStartHints", () => {
  it("builds platform-specific service start hints", () => {
    expect(
      buildPlatformServiceStartHints({
        platform: "darwin",
        installCommand: "SiriClaw-Instruct gateway install",
        startCommand: "SiriClaw-Instruct gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.SiriClaw-Instruct.gateway.plist",
        systemdServiceName: "SiriClaw-Instruct-gateway",
        windowsTaskName: "SiriClaw-Instruct Gateway",
      }),
    ).toEqual([
      "SiriClaw-Instruct gateway install",
      "SiriClaw-Instruct gateway",
      "launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.SiriClaw-Instruct.gateway.plist",
    ]);
    expect(
      buildPlatformServiceStartHints({
        platform: "linux",
        installCommand: "SiriClaw-Instruct gateway install",
        startCommand: "SiriClaw-Instruct gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.SiriClaw-Instruct.gateway.plist",
        systemdServiceName: "SiriClaw-Instruct-gateway",
        windowsTaskName: "SiriClaw-Instruct Gateway",
      }),
    ).toEqual([
      "SiriClaw-Instruct gateway install",
      "SiriClaw-Instruct gateway",
      "systemctl --user start SiriClaw-Instruct-gateway.service",
    ]);
  });
});
