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

  const login = useCallback(async (email, password) => {
    const { token, coach } = await authApi.login(email, password);
    setToken(token);
    setCoach(coach);
  }, []);

  const register = useCallback(async (nom, email, password) => {
    const { token, coach } = await authApi.register(nom, email, password);
    setToken(token);
    setCoach(coach);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setCoach(null);
  }, []);

  return (
    <AuthContext.Provider value={{ coach, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
