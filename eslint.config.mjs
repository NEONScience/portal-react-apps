import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([{
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.commonjs,
            ...globals.node,
        },
    },

    settings: {
        "import/extensions": [".js", ".jsx", ".ts", ".tsx"],

        "import/resolver": {
            node: {
                extensions: [".js", ".jsx", ".ts", ".tsx"],
            },
        },
    },

    rules: {
        "max-len": ["warn", 120],
        "no-const-assign": "warn",
        "no-this-before-super": "warn",
        "no-undef": "warn",
        "no-unreachable": "warn",
        "no-unused-vars": "warn",
        "constructor-super": "warn",
        "valid-typeof": "warn",
        "react/jsx-uses-react": 2,
        "react/jsx-uses-vars": 2,
        "linebreak-style": 0,

        "no-plusplus": ["error", {
            allowForLoopAfterthoughts: true,
        }],

        "eslint linebreak-style": [0, "error", "windows"],

        "import/no-extraneous-dependencies": ["error", {
            packageDir: "./",
        }],

        "react/jsx-fragments": "off",
        "react/no-array-index-key": "off",

        "react/jsx-filename-extension": [2, {
            extensions: [".js", ".jsx", ".ts", ".tsx"],
        }],

        "import/extensions": ["error", "ignorePackages", {
            js: "never",
            jsx: "never",
            ts: "never",
            tsx: "never",
        }],
    },
}]);