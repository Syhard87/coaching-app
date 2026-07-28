import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculerDateFin, CATALOGUE_DEFAUT } from './abonnements.js';

test('calculerDateFin : ajoute la durée en mois à la date de début', () => {
  const fin = calculerDateFin('2026-07-28', 3);
  assert.equal(fin.toISOString().slice(0, 10), '2026-10-28');
});

test('calculerDateFin : gère le passage d\'année', () => {
  const fin = calculerDateFin('2026-11-15', 6);
  assert.equal(fin.toISOString().slice(0, 10), '2027-05-15');
});

test('CATALOGUE_DEFAUT : couvre Sport, Diète et Pack Complet sur 1/3/6 mois', () => {
  assert.equal(CATALOGUE_DEFAUT.length, 9);
  for (const module of ['SPORT', 'DIETE', 'PACK_COMPLET']) {
    const durees = CATALOGUE_DEFAUT.filter((c) => c.module === module).map((c) => c.dureeMois);
    assert.deepEqual(durees.sort(), [1, 3, 6]);
  }
});
