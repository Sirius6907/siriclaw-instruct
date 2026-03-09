import { vi } from "vitest";
import { installChromeUserDataDirHooks } from "./chrome-user-data-dir.test-harness.js";

const chromeUserDataDir = { dir: "/tmp/SiriClawInstruct" };
installChromeUserDataDirHooks(chromeUserDataDir);

vi.mock("./chrome.js", () => ({
  isChromeCdpReady: vi.fn(async () => true),
  isChromeReachable: vi.fn(async () => true),
  launchSiriClawInstructChrome: vi.fn(async () => {
    throw new Error("unexpected launch");
  }),
  resolveSiriClawInstructUserDataDir: vi.fn(() => chromeUserDataDir.dir),
  stopSiriClawInstructChrome: vi.fn(async () => {}),
}));

