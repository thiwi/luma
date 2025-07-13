import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../../api/http';

interface EventMeta {
  id: string;
  mood: string;
}

export default function EnergyRoom() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<EventMeta | null>(null);

  useEffect(() => {
    if (!eventId) return;
    apiFetch(`/api/events/${eventId}`)
      .then((r) => r.json())
      .then(setEvent);
  }, [eventId]);

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="relative w-full max-w-md">
        <Link to="/" className="absolute right-0 -top-2 text-xl">
          ×
        </Link>
        <div className="card w-full text-center">{event ? event.content : '...'}</div>
        <p className="text-center mt-4">You are now in this moment</p>
      </div>
    </div>
  );
}
