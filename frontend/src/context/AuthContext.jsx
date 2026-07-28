import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, getToken, setToken, clearToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(({ coach }) => setCoach(coach))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  // Reçoit le JWT émis par le backend à la fin du flux Google OAuth (redirection
  // /auth/callback#token=...), puis récupère le profil coach associé.
  const loginWithToken = useCallback(async (token) => {
    setToken(token);
    const { coach } = await authApi.me();
    setCoach(coach);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setCoach(null);
  }, []);

  // Modification du slug public (US-8.1) : met à jour le coach en mémoire sans recharger la page.
  const updateSlug = useCallback(async (slug) => {
    const { coach } = await authApi.updateSlug(slug);
    setCoach(coach);
  }, []);

  return (
    <AuthContext.Provider value={{ coach, loading, loginWithToken, logout, updateSlug }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
