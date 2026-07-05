import { useState } from "react";
import BrainDump from "./features/BrainDump";
import Breathe from "./features/Breathe";
import Triage from "./features/Triage";
import Reflect from "./features/Reflect";
import Move from "./features/Move";

const TABS = [
  { id: "morning", label: "Morning", sub: "Brain dump", comp: BrainDump },
  { id: "midday", label: "Midday", sub: "Triage", comp: Triage },
  { id: "break", label: "Anytime", sub: "Breathe", comp: Breathe },
  { id: "move", label: "Move", sub: "Row + Pilates", comp: Move },
  { id: "evening", label: "Evening", sub: "Reflect", comp: Reflect },
];

function defaultTab() {
  const h = new Date().getHours();
  if (h < 11) return "morning";
  if (h < 17) return "midday";
  return "evening";
}

export default function App() {
  const [tab, setTab] = useState(defaultTab());
  const Active = TABS.find((t) => t.id === tab).comp;

  return (
    <div className="shell">
      <header>
        <h1>Stillpoint</h1>
        <p className="tagline">The quiet center of a loud day</p>
      </header>
      <nav>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? "tab active" : "tab"}
            onClick={() => setTab(t.id)}
          >
            <span>{t.label}</span>
            <small>{t.sub}</small>
          </button>
        ))}
      </nav>
      <main>
        <Active />
      </main>
      <footer>Data stays in your browser. AI runs on Claude.</footer>
    </div>
  );
}
