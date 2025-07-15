import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../../api/http';

interface EventMeta {
  id: string;
  mood: string;
  content: string;
}

export default function EnergyRoom() {
  const { eventId } = useParams();
  const location = useLocation();
  const [content, setContent] = useState<string>(
    (location.state as { text?: string } | null)?.text || ''
  );

  useEffect(() => {
    if (!eventId) return;
    apiFetch(`/events/${eventId}`)
      .then((r) => r.json())
      .then((data: EventMeta) => setContent(data.content));
  }, [eventId]);

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="relative w-full max-w-md">
        <Link
          to="/"
          aria-label="Close"
          className="absolute right-2 top-2 text-xl text-white"
        >
          ×
        </Link>
        <div className="card w-full text-center">
          <p className="card-title">{content || '...'}</p>
          <p className="text-xs text-gray-400 mt-2">
            3 people are with you in this moment.
          </p>
        </div>
      </div>
    </div>
  );
}
