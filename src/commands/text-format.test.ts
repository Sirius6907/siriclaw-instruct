import { describe, expect, it } from "vitest";
import { shortenText } from "./text-format.js";

describe("shortenText", () => {
  it("returns original text when it fits", () => {
    expect(shortenText("SiriClaw-Instruct", 16)).toBe("SiriClaw-Instruct");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(shortenText("SiriClaw-Instruct-status-output", 10)).toBe("SiriClaw-Instruct-…");
  });

  it("counts multi-byte characters correctly", () => {
    expect(shortenText("hello🙂world", 7)).toBe("hello🙂…");
  });
});
