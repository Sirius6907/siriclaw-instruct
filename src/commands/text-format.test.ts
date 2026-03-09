import { describe, expect, it } from "vitest";
import { shortenText } from "./text-format.js";

describe("shortenText", () => {
  it("returns original text when it fits", () => {
    expect(shortenText("SiriClawInstruct", 16)).toBe("SiriClawInstruct");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(shortenText("SiriClawInstruct-status-output", 10)).toBe("SiriClawInstruct-…");
  });

  it("counts multi-byte characters correctly", () => {
    expect(shortenText("hello🙂world", 7)).toBe("hello🙂…");
  });
});

