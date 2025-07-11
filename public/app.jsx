const { useState, useEffect } = React;

function App() {
  const [events, setEvents] = useState([]);
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searching, setSearching] = useState(false);
  const [match, setMatch] = useState(null); // {partnerId, matchId}
  const [artwork, setArtwork] = useState([]);
  const [links,setLinks] = useState([]);
  const [rooms,setRooms] = useState([]);
  const [isPremium,setIsPremium] = useState(false);
  const [mood,setMood] = useState('rain');

  const moodOptions = [
    {id:'rain',label:'Rain',icon:'\uD83C\uDF27\uFE0F'},
    {id:'sun',label:'Sun',icon:'\u2600\uFE0F'},
    {id:'night',label:'Night',icon:'\uD83C\uDF19'},
    {id:'ember',label:'Ember',icon:'\uD83D\uDD25'},
    {id:'fog',label:'Fog',icon:'\uD83C\uDF2B\uFE0F'},
    {id:'ocean',label:'Ocean',icon:'\uD83C\uDF0A'}
  ];
  const moodMap = Object.fromEntries(moodOptions.map(m=>[m.id,m.icon]));

  useEffect(() => {
    fetch('/api/session', { method: 'POST' , credentials: 'include'})
      .then(r=>r.json())
      .then(data => {
        setIsPremium(!!data.premium);
        connectWs();
        loadEvents();
        loadArtworks();
        loadLinks();
        loadRooms();
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

  function loadArtworks() {
    fetch('/api/artwork', { credentials: 'include' })
      .then(r => r.json())
      .then(setArtwork);
  }

  function loadLinks(){
    fetch('/api/resonance-links',{credentials:'include'})
      .then(r=>r.json())
      .then(setLinks);
  }

  function loadRooms(){
    fetch('/api/rooms/upcoming',{credentials:'include'})
      .then(r=>r.json())
      .then(setRooms);
  }

  function createLink(toId){
    fetch('/api/resonance-links',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({to_user_id:toId})})
      .then(loadLinks);
  }

  function joinRoom(id){
    fetch(`/api/rooms/${id}/join`,{method:'POST',credentials:'include'})
      .then(()=>connectRoomWs(id));
  }

  function connectRoomWs(id){
    const socket=new WebSocket(`ws://${location.host}/ws/rooms/${id}`);
    socket.onmessage=e=>setMessages(m=>[...m,e.data]);
  }

  function createEvent() {
    const startTime = new Date(Date.now()+60000).toISOString();
    fetch('/api/events', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      credentials: 'include',
      body: JSON.stringify({startTime, symbol:'\uD83C\uDF0C', ...(isPremium ? {mood} : {})})
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
      {isPremium && (
        <select value={mood} onChange={e=>setMood(e.target.value)} className="border p-1 mr-2">
          {moodOptions.map(m=> <option key={m.id} value={m.id}>{m.icon} {m.label}</option>)}
        </select>
      )}
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
            <span>{ev.symbol} {ev.mood ? moodMap[ev.mood] : ''} @ {new Date(ev.startTime).toLocaleTimeString()} ({ev.status}) - energy {ev.energy}</span>
            <button className="ml-2 px-2 py-1 bg-gray-200 rounded" onClick={() => joinEvent(ev.id)}>Join</button>
          </li>
        ))}
      </ul>

      <div>
        <h2 className="font-semibold">Resonance Links</h2>
        <ul className="text-sm">
          {links.map(l=>(<li key={l.id}>{l.id} - {l.partner_present? 'online':'offline'}</li>))}
        </ul>
        <input id="linkTarget" placeholder="Target user id" className="border p-1 mr-2" />
        <button className="px-2 py-1 bg-gray-200 rounded" onClick={()=>{
          const v=document.getElementById('linkTarget').value; if(v) createLink(v);
        }}>Link</button>
      </div>

      <div>
        <h2 className="font-semibold">Upcoming Rooms</h2>
        <ul>
          {rooms.map(r=> (
            <li key={r.id} className="mt-1 flex items-center justify-between">
              <span>{r.name} ({new Date(r.start_time).toLocaleTimeString()})</span>
              <button className="ml-2 px-2 py-1 bg-gray-200 rounded" onClick={()=>joinRoom(r.id)}>Join</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-semibold">Messages</h2>
        <ul className="text-sm text-gray-600">
          {messages.map((m,i) => (<li key={i}>{m}</li>))}
        </ul>
      </div>
      <div>
        <h2 className="font-semibold">Artwork</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {artwork.map((p,i) => (
            <img key={i} src={p} alt={p.split('/').pop()} className="w-full h-auto" />
          ))}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App/>);

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js');
}
