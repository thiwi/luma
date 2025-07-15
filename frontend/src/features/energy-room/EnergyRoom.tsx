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
      <div className="w-full max-w-md">
        <div className="card w-full text-center relative group">
          <Link
            to="/"
            aria-label="Leave"
            className="absolute right-2 top-2 text-xs text-black opacity-0 group-hover:opacity-100"
          >
            leave
          </Link>
          <p className="card-title">{content || '...'}</p>
          <p className="text-xs text-gray-400 absolute bottom-2 left-0 right-0">
            3 people are with you in this moment.
          </p>
        </div>
      </div>
    </div>
  );
}
