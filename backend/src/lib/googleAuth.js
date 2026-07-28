// Authentification Google OAuth2 — cahier des charges section 7 / Phase 9.5.
// Flux "authorization code" classique, implémenté avec fetch natif (pas de dépendance
// passport/OAuth ajoutée, cohérent avec le reste du backend qui reste volontairement léger).

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

export function construireUrlConsentement({ clientId, redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    ...(state ? { state } : {}),
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function echangerCodeContreProfil({ code, clientId, clientSecret, redirectUri }, fetchImpl = fetch) {
  const tokenRes = await fetchImpl(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    throw new Error(`Échange du code Google échoué (HTTP ${tokenRes.status}) : ${detail}`);
  }
  const { access_token: accessToken } = await tokenRes.json();

  const userinfoRes = await fetchImpl(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!userinfoRes.ok) {
    throw new Error(`Récupération du profil Google échouée (HTTP ${userinfoRes.status})`);
  }
  const profil = await userinfoRes.json();

  return {
    googleId: profil.sub,
    email: profil.email,
    nom: profil.name || profil.email,
    avatarUrl: profil.picture || null,
  };
}
