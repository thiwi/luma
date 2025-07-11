import { useEffect, useState } from 'react';

export default function PresenceIndicator({ eventId }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const ws = new WebSocket(`/ws/presence/${eventId}`);
    ws.onmessage = (e) => setCount(JSON.parse(e.data).count);
    return () => ws.close();
  }, [eventId]);
  return <span>{count} resonating</span>;
}
