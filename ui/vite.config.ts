import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const here = path.dirname(fileURLToPath(import.meta.url));

function normalizeBase(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "/";
  }
  if (trimmed === "./") {
    return "./";
  }
  if (trimmed.endsWith("/")) {
    return trimmed;
  }
  return `${trimmed}/`;
}

export default defineConfig(() => {
  const envBase = process.env.SIRICLAW_CONTROL_UI_BASE_PATH?.trim();
  const base = envBase ? normalizeBase(envBase) : "./";

  // Bake the remote gateway WSS URL into the bundle at build time.
  // Set SIRICLAW_GATEWAY_URL=wss://... in your Netlify/CI env to wire the
  // static UI to a cloud backend without any runtime config needed by users.
  const gatewayUrl = process.env.SIRICLAW_GATEWAY_URL?.trim() ?? "";

  return {
    base,
    publicDir: path.resolve(here, "public"),
    define: {
      __SIRICLAW_GATEWAY_URL__: JSON.stringify(gatewayUrl),
    },
    optimizeDeps: {
      include: ["lit/directives/repeat.js"],
    },
    build: {
      outDir: path.resolve(here, "../dist/control-ui"),
      emptyOutDir: true,
      sourcemap: true,
      // Keep CI/onboard logs clean; current control UI chunking is intentionally above 500 kB.
      chunkSizeWarningLimit: 1024,
    },
    server: {
      host: true,
      port: 5173,
      strictPort: true,
    },
  };
});
