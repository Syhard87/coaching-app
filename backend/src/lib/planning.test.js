import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estHeureValide, estPlageValide } from './planning.js';

test('estHeureValide : accepte un format HH:mm valide', () => {
  assert.equal(estHeureValide('09:00'), true);
  assert.equal(estHeureValide('23:59'), true);
});

test('estHeureValide : rejette un format invalide', () => {
  assert.equal(estHeureValide('24:00'), false);
  assert.equal(estHeureValide('9:00'), false);
  assert.equal(estHeureValide('09:60'), false);
  assert.equal(estHeureValide(''), false);
  assert.equal(estHeureValide(undefined), false);
});

test('estPlageValide : accepte une plage où le début précède la fin', () => {
  assert.equal(estPlageValide('09:00', '10:30'), true);
});

test('estPlageValide : rejette une plage inversée ou égale', () => {
  assert.equal(estPlageValide('10:00', '09:00'), false);
  assert.equal(estPlageValide('10:00', '10:00'), false);
});

test('estPlageValide : rejette si une des deux heures est invalide', () => {
  assert.equal(estPlageValide('25:00', '10:00'), false);
  assert.equal(estPlageValide('09:00', 'abc'), false);
});
