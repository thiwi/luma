import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSession } from './store/session';

export default function App() {
  const initSession = useSession((s) => s.initSession);

  useEffect(() => {
    initSession();
  }, [initSession]);

  return (
    <div className="min-h-screen bg-dawnSand dark:bg-nightBlue text-gray-800 dark:text-gray-100">
      <Outlet />
    </div>
  );
}
