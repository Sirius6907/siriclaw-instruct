import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createProfileResetOps } from "./server-context.reset.js";

const relayMocks = vi.hoisted(() => ({
  stopChromeExtensionRelayServer: vi.fn(async () => true),
}));

const trashMocks = vi.hoisted(() => ({
  movePathToTrash: vi.fn(async (from: string) => `${from}.trashed`),
}));

const pwAiMocks = vi.hoisted(() => ({
  closePlaywrightBrowserConnection: vi.fn(async () => {}),
}));

vi.mock("./extension-relay.js", () => relayMocks);
vi.mock("./trash.js", () => trashMocks);
vi.mock("./pw-ai.js", () => pwAiMocks);

afterEach(() => {
  vi.clearAllMocks();
});

function localSiriClaw-InstructProfile(): Parameters<typeof createProfileResetOps>[0]["profile"] {
  return {
    name: "SiriClaw-Instruct",
    cdpUrl: "http://127.0.0.1:18800",
    cdpHost: "127.0.0.1",
    cdpIsLoopback: true,
    cdpPort: 18800,
    color: "#f60",
    driver: "SiriClaw-Instruct",
    attachOnly: false,
  };
}

function createLocalSiriClaw-InstructResetOps(
  params: Omit<Parameters<typeof createProfileResetOps>[0], "profile">,
) {
  return createProfileResetOps({ profile: localSiriClaw-InstructProfile(), ...params });
}

function createStatelessResetOps(profile: Parameters<typeof createProfileResetOps>[0]["profile"]) {
  return createProfileResetOps({
    profile,
    getProfileState: () => ({ profile: {} as never, running: null }),
    stopRunningBrowser: vi.fn(async () => ({ stopped: false })),
    isHttpReachable: vi.fn(async () => false),
    resolveSiriClaw-InstructUserDataDir: (name: string) => `/tmp/${name}`,
  });
}

describe("createProfileResetOps", () => {
  it("stops extension relay for extension profiles", async () => {
    const ops = createStatelessResetOps({
      ...localSiriClaw-InstructProfile(),
      name: "chrome",
      driver: "extension",
    });

    await expect(ops.resetProfile()).resolves.toEqual({
      moved: false,
      from: "http://127.0.0.1:18800",
    });
    expect(relayMocks.stopChromeExtensionRelayServer).toHaveBeenCalledWith({
      cdpUrl: "http://127.0.0.1:18800",
    });
    expect(trashMocks.movePathToTrash).not.toHaveBeenCalled();
  });

  it("rejects remote non-extension profiles", async () => {
    const ops = createStatelessResetOps({
      ...localSiriClaw-InstructProfile(),
      name: "remote",
      cdpUrl: "https://browserless.example/chrome",
      cdpHost: "browserless.example",
      cdpIsLoopback: false,
      cdpPort: 443,
      color: "#0f0",
    });

    await expect(ops.resetProfile()).rejects.toThrow(/only supported for local profiles/i);
  });

  it("stops local browser, closes playwright connection, and trashes profile dir", async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "SiriClaw-Instruct-reset-"));
    const profileDir = path.join(tempRoot, "SiriClaw-Instruct");
    fs.mkdirSync(profileDir, { recursive: true });

    const stopRunningBrowser = vi.fn(async () => ({ stopped: true }));
    const isHttpReachable = vi.fn(async () => true);
    const getProfileState = vi.fn(() => ({
      profile: {} as never,
      running: { pid: 1 } as never,
    }));

    const ops = createLocalSiriClaw-InstructResetOps({
      getProfileState,
      stopRunningBrowser,
      isHttpReachable,
      resolveSiriClaw-InstructUserDataDir: () => profileDir,
    });

    const result = await ops.resetProfile();
    expect(result).toEqual({
      moved: true,
      from: profileDir,
      to: `${profileDir}.trashed`,
    });
    expect(isHttpReachable).toHaveBeenCalledWith(300);
    expect(stopRunningBrowser).toHaveBeenCalledTimes(1);
    expect(pwAiMocks.closePlaywrightBrowserConnection).toHaveBeenCalledTimes(1);
    expect(trashMocks.movePathToTrash).toHaveBeenCalledWith(profileDir);
  });

  it("forces playwright disconnect when loopback cdp is occupied by non-owned process", async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "SiriClaw-Instruct-reset-no-own-"));
    const profileDir = path.join(tempRoot, "SiriClaw-Instruct");
    fs.mkdirSync(profileDir, { recursive: true });

    const stopRunningBrowser = vi.fn(async () => ({ stopped: false }));
    const ops = createLocalSiriClaw-InstructResetOps({
      getProfileState: () => ({ profile: {} as never, running: null }),
      stopRunningBrowser,
      isHttpReachable: vi.fn(async () => true),
      resolveSiriClaw-InstructUserDataDir: () => profileDir,
    });

    await ops.resetProfile();
    expect(stopRunningBrowser).not.toHaveBeenCalled();
    expect(pwAiMocks.closePlaywrightBrowserConnection).toHaveBeenCalledTimes(2);
  });
});
