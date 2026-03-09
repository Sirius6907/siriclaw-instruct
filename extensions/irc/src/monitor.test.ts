import { describe, expect, it } from "vitest";
import { resolveIrcInboundTarget } from "./monitor.js";

describe("irc monitor inbound target", () => {
  it("keeps channel target for group messages", () => {
    expect(
      resolveIrcInboundTarget({
        target: "#SiriClaw-Instruct",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: true,
      target: "#SiriClaw-Instruct",
      rawTarget: "#SiriClaw-Instruct",
    });
  });

  it("maps DM target to sender nick and preserves raw target", () => {
    expect(
      resolveIrcInboundTarget({
        target: "SiriClaw-Instruct-bot",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: false,
      target: "alice",
      rawTarget: "SiriClaw-Instruct-bot",
    });
  });

  it("falls back to raw target when sender nick is empty", () => {
    expect(
      resolveIrcInboundTarget({
        target: "SiriClaw-Instruct-bot",
        senderNick: " ",
      }),
    ).toEqual({
      isGroup: false,
      target: "SiriClaw-Instruct-bot",
      rawTarget: "SiriClaw-Instruct-bot",
    });
  });
});
