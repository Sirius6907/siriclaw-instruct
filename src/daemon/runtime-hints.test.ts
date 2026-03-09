import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          SiriClawInstruct_STATE_DIR: "/tmp/SiriClawInstruct-state",
          SiriClawInstruct_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "SiriClawInstruct-gateway",
        windowsTaskName: "SiriClawInstruct Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /tmp/SiriClawInstruct-state/logs/gateway.log",
      "Launchd stderr (if installed): /tmp/SiriClawInstruct-state/logs/gateway.err.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        systemdServiceName: "SiriClawInstruct-gateway",
        windowsTaskName: "SiriClawInstruct Gateway",
      }),
    ).toEqual(["Logs: journalctl --user -u SiriClawInstruct-gateway.service -n 200 --no-pager"]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        systemdServiceName: "SiriClawInstruct-gateway",
        windowsTaskName: "SiriClawInstruct Gateway",
      }),
    ).toEqual(['Logs: schtasks /Query /TN "SiriClawInstruct Gateway" /V /FO LIST']);
  });
});

describe("buildPlatformServiceStartHints", () => {
  it("builds platform-specific service start hints", () => {
    expect(
      buildPlatformServiceStartHints({
        platform: "darwin",
        installCommand: "SiriClawInstruct gateway install",
        startCommand: "SiriClawInstruct gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.SiriClawInstruct.gateway.plist",
        systemdServiceName: "SiriClawInstruct-gateway",
        windowsTaskName: "SiriClawInstruct Gateway",
      }),
    ).toEqual([
      "SiriClawInstruct gateway install",
      "SiriClawInstruct gateway",
      "launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.SiriClawInstruct.gateway.plist",
    ]);
    expect(
      buildPlatformServiceStartHints({
        platform: "linux",
        installCommand: "SiriClawInstruct gateway install",
        startCommand: "SiriClawInstruct gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.SiriClawInstruct.gateway.plist",
        systemdServiceName: "SiriClawInstruct-gateway",
        windowsTaskName: "SiriClawInstruct Gateway",
      }),
    ).toEqual([
      "SiriClawInstruct gateway install",
      "SiriClawInstruct gateway",
      "systemctl --user start SiriClawInstruct-gateway.service",
    ]);
  });
});

