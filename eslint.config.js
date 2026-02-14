import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'external/**',
      'sandbox/**',
      'bin/**',
      'obj/**',
      'spikes/**',
      '**/*.d.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ['packages/*/src/**/*.{ts,tsx}'],
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
    rules: {
      /* Project-specific rules (from coding standards) */
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      'no-console': 'warn',
      'no-empty': 'warn',
      'max-lines': ['warn', { max: 400, skipBlankLines: true, skipComments: true }],
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Prefer named exports over default exports (see ADR-0003).',
        },
      ],

      /* Downgrade inherited error-level rules to warn */
      'prefer-const': 'warn',
      'no-var': 'warn',
      'no-useless-escape': 'warn',
      'no-fallthrough': 'warn',
      'no-useless-assignment': 'warn',
      'no-empty-pattern': 'warn',
      'no-case-declarations': 'warn',
      'no-async-promise-executor': 'warn',
      'no-useless-catch': 'warn',
      'prefer-spread': 'warn',
      'prefer-rest-params': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
    },
  },
);
