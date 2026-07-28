import {
  OBJECTIFS,
  SEXES,
  NIVEAUX_ACTIVITE,
  HORAIRES_TRAVAIL,
  EXPERIENCES,
  JOURS_SEMAINE,
  CRENEAUX,
} from '../lib/constants';

// Champs du profil (identité, objectif, notes santé, disponibilités) — cahier des charges
// section 4.1. Extrait de l'ancien ClientFormPage pour être réutilisé par l'onglet Bilan (T10.4)
// et par la création d'un nouveau client.
export function ClientProfilFields({ form, setField, grid, toggleSlot }) {
  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-graphite-700">Nom *</label>
          <input
            required
            value={form.nom}
            onChange={(e) => setField('nom', e.target.value)}
            className="mt-1 w-full rounded border border-chalk-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-graphite-700">Objectif *</label>
          <select
            required
            value={form.objectif}
            onChange={(e) => setField('objectif', e.target.value)}
            className="mt-1 w-full rounded border border-chalk-300 px-3 py-2 text-sm"
          >
            <option value="">— Choisir —</option>
            {OBJECTIFS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-graphite-700">Âge</label>
          <input
            type="number"
            min="0"
            value={form.age}
            onChange={(e) => setField('age', e.target.value)}
            className="mt-1 w-full rounded border border-chalk-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-graphite-700">Sexe</label>
          <select
            value={form.sexe}
            onChange={(e) => setField('sexe', e.target.value)}
            className="mt-1 w-full rounded border border-chalk-300 px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {SEXES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-graphite-700">Taille (cm)</label>
          <input
            type="number"
            min="0"
            value={form.tailleCm}
            onChange={(e) => setField('tailleCm', e.target.value)}
            className="mt-1 w-full rounded border border-chalk-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-graphite-700">Poids initial (kg)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={form.poidsInitial}
            onChange={(e) => setField('poidsInitial', e.target.value)}
            className="mt-1 w-full rounded border border-chalk-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-graphite-700">Niveau d'activité</label>
          <select
            value={form.niveauActivite}
            onChange={(e) => setField('niveauActivite', e.target.value)}
            className="mt-1 w-full rounded border border-chalk-300 px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {NIVEAUX_ACTIVITE.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-graphite-700">Expérience sportive</label>
          <select
            value={form.experienceSportive}
            onChange={(e) => setField('experienceSportive', e.target.value)}
            className="mt-1 w-full rounded border border-chalk-300 px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {EXPERIENCES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-graphite-700">Profession</label>
          <input
            value={form.profession}
            onChange={(e) => setField('profession', e.target.value)}
            className="mt-1 w-full rounded border border-chalk-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-graphite-700">Horaires de travail</label>
          <select
            value={form.horaireTravail}
            onChange={(e) => setField('horaireTravail', e.target.value)}
            className="mt-1 w-full rounded border border-chalk-300 px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {HORAIRES_TRAVAIL.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <label className="block text-sm font-medium text-graphite-700">Notes santé</label>
        <textarea
          rows={3}
          value={form.notesSante}
          onChange={(e) => setField('notesSante', e.target.value)}
          className="mt-1 w-full rounded border border-chalk-300 px-3 py-2 text-sm"
        />
        <label className="mt-2 flex items-center gap-2 text-sm text-graphite-700">
          <input
            type="checkbox"
            checked={form.suiviMedical}
            onChange={(e) => setField('suiviMedical', e.target.checked)}
          />
          Suivi médical en cours
        </label>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-graphite-700">Disponibilités hebdomadaires (optionnel)</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-1 text-left text-xs font-medium text-graphite-500"></th>
                {CRENEAUX.map((c) => (
                  <th key={c.value} className="p-1 text-xs font-medium text-graphite-500">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {JOURS_SEMAINE.map((jour) => (
                <tr key={jour.value}>
                  <td className="p-1 text-graphite-700">{jour.label}</td>
                  {CRENEAUX.map((creneau) => (
                    <td key={creneau.value} className="p-1 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(grid[`${jour.value}_${creneau.value}`])}
                        onChange={() => toggleSlot(jour.value, creneau.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export const EMPTY_CLIENT_FORM = {
  nom: '',
  objectif: '',
  age: '',
  sexe: '',
  tailleCm: '',
  poidsInitial: '',
  notesSante: '',
  suiviMedical: false,
  niveauActivite: '',
  profession: '',
  horaireTravail: '',
  experienceSportive: '',
};

export function disponibilitesToGrid(disponibilites = []) {
  const grid = {};
  for (const d of disponibilites) {
    if (d.disponible) grid[`${d.jourSemaine}_${d.creneau}`] = true;
  }
  return grid;
}

export function gridToDisponibilites(grid) {
  return Object.keys(grid)
    .filter((k) => grid[k])
    .map((k) => {
      const [jourSemaine, creneau] = k.split('_');
      return { jourSemaine, creneau, disponible: true };
    });
}

export function clientToForm(client) {
  return {
    nom: client.nom || '',
    objectif: client.objectif || '',
    age: client.age ?? '',
    sexe: client.sexe || '',
    tailleCm: client.tailleCm ?? '',
    poidsInitial: client.poidsInitial ?? '',
    notesSante: client.notesSante || '',
    suiviMedical: client.suiviMedical || false,
    niveauActivite: client.niveauActivite || '',
    profession: client.profession || '',
    horaireTravail: client.horaireTravail || '',
    experienceSportive: client.experienceSportive || '',
  };
}

export function formToPayload(form, grid) {
  return {
    nom: form.nom.trim(),
    objectif: form.objectif,
    age: form.age === '' ? undefined : Number(form.age),
    sexe: form.sexe || undefined,
    tailleCm: form.tailleCm === '' ? undefined : Number(form.tailleCm),
    poidsInitial: form.poidsInitial === '' ? undefined : Number(form.poidsInitial),
    notesSante: form.notesSante || undefined,
    suiviMedical: form.suiviMedical,
    niveauActivite: form.niveauActivite || undefined,
    profession: form.profession || undefined,
    horaireTravail: form.horaireTravail || undefined,
    experienceSportive: form.experienceSportive || undefined,
    disponibilites: gridToDisponibilites(grid),
  };
}
