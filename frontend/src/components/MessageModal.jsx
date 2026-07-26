import { useEffect, useState } from 'react';
import { clientsApi } from '../lib/api';
import { genererMessageRecap, lienSMS, lienWhatsApp } from '../lib/message';

export function MessageModal({ client, onClose }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    Promise.all([
      clientsApi.listSeances(client.id),
      clientsApi.listMesures(client.id),
      clientsApi.getObjectifDiete(client.id),
    ])
      .then(([seances, mesures, objectifDiete]) => {
        setMessage(
          genererMessageRecap({
            client,
            derniereSeance: seances[0] || null,
            derniereMesure: mesures[0] || null,
            objectifDiete,
          })
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [client]);

  async function handleCopy() {
    await navigator.clipboard.writeText(message);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded bg-white p-5 shadow-lg">
        <h2 className="mb-4 text-base font-medium text-gray-900">Message pour {client.nom}</h2>

        {loading && <p className="text-sm text-gray-500">Préparation du message…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={7}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
              >
                {copie ? 'Copié !' : 'Copier'}
              </button>
              <a
                href={lienWhatsApp(message)}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
              >
                WhatsApp
              </a>
              <a
                href={lienSMS(message)}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
              >
                SMS
              </a>
            </div>
          </>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
