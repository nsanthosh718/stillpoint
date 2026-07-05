import { useState } from "react";
import { askClaudeJSON } from "../lib/claude";

const SYSTEM = `You are a scheduling triage assistant. The user pastes raw tasks,
meetings, or a messy calendar. Return JSON:
{
  "keep": [{"item": string, "when": string}],
  "shorten": [{"item": string, "suggestion": string}],
  "decline_or_move": [{"item": string, "reason": string}],
  "focus_block": string  // one concrete suggestion for a protected focus block
}
Be decisive. Protect deep work and family time.`;

export default function Triage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setBusy(true);
    setError("");
    try {
      setResult(await askClaudeJSON({ system: SYSTEM, prompt: text }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <h2>Calendar triage</h2>
      <p className="hint">Paste your day's meetings and tasks. Get a ruthless edit.</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="9:00 standup, 10:00 vendor sync (1h), 11:30 1:1, 2:00 sprint review, backlog grooming sometime, pick up kids 5:30…"
      />
      <button onClick={run} disabled={busy || !text.trim()}>
        {busy ? "Triaging…" : "Triage my day"}
      </button>
      {error && <p className="error">{error}</p>}
      {result && (
        <div className="plan">
          {result.focus_block && <p className="reframe">{result.focus_block}</p>}
          <TriageList title="Keep" items={result.keep} f={(i) => `${i.item} — ${i.when}`} />
          <TriageList title="Shorten" items={result.shorten} f={(i) => `${i.item} — ${i.suggestion}`} />
          <TriageList title="Decline or move" items={result.decline_or_move} f={(i) => `${i.item} — ${i.reason}`} />
        </div>
      )}
    </section>
  );
}

function TriageList({ title, items, f }) {
  if (!items?.length) return null;
  return (
    <>
      <h3>{title}</h3>
      <ul>{items.map((i, k) => <li key={k}>{f(i)}</li>)}</ul>
    </>
  );
}
