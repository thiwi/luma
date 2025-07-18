import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/http';
import { useSession } from '../store/session';

interface Props {
  onClose: () => void;
}

export default function CreateMomentModal({ onClose }: Props) {
  const [text, setText] = useState('');
  const navigate = useNavigate();
  const sessionId = useSession((s) => s.sessionId);
  const initSession = useSession((s) => s.initSession);

  const submit = async () => {
    let sid = sessionId;
    if (!sid) {
      await initSession();
      sid = useSession.getState().sessionId;
    }
    let res = await apiFetch(`/events?session_token=${sid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, mood: 'rain', symbol: '✨' }),
    });
    // When the session token is stale the backend responds with 404.
    // In that case create a new session and retry once.
    if (res.status === 404) {
      await initSession(true);
      sid = useSession.getState().sessionId;
      res = await apiFetch(`/events?session_token=${sid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, mood: 'rain', symbol: '✨' }),
      });
    }
    if (res.ok) {
      const { id } = await res.json();
      onClose();
      navigate(`/energy/${id}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div role="dialog" className="bg-white p-4 rounded-md w-full max-w-md space-y-4">
        <textarea
          className="w-full p-2 border rounded-md resize-none bg-dawnSand dark:bg-nightBlue/20"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 100))}
          rows={3}
          placeholder="Share your thought"
        />
        <div className="text-right text-sm opacity-70">{text.length}/100</div>
        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 text-black" onClick={onClose}>
            Leave
          </button>
          <button
            className="bg-waveTeal-400 text-black px-4 py-2 rounded-md shadow-ambient hover:shadow-key transition-shadow disabled:opacity-50"
            disabled={text.length <= 1}
            onClick={submit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
