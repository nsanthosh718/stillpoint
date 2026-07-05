import { useState } from "react";
import { askClaudeJSON } from "../lib/claude";
import { load, save, todayKey } from "../lib/storage";

const SYSTEM = `You are a calm, pragmatic chief-of-staff. The user dumps everything
on their mind — work, family, errands, worries. Return JSON:
{
  "top3": [{"task": string, "why": string, "estimate": string}],
  "later": [string],
  "delegate_or_drop": [string],
  "worry_reframe": string  // one sentence reframing their biggest worry
}
Prioritize by impact and urgency. Keep language short and kind.`;

export default function BrainDump() {
  const [text, setText] = useState("");
  const [plan, setPlan] = useState(() => load("plan:" + todayKey(), null));
  const [done, setDone] = useState(() => load("plandone:" + todayKey(), []));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setBusy(true);
    setError("");
    try {
      const result = await askClaudeJSON({ system: SYSTEM, prompt: text });
      setPlan(result);
      save("plan:" + todayKey(), result);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function toggle(i) {
    const next = done.includes(i) ? done.filter((d) => d !== i) : [...done, i];
    setDone(next);
    save("plandone:" + todayKey(), next);
  }

  return (
    <section className="panel">
      <h2>Morning brain dump</h2>
      <p className="hint">Everything on your mind, unfiltered. Claude sorts it.</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Sprint review at 2, kid's dentist form overdue, worried about the CRB submission, need to call plumber…"
      />
      <button onClick={generate} disabled={busy || !text.trim()}>
        {busy ? "Sorting…" : "Make my plan"}
      </button>
      {error && <p className="error">{error}</p>}

      {plan && (
        <div className="plan">
          <h3>Today's three</h3>
          <ul className="top3">
            {plan.top3.map((t, i) => (
              <li key={i} className={done.includes(i) ? "done" : ""}>
                <label>
                  <input
                    type="checkbox"
                    checked={done.includes(i)}
                    onChange={() => toggle(i)}
                  />
                  <span>
                    <strong>{t.task}</strong> · {t.estimate}
                    <em>{t.why}</em>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          {plan.later?.length > 0 && (
            <p className="muted">Later: {plan.later.join(" · ")}</p>
          )}
          {plan.delegate_or_drop?.length > 0 && (
            <p className="muted">Delegate or drop: {plan.delegate_or_drop.join(" · ")}</p>
          )}
          {plan.worry_reframe && <p className="reframe">{plan.worry_reframe}</p>}
        </div>
      )}
    </section>
  );
}
