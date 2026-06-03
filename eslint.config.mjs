/* eslint-disable no-underscore-dangle */
import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'eslint/config';
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import globals from 'globals';

import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import nextPlugin from '@next/eslint-plugin-next';
import importPlugin from 'eslint-plugin-import';
import stylisticPluginJs from '@stylistic/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_AVAILABILITY_APP_DIR = 'apps/data-availability';
const DATA_PRODUCT_DETAIL_APP_DIR = 'apps/data-product-detail';
const EXPLORE_APP_DIR = 'apps/explore-data-products';
const PROTOTYPE_DATA_DIR = 'apps/prototype-data';
const SAMPLE_EXPLORER_DIR = 'apps/sample-explorer';
const TAXONOMIC_LISTS_DIR = 'apps/taxonomic-lists';

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const jsPlugins = {
  '@next/next': nextPlugin,
  react: reactPlugin,
  'react-hooks': reactHooksPlugin,
  import: importPlugin,
  'jsx-a11y': jsxA11yPlugin,
  '@stylistic': stylisticPluginJs,
};
const tsPlugins = {
  ...jsPlugins,
  '@typescript-eslint': tsPlugin,
};
const settings = {
  'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
  'import/resolver': {
    typescript: {
      project: './tsconfig.json',
    },
    node: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
    },
  },
  react: {
    version: 'detect',
  },
};
const jsRules = {
  ...eslint.configs.recommended.rules,
};
const rules = {
  ...jsRules,
  ...tsPlugin.configs.recommended.rules,
  ...jsxA11yPlugin.configs.recommended.rules,
  ...importPlugin.configs.recommended.rules,
  ...reactPlugin.configs.recommended.rules,
  ...reactHooksPlugin.configs.recommended.rules,
  ...nextPlugin.configs.recommended.rules,
  ...nextPlugin.configs['core-web-vitals'].rules,
  ...stylisticPluginJs.configs.recommended.rules,
  '@next/next/no-img-element': 'off',
  '@next/next/no-html-link-for-pages': 'off',

  '@typescript-eslint/no-shadow': 'error',
  '@typescript-eslint/no-use-before-define': 'warn',
  '@typescript-eslint/no-unused-vars': 'off',
  '@typescript-eslint/no-explicit-any': 'off',

  'import/no-extraneous-dependencies': [
    'error',
    { packageDir: './' },
  ],
  'import/extensions': [
    'error',
    'ignorePackages',
    {
      js: 'never',
      jsx: 'never',
      ts: 'never',
      tsx: 'never',
    },
  ],
  'import/no-relative-packages': 'off',

  'react/function-component-definition': 'off',
  'react/display-name': 'off',
  'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
  'react/jsx-props-no-spreading': 'off',
  'react/require-default-props': 'off',

  'linebreak-style': ['error', 'unix'],
  'no-shadow': 'off',
  'no-restricted-exports': 'off',
  'no-unused-vars': 'off',
  'max-len': ['error', { code: 120 }],

  '@stylistic/max-len': ['error', { code: 120 }],
  '@stylistic/semi': ['error', 'always'],
  '@stylistic/quote-props': 'off',
  '@stylistic/space-infix-ops': 'off',
  '@stylistic/arrow-parens': 'off',
  '@stylistic/member-delimiter-style': [
    'error',
    {
      multiline: {
        delimiter: 'semi',
        requireLast: true,
      },
      singleline: {
        delimiter: 'semi',
        requireLast: false,
      },
    },
  ],
  '@stylistic/jsx-one-expression-per-line': 'off',
  '@stylistic/linebreak-style': ['error', 'unix'],
  '@stylistic/no-extra-parens': 'off',
  '@stylistic/no-shadow': 'off',
  '@stylistic/no-restricted-exports': 'off',
  '@stylistic/no-unused-vars': 'off',
  '@stylistic/max-statements-per-line': 'off',
  '@stylistic/multiline-ternary': 'off',
  '@stylistic/indent-binary-ops': 'off',
  '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
  '@stylistic/quotes': ['error', 'single'],
  '@stylistic/indent': [
    'error',
    2,
    {
      ignoredNodes: ['TSInterfaceDeclaration'],
    },
  ],
};

const buildAppConfig = (appDir) => ([
  {
    files: [
      `./${appDir}/*.{js,mjs}`,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    plugins: jsPlugins,
    settings,
    rules: {
      ...jsRules,
      'import/no-extraneous-dependencies': [
        'error',
        { packageDir: `./${appDir}/`, devDependencies: true },
      ],
    },
  },
  {
    files: [
      `./${appDir}/src/**/*.{ts,tsx,js,jsx}`,
    ],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: `${__dirname}/${appDir}/`,
        ecmaFeatures: {
          impliedStrict: true,
          jsx: true,
          experimentalObjectRestSpread: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: tsPlugins,
    settings,
    rules: {
      ...rules,
      'import/no-extraneous-dependencies': [
        'error',
        { packageDir: `./${appDir}/` },
      ],
    },
  },
  {
    files: [
      `./${appDir}/next.config.ts`,
    ],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: `${__dirname}/${appDir}/`,
        ecmaFeatures: {
          impliedStrict: true,
          jsx: true,
          experimentalObjectRestSpread: true,
        },
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: tsPlugins,
    settings,
    rules: {
      ...rules,
      'import/no-extraneous-dependencies': [
        'error',
        { packageDir: `./${appDir}/`, devDependencies: true },
      ],
    },
  },
]);

export default defineConfig([
  ...compat.extends('airbnb'),
  {
    ignores: [
      'apps/**/src/**/__tests__',
      'apps/**/src/**/__mocks__',
      'apps/**/lib/',
      'apps/**/.next/',
      'apps/**/build/',
      'apps/**/node_modules/',
      'node_modules/',
      'test-coverage/',
    ],
  },
  {
    files: ['*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    plugins: jsPlugins,
    settings,
    rules: {
      ...jsRules,
      'import/no-extraneous-dependencies': [
        'error',
        { packageDir: './', devDependencies: true },
      ],
    },
  },
  ...buildAppConfig(DATA_AVAILABILITY_APP_DIR),
  ...buildAppConfig(DATA_PRODUCT_DETAIL_APP_DIR),
  ...buildAppConfig(EXPLORE_APP_DIR),
  ...buildAppConfig(PROTOTYPE_DATA_DIR),
  ...buildAppConfig(SAMPLE_EXPLORER_DIR),
  ...buildAppConfig(TAXONOMIC_LISTS_DIR),
]);
