import { useState } from 'react';

export function DuplicateClientModal({ source, clients, onClose, onDuplicated }) {
  const [mode, setMode] = useState('new');
  const [nom, setNom] = useState(`${source.nom} (copie)`);
  const [targetId, setTargetId] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const autresClients = clients.filter((c) => c.id !== source.id);
  const target = autresClients.find((c) => c.id === targetId);

  async function handleConfirm() {
    setError(null);
    if (mode === 'existing') {
      if (!targetId) {
        setError('Choisir un client cible.');
        return;
      }
      const ok = window.confirm(
        `Écraser le profil de "${target?.nom}" avec celui de "${source.nom}" ? Cette action est irréversible.`
      );
      if (!ok) return;
    }

    setSubmitting(true);
    try {
      await onDuplicated(mode === 'existing' ? { targetClientId: targetId } : { nom });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded bg-white p-5 shadow-lg">
        <h2 className="mb-4 text-base font-medium text-gray-900">
          Dupliquer le profil de {source.nom}
        </h2>

        <div className="mb-4 space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={mode === 'new'}
              onChange={() => setMode('new')}
            />
            Vers un nouveau client
          </label>
          {mode === 'new' && (
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="ml-6 w-[calc(100%-1.5rem)] rounded border border-gray-300 px-2 py-1 text-sm"
            />
          )}

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={mode === 'existing'}
              onChange={() => setMode('existing')}
              disabled={autresClients.length === 0}
            />
            Vers un client existant (écrase son profil)
          </label>
          {mode === 'existing' && (
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="ml-6 w-[calc(100%-1.5rem)] rounded border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="">— Choisir —</option>
              {autresClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          )}
        </div>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? 'Duplication…' : 'Dupliquer'}
          </button>
        </div>
      </div>
    </div>
  );
}
