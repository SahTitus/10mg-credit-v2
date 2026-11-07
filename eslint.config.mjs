import nextConfig from 'eslint-config-next/core-web-vitals';
import nextTypescriptConfig from 'eslint-config-next/typescript';

const eslintConfig = [
  ...nextConfig,
  ...nextTypescriptConfig,
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'coverage/**'],
  },
  {
    rules: {
      'max-lines': [
        'error',
        {
          max: 600,
          skipBlankLines: true,
          skipComments: true, // The file-size script still counts blank lines and comments
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      // Keep error logs in development because production builds remove console calls
      'no-console': ['error', { allow: ['error'] }],
      'prefer-const': 'error',
      'react-hooks/incompatible-library': 'off',
    },
  },
  {
    files: ['scripts/**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['postcss.config.mjs'],
    rules: {
      'import/no-anonymous-default-export': 'off',
    },
  },
];

export default eslintConfig;
