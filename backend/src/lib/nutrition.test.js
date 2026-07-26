import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculerBMR,
  calculerTDEE,
  calculerCaloriesCible,
  calculerMacros,
  calculerObjectifsAuto,
} from './nutrition.js';

test('calculerBMR homme (Mifflin-St Jeor)', () => {
  assert.equal(calculerBMR({ sexe: 'HOMME', poidsKg: 80, tailleCm: 180, age: 30 }), 1780);
});

test('calculerBMR femme (Mifflin-St Jeor)', () => {
  assert.equal(calculerBMR({ sexe: 'FEMME', poidsKg: 60, tailleCm: 165, age: 25 }), 1345.25);
});

test('calculerTDEE applique le facteur d\'activité', () => {
  assert.equal(calculerTDEE(1780, 'MODEREMENT_ACTIF'), 2759);
  assert.equal(calculerTDEE(1345.25, 'SEDENTAIRE'), 1614.3);
});

test('calculerCaloriesCible applique l\'ajustement selon l\'objectif', () => {
  assert.equal(calculerCaloriesCible(2759, 'DEFICIT_MODERE'), 2259);
  assert.equal(calculerCaloriesCible(2759, 'DEFICIT_LEGER'), 2509);
  assert.equal(calculerCaloriesCible(2759, 'SURPLUS_LEGER'), 3009);
  assert.equal(calculerCaloriesCible(2759, 'SURPLUS_MODERE'), 3259);
  assert.equal(calculerCaloriesCible(2759, 'MAINTIEN'), 2759);
});

test('calculerMacros répartit protéines/lipides par kg puis glucides sur le reste', () => {
  const macros = calculerMacros({ caloriesCible: 2259, poidsKg: 80 });
  assert.equal(macros.proteinesCible, 176);
  assert.equal(macros.lipidesCible, 80);
  assert.equal(macros.glucidesCible, 209);
});

test('calculerMacros ne descend jamais sous zéro glucides', () => {
  const macros = calculerMacros({ caloriesCible: 500, poidsKg: 100 });
  assert.equal(macros.glucidesCible, 0);
});

test('calculerObjectifsAuto — homme, déficit modéré, activité modérée', () => {
  const result = calculerObjectifsAuto({
    sexe: 'HOMME',
    poidsKg: 80,
    tailleCm: 180,
    age: 30,
    niveauActivite: 'MODEREMENT_ACTIF',
    typeObjectifCalorique: 'DEFICIT_MODERE',
  });
  assert.deepEqual(result, {
    tdeeCalcule: 2759,
    caloriesCible: 2259,
    proteinesCible: 176,
    lipidesCible: 80,
    glucidesCible: 209,
  });
});

test('calculerObjectifsAuto — femme, maintien, sédentaire', () => {
  const result = calculerObjectifsAuto({
    sexe: 'FEMME',
    poidsKg: 60,
    tailleCm: 165,
    age: 25,
    niveauActivite: 'SEDENTAIRE',
    typeObjectifCalorique: 'MAINTIEN',
  });
  assert.deepEqual(result, {
    tdeeCalcule: 1614,
    caloriesCible: 1614,
    proteinesCible: 132,
    lipidesCible: 60,
    glucidesCible: 137,
  });
});

test('calculerObjectifsAuto — homme, surplus léger, très actif', () => {
  const result = calculerObjectifsAuto({
    sexe: 'HOMME',
    poidsKg: 70,
    tailleCm: 175,
    age: 22,
    niveauActivite: 'TRES_ACTIF',
    typeObjectifCalorique: 'SURPLUS_LEGER',
  });
  assert.deepEqual(result, {
    tdeeCalcule: 2913,
    caloriesCible: 3163,
    proteinesCible: 154,
    lipidesCible: 70,
    glucidesCible: 479,
  });
});
