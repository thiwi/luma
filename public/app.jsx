const { useState, useEffect } = React;

function App() {
  const [events, setEvents] = useState([]);
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searching, setSearching] = useState(false);
  const [match, setMatch] = useState(null); // {partnerId, matchId}

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
      if(msg.event === 'match_found'){
        setMatch({partnerId: msg.partnerId, matchId: msg.matchId});
        setSearching(false);
      }
      if(msg.event === 'match_ended'){
        setMatch(null);
        setSearching(false);
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

  function startMatchSearch(){
    fetch('/api/match', {method:'POST', credentials:'include'})
      .then(()=> setSearching(true));
  }

  function stopMatchSearch(){
    fetch('/api/match', {method:'DELETE', credentials:'include'})
      .then(()=> { setSearching(false); setMatch(null); });
  }

  function sendEnergyToMatch(){
    if(!match) return;
    if(ws && ws.readyState === WebSocket.OPEN){
      ws.send(JSON.stringify({action:'send_energy', targetUser:match.partnerId}));
    } else {
      fetch('/api/energy', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        credentials:'include',
        body:JSON.stringify({targetUser:match.partnerId})
      });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Luma Prototype</h1>
      <button className="px-4 py-2 bg-teal-500 text-white rounded" onClick={createEvent}>Create Quick Event</button>

      <div>
        {match ? (
          <div className="space-x-2">
            <span>Matched with {match.partnerId}</span>
            <button className="px-2 py-1 bg-teal-500 text-white rounded" onClick={sendEnergyToMatch}>Send Energy</button>
            <button className="px-2 py-1 bg-gray-200 rounded" onClick={stopMatchSearch}>End Match</button>
          </div>
        ) : (
          <div>
            <button
              className="px-4 py-2 bg-teal-500 text-white rounded"
              onClick={searching ? stopMatchSearch : startMatchSearch}
            >
              {searching ? 'Cancel Search' : 'Find Match'}
            </button>
          </div>
        )}
      </div>

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
