import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { clientsApi, mesuresApi } from '../../lib/api';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_FORM = { date: todayISO(), poids: '', bras: '', taille: '', poitrine: '', cuisse: '', notes: '' };

// Mesures corporelles — fusionnées dans l'onglet Bilan (T10.4), anciennement page dédiée.
export function MesuresSection({ clientId }) {
  const [mesures, setMesures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    clientsApi
      .listMesures(clientId)
      .then(setMesures)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [clientId]);

  useEffect(load, [load]);

  const chartData = useMemo(
    () =>
      [...mesures]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((m) => ({ ...m, date: m.date.slice(0, 10) })),
    [mesures]
  );

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function startEdit(m) {
    setEditingId(m.id);
    setForm({
      date: m.date.slice(0, 10),
      poids: m.poids ?? '',
      bras: m.bras ?? '',
      taille: m.taille ?? '',
      poitrine: m.poitrine ?? '',
      cuisse: m.cuisse ?? '',
      notes: m.notes ?? '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const payload = {
      poids: form.poids === '' ? undefined : Number(form.poids),
      bras: form.bras === '' ? undefined : Number(form.bras),
      taille: form.taille === '' ? undefined : Number(form.taille),
      poitrine: form.poitrine === '' ? undefined : Number(form.poitrine),
      cuisse: form.cuisse === '' ? undefined : Number(form.cuisse),
      notes: form.notes || undefined,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await mesuresApi.update(editingId, payload);
      } else {
        await clientsApi.createMesure(clientId, { date: form.date, ...payload });
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer cette mesure ?')) return;
    await mesuresApi.remove(id);
    if (editingId === id) cancelEdit();
    load();
  }

  if (loading) return <p className="text-sm text-graphite-500">Chargement…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-lg font-medium text-graphite-900">Mesures corporelles</h2>

      <form onSubmit={handleSubmit} className="rounded border border-chalk-200 bg-white p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="block text-xs text-graphite-600">Date</label>
            <input
              type="date"
              disabled={Boolean(editingId)}
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
              className="mt-1 w-full rounded border border-chalk-300 px-2 py-1.5 text-sm disabled:bg-chalk-100"
            />
          </div>
          <NumberField label="Poids (kg)" value={form.poids} onChange={(v) => setField('poids', v)} step="0.1" />
          <NumberField label="Bras (cm)" value={form.bras} onChange={(v) => setField('bras', v)} step="0.1" />
          <NumberField label="Taille (cm)" value={form.taille} onChange={(v) => setField('taille', v)} step="0.1" />
          <NumberField
            label="Poitrine (cm)"
            value={form.poitrine}
            onChange={(v) => setField('poitrine', v)}
            step="0.1"
          />
          <NumberField label="Cuisse (cm)" value={form.cuisse} onChange={(v) => setField('cuisse', v)} step="0.1" />
          <div className="col-span-2 sm:col-span-2">
            <label className="block text-xs text-graphite-600">Notes</label>
            <input
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              className="mt-1 w-full rounded border border-chalk-300 px-2 py-1.5 text-sm"
            />
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-graphite-900 px-4 py-2 text-sm font-medium text-white hover:bg-graphite-800 disabled:opacity-50"
          >
            {submitting ? 'Enregistrement…' : editingId ? 'Enregistrer' : '+ Ajouter une mesure'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded border border-chalk-300 px-4 py-2 text-sm text-graphite-700 hover:bg-chalk-100"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {mesures.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="h-64 rounded border border-chalk-200 bg-white p-4">
              <p className="mb-2 text-sm font-medium text-graphite-700">Poids (kg)</p>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="poids" stroke="#1c1f24" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="h-64 rounded border border-chalk-200 bg-white p-4">
              <p className="mb-2 text-sm font-medium text-graphite-700">Tours (cm)</p>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="bras" name="Bras" stroke="#4d7488" connectNulls />
                  <Line type="monotone" dataKey="taille" name="Taille" stroke="#66875c" connectNulls />
                  <Line type="monotone" dataKey="poitrine" name="Poitrine" stroke="#d95f2b" connectNulls />
                  <Line type="monotone" dataKey="cuisse" name="Cuisse" stroke="#9a3f1c" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <ul className="divide-y divide-chalk-200 rounded border border-chalk-200 bg-white text-sm">
            {mesures.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-4 px-4 py-2">
                <span className="font-mono text-graphite-500">{new Date(m.date).toLocaleDateString('fr-FR')}</span>
                <span className="flex-1 text-graphite-900">
                  {m.poids != null && `${m.poids} kg`}
                  {m.bras != null && ` · Bras ${m.bras}`}
                  {m.taille != null && ` · Taille ${m.taille}`}
                  {m.poitrine != null && ` · Poitrine ${m.poitrine}`}
                  {m.cuisse != null && ` · Cuisse ${m.cuisse}`}
                  {m.notes && ` · ${m.notes}`}
                </span>
                <button type="button" onClick={() => startEdit(m)} className="text-graphite-600 hover:underline">
                  Modifier
                </button>
                <button type="button" onClick={() => handleDelete(m.id)} className="text-red-600 hover:underline">
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function NumberField({ label, value, onChange, step }) {
  return (
    <div>
      <label className="block text-xs text-graphite-600">{label}</label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded border border-chalk-300 px-2 py-1.5 text-sm"
      />
    </div>
  );
}
