// Correspondance automatique nom d'exercice -> illustration de démonstration —
// cahier des charges section 3.3 / US-2.5.
//
// Source : free-exercise-db (github.com/yuhonas/free-exercise-db), jeu de données du domaine public,
// sans clé d'API ni inscription. Décision assumée : la vraie base ExerciseDB citée dans le cahier des
// charges exige soit une clé RapidAPI (quota gratuit très restrictif), soit un auto-hébergement — hors
// de portée d'un agent autonome, même limite que la création des comptes Render/Netlify en Phase 7.
// Cette source fournit des photos fixes (position de départ/fin), pas un GIF animé ; on assume ce
// compromis pour livrer une fonctionnalité qui marche réellement plutôt qu'une intégration non testable.
//
// Ne couvre que les noms d'exercice standards utilisés par la bibliothèque de splits (voir
// splitTemplates.js) : un exercice personnalisé ne matchera jamais et l'appelant doit alors retomber
// sur le lien vidéo du coach, conformément à la section 3.3.

const EXERCISES_JSON_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMAGES_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

// Nom d'exercice de l'app (normalisé) -> nom exact dans free-exercise-db.
const TRADUCTIONS = {
  squat: 'Barbell Squat',
  'developpe couche': 'Barbell Bench Press - Medium Grip',
  'rowing barre': 'Bent Over Barbell Row',
  'developpe militaire': 'Standing Military Press',
  'souleve de terre roumain': 'Romanian Deadlift',
  gainage: 'Plank',
  'tirage vertical': 'Wide-Grip Lat Pulldown',
  'curl biceps': 'Barbell Curl',
  'curl biceps barre': 'Barbell Curl',
  'extension triceps': 'Cable Lying Triceps Extension',
  'extension triceps poulie': 'Triceps Pushdown',
  fentes: 'Dumbbell Lunges',
  'leg curl': 'Lying Leg Curls',
  'mollets debout': 'Standing Calf Raises',
  dips: 'Parallel Bar Dip',
  'elevations laterales': 'Side Lateral Raise',
  'elevations arriere': 'Lying Rear Delt Raise',
  tractions: 'Pullups',
  'face pull': 'Face Pull',
  'presse a cuisses': 'Leg Press',
  'developpe incline halteres': 'Incline Dumbbell Press',
  'ecarte couche': 'Dumbbell Flyes',
  'rowing haltere': 'One-Arm Dumbbell Row',
  shrugs: 'Dumbbell Shrug',
  'curl marteau': 'Hammer Curls',
};

const DIACRITIQUES = new RegExp('[̀-ͯ]', 'g');

function normaliser(nom) {
  return nom.normalize('NFD').replace(DIACRITIQUES, '').toLowerCase().trim();
}

let datasetParNomAnglais = null; // cache mémoire du jeu de données externe, chargé une seule fois
const cacheGif = new Map(); // nom normalisé -> gifUrl | null — cache local pour limiter les appels externes (T9.8)

async function chargerDataset(fetchImpl) {
  if (datasetParNomAnglais) return datasetParNomAnglais;
  const res = await fetchImpl(EXERCISES_JSON_URL);
  if (!res.ok) throw new Error(`Impossible de charger la base d'exercices (HTTP ${res.status})`);
  const data = await res.json();
  datasetParNomAnglais = new Map(data.map((e) => [e.name.toLowerCase(), e]));
  return datasetParNomAnglais;
}

export async function chercherGifExercice(nomExercice, fetchImpl = fetch) {
  const cle = normaliser(nomExercice);
  if (cacheGif.has(cle)) return cacheGif.get(cle);

  const nomAnglais = TRADUCTIONS[cle];
  if (!nomAnglais) {
    cacheGif.set(cle, null);
    return null;
  }

  const dataset = await chargerDataset(fetchImpl);
  const exercice = dataset.get(nomAnglais.toLowerCase());
  const gifUrl = exercice?.images?.[0] ? IMAGES_BASE_URL + exercice.images[0] : null;
  cacheGif.set(cle, gifUrl);
  return gifUrl;
}

export function _reinitialiserCachePourTests() {
  datasetParNomAnglais = null;
  cacheGif.clear();
}
