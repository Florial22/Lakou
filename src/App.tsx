import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { APP_NAME } from './config/app';

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    const map: Record<string, string> = {
      '/': `${APP_NAME} · Accueil`,
      '/versets': `${APP_NAME} · Versets`,
      '/lecteur': `${APP_NAME} · Lecteur`,
      '/quiz': `${APP_NAME} · Quiz`,
      '/quiz/jouer': `${APP_NAME} · Quiz`,
      '/quiz/resultats': `${APP_NAME} · Résultats`,
    };
    document.title = map[pathname] ?? APP_NAME;
  }, [pathname]);

  return (
    <div className="min-h-dvh">
      <main className="container py-12">
        <Outlet />
      </main>
    </div>
  );
}
