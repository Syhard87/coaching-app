import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientsApi } from '../lib/api';
import {
  OBJECTIFS,
  SEXES,
  NIVEAUX_ACTIVITE,
  HORAIRES_TRAVAIL,
  EXPERIENCES,
  JOURS_SEMAINE,
  CRENEAUX,
} from '../lib/constants';

const EMPTY_FORM = {
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

function disponibilitesToGrid(disponibilites = []) {
  const grid = {};
  for (const d of disponibilites) {
    if (d.disponible) grid[`${d.jourSemaine}_${d.creneau}`] = true;
  }
  return grid;
}

function gridToDisponibilites(grid) {
  return Object.keys(grid)
    .filter((k) => grid[k])
    .map((k) => {
      const [jourSemaine, creneau] = k.split('_');
      return { jourSemaine, creneau, disponible: true };
    });
}

export function ClientFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [grid, setGrid] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    clientsApi
      .get(id)
      .then((client) => {
        setForm({
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
        });
        setGrid(disponibilitesToGrid(client.disponibilites));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleSlot(jour, creneau) {
    const key = `${jour}_${creneau}`;
    setGrid((g) => ({ ...g, [key]: !g[key] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.nom.trim() || !form.objectif) {
      setError('Le nom et l’objectif sont obligatoires.');
      return;
    }

    const payload = {
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

    setSubmitting(true);
    try {
      if (isEdit) {
        await clientsApi.update(id, payload);
        navigate(`/clients`);
      } else {
        const client = await clientsApi.create(payload);
        navigate(`/clients/${client.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Chargement…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-medium text-gray-900">
        {isEdit ? 'Modifier le client' : 'Nouveau client'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom *</label>
            <input
              required
              value={form.nom}
              onChange={(e) => setField('nom', e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Objectif *</label>
            <select
              required
              value={form.objectif}
              onChange={(e) => setField('objectif', e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
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
            <label className="block text-sm font-medium text-gray-700">Âge</label>
            <input
              type="number"
              min="0"
              value={form.age}
              onChange={(e) => setField('age', e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sexe</label>
            <select
              value={form.sexe}
              onChange={(e) => setField('sexe', e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
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
            <label className="block text-sm font-medium text-gray-700">Taille (cm)</label>
            <input
              type="number"
              min="0"
              value={form.tailleCm}
              onChange={(e) => setField('tailleCm', e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Poids initial (kg)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.poidsInitial}
              onChange={(e) => setField('poidsInitial', e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Niveau d'activité</label>
            <select
              value={form.niveauActivite}
              onChange={(e) => setField('niveauActivite', e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
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
            <label className="block text-sm font-medium text-gray-700">Expérience sportive</label>
            <select
              value={form.experienceSportive}
              onChange={(e) => setField('experienceSportive', e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
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
            <label className="block text-sm font-medium text-gray-700">Profession</label>
            <input
              value={form.profession}
              onChange={(e) => setField('profession', e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Horaires de travail</label>
            <select
              value={form.horaireTravail}
              onChange={(e) => setField('horaireTravail', e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
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
          <label className="block text-sm font-medium text-gray-700">Notes santé</label>
          <textarea
            rows={3}
            value={form.notesSante}
            onChange={(e) => setField('notesSante', e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.suiviMedical}
              onChange={(e) => setField('suiviMedical', e.target.checked)}
            />
            Suivi médical en cours
          </label>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-medium text-gray-700">
            Disponibilités hebdomadaires (optionnel)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-1 text-left text-xs font-medium text-gray-500"></th>
                  {CRENEAUX.map((c) => (
                    <th key={c.value} className="p-1 text-xs font-medium text-gray-500">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {JOURS_SEMAINE.map((jour) => (
                  <tr key={jour.value}>
                    <td className="p-1 text-gray-700">{jour.label}</td>
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer le client'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
