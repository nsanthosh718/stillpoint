const NS = "stillpoint:";

export const todayKey = () => new Date().toISOString().slice(0, 10);

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(NS + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  localStorage.setItem(NS + key, JSON.stringify(value));
}

// Append an entry to a dated log array, e.g. moods, reflections.
export function appendLog(key, entry) {
  const log = load(key, []);
  log.push({ date: todayKey(), ts: Date.now(), ...entry });
  save(key, log);
  return log;
}
