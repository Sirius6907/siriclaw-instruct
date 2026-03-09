import { describe, expect, it } from "vitest";
import type { SiriClawInstructConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import { monitorLineProvider } from "./monitor.js";

describe("monitorLineProvider fail-closed webhook auth", () => {
  it("rejects startup when channel secret is missing", async () => {
    await expect(
      monitorLineProvider({
        channelAccessToken: "token",
        channelSecret: "   ",
        config: {} as SiriClawInstructConfig,
        runtime: {} as RuntimeEnv,
      }),
    ).rejects.toThrow("LINE webhook mode requires a non-empty channel secret.");
  });

  it("rejects startup when channel access token is missing", async () => {
    await expect(
      monitorLineProvider({
        channelAccessToken: "   ",
        channelSecret: "secret",
        config: {} as SiriClawInstructConfig,
        runtime: {} as RuntimeEnv,
      }),
    ).rejects.toThrow("LINE webhook mode requires a non-empty channel access token.");
  });
});

