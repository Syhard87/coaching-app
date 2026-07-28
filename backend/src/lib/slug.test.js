import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify, estSlugValide } from './slug.js';

test('slugify met en minuscules et remplace les espaces par des tirets', () => {
  assert.equal(slugify('Antoine Morellet'), 'antoine-morellet');
});

test('slugify enlève les accents', () => {
  assert.equal(slugify('Éric Nguyễn-Dupont'), 'eric-nguyen-dupont');
});

test('slugify supprime la ponctuation et les tirets en trop', () => {
  assert.equal(slugify('  Coach Pro !! '), 'coach-pro');
});

test('estSlugValide accepte un slug bien formé', () => {
  assert.equal(estSlugValide('antoine-morellet'), true);
});

test('estSlugValide refuse majuscules, espaces ou caractères spéciaux', () => {
  assert.equal(estSlugValide('Antoine_Morellet'), false);
  assert.equal(estSlugValide('antoine morellet'), false);
  assert.equal(estSlugValide('-antoine'), false);
});
