import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSession } from '../../store/session';

interface EventMeta {
  id: string;
  mood: string;
}

export default function EnergyRoom() {
  const { eventId } = useParams();
  const { sessionId, setPresence } = useSession((s) => ({
    sessionId: s.sessionId,
    setPresence: s.setPresence,
  }));
  const [event, setEvent] = useState<EventMeta | null>(null);
  const wsRef = useRef<WebSocket>();

  useEffect(() => {
    if (!eventId) return;
    fetch(`/api/events/${eventId}`)
      .then((r) => r.json())
      .then(setEvent);
  }, [eventId]);

  useEffect(() => {
    if (!eventId || !sessionId) return;
    const ws = new WebSocket(
      `wss://api.luma/ws/presence?eventId=${eventId}&sid=${sessionId}`,
    );
    ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.type === 'presence') {
        setPresence(eventId, data.count);
      }
    };
    wsRef.current = ws;
    return () => ws.close();
  }, [eventId, sessionId, setPresence]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-2xl mb-4">Energy Room</div>
      <div>{event ? event.mood : '...'}</div>
    </div>
  );
}
