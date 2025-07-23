import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '../../components/EventCard';
import { apiFetch } from '../../api/http';

interface SuggestedEvent {
  id: string;
  text: string;
  expiresIn: number;
}


export default function Home() {
  const [data, setData] = useState<SuggestedEvent[]>([]);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/events')
      .then((r) => r.json())
      .then((events: any[]) =>
        setData(events.map((e) => ({ id: String(e.id), text: e.content, expiresIn: 0 })))
      );
  }, []);

  return (
    <div className="relative p-4 space-y-4 flex flex-col items-center min-h-screen">
      {data && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl justify-items-center">
          {data.slice(0, page * 3).map((ev) => (
            <EventCard
              key={ev.id}
              text={ev.text}
              expiresIn={ev.expiresIn}
              onSendEnergy={() =>
                navigate(`/energy/${ev.id}`, { state: { text: ev.text } })
              }
            />
          ))}
        </div>
      )}
      {data && page * 3 < (data?.length ?? 0) && (
        <button
          className="absolute bottom-4 text-sm text-gray-600"
          onClick={() => setPage((p) => p + 1)}
          aria-label="More moments"
        >
          More moments
        </button>
      )}
    </div>
  );
}
