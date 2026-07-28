import { test } from 'node:test';
import assert from 'node:assert/strict';
import { construireUrlConsentement, echangerCodeContreProfil } from './googleAuth.js';

test('construireUrlConsentement inclut client_id, redirect_uri et le scope openid', () => {
  const url = construireUrlConsentement({
    clientId: 'abc.apps.googleusercontent.com',
    redirectUri: 'http://localhost:3001/api/auth/google/callback',
    state: 'xyz',
  });
  assert.match(url, /^https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth\?/);
  assert.match(url, /client_id=abc\.apps\.googleusercontent\.com/);
  assert.match(url, /redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fapi%2Fauth%2Fgoogle%2Fcallback/);
  assert.match(url, /scope=openid\+email\+profile/);
  assert.match(url, /state=xyz/);
});

function fetchMock({ tokenOk = true, userinfoOk = true } = {}) {
  return async (url) => {
    if (url.startsWith('https://oauth2.googleapis.com/token')) {
      if (!tokenOk) return { ok: false, status: 400, text: async () => 'invalid_grant' };
      return { ok: true, json: async () => ({ access_token: 'fake-access-token' }) };
    }
    if (url.startsWith('https://openidconnect.googleapis.com/v1/userinfo')) {
      if (!userinfoOk) return { ok: false, status: 401 };
      return {
        ok: true,
        json: async () => ({
          sub: 'google-123',
          email: 'coach@example.com',
          name: 'Coach Test',
          picture: 'https://example.com/avatar.jpg',
        }),
      };
    }
    throw new Error(`URL inattendue dans le test : ${url}`);
  };
}

test('echangerCodeContreProfil renvoie le profil normalisé à partir du code', async () => {
  const profil = await echangerCodeContreProfil(
    { code: 'fake-code', clientId: 'id', clientSecret: 'secret', redirectUri: 'http://localhost/callback' },
    fetchMock()
  );
  assert.deepEqual(profil, {
    googleId: 'google-123',
    email: 'coach@example.com',
    nom: 'Coach Test',
    avatarUrl: 'https://example.com/avatar.jpg',
  });
});

test('echangerCodeContreProfil lève une erreur si l\'échange du code échoue', async () => {
  await assert.rejects(
    () =>
      echangerCodeContreProfil(
        { code: 'bad', clientId: 'id', clientSecret: 'secret', redirectUri: 'http://localhost/callback' },
        fetchMock({ tokenOk: false })
      ),
    /Échange du code Google échoué/
  );
});

test('echangerCodeContreProfil lève une erreur si la récupération du profil échoue', async () => {
  await assert.rejects(
    () =>
      echangerCodeContreProfil(
        { code: 'ok', clientId: 'id', clientSecret: 'secret', redirectUri: 'http://localhost/callback' },
        fetchMock({ userinfoOk: false })
      ),
    /Récupération du profil Google échouée/
  );
});
