import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Point d'arrivée du flux Google OAuth (backend/src/routes/auth.routes.js) : le token
// est passé dans le fragment d'URL, jamais dans l'historique ni les logs serveur.
export function AuthCallbackPage() {
  const { loginWithToken } = useAuth();
  const [statut, setStatut] = useState('en_cours');

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    if (!token) {
      setStatut('erreur');
      return;
    }
    loginWithToken(token)
      .then(() => setStatut('ok'))
      .catch(() => setStatut('erreur'));
  }, [loginWithToken]);

  if (statut === 'ok') return <Navigate to="/dashboard" replace />;
  if (statut === 'erreur') return <Navigate to="/login?erreur=connexion" replace />;
  return <p className="mx-auto mt-16 max-w-sm text-center text-sm text-gray-600">Connexion en cours…</p>;
}
