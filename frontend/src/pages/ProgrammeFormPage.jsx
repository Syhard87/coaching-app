import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { clientsApi, programmesApi, templatesApi } from '../lib/api';
import { TYPES_SPLIT, labelTypeSplit } from '../lib/constants';
import { ExerciceGifPreview } from '../components/ExerciceGifPreview';

function emptyExercice() {
  return { nom: '', series: 3, reps: '8-12', chargeCible: '', tempsRepos: '', notes: '', lienVideo: '' };
}

function cleanJoursForSubmit(jours) {
  return jours.map((j, idx) => ({
    nom: j.nom,
    ordre: idx,
    exercices: j.exercices.map((e) => ({
      nom: e.nom,
      series: Number(e.series),
      reps: e.reps,
      chargeCible: e.chargeCible === '' ? undefined : Number(e.chargeCible),
      tempsRepos: e.tempsRepos === '' ? undefined : Number(e.tempsRepos),
      notes: e.notes || undefined,
      lienVideo: e.lienVideo || undefined,
    })),
  }));
}

function joursFromServer(jours) {
  return jours.map((j) => ({
    nom: j.nom,
    exercices: j.exercices.map((e) => ({
      nom: e.nom,
      series: e.series,
      reps: e.reps,
      chargeCible: e.chargeCible ?? '',
      tempsRepos: e.tempsRepos ?? '',
      notes: e.notes ?? '',
      lienVideo: e.lienVideo ?? '',
    })),
  }));
}

export function ProgrammeFormPage() {
  const { clientId, programmeId } = useParams();
  const isEdit = Boolean(programmeId);
  const navigate = useNavigate();

  const [nom, setNom] = useState('');
  const [typeSplit, setTypeSplit] = useState('');
  const [frequence, setFrequence] = useState('');
  const [jours, setJours] = useState([]);

  const [suggestion, setSuggestion] = useState(null);
  const [archetypes, setArchetypes] = useState({});
  const [savedTemplates, setSavedTemplates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [templateNom, setTemplateNom] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    const loaders = [templatesApi.archetypes(), templatesApi.list()];
    if (isEdit) {
      loaders.push(programmesApi.get(programmeId));
    } else {
      loaders.push(clientsApi.splitSuggestion(clientId));
    }

    Promise.all(loaders)
      .then(([archetypesData, templatesData, third]) => {
        setArchetypes(archetypesData);
        setSavedTemplates(templatesData);
        if (isEdit) {
          setNom(third.nom);
          setTypeSplit(third.typeSplit);
          setFrequence(third.frequence);
          setJours(joursFromServer(third.jours));
        } else {
          setSuggestion(third);
          setFrequence(third.joursDisponibles || '');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [clientId, programmeId, isEdit]);

  function applyArchetype(typeSplitKey) {
    const archetype = archetypes[typeSplitKey];
    if (!archetype) return;
    setTypeSplit(typeSplitKey);
    setJours(joursFromServer(archetype.jours));
  }

  async function applyTemplate(templateId) {
    if (!templateId) return;
    const template = await templatesApi.get(templateId);
    setTypeSplit(template.typeSplit);
    setJours(joursFromServer(template.contenuJson.jours));
  }

  function updateJour(idx, patch) {
    setJours((js) => js.map((j, i) => (i === idx ? { ...j, ...patch } : j)));
  }

  function addJour() {
    setJours((js) => [...js, { nom: `Jour ${js.length + 1}`, exercices: [emptyExercice()] }]);
  }

  function removeJour(idx) {
    setJours((js) => js.filter((_, i) => i !== idx));
  }

  function updateExercice(jourIdx, exoIdx, patch) {
    setJours((js) =>
      js.map((j, i) =>
        i !== jourIdx
          ? j
          : { ...j, exercices: j.exercices.map((e, ei) => (ei === exoIdx ? { ...e, ...patch } : e)) }
      )
    );
  }

  function addExercice(jourIdx) {
    setJours((js) =>
      js.map((j, i) => (i !== jourIdx ? j : { ...j, exercices: [...j.exercices, emptyExercice()] }))
    );
  }

  function removeExercice(jourIdx, exoIdx) {
    setJours((js) =>
      js.map((j, i) =>
        i !== jourIdx ? j : { ...j, exercices: j.exercices.filter((_, ei) => ei !== exoIdx) }
      )
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!nom.trim() || !typeSplit || !frequence) {
      setError('Nom, type de split et fréquence sont obligatoires.');
      return;
    }
    if (jours.length === 0) {
      setError('Le programme doit comporter au moins un jour d’entraînement.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { nom: nom.trim(), typeSplit, frequence: Number(frequence), jours: cleanJoursForSubmit(jours) };
      if (isEdit) {
        await programmesApi.update(programmeId, payload);
      } else {
        await clientsApi.createProgramme(clientId, payload);
      }
      navigate(`/clients/${clientId}/programme`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveAsTemplate() {
    if (!templateNom.trim()) return;
    setSavingTemplate(true);
    try {
      await templatesApi.create({ nom: templateNom.trim(), programmeId });
      setTemplateNom('');
      const templates = await templatesApi.list();
      setSavedTemplates(templates);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingTemplate(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Chargement…</p>;

  return (
    <div className="max-w-3xl">
      <Link to={`/clients/${clientId}/programme`} className="text-sm text-gray-500 hover:underline">
        ← Programmes
      </Link>
      <h1 className="mb-6 mt-2 text-xl font-medium text-gray-900">
        {isEdit ? 'Modifier le programme' : 'Nouveau programme'}
      </h1>

      {!isEdit && suggestion && (
        <div className="mb-6 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          Split suggéré selon les disponibilités du client ({suggestion.joursDisponibles} j/sem.) :{' '}
          <strong>{labelTypeSplit(suggestion.typeSplit)}</strong>.{' '}
          <button
            type="button"
            onClick={() => applyArchetype(suggestion.typeSplit)}
            className="underline"
          >
            Appliquer cette suggestion
          </button>
        </div>
      )}

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-gray-700">Partir d'un modèle de split</p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(archetypes).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => applyArchetype(key)}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              {archetypes[key].label}
            </button>
          ))}
        </div>
        {savedTemplates.length > 0 && (
          <div className="mt-3">
            <label className="text-sm text-gray-700">Ou un de mes modèles enregistrés : </label>
            <select
              onChange={(e) => applyTemplate(e.target.value)}
              defaultValue=""
              className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="">— Choisir —</option>
              {savedTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nom}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom du programme *</label>
            <input
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type de split *</label>
            <select
              required
              value={typeSplit}
              onChange={(e) => setTypeSplit(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">— Choisir —</option>
              {TYPES_SPLIT.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fréquence (j/semaine) *</label>
            <input
              type="number"
              min="1"
              max="7"
              required
              value={frequence}
              onChange={(e) => setFrequence(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </section>

        <section className="space-y-4">
          {jours.map((jour, jourIdx) => (
            <div key={jourIdx} className="rounded border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <input
                  value={jour.nom}
                  onChange={(e) => updateJour(jourIdx, { nom: e.target.value })}
                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm font-medium"
                  placeholder="Nom du jour (ex. Push)"
                />
                <button
                  type="button"
                  onClick={() => removeJour(jourIdx)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Supprimer le jour
                </button>
              </div>

              <div className="space-y-2">
                {jour.exercices.map((exo, exoIdx) => (
                  <div key={exoIdx} className="grid grid-cols-12 gap-2 text-sm">
                    <input
                      value={exo.nom}
                      onChange={(e) => updateExercice(jourIdx, exoIdx, { nom: e.target.value })}
                      placeholder="Exercice"
                      className="col-span-3 rounded border border-gray-300 px-2 py-1"
                    />
                    <input
                      type="number"
                      value={exo.series}
                      onChange={(e) => updateExercice(jourIdx, exoIdx, { series: e.target.value })}
                      placeholder="Séries"
                      className="col-span-1 rounded border border-gray-300 px-2 py-1"
                    />
                    <input
                      value={exo.reps}
                      onChange={(e) => updateExercice(jourIdx, exoIdx, { reps: e.target.value })}
                      placeholder="Reps"
                      className="col-span-1 rounded border border-gray-300 px-2 py-1"
                    />
                    <input
                      type="number"
                      value={exo.chargeCible}
                      onChange={(e) => updateExercice(jourIdx, exoIdx, { chargeCible: e.target.value })}
                      placeholder="Charge (kg)"
                      className="col-span-2 rounded border border-gray-300 px-2 py-1"
                    />
                    <input
                      type="number"
                      value={exo.tempsRepos}
                      onChange={(e) => updateExercice(jourIdx, exoIdx, { tempsRepos: e.target.value })}
                      placeholder="Repos (s)"
                      className="col-span-1 rounded border border-gray-300 px-2 py-1"
                    />
                    <input
                      value={exo.lienVideo}
                      onChange={(e) => updateExercice(jourIdx, exoIdx, { lienVideo: e.target.value })}
                      placeholder="Lien vidéo"
                      className="col-span-2 rounded border border-gray-300 px-2 py-1"
                    />
                    <div className="col-span-1 flex items-center justify-center">
                      <ExerciceGifPreview nom={exo.nom} />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExercice(jourIdx, exoIdx)}
                      className="col-span-1 text-red-600 hover:underline"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addExercice(jourIdx)}
                className="mt-2 text-sm text-gray-600 hover:underline"
              >
                + Ajouter un exercice
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addJour}
            className="rounded border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            + Ajouter un jour
          </button>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer le programme'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/clients/${clientId}/programme`)}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Annuler
          </button>
        </div>
      </form>

      {isEdit && (
        <div className="mt-8 border-t border-gray-200 pt-4">
          <p className="mb-2 text-sm font-medium text-gray-700">Enregistrer comme modèle réutilisable</p>
          <div className="flex gap-2">
            <input
              value={templateNom}
              onChange={(e) => setTemplateNom(e.target.value)}
              placeholder="Nom du modèle"
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleSaveAsTemplate}
              disabled={savingTemplate || !templateNom.trim()}
              className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              {savingTemplate ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
