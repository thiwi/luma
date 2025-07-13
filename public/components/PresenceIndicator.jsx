import { useEffect, useState } from 'react';

export default function PresenceIndicator({ eventId }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const base = (window.API_URL || "http://backend:8000").replace(
      /^http/,
      "ws",
    );
    const ws = new WebSocket(`${base}/ws/presence/${eventId}`);
    ws.onmessage = (e) => setCount(JSON.parse(e.data).count);
    return () => ws.close();
  }, [eventId]);
  return <span>{count} resonating</span>;
}
