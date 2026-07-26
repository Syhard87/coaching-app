export const OBJECTIFS = [
  { value: 'PRISE_DE_MASSE', label: 'Prise de masse' },
  { value: 'PERTE_DE_POIDS', label: 'Perte de poids' },
  { value: 'REMISE_EN_FORME', label: 'Remise en forme' },
  { value: 'PERFORMANCE', label: 'Performance' },
];

export const SEXES = [
  { value: 'HOMME', label: 'Homme' },
  { value: 'FEMME', label: 'Femme' },
];

export const NIVEAUX_ACTIVITE = [
  { value: 'SEDENTAIRE', label: 'Sédentaire' },
  { value: 'LEGEREMENT_ACTIF', label: 'Légèrement actif' },
  { value: 'MODEREMENT_ACTIF', label: 'Modérément actif' },
  { value: 'TRES_ACTIF', label: 'Très actif' },
  { value: 'EXTREMEMENT_ACTIF', label: 'Extrêmement actif' },
];

export const HORAIRES_TRAVAIL = [
  { value: 'BUREAU', label: 'Horaires de bureau' },
  { value: 'POSTE_3X8', label: 'Travail posté / 3x8' },
  { value: 'IRREGULIER', label: 'Horaires irréguliers' },
  { value: 'AUTRE', label: 'Autre' },
];

export const EXPERIENCES = [
  { value: 'DEBUTANT', label: 'Débutant' },
  { value: 'INTERMEDIAIRE', label: 'Intermédiaire' },
  { value: 'CONFIRME', label: 'Confirmé' },
];

export const JOURS_SEMAINE = [
  { value: 'LUNDI', label: 'Lundi' },
  { value: 'MARDI', label: 'Mardi' },
  { value: 'MERCREDI', label: 'Mercredi' },
  { value: 'JEUDI', label: 'Jeudi' },
  { value: 'VENDREDI', label: 'Vendredi' },
  { value: 'SAMEDI', label: 'Samedi' },
  { value: 'DIMANCHE', label: 'Dimanche' },
];

export const CRENEAUX = [
  { value: 'MATIN', label: 'Matin' },
  { value: 'MIDI', label: 'Midi' },
  { value: 'SOIR', label: 'Soir' },
];

function label(options, value) {
  return options.find((o) => o.value === value)?.label || value;
}

export const labelObjectif = (v) => label(OBJECTIFS, v);
export const labelSexe = (v) => label(SEXES, v);
export const labelNiveauActivite = (v) => label(NIVEAUX_ACTIVITE, v);
export const labelHoraireTravail = (v) => label(HORAIRES_TRAVAIL, v);
export const labelExperience = (v) => label(EXPERIENCES, v);
