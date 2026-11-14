import { useLayoutEffect } from 'react';

// Publie la hauteur d'un élément dans une variable CSS sur <html>, mise à
// jour à chaque redimensionnement (rotation du téléphone, retour à la ligne…).
export function useHeightVar(ref, varName) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const root = document.documentElement;
    const update = () => root.style.setProperty(varName, `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty(varName);
    };
  }, [ref, varName]);
}
