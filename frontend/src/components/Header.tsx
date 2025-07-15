import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-dawnSand-300">
      <Link to="/" className="font-bold text-lg">
        Luma
      </Link>
      <div className="relative">
        <button
          aria-label="Menu"
          className="w-6 h-6 flex flex-col justify-between"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-0.5 bg-black" />
          <span className="block h-0.5 bg-black" />
          <span className="block h-0.5 bg-black" />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 bg-white border rounded shadow-md text-sm">
            <Link
              to="/moodrooms/new"
              className="block px-4 py-2 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              Create mood room
            </Link>
            <Link
              to="/moodrooms"
              className="block px-4 py-2 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              Mood rooms
            </Link>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                localStorage.removeItem('sessionId');
                location.reload();
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
