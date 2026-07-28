import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { clientsApi } from '../../lib/api';
import { VendreAbonnementModal } from './VendreAbonnementModal';

function abonnementActifPour(abonnements, module, maintenant) {
  return abonnements
    .filter((a) => a.catalogueAbonnement.module === module || a.catalogueAbonnement.module === 'PACK_COMPLET')
    .filter((a) => new Date(a.dateFin) > maintenant)
    .sort((a, b) => new Date(b.dateFin) - new Date(a.dateFin))[0];
}

// En-tête de fiche client : état des modules (Sport/Diète), barre de progression animée
// vers l'expiration, vente d'un abonnement — cahier des charges section 5 (T10.2/T10.5).
export function AbonnementsHeader({ clientId, onChange }) {
  const [abonnements, setAbonnements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vente, setVente] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    clientsApi
      .listAbonnements(clientId)
      .then(setAbonnements)
      .finally(() => setLoading(false));
  }, [clientId]);

  useEffect(load, [load]);

  if (loading) return null;

  const maintenant = new Date();
  const sport = abonnementActifPour(abonnements, 'SPORT', maintenant);
  const diete = abonnementActifPour(abonnements, 'DIETE', maintenant);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded border border-chalk-200 bg-white p-4">
      <ModuleBadge label="Sport" abonnement={sport} maintenant={maintenant} />
      <ModuleBadge label="Diète" abonnement={diete} maintenant={maintenant} />
      <button
        type="button"
        onClick={() => setVente(true)}
        className="ml-auto rounded border border-chalk-300 px-3 py-1.5 text-sm text-graphite-700 hover:bg-chalk-100"
      >
        Vendre un abonnement
      </button>

      {vente && (
        <VendreAbonnementModal
          clientId={clientId}
          onClose={() => setVente(false)}
          onVendu={() => {
            setVente(false);
            load();
            onChange?.();
          }}
        />
      )}
    </div>
  );
}

function ModuleBadge({ label, abonnement, maintenant }) {
  if (!abonnement) {
    return (
      <span className="rounded-full bg-chalk-100 px-3 py-1 text-xs font-medium text-graphite-500">
        {label} — non souscrit
      </span>
    );
  }

  const debut = new Date(abonnement.dateDebut).getTime();
  const fin = new Date(abonnement.dateFin).getTime();
  const pourcentage = Math.min(100, Math.max(0, ((maintenant.getTime() - debut) / (fin - debut)) * 100));

  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full bg-moss-100 px-3 py-1 text-xs font-medium text-moss-600">
        {label} actif — jusqu'au {new Date(abonnement.dateFin).toLocaleDateString('fr-FR')}
      </span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-chalk-200">
        <motion.div
          className="h-full rounded-full bg-moss-500"
          initial={{ width: 0 }}
          animate={{ width: `${pourcentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
