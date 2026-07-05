import { useState } from "react";
import { askClaudeJSON } from "../lib/claude";
import { appendLog, load } from "../lib/storage";

const SYSTEM = `You are a warm, grounded reflection companion. The user writes a short
end-of-day journal entry. Return JSON:
{
  "mood": number,        // 1 (drained) to 10 (great), your best read of their day
  "summary": string,     // one sentence, their day in plain words
  "insight": string,     // one gentle, specific observation or suggestion for tomorrow
  "win": string          // one thing that went right today, however small
}`;

export default function Reflect() {
  const [text, setText] = useState("");
  const [entry, setEntry] = useState(null);
  const [log, setLog] = useState(() => load("reflections", []));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setBusy(true);
    setError("");
    try {
      const r = await askClaudeJSON({ system: SYSTEM, prompt: text });
      setEntry(r);
      setLog(appendLog("reflections", { ...r, note: text }));
      setText("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const recent = log.slice(-14);
  const max = 10;

  return (
    <section className="panel">
      <h2>Evening reflection</h2>
      <p className="hint">A few honest sentences about your day.</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="Long day. CRB prep ate the afternoon but dinner with the kids was good…"
      />
      <button onClick={run} disabled={busy || !text.trim()}>
        {busy ? "Reflecting…" : "Close the day"}
      </button>
      {error && <p className="error">{error}</p>}

      {entry && (
        <div className="plan">
          <p><strong>{entry.summary}</strong></p>
          <p className="muted">Win: {entry.win}</p>
          <p className="reframe">{entry.insight}</p>
        </div>
      )}

      {recent.length > 0 && (
        <div className="trend">
          <h3>Mood, last {recent.length} entries</h3>
          <div className="bars">
            {recent.map((r, i) => (
              <div key={i} className="barCol" title={`${r.date}: ${r.mood}/10`}>
                <div className="bar" style={{ height: `${(r.mood / max) * 100}%` }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
