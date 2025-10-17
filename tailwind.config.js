/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors (kept for backwards compatibility)
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',

        // DNA Helix theme colors (from CSS custom properties)
        'helix-blue': 'var(--helix-blue)',
        'helix-purple': 'var(--helix-purple)',
        'helix-pink': 'var(--helix-pink)',
        'tech-cyan': 'var(--tech-cyan)',
        'tech-green': 'var(--tech-green)',
        'tech-amber': 'var(--tech-amber)',
        'tech-red': 'var(--tech-red)',
        'tech-indigo': 'var(--tech-indigo)',

        // Background layers
        'bg-deepest': 'var(--bg-deepest)',
        'bg-deep': 'var(--bg-deep)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-surface': 'var(--bg-surface)',
        'bg-overlay': 'var(--bg-overlay)',
      },
      boxShadow: {
        'glow-blue': 'var(--glow-blue)',
        'glow-purple': 'var(--glow-purple)',
        'glow-pink': 'var(--glow-pink)',
        'glow-green': 'var(--glow-green)',
        'glow-cyan': 'var(--glow-cyan)',
        'glow-amber': 'var(--glow-amber)',
        'glow-helix': 'var(--glow-helix)',
        'shadow-glow-blue': 'var(--shadow-glow-blue)',
        'shadow-glow-purple': 'var(--shadow-glow-purple)',
      },
      animation: {
        'float': 'float 0.8s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'rainbow-glow': 'rainbowGlow 6s linear infinite',
        'spin-slow': 'spinSlow 20s linear infinite',
        'float-gentle': 'floatGentle 3s ease-in-out infinite',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
