import { useEffect, useState } from 'react';

export default function PresenceIndicator({ eventId }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const defaultHost = `${window.location.protocol}//${window.location.hostname}:8000`;
    const base = (window.API_URL || defaultHost).replace(
      /^http/,
      "ws",
    );
    const ws = new WebSocket(`${base}/ws/presence/${eventId}`);
    ws.onmessage = (e) => setCount(JSON.parse(e.data).count);
    return () => ws.close();
  }, [eventId]);
  return <span>{count} resonating</span>;
}
