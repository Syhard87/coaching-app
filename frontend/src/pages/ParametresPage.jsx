import { useEffect, useState } from 'react';
import { catalogueAbonnementsApi } from '../lib/api';
import { labelModuleAbonnement } from '../lib/constants';

// Gestion du catalogue d'abonnements (édition prix/durées) — cahier des charges section 5 (T10.8).
export function ParametresPage() {
  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [prixTotal, setPrixTotal] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    catalogueAbonnementsApi
      .list()
      .then(setCatalogue)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function startEdit(entree) {
    setEditingId(entree.id);
    setPrixTotal(String(entree.prixTotal));
  }

  async function handleSave(id) {
    setSubmitting(true);
    try {
      const entree = await catalogueAbonnementsApi.update(id, { prixTotal: Number(prixTotal) });
      setCatalogue((c) => c.map((e) => (e.id === id ? entree : e)));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-graphite-500">Chargement…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const parModule = ['SPORT', 'DIETE', 'PACK_COMPLET'].map((module) => ({
    module,
    entrees: catalogue.filter((c) => c.module === module).sort((a, b) => a.dureeMois - b.dureeMois),
  }));

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-heading text-xl font-medium text-graphite-900">Paramètres — Catalogue d'abonnements</h1>

      <div className="space-y-6">
        {parModule.map(({ module, entrees }) => (
          <section key={module} className="rounded border border-chalk-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-medium text-graphite-700">{labelModuleAbonnement(module)}</h2>
            <ul className="divide-y divide-chalk-200 text-sm">
              {entrees.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-4 py-2">
                  <span className="text-graphite-700">{e.dureeMois} mois</span>
                  {editingId === e.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={prixTotal}
                        onChange={(ev) => setPrixTotal(ev.target.value)}
                        className="w-24 rounded border border-chalk-300 px-2 py-1 font-mono text-sm"
                      />
                      <span className="text-graphite-500">€</span>
                      <button
                        type="button"
                        onClick={() => handleSave(e.id)}
                        disabled={submitting}
                        className="rounded bg-graphite-900 px-3 py-1 text-xs font-medium text-white hover:bg-graphite-800 disabled:opacity-50"
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-xs text-graphite-500 hover:underline"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-graphite-900">{e.prixTotal}€</span>
                      <button
                        type="button"
                        onClick={() => startEdit(e)}
                        className="text-xs text-graphite-600 hover:underline"
                      >
                        Modifier
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
