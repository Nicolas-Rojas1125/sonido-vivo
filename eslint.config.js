import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'karma.conf.cjs']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Archivos de prueba: se ejecutan con Jasmine dentro de Karma
    files: ['src/**/*.spec.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.jasmine },
    },
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
