import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Anthropic Claude API configuration. The key is read from the environment and
 * never hardcoded; the model is also env-driven so it can be swapped without a
 * code change. Defaults to the current flagship Claude model.
 */
export const anthropicEnv = {
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
  model: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
  get isConfigured(): boolean {
    return Boolean(this.apiKey);
  },
};

let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!anthropicEnv.isConfigured) {
    throw new Error("Anthropic API is not configured (ANTHROPIC_API_KEY).");
  }
  if (!cached) {
    cached = new Anthropic({ apiKey: anthropicEnv.apiKey });
  }
  return cached;
}
