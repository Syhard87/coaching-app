import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculerModulesActifs } from './accesModules.js';

const MAINTENANT = new Date('2026-07-28');

test('calculerModulesActifs : aucun abonnement -> aucun module actif', () => {
  assert.deepEqual(calculerModulesActifs([], MAINTENANT), { sportActif: false, dieteActif: false });
});

test('calculerModulesActifs : abonnement SPORT non expiré -> sportActif seul', () => {
  const res = calculerModulesActifs([{ module: 'SPORT', dateFin: '2026-08-15' }], MAINTENANT);
  assert.deepEqual(res, { sportActif: true, dieteActif: false });
});

test('calculerModulesActifs : abonnement DIETE expiré -> aucun module actif', () => {
  const res = calculerModulesActifs([{ module: 'DIETE', dateFin: '2026-07-01' }], MAINTENANT);
  assert.deepEqual(res, { sportActif: false, dieteActif: false });
});

test('calculerModulesActifs : PACK_COMPLET non expiré -> les deux modules actifs', () => {
  const res = calculerModulesActifs([{ module: 'PACK_COMPLET', dateFin: '2026-09-01' }], MAINTENANT);
  assert.deepEqual(res, { sportActif: true, dieteActif: true });
});

test('calculerModulesActifs : plusieurs abonnements, un seul encore valide', () => {
  const res = calculerModulesActifs(
    [
      { module: 'SPORT', dateFin: '2026-06-01' },
      { module: 'DIETE', dateFin: '2026-12-01' },
    ],
    MAINTENANT
  );
  assert.deepEqual(res, { sportActif: false, dieteActif: true });
});
