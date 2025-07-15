import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '../../components/EventCard';

interface SuggestedEvent {
  id: string;
  text: string;
  expiresIn: number;
}

const defaultEvents: SuggestedEvent[] = [
  { id: '1', text: 'I have a difficult exam tomorrow.', expiresIn: 0 },
  { id: '2', text: 'Afraid to go home tonight.', expiresIn: 0 },
  { id: '3', text: 'Feeling happy today.', expiresIn: 0 },
];

export default function Home() {
  const [data] = useState<SuggestedEvent[]>(defaultEvents);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-4 flex flex-col items-center">
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
