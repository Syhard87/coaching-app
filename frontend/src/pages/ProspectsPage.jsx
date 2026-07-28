import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { prospectsApi } from '../lib/api';
import { STATUTS_PROSPECT } from '../lib/constants';
import { ConvertProspectModal } from '../components/ConvertProspectModal';

export function ProspectsPage() {
  const { coach, updateSlug } = useAuth();
  const navigate = useNavigate();

  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [copie, setCopie] = useState(false);
  const [editingSlug, setEditingSlug] = useState(false);
  const [slugInput, setSlugInput] = useState('');
  const [slugError, setSlugError] = useState(null);

  const [convertTarget, setConvertTarget] = useState(null);

  const lienPublic = `${window.location.origin}/p/${coach?.slug}`;

  const load = useCallback(() => {
    setLoading(true);
    prospectsApi
      .list()
      .then(setProspects)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCopy() {
    await navigator.clipboard.writeText(lienPublic);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  }

  async function handleSaveSlug() {
    setSlugError(null);
    try {
      await updateSlug(slugInput.trim());
      setEditingSlug(false);
    } catch (err) {
      setSlugError(err.message);
    }
  }

  async function handleStatutChange(prospect, statut) {
    const updated = await prospectsApi.setStatut(prospect.id, statut);
    setProspects((ps) => ps.map((p) => (p.id === updated.id ? updated : p)));
  }

  async function handleConvert(objectif) {
    const client = await prospectsApi.convert(convertTarget.id, objectif);
    load();
    navigate(`/clients/${client.id}`);
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-medium text-gray-900">Prospects</h1>

      <div className="mb-6 rounded border border-gray-200 bg-white p-4">
        <p className="mb-2 text-sm font-medium text-gray-700">Page publique de prospection</p>
        {editingSlug ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">{window.location.origin}/p/</span>
            <input
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={handleSaveSlug}
              className="rounded bg-gray-900 px-3 py-1 text-sm font-medium text-white hover:bg-gray-800"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setEditingSlug(false)}
              className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-800">{lienPublic}</code>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              {copie ? 'Copié !' : 'Copier le lien à partager'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSlugInput(coach?.slug || '');
                setEditingSlug(true);
                setSlugError(null);
              }}
              className="text-sm text-gray-500 hover:underline"
            >
              Modifier
            </button>
          </div>
        )}
        {slugError && <p className="mt-2 text-sm text-red-600">{slugError}</p>}
      </div>

      {loading && <p className="text-sm text-gray-500">Chargement…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        prospects.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucun prospect pour le moment. Partagez votre lien pour commencer à en recevoir.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white text-sm">
            {prospects.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{p.nom}</p>
                  <p className="text-gray-500">{p.contact}</p>
                  {p.objectif && <p className="text-gray-600">Objectif : {p.objectif}</p>}
                  {p.message && <p className="text-gray-600">« {p.message} »</p>}
                  <p className="text-xs text-gray-400">
                    Reçu le {new Date(p.dateCreation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={p.statut}
                    onChange={(e) => handleStatutChange(p, e.target.value)}
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    {STATUTS_PROSPECT.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {p.clientId ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/clients/${p.clientId}`)}
                      className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Voir le client
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConvertTarget(p)}
                      className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Convertir en client
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )
      )}

      {convertTarget && (
        <ConvertProspectModal
          prospect={convertTarget}
          onClose={() => setConvertTarget(null)}
          onConverted={handleConvert}
        />
      )}
    </div>
  );
}
