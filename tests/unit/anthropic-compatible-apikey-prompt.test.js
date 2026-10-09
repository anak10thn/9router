// api.anthropic.com answers a plain API key with HTTP 400 "Your credit balance
// is too low" when the injected Claude Code identity prompt is present.
import { describe, it, expect } from "vitest";
import { translateRequest } from "../../open-sse/translator/index.js";
import { CLAUDE_SYSTEM_PROMPT } from "../../open-sse/config/appConstants.js";

const req = (creds, system) => translateRequest("openai", "claude", "claude-opus-5-5", {
  model: "claude-opus-5-5",
  messages: [...(system ? [{ role: "system", content: system }] : []), { role: "user", content: "hi" }],
}, false, creds, "anthropic-compatible-x");
const hasPrompt = (out) => (out.system || []).some((b) => b.text === CLAUDE_SYSTEM_PROMPT);

describe("anthropic-compatible: Claude Code system prompt", () => {
  it("is dropped for an API key, keeping the client's own system text", () => {
    expect(hasPrompt(req({ apiKey: "sk-ant-api03-x" }))).toBe(false);
    const out = req({ apiKey: "sk-ant-api03-x" }, "Be terse.");
    expect(hasPrompt(out)).toBe(false);
    expect(out.system.map((b) => b.text)).toEqual(["Be terse."]);
  });

  it("is kept for an OAuth token", () => {
    expect(hasPrompt(req({ accessToken: "sk-ant-oat01-x" }))).toBe(true);
  });
});
