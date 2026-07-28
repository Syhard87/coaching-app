import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { googleLoginUrl } from '../lib/api';

export function LoginPage() {
  const { coach } = useAuth();

  if (coach) return <Navigate to="/dashboard" replace />;

  return (
    <div className="mx-auto mt-16 max-w-sm text-center">
      <h1 className="mb-6 text-xl font-medium text-gray-900">Suivi coaching</h1>
      <a
        href={googleLoginUrl}
        className="inline-flex w-full items-center justify-center gap-3 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.6 5.6 0 0 1-2.4 3.68v3.02h3.86c2.26-2.09 3.56-5.17 3.56-8.94Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3.02c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.11A12 12 0 0 0 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.26a7.2 7.2 0 0 1 0-4.52V6.63H1.28a12 12 0 0 0 0 10.74l3.99-3.11Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.63l3.99 3.11c.95-2.85 3.6-4.99 6.73-4.99Z"
          />
        </svg>
        Se connecter avec Google
      </a>
    </div>
  );
}
