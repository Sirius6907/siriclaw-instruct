import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveDefaultAgentWorkspaceDir } from "./workspace.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("DEFAULT_AGENT_WORKSPACE_DIR", () => {
  it("uses SiriClaw-Instruct_HOME when resolving the default workspace dir", () => {
    const home = path.join(path.sep, "srv", "SiriClaw-Instruct-home");
    vi.stubEnv("SiriClaw-Instruct_HOME", home);
    vi.stubEnv("HOME", path.join(path.sep, "home", "other"));

    expect(resolveDefaultAgentWorkspaceDir()).toBe(
      path.join(path.resolve(home), ".SiriClaw-Instruct", "workspace"),
    );
  });
});
