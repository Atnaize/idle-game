/* ===================================================================
   THEME HOOK
   ===================================================================

   React hook for applying the DNA Helix theme.
   Applies CSS custom properties to document root on mount.
   ================================================================ */

import { useEffect } from 'react';
import { defaultTheme, type Theme } from '@config/themes';

export function useTheme() {
  useEffect(() => {
    applyTheme(defaultTheme);
  }, []);

  return {
    currentTheme: defaultTheme,
  };
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  // Apply each color custom property
  Object.entries(theme.colors).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  // Add data attribute for CSS targeting
  root.setAttribute('data-theme', theme.id);
}
