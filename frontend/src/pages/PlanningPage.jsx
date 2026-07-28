import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { creneauxApi, reservationsApi, clientsApi } from '../lib/api';
import { JOURS_SEMAINE, labelStatutReservation } from '../lib/constants';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Page Planning coach — définir ses créneaux disponibles et suivre les réservations,
// cahier des charges section 5 (T11.4).
export function PlanningPage() {
  const [creneaux, setCreneaux] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([creneauxApi.list(), reservationsApi.list(), clientsApi.list({})])
      .then(([creneaux, reservations, clients]) => {
        setCreneaux(creneaux);
        setReservations(reservations);
        setClients(clients);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  if (loading) return <p className="text-sm text-graphite-500">Chargement…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl space-y-10">
      <h1 className="font-heading text-xl font-medium text-graphite-900">Planning</h1>
      <CreneauxSection creneaux={creneaux} onChange={load} />
      <ReservationsSection reservations={reservations} clients={clients} creneaux={creneaux} onChange={load} />
    </div>
  );
}

function CreneauxSection({ creneaux, onChange }) {
  const [recurrent, setRecurrent] = useState(true);
  const [jourSemaine, setJourSemaine] = useState('LUNDI');
  const [date, setDate] = useState(todayISO());
  const [heureDebut, setHeureDebut] = useState('09:00');
  const [heureFin, setHeureFin] = useState('10:00');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await creneauxApi.create({
        recurrent,
        jourSemaine: recurrent ? jourSemaine : undefined,
        date: recurrent ? undefined : date,
        heureDebut,
        heureFin,
      });
      onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    await creneauxApi.remove(id);
    onChange();
  }

  return (
    <section>
      <h2 className="mb-3 font-heading text-lg font-medium text-graphite-900">Mes créneaux disponibles</h2>

      <form onSubmit={handleSubmit} className="mb-4 rounded border border-chalk-200 bg-white p-4">
        <div className="mb-3 flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={recurrent} onChange={() => setRecurrent(true)} />
            Récurrent (chaque semaine)
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={!recurrent} onChange={() => setRecurrent(false)} />
            Ponctuel (une date précise)
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {recurrent ? (
            <div>
              <label className="block text-xs text-graphite-600">Jour</label>
              <select
                value={jourSemaine}
                onChange={(e) => setJourSemaine(e.target.value)}
                className="mt-1 w-full rounded border border-chalk-300 px-2 py-1.5 text-sm"
              >
                {JOURS_SEMAINE.map((j) => (
                  <option key={j.value} value={j.value}>
                    {j.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs text-graphite-600">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded border border-chalk-300 px-2 py-1.5 text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-graphite-600">Heure de début</label>
            <input
              type="time"
              value={heureDebut}
              onChange={(e) => setHeureDebut(e.target.value)}
              className="mt-1 w-full rounded border border-chalk-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-graphite-600">Heure de fin</label>
            <input
              type="time"
              value={heureFin}
              onChange={(e) => setHeureFin(e.target.value)}
              className="mt-1 w-full rounded border border-chalk-300 px-2 py-1.5 text-sm"
            />
          </div>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-3 rounded bg-graphite-900 px-4 py-2 text-sm font-medium text-white hover:bg-graphite-800 disabled:opacity-50"
        >
          {submitting ? 'Ajout…' : '+ Ajouter un créneau'}
        </button>
      </form>

      {creneaux.length === 0 ? (
        <p className="text-sm text-graphite-500">Aucun créneau disponible défini.</p>
      ) : (
        <ul className="divide-y divide-chalk-200 rounded border border-chalk-200 bg-white text-sm">
          <AnimatePresence initial={false}>
            {creneaux.map((c) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between gap-4 px-4 py-2 overflow-hidden"
              >
                <span className="text-graphite-900">
                  {c.recurrent
                    ? JOURS_SEMAINE.find((j) => j.value === c.jourSemaine)?.label
                    : new Date(c.date).toLocaleDateString('fr-FR')}
                  <span className="ml-2 font-mono text-graphite-500">
                    {c.heureDebut}–{c.heureFin}
                  </span>
                  {!c.recurrent && <span className="ml-2 text-xs text-graphite-400">(ponctuel)</span>}
                </span>
                <button type="button" onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">
                  Supprimer
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}

function ReservationsSection({ reservations, clients, creneaux, onChange }) {
  const [clientId, setClientId] = useState('');
  const [dateHeure, setDateHeure] = useState('');
  const [creneauId, setCreneauId] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!clientId || !dateHeure) {
      setError('Client et date/heure sont requis.');
      return;
    }
    setSubmitting(true);
    try {
      await clientsApi.creerReservation(clientId, {
        dateHeure: new Date(dateHeure).toISOString(),
        creneauId: creneauId || undefined,
      });
      setDateHeure('');
      onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatut(id, statut) {
    await reservationsApi.setStatut(id, statut);
    onChange();
  }

  return (
    <section>
      <h2 className="mb-3 font-heading text-lg font-medium text-graphite-900">Réservations</h2>

      <form onSubmit={handleSubmit} className="mb-4 rounded border border-chalk-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs text-graphite-600">Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-1 w-full rounded border border-chalk-300 px-2 py-1.5 text-sm"
            >
              <option value="">— Choisir —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-graphite-600">Date et heure</label>
            <input
              type="datetime-local"
              value={dateHeure}
              onChange={(e) => setDateHeure(e.target.value)}
              className="mt-1 w-full rounded border border-chalk-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-graphite-600">Créneau (optionnel)</label>
            <select
              value={creneauId}
              onChange={(e) => setCreneauId(e.target.value)}
              className="mt-1 w-full rounded border border-chalk-300 px-2 py-1.5 text-sm"
            >
              <option value="">—</option>
              {creneaux.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.recurrent
                    ? JOURS_SEMAINE.find((j) => j.value === c.jourSemaine)?.label
                    : new Date(c.date).toLocaleDateString('fr-FR')}{' '}
                  {c.heureDebut}–{c.heureFin}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-3 rounded bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-50"
        >
          {submitting ? 'Réservation…' : '+ Réserver'}
        </button>
      </form>

      {reservations.length === 0 ? (
        <p className="text-sm text-graphite-500">Aucune réservation pour le moment.</p>
      ) : (
        <ul className="divide-y divide-chalk-200 rounded border border-chalk-200 bg-white text-sm">
          <AnimatePresence initial={false}>
            {reservations.map((r) => (
              <motion.li
                key={r.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between gap-4 px-4 py-2"
              >
                <div>
                  <span className="font-medium text-graphite-900">{r.client.nom}</span>{' '}
                  <span className="font-mono text-graphite-500">
                    {new Date(r.dateHeure).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatutBadge statut={r.statut} />
                  {r.statut === 'CONFIRMEE' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStatut(r.id, 'HONOREE')}
                        className="text-moss-600 hover:underline"
                      >
                        Honorée
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatut(r.id, 'ANNULEE')}
                        className="text-red-600 hover:underline"
                      >
                        Annuler
                      </button>
                    </>
                  )}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}

function StatutBadge({ statut }) {
  const styles = {
    CONFIRMEE: 'bg-steel-100 text-steel-600',
    HONOREE: 'bg-moss-100 text-moss-600',
    ANNULEE: 'bg-chalk-100 text-graphite-500',
  };
  return (
    <motion.span
      key={statut}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[statut]}`}
    >
      {labelStatutReservation(statut)}
    </motion.span>
  );
}
