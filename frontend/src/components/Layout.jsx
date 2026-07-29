import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { coach, logout } = useAuth();

  return (
    <div className="min-h-screen bg-chalk-50">
      <header className="border-b border-chalk-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="font-heading text-lg font-medium tracking-wide text-graphite-900">
              Suivi coaching
            </Link>
            <nav className="flex gap-4 text-sm text-graphite-600">
              <Link to="/dashboard" className="hover:text-graphite-900 hover:underline">
                Tableau de bord
              </Link>
              <Link to="/clients" className="hover:text-graphite-900 hover:underline">
                Clients
              </Link>
              <Link to="/prospects" className="hover:text-graphite-900 hover:underline">
                Prospects
              </Link>
              <Link to="/planning" className="hover:text-graphite-900 hover:underline">
                Planning
              </Link>
              <Link to="/export" className="hover:text-graphite-900 hover:underline">
                Export
              </Link>
              <Link to="/parametres" className="hover:text-graphite-900 hover:underline">
                Paramètres
              </Link>
            </nav>
          </div>
          {coach && (
            <div className="flex items-center gap-4 text-sm text-graphite-600">
              <span className="flex items-center gap-2">
                {coach.avatarUrl && (
                  <img src={coach.avatarUrl} alt="" className="h-6 w-6 rounded-full" referrerPolicy="no-referrer" />
                )}
                {coach.nom}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded border border-chalk-300 px-3 py-1 hover:bg-chalk-100"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
