import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { clientsApi } from '../lib/api';
import {
  ClientProfilFields,
  clientToForm,
  disponibilitesToGrid,
  formToPayload,
} from '../components/ClientProfilFields';
import { AbonnementsHeader } from '../components/fiche/AbonnementsHeader';
import { MedicalBanner } from '../components/fiche/MedicalBanner';
import { NonSouscrit } from '../components/fiche/NonSouscrit';
import { MesuresSection } from '../components/fiche/MesuresSection';
import { ProgrammesSection } from '../components/fiche/ProgrammesSection';
import { ReservationsSection } from '../components/fiche/ReservationsSection';
import { SeancesSection } from '../components/fiche/SeancesSection';
import { NutritionSection } from '../components/fiche/NutritionSection';

const ONGLETS = [
  { value: 'bilan', label: 'Bilan', path: '' },
  { value: 'programme', label: 'Programme sportif', path: '/programme' },
  { value: 'nutrition', label: 'Nutritionnel', path: '/nutrition' },
];

// Fiche client à 3 onglets — cahier des charges section 3/4 (T10.4). Bilan toujours
// accessible ; Programme sportif / Nutritionnel visibles selon l'abonnement actif (T10.5).
export function ClientFichePage({ onglet }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [modulesActifs, setModulesActifs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([clientsApi.get(id), clientsApi.getModulesActifs(id)])
      .then(([client, modulesActifs]) => {
        setClient(client);
        setModulesActifs(modulesActifs);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  if (loading) return <p className="text-sm text-graphite-500">Chargement…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl">
      <Link to="/clients" className="text-sm text-graphite-500 hover:underline">
        ← Clients
      </Link>
      <h1 className="mb-4 mt-2 font-heading text-xl font-medium text-graphite-900">{client.nom}</h1>

      <AbonnementsHeader clientId={id} onChange={load} />

      <nav className="mb-6 flex gap-1 border-b border-chalk-200">
        {ONGLETS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => navigate(`/clients/${id}${o.path}`)}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              onglet === o.value
                ? 'border-accent-600 text-graphite-900'
                : 'border-transparent text-graphite-500 hover:text-graphite-700'
            }`}
          >
            {o.label}
          </button>
        ))}
      </nav>

      {onglet === 'bilan' && <BilanTab client={client} onSaved={load} />}
      {onglet === 'programme' && (
        <ModuleTab actif={modulesActifs.sportActif} moduleLabel="Sport">
          <div className="space-y-10">
            <ProgrammesSection clientId={id} />
            <ReservationsSection clientId={id} />
            <SeancesSection clientId={id} />
          </div>
        </ModuleTab>
      )}
      {onglet === 'nutrition' && (
        <ModuleTab actif={modulesActifs.dieteActif} moduleLabel="Diète">
          <NutritionSection clientId={id} client={client} />
        </ModuleTab>
      )}
    </div>
  );
}

function ModuleTab({ actif, moduleLabel, children }) {
  const [venteForcee, setVenteForcee] = useState(false);
  if (!actif && !venteForcee) {
    return <NonSouscrit module={moduleLabel} onVendre={() => setVenteForcee(true)} />;
  }
  return children;
}

function BilanTab({ client, onSaved }) {
  const [form, setForm] = useState(clientToForm(client));
  const [grid, setGrid] = useState(disponibilitesToGrid(client.disponibilites));
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
      await clientsApi.update(client.id, formToPayload(form, grid));
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {form.suiviMedical && <MedicalBanner />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <ClientProfilFields form={form} setField={setField} grid={grid} toggleSlot={toggleSlot} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-graphite-900 px-4 py-2 text-sm font-medium text-white hover:bg-graphite-800 disabled:opacity-50"
        >
          {submitting ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>

      <MesuresSection clientId={client.id} />
    </div>
  );
}
