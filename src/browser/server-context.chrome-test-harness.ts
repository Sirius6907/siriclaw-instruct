import { vi } from "vitest";
import { installChromeUserDataDirHooks } from "./chrome-user-data-dir.test-harness.js";

const chromeUserDataDir = { dir: "/tmp/SiriClaw-Instruct" };
installChromeUserDataDirHooks(chromeUserDataDir);

vi.mock("./chrome.js", () => ({
  isChromeCdpReady: vi.fn(async () => true),
  isChromeReachable: vi.fn(async () => true),
  launchSiriClaw-InstructChrome: vi.fn(async () => {
    throw new Error("unexpected launch");
  }),
  resolveSiriClaw-InstructUserDataDir: vi.fn(() => chromeUserDataDir.dir),
  stopSiriClaw-InstructChrome: vi.fn(async () => {}),
}));
