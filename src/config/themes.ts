/* ===================================================================
   THEME DEFINITION
   ===================================================================

   DNA Helix theme configuration.
   Theme colors are defined as CSS custom properties.
   ================================================================ */

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    [key: string]: string;
  };
}

export const dnaHelixTheme: Theme = {
  id: 'dna-helix',
  name: 'DNA Helix',
  description: 'Blue, purple, and pink double helix sci-fi theme',
  colors: {
    '--helix-blue': '#3b82f6',
    '--helix-purple': '#a855f7',
    '--helix-pink': '#ec4899',
    '--tech-cyan': '#06b6d4',
    '--tech-green': '#10b981',
    '--tech-amber': '#fbbf24',
    '--tech-red': '#ef4444',
    '--tech-indigo': '#6366f1',
    '--bg-deepest': '#050816',
    '--bg-deep': '#0a1128',
    '--bg-elevated': '#0f1729',
    '--bg-surface': '#1a2942',
  },
};

export const defaultTheme = dnaHelixTheme;
