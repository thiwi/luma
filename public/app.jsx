const { useState, useEffect } = React;

// Determine backend API base URL. When running the Docker compose
// setup the frontend is served on port 8080 while the API listens on
// port 8000. Using a relative path would hit the frontend server
// instead of the API and result in 404 errors, so construct the base
// URL explicitly.
const defaultHost = `${window.location.protocol}//${window.location.hostname}:8000`;
const API_BASE = (window.API_URL || defaultHost) + "/api";

function App() {
  const [events, setEvents] = useState([]);
  const [links, setLinks] = useState([]);
  const [sessionToken, setSessionToken] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [mood, setMood] = useState("rain");

  const moodOptions = [
    { id: "rain", label: "Rain", icon: "\uD83C\uDF27\uFE0F" },
    { id: "sun", label: "Sun", icon: "\u2600\uFE0F" },
    { id: "night", label: "Night", icon: "\uD83C\uDF19" },
    { id: "ember", label: "Ember", icon: "\uD83D\uDD25" },
    { id: "fog", label: "Fog", icon: "\uD83C\uDF2B\uFE0F" },
    { id: "ocean", label: "Ocean", icon: "\uD83C\uDF0A" },
  ];
  const moodMap = Object.fromEntries(moodOptions.map((m) => [m.id, m.icon]));

  useEffect(() => {
    fetch(`${API_BASE}/session`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        setSessionToken(data.token);
        loadEvents();
        loadLinks(data.token);
      });
  }, []);

  function loadEvents() {
    fetch(`${API_BASE}/events`)
      .then((r) => r.json())
      .then(setEvents);
  }

  function loadLinks(token) {
    if (!token) return;
    fetch(`${API_BASE}/resonance/links?session_token=${token}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setLinks(Array.isArray(data) ? data : []));
  }

  function createLink(toId) {
    if (!sessionToken) return;
    fetch(
      `${API_BASE}/resonance/link?session_token=${sessionToken}&target_token=${toId}`,
      {
        method: "POST",
      },
    ).then(() => loadLinks(sessionToken));
  }

  function createEvent() {
    if (!sessionToken) return;
    fetch(`${API_BASE}/events?session_token=${sessionToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "Quick event",
        symbol: "\u2728",
        mood: isPremium ? mood : null,
      }),
    }).then(loadEvents);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Luma Prototype</h1>
      {isPremium && (
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="border p-1 mr-2"
        >
          {moodOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.icon} {m.label}
            </option>
          ))}
        </select>
      )}
      <button
        className="px-4 py-2 bg-teal-500 text-white rounded"
        onClick={createEvent}
      >
        Create Quick Event
      </button>

      <div className="space-y-4">
        {events.map((ev) => (
          <div key={ev.id} className="card">
            <p className="card-title">{ev.content}</p>
            <p className="card-subtext">0 people are here with you</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-semibold">Resonance Links</h2>
        <ul className="text-sm">
          {links.map((l) => (
            <li key={l.id}>
              {l.id} - {l.partner_present ? "online" : "offline"}
            </li>
          ))}
        </ul>
        <input
          id="linkTarget"
          placeholder="Target user id"
          className="border p-1 mr-2"
        />
        <button
          className="px-2 py-1 bg-gray-200 rounded"
          onClick={() => {
            const v = document.getElementById("linkTarget").value;
            if (v) createLink(v);
          }}
        >
          Link
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}
