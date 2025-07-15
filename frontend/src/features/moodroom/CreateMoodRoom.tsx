import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/http';
import { useSession } from '../../store/session';

export default function CreateMoodRoom() {
  const [title, setTitle] = useState('');
  const navigate = useNavigate();
  const { sessionId } = useSession();

  const submit = async () => {
    const res = await apiFetch(`/moodrooms?session_token=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      navigate('/moodrooms');
    }
  };

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-xl mb-2">Create Mood Room</h2>
      <input
        className="border p-2 w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 py-2" onClick={submit}>
        Create
      </button>
    </div>
  );
}
