import { test } from 'node:test';
import assert from 'node:assert/strict';
import { versCSV } from './csv.js';

test('versCSV : tableau vide -> chaîne vide', () => {
  assert.equal(versCSV([]), '');
});

test('versCSV : entête + lignes dans l\'ordre des colonnes fournies', () => {
  const csv = versCSV(
    [
      { nom: 'Alice', age: 30 },
      { nom: 'Bob', age: 25 },
    ],
    ['nom', 'age']
  );
  assert.equal(csv, 'nom,age\r\nAlice,30\r\nBob,25');
});

test('versCSV : échappe les virgules, guillemets et retours à la ligne', () => {
  const csv = versCSV([{ notes: 'Bonjour, "champion" !\nÀ bientôt' }], ['notes']);
  assert.equal(csv, 'notes\r\n"Bonjour, ""champion"" !\nÀ bientôt"');
});

test('versCSV : null/undefined deviennent des cellules vides', () => {
  const csv = versCSV([{ a: null, b: undefined, c: 0 }], ['a', 'b', 'c']);
  assert.equal(csv, 'a,b,c\r\n,,0');
});

test('versCSV : les dates sont sérialisées en ISO', () => {
  const csv = versCSV([{ date: new Date('2026-07-26T00:00:00.000Z') }], ['date']);
  assert.equal(csv, 'date\r\n2026-07-26T00:00:00.000Z');
});

test('versCSV : sans colonnes fournies, utilise les clés du premier objet', () => {
  const csv = versCSV([{ x: 1, y: 2 }]);
  assert.equal(csv, 'x,y\r\n1,2');
});
