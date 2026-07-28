import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cyclesApi, programmesApi, semainesApi } from '../lib/api';
import { STATUTS_SEMAINE } from '../lib/constants';

const STATUT_COLORS = {
  NORMALE: 'bg-gray-100 text-gray-700 border-gray-300',
  DELOAD: 'bg-amber-100 text-amber-800 border-amber-300',
  TEST: 'bg-blue-100 text-blue-800 border-blue-300',
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Reflet côté client de backend/src/lib/dashboard.js::semaineActuelleIndex — purement indicatif
// pour l'affichage (le tableau de bord côté serveur reste la source de vérité).
function semaineActuelleIndex(dateDebut, dureeSemaines) {
  if (!dateDebut) return null;
  const joursEcoules = Math.floor((Date.now() - new Date(dateDebut).getTime()) / 86_400_000);
  if (joursEcoules < 0) return null;
  const numero = Math.floor(joursEcoules / 7) + 1;
  return numero > dureeSemaines ? null : numero;
}

export function ProgrammeCalendarPage() {
  const { clientId, programmeId } = useParams();
  const [programme, setProgramme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCycleNom, setNewCycleNom] = useState('');
  const [newCycleDuree, setNewCycleDuree] = useState(4);
  const [newCycleDateDebut, setNewCycleDateDebut] = useState(todayISO());
  const [creatingCycle, setCreatingCycle] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    programmesApi
      .get(programmeId)
      .then(setProgramme)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [programmeId]);

  useEffect(load, [load]);

  async function handleCreateCycle(e) {
    e.preventDefault();
    if (!newCycleNom.trim() || !newCycleDuree) return;
    setCreatingCycle(true);
    try {
      await programmesApi.createCycle(programmeId, {
        nom: newCycleNom.trim(),
        dureeSemaines: Number(newCycleDuree),
        dateDebut: newCycleDateDebut || null,
      });
      setNewCycleNom('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingCycle(false);
    }
  }

  async function handleDeleteCycle(cycleId) {
    if (!window.confirm('Supprimer ce cycle et toutes ses semaines ?')) return;
    await cyclesApi.remove(cycleId);
    load();
  }

  async function handleDateDebutChange(cycleId, dateDebut) {
    await cyclesApi.update(cycleId, { dateDebut: dateDebut || null });
    load();
  }

  async function handleStatutChange(semaineId, statut) {
    await semainesApi.update(semaineId, { statut });
    load();
  }

  async function handleNotesChange(semaineId, notes) {
    await semainesApi.update(semaineId, { notes });
    load();
  }

  if (loading) return <p className="text-sm text-gray-500">Chargement…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl">
      <Link to={`/clients/${clientId}/programme`} className="text-sm text-gray-500 hover:underline">
        ← Programmes
      </Link>
      <h1 className="mb-6 mt-2 text-xl font-medium text-gray-900">
        Calendrier — {programme.nom}
      </h1>

      <div className="space-y-6">
        {programme.cycles.map((cycle) => {
          const numeroActuel = semaineActuelleIndex(cycle.dateDebut, cycle.dureeSemaines);
          return (
            <div key={cycle.id} className="rounded border border-gray-200 bg-white p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-medium text-gray-900">
                  {cycle.nom} <span className="text-sm text-gray-500">({cycle.dureeSemaines} semaines)</span>
                </h2>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-600">
                    Début :{' '}
                    <input
                      type="date"
                      defaultValue={cycle.dateDebut ? cycle.dateDebut.slice(0, 10) : ''}
                      onBlur={(e) => handleDateDebutChange(cycle.id, e.target.value)}
                      className="rounded border border-gray-300 px-1 py-0.5 text-xs"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteCycle(cycle.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Supprimer le cycle
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {cycle.semaines.map((semaine) => (
                  <div
                    key={semaine.id}
                    className={`w-36 rounded border p-2 text-xs ${STATUT_COLORS[semaine.statut]} ${
                      semaine.numeroSemaine === numeroActuel ? 'ring-2 ring-gray-900' : ''
                    }`}
                  >
                    <p className="mb-1 font-medium">
                      Semaine {semaine.numeroSemaine}
                      {semaine.numeroSemaine === numeroActuel && (
                        <span className="ml-1 text-[10px] font-normal text-gray-500">(actuelle)</span>
                      )}
                    </p>
                    <select
                      value={semaine.statut}
                      onChange={(e) => handleStatutChange(semaine.id, e.target.value)}
                      className="w-full rounded border border-gray-300 bg-white px-1 py-0.5 text-xs text-gray-700"
                    >
                      {STATUTS_SEMAINE.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <input
                      defaultValue={semaine.notes || ''}
                      onBlur={(e) => handleNotesChange(semaine.id, e.target.value)}
                      placeholder="Notes"
                      className="mt-1 w-full rounded border border-gray-300 bg-white px-1 py-0.5 text-xs text-gray-700"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleCreateCycle} className="mt-6 flex flex-wrap items-end gap-3 rounded border border-dashed border-gray-300 p-4">
        <div>
          <label className="block text-sm text-gray-700">Nom du cycle</label>
          <input
            value={newCycleNom}
            onChange={(e) => setNewCycleNom(e.target.value)}
            placeholder="Bloc 2 — Force"
            className="mt-1 rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Durée (semaines)</label>
          <input
            type="number"
            min="1"
            value={newCycleDuree}
            onChange={(e) => setNewCycleDuree(e.target.value)}
            className="mt-1 w-24 rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Date de début</label>
          <input
            type="date"
            value={newCycleDateDebut}
            onChange={(e) => setNewCycleDateDebut(e.target.value)}
            className="mt-1 rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={creatingCycle}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {creatingCycle ? 'Création…' : '+ Ajouter un cycle'}
        </button>
      </form>
    </div>
  );
}
