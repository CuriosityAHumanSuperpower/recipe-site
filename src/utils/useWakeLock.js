import { useEffect, useState } from 'react';

// Empêche l'écran de se mettre en veille pendant qu'on cuisine (API Screen
// Wake Lock, gérée par la plupart des navigateurs récents, y compris mobiles).
// Le verrou est relâché automatiquement quand l'onglet passe en arrière-plan :
// on le reprend au retour.
export function useWakeLock() {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!supported || !enabled) return undefined;
    let sentinel = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        sentinel = await navigator.wakeLock.request('screen');
        if (cancelled) sentinel.release();
      } catch {
        setEnabled(false);
      }
    };
    const onVisible = () => { if (document.visibilityState === 'visible') acquire(); };

    acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      sentinel?.release().catch(() => {});
    };
  }, [supported, enabled]);

  return { supported, enabled, setEnabled };
}
