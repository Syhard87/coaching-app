import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsApi } from '../lib/api';
import {
  ClientProfilFields,
  EMPTY_CLIENT_FORM,
  formToPayload,
} from '../components/ClientProfilFields';

// Création d'un nouveau client — l'édition se fait désormais depuis la fiche à 3 onglets
// (ClientFichePage, onglet Bilan), cahier des charges section 3/4 (T10.4).
export function ClientFormPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_CLIENT_FORM);
  const [grid, setGrid] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);
    try {
      const client = await clientsApi.create(formToPayload(form, grid));
      navigate(`/clients/${client.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-heading text-xl font-medium text-graphite-900">Nouveau client</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ClientProfilFields form={form} setField={setField} grid={grid} toggleSlot={toggleSlot} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-graphite-900 px-4 py-2 text-sm font-medium text-white hover:bg-graphite-800 disabled:opacity-50"
          >
            {submitting ? 'Création…' : 'Créer le client'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="rounded border border-chalk-300 px-4 py-2 text-sm text-graphite-700 hover:bg-chalk-100"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
