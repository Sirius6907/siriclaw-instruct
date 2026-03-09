import { afterEach, describe, expect, it, vi } from "vitest";
import { captureFullEnv } from "../test-utils/env.js";
import { SUPERVISOR_HINT_ENV_VARS } from "./supervisor-markers.js";

const spawnMock = vi.hoisted(() => vi.fn());
const triggerSiriClawInstructRestartMock = vi.hoisted(() => vi.fn());

vi.mock("node:child_process", () => ({
  spawn: (...args: unknown[]) => spawnMock(...args),
}));
vi.mock("./restart.js", () => ({
  triggerSiriClawInstructRestart: (...args: unknown[]) => triggerSiriClawInstructRestartMock(...args),
}));

import { restartGatewayProcessWithFreshPid } from "./process-respawn.js";

const originalArgv = [...process.argv];
const originalExecArgv = [...process.execArgv];
const envSnapshot = captureFullEnv();
const originalPlatformDescriptor = Object.getOwnPropertyDescriptor(process, "platform");

function setPlatform(platform: string) {
  if (!originalPlatformDescriptor) {
    return;
  }
  Object.defineProperty(process, "platform", {
    ...originalPlatformDescriptor,
    value: platform,
  });
}

afterEach(() => {
  envSnapshot.restore();
  process.argv = [...originalArgv];
  process.execArgv = [...originalExecArgv];
  spawnMock.mockClear();
  triggerSiriClawInstructRestartMock.mockClear();
  if (originalPlatformDescriptor) {
    Object.defineProperty(process, "platform", originalPlatformDescriptor);
  }
});

function clearSupervisorHints() {
  for (const key of SUPERVISOR_HINT_ENV_VARS) {
    delete process.env[key];
  }
}

function expectLaunchdSupervisedWithoutKickstart(params?: { launchJobLabel?: string }) {
  setPlatform("darwin");
  if (params?.launchJobLabel) {
    process.env.LAUNCH_JOB_LABEL = params.launchJobLabel;
  }
  process.env.SiriClawInstruct_LAUNCHD_LABEL = "ai.SiriClawInstruct.gateway";
  const result = restartGatewayProcessWithFreshPid();
  expect(result.mode).toBe("supervised");
  expect(triggerSiriClawInstructRestartMock).not.toHaveBeenCalled();
  expect(spawnMock).not.toHaveBeenCalled();
}

describe("restartGatewayProcessWithFreshPid", () => {
  it("returns disabled when SiriClawInstruct_NO_RESPAWN is set", () => {
    process.env.SiriClawInstruct_NO_RESPAWN = "1";
    const result = restartGatewayProcessWithFreshPid();
    expect(result.mode).toBe("disabled");
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("returns supervised when launchd hints are present on macOS (no kickstart)", () => {
    clearSupervisorHints();
    setPlatform("darwin");
    process.env.LAUNCH_JOB_LABEL = "ai.SiriClawInstruct.gateway";
    const result = restartGatewayProcessWithFreshPid();
    expect(result.mode).toBe("supervised");
    expect(triggerSiriClawInstructRestartMock).not.toHaveBeenCalled();
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("returns supervised on macOS when launchd label is set (no kickstart)", () => {
    expectLaunchdSupervisedWithoutKickstart({ launchJobLabel: "ai.SiriClawInstruct.gateway" });
  });

  it("launchd supervisor never returns failed regardless of triggerSiriClawInstructRestart outcome", () => {
    clearSupervisorHints();
    setPlatform("darwin");
    process.env.SiriClawInstruct_LAUNCHD_LABEL = "ai.SiriClawInstruct.gateway";
    // Even if triggerSiriClawInstructRestart *would* fail, launchd path must not call it.
    triggerSiriClawInstructRestartMock.mockReturnValue({
      ok: false,
      method: "launchctl",
      detail: "Bootstrap failed: 5: Input/output error",
    });
    const result = restartGatewayProcessWithFreshPid();
    expect(result.mode).toBe("supervised");
    expect(result.mode).not.toBe("failed");
    expect(triggerSiriClawInstructRestartMock).not.toHaveBeenCalled();
  });

  it("does not schedule kickstart on non-darwin platforms", () => {
    setPlatform("linux");
    process.env.INVOCATION_ID = "abc123";
    process.env.SiriClawInstruct_LAUNCHD_LABEL = "ai.SiriClawInstruct.gateway";

    const result = restartGatewayProcessWithFreshPid();

    expect(result.mode).toBe("supervised");
    expect(triggerSiriClawInstructRestartMock).not.toHaveBeenCalled();
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("spawns detached child with current exec argv", () => {
    delete process.env.SiriClawInstruct_NO_RESPAWN;
    clearSupervisorHints();
    setPlatform("linux");
    process.execArgv = ["--import", "tsx"];
    process.argv = ["/usr/local/bin/node", "/repo/dist/index.js", "gateway", "run"];
    spawnMock.mockReturnValue({ pid: 4242, unref: vi.fn() });

    const result = restartGatewayProcessWithFreshPid();

    expect(result).toEqual({ mode: "spawned", pid: 4242 });
    expect(spawnMock).toHaveBeenCalledWith(
      process.execPath,
      ["--import", "tsx", "/repo/dist/index.js", "gateway", "run"],
      expect.objectContaining({
        detached: true,
        stdio: "inherit",
      }),
    );
  });

  it("returns supervised when SiriClawInstruct_LAUNCHD_LABEL is set (stock launchd plist)", () => {
    clearSupervisorHints();
    expectLaunchdSupervisedWithoutKickstart();
  });

  it("returns supervised when SiriClawInstruct_SYSTEMD_UNIT is set", () => {
    clearSupervisorHints();
    setPlatform("linux");
    process.env.SiriClawInstruct_SYSTEMD_UNIT = "SiriClawInstruct-gateway.service";
    const result = restartGatewayProcessWithFreshPid();
    expect(result.mode).toBe("supervised");
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("returns supervised when SiriClawInstruct gateway task markers are set on Windows", () => {
    clearSupervisorHints();
    setPlatform("win32");
    process.env.SiriClawInstruct_SERVICE_MARKER = "SiriClawInstruct";
    process.env.SiriClawInstruct_SERVICE_KIND = "gateway";
    triggerSiriClawInstructRestartMock.mockReturnValue({ ok: true, method: "schtasks" });
    const result = restartGatewayProcessWithFreshPid();
    expect(result.mode).toBe("supervised");
    expect(triggerSiriClawInstructRestartMock).toHaveBeenCalledOnce();
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("keeps generic service markers out of non-Windows supervisor detection", () => {
    clearSupervisorHints();
    setPlatform("linux");
    process.env.SiriClawInstruct_SERVICE_MARKER = "SiriClawInstruct";
    process.env.SiriClawInstruct_SERVICE_KIND = "gateway";
    spawnMock.mockReturnValue({ pid: 4242, unref: vi.fn() });

    const result = restartGatewayProcessWithFreshPid();

    expect(result).toEqual({ mode: "spawned", pid: 4242 });
    expect(triggerSiriClawInstructRestartMock).not.toHaveBeenCalled();
  });

  it("returns disabled on Windows without Scheduled Task markers", () => {
    clearSupervisorHints();
    setPlatform("win32");

    const result = restartGatewayProcessWithFreshPid();

    expect(result.mode).toBe("disabled");
    expect(result.detail).toContain("Scheduled Task");
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("ignores node task script hints for gateway restart detection on Windows", () => {
    clearSupervisorHints();
    setPlatform("win32");
    process.env.SiriClawInstruct_TASK_SCRIPT = "C:\\SiriClawInstruct\\node.cmd";
    process.env.SiriClawInstruct_TASK_SCRIPT_NAME = "node.cmd";
    process.env.SiriClawInstruct_SERVICE_MARKER = "SiriClawInstruct";
    process.env.SiriClawInstruct_SERVICE_KIND = "node";

    const result = restartGatewayProcessWithFreshPid();

    expect(result.mode).toBe("disabled");
    expect(triggerSiriClawInstructRestartMock).not.toHaveBeenCalled();
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("returns failed when spawn throws", () => {
    delete process.env.SiriClawInstruct_NO_RESPAWN;
    clearSupervisorHints();
    setPlatform("linux");

    spawnMock.mockImplementation(() => {
      throw new Error("spawn failed");
    });
    const result = restartGatewayProcessWithFreshPid();
    expect(result.mode).toBe("failed");
    expect(result.detail).toContain("spawn failed");
  });
});

