import { test } from 'node:test';
import assert from 'node:assert/strict';
import { genererMessageRecap } from './message.js';

const CLIENT_SENSIBLE = {
  nom: 'Marie Curie',
  notesSante: 'Antécédents cardiaques, sous traitement bêta-bloquant',
  suiviMedical: true,
};

test('genererMessageRecap ne fait jamais fuiter notesSante ou suiviMedical', () => {
  const message = genererMessageRecap({
    client: CLIENT_SENSIBLE,
    derniereSeance: {
      date: '2026-07-22',
      ressenti: 7,
      jour: { nom: 'Full Body' },
    },
    derniereMesure: { date: '2026-07-25', poids: 70 },
    objectifDiete: { caloriesCible: 2200 },
  });

  assert.ok(!message.includes('cardiaque'));
  assert.ok(!message.includes(CLIENT_SENSIBLE.notesSante));
  assert.ok(!message.toLowerCase().includes('suivi médical'));
  assert.ok(!message.toLowerCase().includes('suivi medical'));
});

test("genererMessageRecap ne fait jamais fuiter notesSante ou suiviMedical même sans séance/mesure/objectif", () => {
  const message = genererMessageRecap({
    client: CLIENT_SENSIBLE,
    derniereSeance: null,
    derniereMesure: null,
    objectifDiete: null,
  });

  assert.ok(!message.includes(CLIENT_SENSIBLE.notesSante));
  assert.ok(!message.toLowerCase().includes('suivi médical'));
  assert.equal(message.includes('Marie Curie'), true);
});

test('genererMessageRecap inclut bien séance, mesure et objectif quand fournis', () => {
  const message = genererMessageRecap({
    client: { nom: 'Alice' },
    derniereSeance: { date: '2026-07-22', ressenti: 7, jour: { nom: 'Full Body' } },
    derniereMesure: { date: '2026-07-25', poids: 70 },
    objectifDiete: { caloriesCible: 2200 },
  });

  assert.ok(message.includes('Full Body'));
  assert.ok(message.includes('7/10'));
  assert.ok(message.includes('70 kg'));
  assert.ok(message.includes('2200 kcal/jour'));
});
