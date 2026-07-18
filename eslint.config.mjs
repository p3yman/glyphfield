import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'coverage',
      'dist',
      'node_modules',
      'storybook-static',
      '.tmp',
      'fixtures/consumer',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
  {
    ...tseslint.configs.disableTypeChecked,
    files: ['.storybook/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
  },
  {
    files: ['stories/**/*.tsx', 'tests/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/static-components': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
);
