import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateEvent() {
  const [text, setText] = useState('');
  const [duration, setDuration] = useState(1);
  const navigate = useNavigate();

  const submit = async () => {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, duration: duration * 3600, mood: 'rain' }),
    });
    if (res.ok) {
      const { eventId } = await res.json();
      navigate(`/energy/${eventId}`);
    }
  };

  return (
    <div role="dialog" className="p-4 max-w-lg mx-auto space-y-4">
      <textarea
        className="w-full p-2 border rounded resize-none"
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 100))}
        rows={3}
        placeholder="Share your thought"
      />
      <div className="text-right text-sm opacity-70">{text.length}/100</div>
      <label className="block">Duration: {duration}h</label>
      <input
        type="range"
        min={1}
        max={24}
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        className="w-full"
      />
      <button
        className="bg-nightBlue text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={text.length <= 1}
        onClick={submit}
      >
        Create
      </button>
    </div>
  );
}
