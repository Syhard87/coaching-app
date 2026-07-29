import { useCallback, useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { clientsApi, journalDieteApi } from '../../lib/api';
import { TYPES_OBJECTIF_CALORIQUE } from '../../lib/constants';

const PROFIL_REQUIS_AUTO = ['sexe', 'age', 'tailleCm', 'poidsInitial', 'niveauActivite'];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function moyenneGlissante(entries, jours) {
  const seuil = Date.now() - jours * 86_400_000;
  const subset = entries.filter((e) => new Date(e.date).getTime() >= seuil);
  if (subset.length === 0) return null;
  const somme = (cle) => subset.reduce((acc, e) => acc + (e[cle] || 0), 0);
  return {
    nbJours: subset.length,
    calories: Math.round(somme('calories') / subset.length),
    proteines: Math.round(somme('proteines') / subset.length),
    glucides: Math.round(somme('glucides') / subset.length),
    lipides: Math.round(somme('lipides') / subset.length),
  };
}

// Onglet Nutritionnel (T10.4) — anciennement page dédiée, inchangé fonctionnellement.
export function NutritionSection({ clientId, client }) {
  const [objectif, setObjectif] = useState(null);
  const [journal, setJournal] = useState([]);
  const [mesures, setMesures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      clientsApi.getObjectifDiete(clientId),
      clientsApi.listJournalDiete(clientId),
      clientsApi.listMesures(clientId),
    ])
      .then(([objectif, journal, mesures]) => {
        setObjectif(objectif);
        setJournal(journal);
        setMesures(mesures);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [clientId]);

  useEffect(load, [load]);

  if (loading) return <p className="text-sm text-graphite-500">Chargement…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-10">
      <ObjectifSection client={client} objectif={objectif} mesures={mesures} onSaved={load} />
      <JournalSection clientId={clientId} objectif={objectif} journal={journal} onChange={load} />
      <GraphiqueSection journal={journal} mesures={mesures} />
    </div>
  );
}

// Dernière mesure de poids réelle du client (source unique de vérité, cahier des charges
// section 4.3) — null si aucune mesure n'a encore été enregistrée. Tri identique à celui du
// backend (date puis createdAt) pour départager les mesures saisies le même jour calendaire.
function derniereMesurePoids(mesures) {
  return (
    [...mesures]
      .filter((m) => m.poids != null)
      .sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt))[0] ??
    null
  );
}

// Variation de poids sur les 30 derniers jours — compare le poids actuel à la mesure la plus
// récente antérieure au seuil des 30 jours (approximation de "il y a 30 jours" quand aucune
// mesure ne tombe exactement sur cette date). Null si moins de deux mesures couvrent la période.
function variationPoids30j(mesures, maintenant = new Date()) {
  const actuelle = derniereMesurePoids(mesures);
  if (!actuelle) return null;

  const seuil = maintenant.getTime() - 30 * 86_400_000;
  const avantSeuil = [...mesures]
    .filter((m) => m.poids != null && new Date(m.date).getTime() <= seuil)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  if (!avantSeuil || avantSeuil.id === actuelle.id) {
    return { poidsActuel: actuelle.poids, delta: null };
  }
  return { poidsActuel: actuelle.poids, delta: Math.round((actuelle.poids - avantSeuil.poids) * 10) / 10 };
}

function ObjectifSection({ client, objectif, mesures, onSaved }) {
  const [methode, setMethode] = useState(objectif?.methodeCalcul || 'AUTO');
  const [typeObjectifCalorique, setTypeObjectifCalorique] = useState(objectif?.typeObjectifCalorique || '');
  const [manuel, setManuel] = useState({
    caloriesCible: objectif?.caloriesCible ?? '',
    proteinesCible: objectif?.proteinesCible ?? '',
    glucidesCible: objectif?.glucidesCible ?? '',
    lipidesCible: objectif?.lipidesCible ?? '',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const derniereMesure = derniereMesurePoids(mesures);
  // Le poids peut venir d'une mesure réelle même si poidsInitial n'a jamais été renseigné —
  // ne pas bloquer le calcul automatique dans ce cas (cahier des charges section 4.3).
  const poidsDisponible = client.poidsInitial != null || derniereMesure != null;
  const champsManquants = PROFIL_REQUIS_AUTO.filter((f) =>
    f === 'poidsInitial' ? !poidsDisponible : !client[f]
  );
  // Une mesure plus récente existe que celle utilisée pour le dernier calcul automatique —
  // jamais de recalcul automatique/silencieux (cahier des charges section 8) : bouton explicite.
  const recalculDisponible =
    objectif?.methodeCalcul === 'AUTO' &&
    derniereMesure &&
    (!objectif.dateMesureUtilisee || new Date(derniereMesure.date) > new Date(objectif.dateMesureUtilisee));

  async function recalculer() {
    setError(null);
    setSubmitting(true);
    try {
      await clientsApi.setObjectifDiete(client.id, {
        methodeCalcul: 'AUTO',
        typeObjectifCalorique: objectif.typeObjectifCalorique,
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (methode === 'AUTO') {
        if (!typeObjectifCalorique) throw new Error("Choisir un objectif calorique.");
        await clientsApi.setObjectifDiete(client.id, { methodeCalcul: 'AUTO', typeObjectifCalorique });
      } else {
        const { caloriesCible, proteinesCible, glucidesCible, lipidesCible } = manuel;
        if (!caloriesCible || !proteinesCible || !glucidesCible || !lipidesCible) {
          throw new Error('Tous les champs sont requis en mode manuel.');
        }
        await clientsApi.setObjectifDiete(client.id, {
          methodeCalcul: 'MANUEL',
          caloriesCible: Number(caloriesCible),
          proteinesCible: Number(proteinesCible),
          glucidesCible: Number(glucidesCible),
          lipidesCible: Number(lipidesCible),
        });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2 className="mb-3 font-heading text-lg font-medium text-graphite-900">Objectifs nutritionnels</h2>

      {objectif && (
        <div className="mb-4 grid grid-cols-2 gap-3 rounded border border-chalk-200 bg-white p-4 sm:grid-cols-4">
          <Stat label="Calories cible" value={`${objectif.caloriesCible} kcal`} />
          <Stat label="Protéines" value={`${objectif.proteinesCible} g`} />
          <Stat label="Glucides" value={`${objectif.glucidesCible} g`} />
          <Stat label="Lipides" value={`${objectif.lipidesCible} g`} />
          {objectif.tdeeCalcule && <Stat label="TDEE calculé" value={`${objectif.tdeeCalcule} kcal`} />}
        </div>
      )}

      {objectif?.methodeCalcul === 'AUTO' && (objectif.poidsUtilise != null || recalculDisponible) && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded border border-chalk-200 bg-chalk-50 p-3 text-sm">
          <p className="text-graphite-600">
            {objectif.poidsUtilise != null ? (
              <>
                Calculé à partir de :{' '}
                <span className="font-mono font-medium text-graphite-900">{objectif.poidsUtilise} kg</span>
                {objectif.dateMesureUtilisee ? (
                  <>, mesuré le {new Date(objectif.dateMesureUtilisee).toLocaleDateString('fr-FR')}</>
                ) : (
                  <> (poids initial du profil — aucune mesure enregistrée pour ce client)</>
                )}
              </>
            ) : (
              'Calculé avec une ancienne version — source du poids inconnue.'
            )}
          </p>
          {recalculDisponible && (
            <button
              type="button"
              onClick={recalculer}
              disabled={submitting}
              className="ml-auto rounded bg-accent-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-700 disabled:opacity-50"
            >
              {submitting ? 'Recalcul…' : 'Recalculer avec les dernières données'}
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded border border-chalk-200 bg-white p-4">
        <div className="mb-3 flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={methode === 'AUTO'} onChange={() => setMethode('AUTO')} />
            Calcul automatique
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={methode === 'MANUEL'} onChange={() => setMethode('MANUEL')} />
            Saisie manuelle
          </label>
        </div>

        {methode === 'AUTO' && (
          <div>
            {champsManquants.length > 0 && (
              <p className="mb-2 text-sm text-accent-700">
                Profil client incomplet pour le calcul automatique — champs manquants :{' '}
                {champsManquants.join(', ')}.
              </p>
            )}
            <select
              value={typeObjectifCalorique}
              onChange={(e) => setTypeObjectifCalorique(e.target.value)}
              className="w-full rounded border border-chalk-300 px-3 py-2 text-sm sm:w-96"
            >
              <option value="">— Choisir un objectif calorique —</option>
              {TYPES_OBJECTIF_CALORIQUE.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {methode === 'MANUEL' && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <NumberField
              label="Calories (kcal)"
              value={manuel.caloriesCible}
              onChange={(v) => setManuel((m) => ({ ...m, caloriesCible: v }))}
            />
            <NumberField
              label="Protéines (g)"
              value={manuel.proteinesCible}
              onChange={(v) => setManuel((m) => ({ ...m, proteinesCible: v }))}
            />
            <NumberField
              label="Glucides (g)"
              value={manuel.glucidesCible}
              onChange={(v) => setManuel((m) => ({ ...m, glucidesCible: v }))}
            />
            <NumberField
              label="Lipides (g)"
              value={manuel.lipidesCible}
              onChange={(v) => setManuel((m) => ({ ...m, lipidesCible: v }))}
            />
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || (methode === 'AUTO' && champsManquants.length > 0)}
          className="mt-3 rounded bg-graphite-900 px-4 py-2 text-sm font-medium text-white hover:bg-graphite-800 disabled:opacity-50"
        >
          {submitting ? 'Enregistrement…' : 'Enregistrer les objectifs'}
        </button>
      </form>
    </section>
  );
}

function JournalSection({ clientId, objectif, journal, onChange }) {
  const [date, setDate] = useState(todayISO());
  const [calories, setCalories] = useState('');
  const [proteines, setProteines] = useState('');
  const [glucides, setGlucides] = useState('');
  const [lipides, setLipides] = useState('');
  const [eau, setEau] = useState('');
  const [repas, setRepas] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const moy7 = useMemo(() => moyenneGlissante(journal, 7), [journal]);
  const moy30 = useMemo(() => moyenneGlissante(journal, 30), [journal]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!date) {
      setError('La date est requise.');
      return;
    }
    setSubmitting(true);
    try {
      await clientsApi.upsertJournalDiete(clientId, {
        date,
        calories: calories === '' ? undefined : Number(calories),
        proteines: proteines === '' ? undefined : Number(proteines),
        glucides: glucides === '' ? undefined : Number(glucides),
        lipides: lipides === '' ? undefined : Number(lipides),
        eau: eau === '' ? undefined : Number(eau),
        repas: repas || undefined,
      });
      setCalories('');
      setProteines('');
      setGlucides('');
      setLipides('');
      setEau('');
      setRepas('');
      onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    await journalDieteApi.remove(id);
    onChange();
  }

  return (
    <section>
      <h2 className="mb-3 font-heading text-lg font-medium text-graphite-900">Journal alimentaire</h2>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MoyenneCard titre="Moyenne 7 jours" moyenne={moy7} objectif={objectif} />
        <MoyenneCard titre="Moyenne 30 jours" moyenne={moy30} objectif={objectif} />
      </div>

      <form onSubmit={handleSubmit} className="mb-4 rounded border border-chalk-200 bg-white p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          <div className="col-span-2">
            <label className="block text-xs text-graphite-600">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded border border-chalk-300 px-2 py-1.5 text-sm"
            />
          </div>
          <NumberField label="Calories" value={calories} onChange={setCalories} compact />
          <NumberField label="Protéines" value={proteines} onChange={setProteines} compact />
          <NumberField label="Glucides" value={glucides} onChange={setGlucides} compact />
          <NumberField label="Lipides" value={lipides} onChange={setLipides} compact />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <NumberField label="Eau (L)" value={eau} onChange={setEau} step="0.1" compact />
          <div className="sm:col-span-2">
            <label className="block text-xs text-graphite-600">Repas / notes</label>
            <input
              value={repas}
              onChange={(e) => setRepas(e.target.value)}
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
          {submitting ? 'Enregistrement…' : 'Enregistrer le jour'}
        </button>
      </form>

      {journal.length > 0 && (
        <ul className="divide-y divide-chalk-200 rounded border border-chalk-200 bg-white text-sm">
          {journal.slice(0, 14).map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-4 px-4 py-2">
              <span className="font-mono text-graphite-500">{new Date(e.date).toLocaleDateString('fr-FR')}</span>
              <span className="flex-1 text-graphite-900">
                {e.calories ?? '–'} kcal · P{e.proteines ?? '–'} G{e.glucides ?? '–'} L{e.lipides ?? '–'}
              </span>
              <button type="button" onClick={() => handleDelete(e.id)} className="text-red-600 hover:underline">
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function GraphiqueSection({ journal, mesures }) {
  const data = useMemo(
    () =>
      journal
        .filter((e) => e.calories != null)
        .map((e) => ({ date: e.date.slice(0, 10), calories: e.calories }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [journal]
  );

  const variation = useMemo(() => variationPoids30j(mesures), [mesures]);

  return (
    <section>
      <h2 className="mb-3 font-heading text-lg font-medium text-graphite-900">Calories</h2>

      {/* Contexte poids en une phrase compacte — le graphique de poids vit uniquement dans
          l'onglet Bilan (T11.5.7), pas de second graphique dupliqué ici. */}
      <p className="mb-4 text-sm text-graphite-600">
        {variation == null ? (
          "Aucune mesure de poids enregistrée pour ce client."
        ) : (
          <>
            Poids actuel : <span className="font-mono font-medium text-graphite-900">{variation.poidsActuel} kg</span>
            {variation.delta != null && (
              <>
                {' '}
                ({variation.delta > 0 ? '+' : ''}
                {variation.delta} kg sur 30 jours)
              </>
            )}
          </>
        )}
      </p>

      {data.length === 0 ? (
        <p className="text-sm text-graphite-500">Pas encore de données à afficher.</p>
      ) : (
        <div className="h-64 rounded border border-chalk-200 bg-white p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="calories" name="Calories (kcal)" stroke="#9aa0a9" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-graphite-500">{label}</p>
      <p className="font-mono text-base font-medium text-graphite-900">{value}</p>
    </div>
  );
}

function NumberField({ label, value, onChange, step, compact }) {
  return (
    <div>
      <label className="block text-xs text-graphite-600">{label}</label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 rounded border border-chalk-300 px-2 py-1.5 text-sm ${compact ? 'w-24' : 'w-full'}`}
      />
    </div>
  );
}

function MoyenneCard({ titre, moyenne, objectif }) {
  return (
    <div className="rounded border border-chalk-200 bg-white p-4">
      <p className="mb-2 text-sm font-medium text-graphite-700">{titre}</p>
      {!moyenne ? (
        <p className="text-sm text-graphite-500">Pas de données sur cette période.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p>
            Calories : <strong>{moyenne.calories}</strong> kcal
            {objectif?.caloriesCible && (
              <span className={moyenne.calories > objectif.caloriesCible ? 'text-red-600' : 'text-moss-600'}>
                {' '}
                ({moyenne.calories > objectif.caloriesCible ? '+' : ''}
                {moyenne.calories - objectif.caloriesCible})
              </span>
            )}
          </p>
          <p>
            Protéines : <strong>{moyenne.proteines}</strong> g
          </p>
          <p>
            Glucides : <strong>{moyenne.glucides}</strong> g
          </p>
          <p>
            Lipides : <strong>{moyenne.lipides}</strong> g
          </p>
          <p className="col-span-2 text-xs text-graphite-500">Basé sur {moyenne.nbJours} jour(s) loggé(s)</p>
        </div>
      )}
    </div>
  );
}
