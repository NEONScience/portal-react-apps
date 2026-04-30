import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import react from "eslint-plugin-react";
import jsxA11Y from "eslint-plugin-jsx-a11y";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import importPlugin from "eslint-plugin-import";
import reactHooksPlugin from 'eslint-plugin-react-hooks';

import parentConfig from "../../eslint.config.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const sourceFiles = ["src/**/*.{js,jsx,ts,tsx}"];

const airbnbConfigs = [
  ...compat.extends("airbnb"),
  ...compat.extends("airbnb/hooks"),
].map((config) => ({
  ...config,
  files: sourceFiles,
}));

export default defineConfig([
  globalIgnores([
    "**/server.js",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/",
  ]),
  ...airbnbConfigs,
  parentConfig,
  {
    name: "Base plugins",
    plugins: {
      "@typescript-eslint": typescriptEslint,
      react,
      "jsx-a11y": jsxA11Y,
      import: importPlugin,
      "react-hooks": reactHooksPlugin,
    },
  },
  {
    name: "Javascript and React rules",
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    name: "Typescript and React rules",
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    name: "global rules",
    rules: {
      "linebreak-style": 0,
      "eslint linebreak-style": [0, "error", "windows"],
      "react/jsx-props-no-spreading": "off",
      "no-const-assign": "warn",
      "no-this-before-super": "warn",
      "no-undef": "warn",
      "no-unreachable": "warn",
      "no-unused-vars": "warn",
      "constructor-super": "warn",
      "valid-typeof": "warn",
      "quotes": "off",
      "max-len": ["warn", 120],
      "react/jsx-uses-react": 2,
      "react/jsx-uses-vars": 2,
      "import/no-extraneous-dependencies": "off"
    },
  },
]);