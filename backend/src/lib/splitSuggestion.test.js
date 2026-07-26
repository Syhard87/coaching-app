import { test } from 'node:test';
import assert from 'node:assert/strict';
import { suggererSplit, compterJoursDisponibles } from './splitSuggestion.js';

test('2 jours disponibles -> full body', () => {
  assert.equal(
    suggererSplit({ joursDisponibles: 2, experienceSportive: 'DEBUTANT', horaireTravail: 'BUREAU' }),
    'FULL_BODY'
  );
});

test('3 jours, débutant -> full body', () => {
  assert.equal(
    suggererSplit({ joursDisponibles: 3, experienceSportive: 'DEBUTANT', horaireTravail: 'BUREAU' }),
    'FULL_BODY'
  );
});

test('3 jours, confirmé -> half body', () => {
  assert.equal(
    suggererSplit({ joursDisponibles: 3, experienceSportive: 'CONFIRME', horaireTravail: 'BUREAU' }),
    'HALF_BODY'
  );
});

test('4 jours -> half body quelle que soit l\'expérience', () => {
  assert.equal(
    suggererSplit({ joursDisponibles: 4, experienceSportive: 'DEBUTANT', horaireTravail: 'BUREAU' }),
    'HALF_BODY'
  );
});

test('5 jours, intermédiaire -> PPL', () => {
  assert.equal(
    suggererSplit({ joursDisponibles: 5, experienceSportive: 'INTERMEDIAIRE', horaireTravail: 'BUREAU' }),
    'PPL'
  );
});

test('5 jours, confirmé -> bro split', () => {
  assert.equal(
    suggererSplit({ joursDisponibles: 5, experienceSportive: 'CONFIRME', horaireTravail: 'BUREAU' }),
    'BRO_SPLIT'
  );
});

test('6 jours -> PPL (cycle répété)', () => {
  assert.equal(
    suggererSplit({ joursDisponibles: 6, experienceSportive: 'CONFIRME', horaireTravail: 'BUREAU' }),
    'PPL'
  );
});

test('horaires irréguliers -> full body même avec 5 jours confirmé', () => {
  assert.equal(
    suggererSplit({ joursDisponibles: 5, experienceSportive: 'CONFIRME', horaireTravail: 'IRREGULIER' }),
    'FULL_BODY'
  );
});

test('compterJoursDisponibles ignore les doublons de jour et les créneaux non disponibles', () => {
  const dispos = [
    { jourSemaine: 'LUNDI', creneau: 'MATIN', disponible: true },
    { jourSemaine: 'LUNDI', creneau: 'SOIR', disponible: true },
    { jourSemaine: 'MARDI', creneau: 'MIDI', disponible: false },
    { jourSemaine: 'MERCREDI', creneau: 'SOIR', disponible: true },
  ];
  assert.equal(compterJoursDisponibles(dispos), 2);
});
