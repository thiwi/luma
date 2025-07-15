import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSession } from './store/session';
import Header from './components/Header';

export default function App() {
  const initSession = useSession((s) => s.initSession);

  useEffect(() => {
    initSession();
  }, [initSession]);

  return (
    <div className="min-h-screen">
      <Header />
      <Outlet />
    </div>
  );
}
