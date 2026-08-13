import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'no-alert': 'warn',
      'no-debugger': 'error',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
    },
  },
  eslintConfigPrettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'coverage/**',
    'output/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
