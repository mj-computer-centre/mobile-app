// One ESLint config for the whole repository. Besides Expo's recommended rules it enforces the
// architecture's dependency rules (docs/architecture/overview.md, "Module boundaries").
import { defineConfig, globalIgnores } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';

const featurePublicApi = {
  group: ['@/features/*/*'],
  message: 'Import another feature through its public index: @/features/<name>.',
};
const sharedPublicApi = {
  group: ['@mcc/shared/*'],
  message: 'Import from @mcc/shared, never from its internal paths.',
};

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/.expo/**',
    '**/coverage/**',
    'apps/mobile/public/**',
    // Deno code: checked with `deno check` (docs/operations/supabase.md), not Node's ESLint.
    'supabase/functions/**',
  ]),
  expoConfig,
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'import/no-cycle': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },
  {
    files: ['apps/mobile/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [featurePublicApi, sharedPublicApi] }],
    },
  },
  {
    // The design system knows nothing about features or infrastructure.
    files: ['apps/mobile/src/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            sharedPublicApi,
            {
              group: ['@/features/*', '@/lib/*', '@/app-shell/*'],
              message: 'ui/ must not depend on features, lib or the app shell.',
            },
          ],
        },
      ],
    },
  },
  {
    // Infrastructure is used by features, never the other way round.
    files: ['apps/mobile/src/lib/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            sharedPublicApi,
            {
              group: ['@/features/*', '@/ui', '@/ui/*', '@/app-shell/*'],
              message: 'lib/ must not depend on features, ui or the app shell.',
            },
          ],
        },
      ],
    },
  },
  {
    // Shared domain logic stays framework-free so it runs in the app, the tests and any server.
    files: ['packages/shared/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react-*',
                'react-native',
                'react-native-*',
                'expo',
                'expo-*',
                '@supabase/*',
                '@tanstack/*',
              ],
              message: '@mcc/shared must not depend on React, Expo or Supabase.',
            },
          ],
        },
      ],
    },
  },
]);
