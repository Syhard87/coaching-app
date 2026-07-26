// Bibliothèque de modèles de split — cahier des charges section 3.3.
// Structures pré-remplies (jours + exercices), destinées à être personnalisées
// par le coach après application sur un programme.

function exo(nom, series, reps, tempsRepos) {
  return { nom, series, reps, tempsRepos, chargeCible: null, notes: null, lienVideo: null };
}

export const SPLIT_ARCHETYPES = {
  FULL_BODY: {
    label: 'Full body',
    description: 'Tout le corps à chaque séance — adapté aux emplois du temps chargés (2-3 j/sem.)',
    jours: [
      {
        nom: 'Full Body',
        exercices: [
          exo('Squat', 3, '8-12', 90),
          exo('Développé couché', 3, '8-12', 90),
          exo('Rowing barre', 3, '8-12', 90),
          exo('Développé militaire', 3, '8-12', 90),
          exo('Soulevé de terre roumain', 3, '10-12', 90),
          exo('Gainage', 3, '30-45s', 60),
        ],
      },
    ],
  },
  HALF_BODY: {
    label: 'Half body (Upper/Lower)',
    description: 'Alternance haut du corps / bas du corps — 4 jours/semaine',
    jours: [
      {
        nom: 'Haut du corps',
        exercices: [
          exo('Développé couché', 4, '8-12', 90),
          exo('Rowing barre', 4, '8-12', 90),
          exo('Développé militaire', 3, '8-12', 90),
          exo('Tirage vertical', 3, '10-12', 75),
          exo('Curl biceps', 3, '10-15', 60),
          exo('Extension triceps', 3, '10-15', 60),
        ],
      },
      {
        nom: 'Bas du corps',
        exercices: [
          exo('Squat', 4, '8-12', 120),
          exo('Soulevé de terre roumain', 3, '10-12', 90),
          exo('Fentes', 3, '10-12', 75),
          exo('Leg curl', 3, '10-15', 60),
          exo('Mollets debout', 4, '12-20', 45),
        ],
      },
    ],
  },
  PPL: {
    label: 'Push / Pull / Legs',
    description: 'Poussée, tirage, jambes — 3, 5 ou 6 jours/semaine selon répétition du cycle',
    jours: [
      {
        nom: 'Push',
        exercices: [
          exo('Développé couché', 4, '8-12', 90),
          exo('Développé militaire', 3, '8-12', 90),
          exo('Dips', 3, '8-12', 75),
          exo('Élévations latérales', 3, '12-15', 60),
          exo('Extension triceps', 3, '10-15', 60),
        ],
      },
      {
        nom: 'Pull',
        exercices: [
          exo('Tractions', 4, '6-10', 90),
          exo('Rowing barre', 4, '8-12', 90),
          exo('Tirage vertical', 3, '10-12', 75),
          exo('Curl biceps', 3, '10-15', 60),
          exo('Face pull', 3, '12-15', 60),
        ],
      },
      {
        nom: 'Legs',
        exercices: [
          exo('Squat', 4, '8-12', 120),
          exo('Soulevé de terre roumain', 3, '10-12', 90),
          exo('Presse à cuisses', 3, '10-15', 90),
          exo('Leg curl', 3, '10-15', 60),
          exo('Mollets debout', 4, '12-20', 45),
        ],
      },
    ],
  },
  BRO_SPLIT: {
    label: 'Bro split',
    description: 'Un groupe musculaire par séance — 5 jours/semaine, profil expérimenté',
    jours: [
      {
        nom: 'Pectoraux',
        exercices: [
          exo('Développé couché', 4, '8-12', 90),
          exo('Développé incliné haltères', 3, '8-12', 90),
          exo('Écarté couché', 3, '10-15', 60),
          exo('Dips', 3, '8-12', 75),
        ],
      },
      {
        nom: 'Dos',
        exercices: [
          exo('Tractions', 4, '6-10', 90),
          exo('Rowing barre', 4, '8-12', 90),
          exo('Tirage vertical', 3, '10-12', 75),
          exo('Rowing haltère', 3, '10-12', 75),
        ],
      },
      {
        nom: 'Jambes',
        exercices: [
          exo('Squat', 4, '8-12', 120),
          exo('Presse à cuisses', 3, '10-15', 90),
          exo('Leg curl', 3, '10-15', 60),
          exo('Mollets debout', 4, '12-20', 45),
        ],
      },
      {
        nom: 'Épaules',
        exercices: [
          exo('Développé militaire', 4, '8-12', 90),
          exo('Élévations latérales', 3, '12-15', 60),
          exo('Élévations arrière', 3, '12-15', 60),
          exo('Shrugs', 3, '10-15', 60),
        ],
      },
      {
        nom: 'Bras',
        exercices: [
          exo('Curl biceps barre', 3, '10-12', 60),
          exo('Curl marteau', 3, '10-15', 60),
          exo('Extension triceps poulie', 3, '10-15', 60),
          exo('Dips', 3, '8-12', 75),
        ],
      },
    ],
  },
};
