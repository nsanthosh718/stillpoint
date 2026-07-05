// Thin Anthropic Messages API client.
// Dev convenience: direct browser calls with the dangerous-direct-browser-access
// header. For production, route through a small proxy (see README).
const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = import.meta.env.VITE_ANTHROPIC_MODEL || "claude-fable-5";
const KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export async function askClaude({ system, prompt, maxTokens = 1200 }) {
  if (!KEY) throw new Error("Missing VITE_ANTHROPIC_API_KEY. Copy .env.example to .env.");
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude API ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

// Ask for strict JSON and parse defensively (strips code fences if present).
export async function askClaudeJSON({ system, prompt, maxTokens = 1200 }) {
  const jsonSystem =
    system +
    "\nRespond with ONLY a valid JSON object. No prose, no markdown fences.";
  const text = await askClaude({ system: jsonSystem, prompt, maxTokens });
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
