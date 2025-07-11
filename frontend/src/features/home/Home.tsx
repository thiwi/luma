import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '../../components/EventCard';
import EmptyState from '../../components/EmptyState';

interface SuggestedEvent {
  id: string;
  emoji: string;
  text: string;
  expiresIn: number;
}

export default function Home() {
  const [data, setData] = useState<SuggestedEvent[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/events/suggested')
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData([]));
  }, []);

  return (
    <div className="p-4 space-y-4">
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
        <div className="space-y-4">
          {data.slice(0, 3).map((ev) => (
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
      <button
        className="fixed bottom-6 right-6 bg-nightBlue text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
        onClick={() => navigate('/create')}
        aria-label="Create"
      >
        +
      </button>
    </div>
  );
}
