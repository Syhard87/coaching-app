const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'coaching_app_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(method, path, body) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Erreur ${res.status}`);
  }
  return data;
}

export const authApi = {
  register: (nom, email, password) => request('POST', '/auth/register', { nom, email, password }),
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  me: () => request('GET', '/auth/me'),
};

export const clientsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    return request('GET', `/clients${qs ? `?${qs}` : ''}`);
  },
  get: (id) => request('GET', `/clients/${id}`),
  create: (data) => request('POST', '/clients', data),
  update: (id, data) => request('PATCH', `/clients/${id}`, data),
  setArchive: (id, archive) => request('PATCH', `/clients/${id}/archive`, { archive }),
  duplicate: (id, data) => request('POST', `/clients/${id}/duplicate`, data),
};
