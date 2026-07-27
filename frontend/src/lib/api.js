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

// Téléchargement d'un fichier authentifié : un <a href> classique n'enverrait pas le
// token, donc on récupère le contenu en mémoire puis on simule le clic sur un lien
// temporaire pointant vers un blob local.
async function telechargerFichier(path) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || `Erreur ${res.status}`);
  }

  const disposition = res.headers.get('Content-Disposition') || '';
  const nomFichier = disposition.match(/filename="([^"]+)"/)?.[1] || 'export';

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  URL.revokeObjectURL(url);
}

export const exportApi = {
  json: () => telechargerFichier('/export/json'),
  csv: (entite) => telechargerFichier(`/export/csv/${entite}`),
};

export const authApi = {
  register: (nom, email, password) => request('POST', '/auth/register', { nom, email, password }),
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  me: () => request('GET', '/auth/me'),
  updateSlug: (slug) => request('PATCH', '/auth/me', { slug }),
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
  splitSuggestion: (id) => request('GET', `/clients/${id}/split-suggestion`),
  listProgrammes: (id) => request('GET', `/clients/${id}/programmes`),
  createProgramme: (id, data) => request('POST', `/clients/${id}/programmes`, data),
  getObjectifDiete: (id) => request('GET', `/clients/${id}/objectif-diete`),
  setObjectifDiete: (id, data) => request('PUT', `/clients/${id}/objectif-diete`, data),
  listJournalDiete: (id, params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    return request('GET', `/clients/${id}/journal-diete${qs ? `?${qs}` : ''}`);
  },
  upsertJournalDiete: (id, data) => request('PUT', `/clients/${id}/journal-diete`, data),
  listMesures: (id) => request('GET', `/clients/${id}/mesures`),
  createMesure: (id, data) => request('POST', `/clients/${id}/mesures`, data),
  listJoursEntrainement: (id) => request('GET', `/clients/${id}/jours-entrainement`),
  listSeances: (id, params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    return request('GET', `/clients/${id}/seances${qs ? `?${qs}` : ''}`);
  },
  createSeance: (id, data) => request('POST', `/clients/${id}/seances`, data),
  listExercicesNoms: (id) => request('GET', `/clients/${id}/exercices-noms`),
  getProgression: (id, exercice) =>
    request('GET', `/clients/${id}/progression?exercice=${encodeURIComponent(exercice)}`),
};

export const programmesApi = {
  get: (id) => request('GET', `/programmes/${id}`),
  update: (id, data) => request('PATCH', `/programmes/${id}`, data),
  remove: (id) => request('DELETE', `/programmes/${id}`),
  duplicate: (id, targetClientId) => request('POST', `/programmes/${id}/duplicate`, { targetClientId }),
  createCycle: (id, data) => request('POST', `/programmes/${id}/cycles`, data),
};

export const cyclesApi = {
  update: (id, data) => request('PATCH', `/cycles/${id}`, data),
  remove: (id) => request('DELETE', `/cycles/${id}`),
};

export const semainesApi = {
  update: (id, data) => request('PATCH', `/semaines/${id}`, data),
};

export const templatesApi = {
  archetypes: () => request('GET', '/templates/archetypes'),
  list: () => request('GET', '/templates'),
  get: (id) => request('GET', `/templates/${id}`),
  create: (data) => request('POST', '/templates', data),
  remove: (id) => request('DELETE', `/templates/${id}`),
};

export const journalDieteApi = {
  update: (id, data) => request('PATCH', `/journal-diete/${id}`, data),
  remove: (id) => request('DELETE', `/journal-diete/${id}`),
};

export const mesuresApi = {
  update: (id, data) => request('PATCH', `/mesures/${id}`, data),
  remove: (id) => request('DELETE', `/mesures/${id}`),
};

export const seancesApi = {
  get: (id) => request('GET', `/seances/${id}`),
  update: (id, data) => request('PATCH', `/seances/${id}`, data),
  remove: (id) => request('DELETE', `/seances/${id}`),
};

export const dashboardApi = {
  get: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    return request('GET', `/dashboard${qs ? `?${qs}` : ''}`);
  },
};

export const prospectsApi = {
  list: (statut) => request('GET', `/prospects${statut ? `?statut=${statut}` : ''}`),
  setStatut: (id, statut) => request('PATCH', `/prospects/${id}`, { statut }),
  convert: (id, objectif) => request('POST', `/prospects/${id}/convert`, { objectif }),
};

// Pas de token requis : page publique de prospection (US-8.1), appelée sans être connecté.
export const publicApi = {
  getCoach: (slug) => request('GET', `/public/coach/${slug}`),
  submitProspect: (slug, data) => request('POST', `/public/coach/${slug}/prospects`, data),
};

export const exercicesApi = {
  gif: (nom) => request('GET', `/exercices/gif?nom=${encodeURIComponent(nom)}`),
};
