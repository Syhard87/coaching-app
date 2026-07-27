import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { chercherGifExercice, _reinitialiserCachePourTests } from './exerciceGifs.js';

const FAUX_DATASET = [
  { name: 'Barbell Squat', images: ['Barbell_Squat/0.jpg', 'Barbell_Squat/1.jpg'] },
  { name: 'Face Pull', images: ['Face_Pull/0.jpg'] },
];

function fetchMock(compteur) {
  return async () => {
    compteur.appels++;
    return { ok: true, json: async () => FAUX_DATASET };
  };
}

beforeEach(() => {
  _reinitialiserCachePourTests();
});

test('retourne le gifUrl pour un exercice standard connu', async () => {
  const compteur = { appels: 0 };
  const url = await chercherGifExercice('Squat', fetchMock(compteur));
  assert.equal(url, 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg');
  assert.equal(compteur.appels, 1);
});

test('ignore les accents et la casse du nom saisi', async () => {
  const compteur = { appels: 0 };
  const url = await chercherGifExercice('FACE PULL', fetchMock(compteur));
  assert.equal(url, 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg');
});

test('retourne null pour un exercice personnalisé sans correspondance, sans appeler le fetch', async () => {
  const compteur = { appels: 0 };
  const url = await chercherGifExercice('Mouvement inventé par le coach', fetchMock(compteur));
  assert.equal(url, null);
  assert.equal(compteur.appels, 0);
});

test('met en cache le résultat : un second appel ne relance pas le fetch', async () => {
  const compteur = { appels: 0 };
  await chercherGifExercice('Squat', fetchMock(compteur));
  await chercherGifExercice('Squat', fetchMock(compteur));
  assert.equal(compteur.appels, 1);
});
