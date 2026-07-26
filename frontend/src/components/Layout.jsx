import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { coach, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="font-medium text-gray-900">
              Suivi coaching
            </Link>
            <nav className="flex gap-4 text-sm text-gray-600">
              <Link to="/dashboard" className="hover:text-gray-900 hover:underline">
                Tableau de bord
              </Link>
              <Link to="/clients" className="hover:text-gray-900 hover:underline">
                Clients
              </Link>
              <Link to="/export" className="hover:text-gray-900 hover:underline">
                Export
              </Link>
            </nav>
          </div>
          {coach && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{coach.nom}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100"
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
