import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../../api/http';
import { connect } from '../../api/ws';
import { useSession } from '../../store/session';

interface Room {
  id: number;
  title: string;
}

export default function MoodRoomView() {
  const { roomId } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [count, setCount] = useState(0);
  const { sessionId } = useSession();

  useEffect(() => {
    if (!roomId) return;
    apiFetch(`/moodrooms/${roomId}`)
      .then((r) => r.json())
      .then(setRoom);
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = connect(`${protocol}://${window.location.host}/ws/moodrooms/${roomId}`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setCount(data.count);
    };
    return () => ws.close();
  }, [roomId]);

  return (
    <div className="p-4 flex flex-col items-center mood-room">
      <Link to="/" className="mb-4 underline">
        Back
      </Link>
      <h2 className="text-2xl mb-2">{room ? room.title : '...'}</h2>
      <p>{count} people are here with you</p>
    </div>
  );
}
