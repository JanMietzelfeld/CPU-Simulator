import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
import js from "@eslint/js";

export default defineConfig(

  {
    ignores: ["node_modules", "dist", "out", ".webpack", "docs", "**/*.js"],
  },

  js.configs.recommended,
  tseslint.configs.recommended,

  {
    files: ["src/**/*.ts"],

    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    plugins: {
      import: importPlugin,
    },

    settings: {
      "import/resolver": {
        node: true,
        typescript: true,
      },
    },

    rules: {
      "@typescript-eslint/no-namespace": "off"
    }
  },

  {
    files: ["src/main/**/*.ts"],
    languageOptions: {
      globals: {
        process: "readonly",
        __dirname: "readonly",
        Buffer: "readonly",
      },
    },
  },

  {
    files: ["src/renderer/**/*.ts"],
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
      },
    },
  }
);