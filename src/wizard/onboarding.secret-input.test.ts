import { describe, expect, it } from "vitest";
import type { SiriClawInstructConfig } from "../config/config.js";
import { resolveOnboardingSecretInputString } from "./onboarding.secret-input.js";

function makeConfig(): SiriClawInstructConfig {
  return {
    secrets: {
      providers: {
        default: { source: "env" },
      },
    },
  } as SiriClawInstructConfig;
}

describe("resolveOnboardingSecretInputString", () => {
  it("resolves env-template SecretInput strings", async () => {
    const resolved = await resolveOnboardingSecretInputString({
      config: makeConfig(),
      value: "${SiriClawInstruct_GATEWAY_PASSWORD}",
      path: "gateway.auth.password",
      env: {
        SiriClawInstruct_GATEWAY_PASSWORD: "gateway-secret", // pragma: allowlist secret
      },
    });

    expect(resolved).toBe("gateway-secret");
  });

  it("returns plaintext strings when value is not a SecretRef", async () => {
    const resolved = await resolveOnboardingSecretInputString({
      config: makeConfig(),
      value: "plain-text",
      path: "gateway.auth.password",
    });

    expect(resolved).toBe("plain-text");
  });

  it("throws with path context when env-template SecretRef cannot resolve", async () => {
    await expect(
      resolveOnboardingSecretInputString({
        config: makeConfig(),
        value: "${SiriClawInstruct_GATEWAY_PASSWORD}",
        path: "gateway.auth.password",
        env: {},
      }),
    ).rejects.toThrow(
      'gateway.auth.password: failed to resolve SecretRef "env:default:SiriClawInstruct_GATEWAY_PASSWORD"',
    );
  });
});

