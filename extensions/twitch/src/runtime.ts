import type { PluginRuntime } from "SiriClaw-Instruct/plugin-sdk/twitch";

let runtime: PluginRuntime | null = null;

export function setTwitchRuntime(next: PluginRuntime) {
  runtime = next;
}

export function getTwitchRuntime(): PluginRuntime {
  if (!runtime) {
    throw new Error("Twitch runtime not initialized");
  }
  return runtime;
}
