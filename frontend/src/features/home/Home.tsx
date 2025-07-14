import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '../../components/EventCard';
import EmptyState from '../../components/EmptyState';
import { apiFetch } from '../../api/http';

interface SuggestedEvent {
  id: string;
  emoji: string;
  text: string;
  expiresIn: number;
}

export default function Home() {
  const [data, setData] = useState<SuggestedEvent[] | null>(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    // backend only exposes a simple list endpoint under /events
    apiFetch('/events')
      .then((res) => res.json())
      .then((events) =>
        setData(
          events.map((ev: any) => ({
            id: ev.id,
            emoji: ev.symbol ?? '✨',
            text: ev.content,
            expiresIn: 0,
          }))
        )
      )
      .catch(() => setData([]));
  }, []);

  return (
    <div className="p-4 space-y-4 flex flex-col items-center">
      {data === null && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-[120px] w-full animate-pulse"
            />
          ))}
        </div>
      )}
      {data && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl justify-items-center">
          {data.slice(0, page * 3).map((ev) => (
            <EventCard
              key={ev.id}
              symbol={ev.emoji}
              text={ev.text}
              expiresIn={ev.expiresIn}
              onSendEnergy={() => navigate(`/energy/${ev.id}`)}
            />
          ))}
        </div>
      )}
      {data && data.length === 0 && <EmptyState />}
      {data && page * 3 < (data?.length ?? 0) && (
        <button
          className="mt-4 text-black"
          onClick={() => setPage((p) => p + 1)}
          aria-label="More"
        >
          ↓
        </button>
      )}
    </div>
  );
}
