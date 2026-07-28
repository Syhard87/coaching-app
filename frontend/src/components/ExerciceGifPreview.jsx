import { useEffect, useState } from 'react';
import { exercicesApi } from '../lib/api';

// Suggestion automatique de GIF de démonstration pour un exercice standard — US-2.5.
// Ne s'affiche que si une correspondance est trouvée ; sinon le coach garde le lien vidéo saisi à côté.
export function ExerciceGifPreview({ nom }) {
  const [gifUrl, setGifUrl] = useState(null);

  useEffect(() => {
    if (!nom?.trim()) {
      setGifUrl(null);
      return;
    }
    let annule = false;
    const timeout = setTimeout(() => {
      exercicesApi
        .gif(nom.trim())
        .then((data) => {
          if (!annule) setGifUrl(data.gifUrl);
        })
        .catch(() => {
          if (!annule) setGifUrl(null);
        });
    }, 500);
    return () => {
      annule = true;
      clearTimeout(timeout);
    };
  }, [nom]);

  if (!gifUrl) return null;

  return (
    <img
      src={gifUrl}
      alt={`Démonstration : ${nom}`}
      title={`Démonstration : ${nom}`}
      className="col-span-1 h-9 w-9 rounded border border-gray-200 object-cover"
    />
  );
}
