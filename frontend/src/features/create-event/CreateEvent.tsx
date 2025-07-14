import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/http';

export default function CreateEvent() {
  const [text, setText] = useState('');
  const navigate = useNavigate();

  const submit = async () => {
    const res = await apiFetch('/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // backend expects `content`, optional symbol and mood fields
      body: JSON.stringify({ content: text, mood: 'rain', symbol: '✨' }),
    });
    if (res.ok) {
      const { id } = await res.json();
      navigate(`/energy/${id}`);
    }
  };

  return (
    <div role="dialog" className="p-4 max-w-lg mx-auto space-y-4">
      <textarea
        className="w-full p-2 border rounded-md resize-none bg-dawnSand dark:bg-nightBlue/20"
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 100))}
        rows={3}
        placeholder="Share your thought"
      />
      <div className="text-right text-sm opacity-70">{text.length}/100</div>
      <button
        className="bg-waveTeal-400 text-white px-4 py-2 rounded-md shadow-ambient hover:shadow-key transition-shadow disabled:opacity-50"
        disabled={text.length <= 1}
        onClick={submit}
      >
        Create
      </button>
    </div>
  );
}
