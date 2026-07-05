import { useState } from "react";
import { askClaudeJSON } from "../lib/claude";
import { appendLog, load } from "../lib/storage";

const SYSTEM = `You are a pragmatic coach for someone working two jobs and running a
company. Their only equipment: a mat (Pilates) and an air rower. Sessions must fit
EXACTLY the minutes given — no warm-up sprawl, no "if you have time" extras.
Rowing guidance uses stroke rate (spm) and effort (easy/steady/hard), never assumed
split times. Pilates uses named mat exercises with reps or seconds.
Return JSON:
{
  "title": string,               // short session name
  "total_minutes": number,
  "blocks": [
    {"tool": "rower" | "pilates", "minutes": number, "detail": string}
  ],
  "why_this_today": string       // one sentence tying it to their stated energy
}
Low energy days get restorative Pilates + easy rowing. Never moralize about missed
workouts.`;

const ENERGY = ["Running on fumes", "Okay", "Good", "Fired up"];
const TIMES = [10, 15, 20, 30, 45];

export default function Move() {
  const [minutes, setMinutes] = useState(15);
  const [energy, setEnergy] = useState("Okay");
  const [session, setSession] = useState(null);
  const [log, setLog] = useState(() => load("workouts", []));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setBusy(true);
    setError("");
    try {
      const recent = log.slice(-5).map((w) => `${w.date}: ${w.title}`).join("; ");
      const r = await askClaudeJSON({
        system: SYSTEM,
        prompt: `Minutes available: ${minutes}. Energy: ${energy}. Recent sessions: ${recent || "none logged"}. Vary the emphasis vs recent sessions.`,
      });
      setSession(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function logIt() {
    setLog(appendLog("workouts", { title: session.title, minutes: session.total_minutes }));
    setSession(null);
  }

  const thisWeek = log.filter(
    (w) => Date.now() - w.ts < 7 * 24 * 3600 * 1000
  );
  const weekMinutes = thisWeek.reduce((s, w) => s + (w.minutes || 0), 0);

  return (
    <section className="panel">
      <h2>Move</h2>
      <p className="hint">Pilates mat + air rower. Sessions sized to the time you actually have.</p>

      <div className="pickRow">
        <div>
          <p className="muted">Minutes</p>
          <div className="chips">
            {TIMES.map((t) => (
              <button
                key={t}
                className={minutes === t ? "chip active" : "chip"}
                onClick={() => setMinutes(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="muted">Energy</p>
          <div className="chips">
            {ENERGY.map((e) => (
              <button
                key={e}
                className={energy === e ? "chip active" : "chip"}
                onClick={() => setEnergy(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={generate} disabled={busy}>
        {busy ? "Building session…" : "Build my session"}
      </button>
      {error && <p className="error">{error}</p>}

      {session && (
        <div className="plan">
          <h3>{session.title} · {session.total_minutes} min</h3>
          <ul className="blocks">
            {session.blocks.map((b, i) => (
              <li key={i}>
                <span className={`toolTag ${b.tool}`}>{b.tool === "rower" ? "Rower" : "Pilates"}</span>
                <span><strong>{b.minutes} min</strong> — {b.detail}</span>
              </li>
            ))}
          </ul>
          <p className="reframe">{session.why_this_today}</p>
          <button onClick={logIt}>Done — log it</button>
        </div>
      )}

      {log.length > 0 && (
        <p className="muted" style={{ marginTop: 16 }}>
          This week: {thisWeek.length} session{thisWeek.length === 1 ? "" : "s"}, {weekMinutes} min ·
          Lifetime: {log.length} sessions
        </p>
      )}
    </section>
  );
}
