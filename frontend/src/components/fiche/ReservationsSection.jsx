import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clientsApi, creneauxApi, reservationsApi } from '../../lib/api';
import { JOURS_SEMAINE } from '../../lib/constants';

// Séances à venir — distinctes de l'historique (SeancesSection), cahier des charges
// section 5 (T11.5). Affichées dans l'onglet Programme sportif de la fiche client.
export function ReservationsSection({ clientId }) {
  const [reservations, setReservations] = useState([]);
  const [creneaux, setCreneaux] = useState([]);
  const [dateHeure, setDateHeure] = useState('');
  const [creneauId, setCreneauId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([clientsApi.listReservations(clientId, true), creneauxApi.list()])
      .then(([reservations, creneaux]) => {
        setReservations(reservations);
        setCreneaux(creneaux);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [clientId]);

  useEffect(load, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!dateHeure) {
      setError('Date et heure requises.');
      return;
    }
    setSubmitting(true);
    try {
      await clientsApi.creerReservation(clientId, {
        dateHeure: new Date(dateHeure).toISOString(),
        creneauId: creneauId || undefined,
      });
      setDateHeure('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAnnuler(id) {
    await reservationsApi.setStatut(id, 'ANNULEE');
    load();
  }

  if (loading) return null;

  return (
    <div>
      <h2 className="mb-3 font-heading text-lg font-medium text-graphite-900">Séances à venir</h2>

      <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-end gap-3 rounded border border-dashed border-chalk-300 p-4">
        <div>
          <label className="block text-xs text-graphite-600">Date et heure</label>
          <input
            type="datetime-local"
            value={dateHeure}
            onChange={(e) => setDateHeure(e.target.value)}
            className="mt-1 rounded border border-chalk-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-graphite-600">Créneau (optionnel)</label>
          <select
            value={creneauId}
            onChange={(e) => setCreneauId(e.target.value)}
            className="mt-1 rounded border border-chalk-300 px-2 py-1.5 text-sm"
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
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded border border-chalk-300 px-4 py-2 text-sm text-graphite-700 hover:bg-chalk-100 disabled:opacity-50"
        >
          {submitting ? 'Réservation…' : '+ Réserver une séance'}
        </button>
      </form>

      {reservations.length === 0 ? (
        <p className="text-sm text-graphite-500">Aucune séance à venir de programmée.</p>
      ) : (
        <ul className="divide-y divide-chalk-200 rounded border border-chalk-200 bg-white text-sm">
          <AnimatePresence initial={false}>
            {reservations.map((r) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between gap-4 px-4 py-2 overflow-hidden"
              >
                <span className="font-mono text-graphite-900">
                  {new Date(r.dateHeure).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                </span>
                <button type="button" onClick={() => handleAnnuler(r.id)} className="text-red-600 hover:underline">
                  Annuler
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
