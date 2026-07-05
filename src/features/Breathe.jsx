import { useEffect, useRef, useState } from "react";

// Box breathing: 4s inhale, 4s hold, 4s exhale, 4s hold.
const PHASES = [
  { label: "Breathe in", secs: 4, scale: 1.35 },
  { label: "Hold", secs: 4, scale: 1.35 },
  { label: "Breathe out", secs: 4, scale: 1.0 },
  { label: "Hold", secs: 4, scale: 1.0 },
];

export default function Breathe() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(PHASES[0].secs);
  const [cycles, setCycles] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        setPhase((p) => {
          const next = (p + 1) % PHASES.length;
          if (next === 0) setCycles((cy) => cy + 1);
          return next;
        });
        return 0; // reset below via effect on phase
      });
    }, 1000);
    return () => clearInterval(timer.current);
  }, [running]);

  useEffect(() => {
    setCount(PHASES[phase].secs);
  }, [phase]);

  function toggle() {
    if (running) {
      setRunning(false);
      setPhase(0);
      setCount(PHASES[0].secs);
    } else {
      setCycles(0);
      setRunning(true);
    }
  }

  const p = PHASES[phase];

  return (
    <section className="panel breathe">
      <h2>Micro-break</h2>
      <p className="hint">Four cycles of box breathing ≈ one minute of calm.</p>
      <div className="orbWrap">
        <div
          className="orb"
          style={{
            transform: `scale(${running ? p.scale : 1})`,
            transitionDuration: running ? `${p.secs}s` : "0.4s",
          }}
        />
        <div className="orbText">
          {running ? (
            <>
              <span className="phaseLabel">{p.label}</span>
              <span className="phaseCount">{count}</span>
            </>
          ) : (
            <span className="phaseLabel">Ready</span>
          )}
        </div>
      </div>
      <button onClick={toggle}>{running ? "Stop" : "Start breathing"}</button>
      {cycles > 0 && <p className="muted">{cycles} cycle{cycles > 1 ? "s" : ""} complete</p>}
    </section>
  );
}
