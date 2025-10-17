import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['dist', 'node_modules', '*.cjs', '*.config.js', '*.config.ts'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      // React 17+ doesn't require React import
      'react/react-in-jsx-scope': 'off',

      // TypeScript provides prop type checking
      'react/prop-types': 'off',

      // === STRICT RULES (ERROR) ===

      // Catch ALL unused variables - no exceptions
      '@typescript-eslint/no-unused-vars': 'error',

      // Prefer const over let
      'prefer-const': 'error',

      // No var declarations
      'no-var': 'error',

      // Require === instead of ==
      'eqeqeq': ['error', 'always'],

      // Disallow console.log (use console.error/warn instead)
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // No duplicate imports
      'no-duplicate-imports': 'error',

      // === TYPESCRIPT STRICT (ERROR) ===

      // No explicit any (upgrade from warn to error)
      '@typescript-eslint/no-explicit-any': 'error',

      // No non-null assertions
      '@typescript-eslint/no-non-null-assertion': 'error',

      // Require return types on exported functions only
      '@typescript-eslint/explicit-module-boundary-types': 'off', // Too strict for React components

      // === CODE QUALITY (ERROR) ===

      // No empty functions
      '@typescript-eslint/no-empty-function': 'error',

      // Require array callback return
      'array-callback-return': 'error',

      // No unreachable code
      'no-unreachable': 'error',

      // === REACT RULES ===

      // Enforce hook rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // === RULES DISABLED (TypeScript handles) ===

      'no-undef': 'off', // TypeScript handles undefined variables
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
