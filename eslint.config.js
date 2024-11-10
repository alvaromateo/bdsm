import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['.vscode/', 'node_modules/', 'dist/', 'coverage', 'package-lock.json'],
  },
  {
    languageOptions: { globals: { ...globals.browser, ...globals.jest } },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
