import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api/http';

interface Room {
  id: number;
  title: string;
  schedule?: string;
}

export default function MoodRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  useEffect(() => {
    apiFetch('/moodrooms')
      .then((r) => r.json())
      .then(setRooms)
      .catch(() => setRooms([]));
  }, []);
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Mood Rooms</h2>
      <ul className="space-y-2">
        {rooms.map((r) => (
          <li key={r.id}>
            <Link className="underline" to={`/mood/${r.id}`}>{r.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
