import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { publicApi } from '../lib/api';

export function PublicProspectPage() {
  const { slug } = useParams();
  const [coachNom, setCoachNom] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [nom, setNom] = useState('');
  const [contact, setContact] = useState('');
  const [objectif, setObjectif] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  useEffect(() => {
    publicApi
      .getCoach(slug)
      .then((data) => setCoachNom(data.nom))
      .catch(() => setNotFound(true));
  }, [slug]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!nom.trim() || !contact.trim()) {
      setError('Nom et contact sont obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      await publicApi.submitProspect(slug, {
        nom: nom.trim(),
        contact: contact.trim(),
        objectif: objectif.trim() || undefined,
        message: message.trim() || undefined,
      });
      setEnvoye(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (notFound) {
    return (
      <div className="mx-auto mt-16 max-w-sm text-center">
        <p className="text-sm text-gray-600">Cette page n'existe pas ou n'est plus disponible.</p>
      </div>
    );
  }

  if (envoye) {
    return (
      <div className="mx-auto mt-16 max-w-sm text-center">
        <h1 className="mb-2 text-xl font-medium text-gray-900">Merci !</h1>
        <p className="text-sm text-gray-600">
          Votre demande a bien été envoyée{coachNom ? ` à ${coachNom}` : ''}. Vous serez recontacté(e)
          prochainement.
        </p>
      </div>
    );
  }

  if (!coachNom) return <p className="mx-auto mt-16 max-w-sm text-sm text-gray-500">Chargement…</p>;

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-1 text-xl font-medium text-gray-900">{coachNom}</h1>
      <p className="mb-6 text-sm text-gray-600">
        Laissez vos coordonnées et votre objectif, {coachNom} vous recontactera.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom *</label>
          <input
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email ou téléphone *</label>
          <input
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Votre objectif</label>
          <input
            value={objectif}
            onChange={(e) => setObjectif(e.target.value)}
            placeholder="Ex. perdre du poids, prendre du muscle…"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? 'Envoi…' : 'Envoyer ma demande'}
        </button>
      </form>
    </div>
  );
}
