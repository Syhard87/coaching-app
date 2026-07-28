import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { clientsApi, seancesApi } from '../lib/api';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function exercicesDepuisJour(jour) {
  return jour.exercices.map((e) => ({
    nom: e.nom,
    chargeRealisee: e.chargeCible ?? '',
    repsRealisees: e.reps ?? '',
    notes: '',
  }));
}

export function SeanceFormPage() {
  const { clientId, seanceId } = useParams();
  const isEdit = Boolean(seanceId);
  const navigate = useNavigate();

  const [jours, setJours] = useState([]);
  const [jourId, setJourId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [ressenti, setRessenti] = useState('');
  const [notes, setNotes] = useState('');
  const [exercices, setExercices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loaders = [clientsApi.listJoursEntrainement(clientId)];
    if (isEdit) loaders.push(seancesApi.get(seanceId));

    Promise.all(loaders)
      .then(([jours, seance]) => {
        setJours(jours);
        if (seance) {
          setJourId(seance.jourId || '');
          setDate(seance.date.slice(0, 10));
          setRessenti(seance.ressenti ?? '');
          setNotes(seance.notes || '');
          setExercices(
            seance.exercicesRealises.map((e) => ({
              nom: e.nom,
              chargeRealisee: e.chargeRealisee ?? '',
              repsRealisees: e.repsRealisees ?? '',
              notes: e.notes ?? '',
            }))
          );
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [clientId, seanceId, isEdit]);

  function handleSelectJour(id) {
    setJourId(id);
    if (!id) return;
    const jour = jours.find((j) => j.id === id);
    if (jour) setExercices(exercicesDepuisJour(jour));
  }

  function updateExercice(idx, patch) {
    setExercices((ex) => ex.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
  }

  function addExercice() {
    setExercices((ex) => [...ex, { nom: '', chargeRealisee: '', repsRealisees: '', notes: '' }]);
  }

  function removeExercice(idx) {
    setExercices((ex) => ex.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError('La date est requise.');
      return;
    }

    const payload = {
      date,
      jourId: jourId || null,
      ressenti: ressenti === '' ? undefined : Number(ressenti),
      notes: notes || undefined,
      exercicesRealises: exercices
        .filter((e) => e.nom.trim())
        .map((e) => ({
          nom: e.nom.trim(),
          chargeRealisee: e.chargeRealisee === '' ? undefined : Number(e.chargeRealisee),
          repsRealisees: e.repsRealisees || undefined,
          notes: e.notes || undefined,
        })),
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await seancesApi.update(seanceId, payload);
      } else {
        await clientsApi.createSeance(clientId, payload);
      }
      navigate(`/clients/${clientId}/programme`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Chargement…</p>;

  return (
    <div className="max-w-2xl">
      <Link to={`/clients/${clientId}/programme`} className="text-sm text-gray-500 hover:underline">
        ← Séances
      </Link>
      <h1 className="mb-6 mt-2 text-xl font-medium text-gray-900">
        {isEdit ? 'Modifier la séance' : 'Nouvelle séance'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Jour de programme</label>
            <select
              value={jourId}
              onChange={(e) => handleSelectJour(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Séance libre</option>
              {jours.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.programme?.nom} — {j.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ressenti (RPE /10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={ressenti}
              onChange={(e) => setRessenti(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </section>

        <section>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </section>

        <section>
          <h2 className="mb-2 text-sm font-medium text-gray-700">Exercices réalisés</h2>
          <div className="space-y-2">
            {exercices.map((exo, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 text-sm">
                <input
                  value={exo.nom}
                  onChange={(e) => updateExercice(idx, { nom: e.target.value })}
                  placeholder="Exercice"
                  className="col-span-4 rounded border border-gray-300 px-2 py-1"
                />
                <input
                  type="number"
                  step="0.5"
                  value={exo.chargeRealisee}
                  onChange={(e) => updateExercice(idx, { chargeRealisee: e.target.value })}
                  placeholder="Charge (kg)"
                  className="col-span-2 rounded border border-gray-300 px-2 py-1"
                />
                <input
                  value={exo.repsRealisees}
                  onChange={(e) => updateExercice(idx, { repsRealisees: e.target.value })}
                  placeholder="Reps"
                  className="col-span-2 rounded border border-gray-300 px-2 py-1"
                />
                <input
                  value={exo.notes}
                  onChange={(e) => updateExercice(idx, { notes: e.target.value })}
                  placeholder="Notes"
                  className="col-span-3 rounded border border-gray-300 px-2 py-1"
                />
                <button
                  type="button"
                  onClick={() => removeExercice(idx)}
                  className="col-span-1 text-red-600 hover:underline"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addExercice}
            className="mt-2 text-sm text-gray-600 hover:underline"
          >
            + Ajouter un exercice
          </button>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer la séance'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/clients/${clientId}/programme`)}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
