import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculerInactivite, semaineActuelleIndex, debutSemaineCourante } from './dashboard.js';

test('calculerInactivite : jamais mesuré -> inactif, jours null', () => {
  assert.deepEqual(calculerInactivite(null, 30, new Date('2026-07-26')), {
    joursDepuisDerniereMesure: null,
    inactif: true,
  });
});

test('calculerInactivite : sous le seuil -> actif', () => {
  const res = calculerInactivite('2026-07-24', 30, new Date('2026-07-26'));
  assert.equal(res.joursDepuisDerniereMesure, 2);
  assert.equal(res.inactif, false);
});

test('calculerInactivite : au-delà du seuil -> inactif', () => {
  const res = calculerInactivite('2026-05-01', 30, new Date('2026-07-26'));
  assert.equal(res.joursDepuisDerniereMesure, 86);
  assert.equal(res.inactif, true);
});

test('semaineActuelleIndex : cycle sans dateDebut -> null', () => {
  assert.equal(semaineActuelleIndex(null, 8, new Date('2026-07-26')), null);
});

test('semaineActuelleIndex : cycle pas encore commencé -> null', () => {
  assert.equal(semaineActuelleIndex('2026-08-01', 8, new Date('2026-07-26')), null);
});

test('semaineActuelleIndex : première semaine (jour 0)', () => {
  assert.equal(semaineActuelleIndex('2026-07-26', 8, new Date('2026-07-26')), 1);
});

test('semaineActuelleIndex : quatrième semaine (jour 22)', () => {
  assert.equal(semaineActuelleIndex('2026-07-01', 8, new Date('2026-07-23')), 4);
});

test('semaineActuelleIndex : cycle terminé -> null', () => {
  assert.equal(semaineActuelleIndex('2026-01-01', 4, new Date('2026-07-26')), null);
});

test('debutSemaineCourante : mercredi -> lundi de la même semaine', () => {
  // 2026-07-29 est un mercredi
  const lundi = debutSemaineCourante(new Date('2026-07-29T15:00:00'));
  assert.equal(lundi.toISOString().slice(0, 10), '2026-07-27');
});

test('debutSemaineCourante : dimanche -> lundi précédent', () => {
  // 2026-08-02 est un dimanche
  const lundi = debutSemaineCourante(new Date('2026-08-02T10:00:00'));
  assert.equal(lundi.toISOString().slice(0, 10), '2026-07-27');
});
