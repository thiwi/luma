const { useState, useEffect } = React;

function App() {
  const [events, setEvents] = useState([]);
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch('/api/session', { method: 'POST' , credentials: 'include'})
      .then(() => {
        connectWs();
        loadEvents();
      });
  }, []);

  function connectWs() {
    const socket = new WebSocket(`ws://${location.host}/ws`);
    socket.onmessage = e => {
      setMessages(m => [...m, e.data]);
      const msg = JSON.parse(e.data);
      if(msg.event === 'event_start' || msg.event === 'event_end' || msg.event === 'participant_joined' || msg.event==='participant_left'){
        loadEvents();
      }
    };
    setWs(socket);
  }

  function loadEvents() {
    fetch('/api/events', { credentials: 'include'} )
      .then(r => r.json())
      .then(setEvents);
  }

  function createEvent() {
    const startTime = new Date(Date.now()+60000).toISOString();
    fetch('/api/events', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      credentials: 'include',
      body: JSON.stringify({startTime, symbol:'\uD83C\uDF0C'})
    }).then(loadEvents);
  }

  function joinEvent(id) {
    fetch(`/api/events/${id}/join`, {method:'POST', credentials:'include'})
      .then(() => sendEnergyToEvent(id));
  }

  function sendEnergyToEvent(id){
    if(ws && ws.readyState === WebSocket.OPEN){
      ws.send(JSON.stringify({action:'send_energy', targetEvent:id}));
    } else {
      fetch('/api/energy', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        credentials:'include',
        body:JSON.stringify({targetEvent:id})
      });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Luma Prototype</h1>
      <button className="px-4 py-2 bg-teal-500 text-white rounded" onClick={createEvent}>Create Quick Event</button>
      <ul>
        {events.map(ev => (
          <li key={ev.id} className="mt-2 flex items-center justify-between">
            <span>{ev.symbol} @ {new Date(ev.startTime).toLocaleTimeString()} ({ev.status}) - energy {ev.energy}</span>
            <button className="ml-2 px-2 py-1 bg-gray-200 rounded" onClick={() => joinEvent(ev.id)}>Join</button>
          </li>
        ))}
      </ul>
      <div>
        <h2 className="font-semibold">Messages</h2>
        <ul className="text-sm text-gray-600">
          {messages.map((m,i) => (<li key={i}>{m}</li>))}
        </ul>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App/>);

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js');
}
