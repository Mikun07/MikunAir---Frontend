import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  js.configs.recommended,

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,

      // TypeScript handles undefined references no-undef produces false positives on DOM types
      'no-undef': 'off',

      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  {
    // vi.importActual<typeof import(...)> is idiomatic Vitest — consistent-type-imports
    // cannot rewrite dynamic import() expressions used as type arguments.
    files: ['src/**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },

  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', '*.config.js', '*.config.ts'],
  },
];
