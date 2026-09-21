import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([
    "**/coverage/**",
    "**/dist/**",
    "**/node_modules/**",
    "project/**",
  ]),
  {
    name: "agora/configuration",
    files: ["*.{js,mjs,cjs}"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    name: "agora/typescript",
    files: ["backend/**/*.ts", "frontend/**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["backend/vitest.config.ts"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    name: "agora/backend",
    files: ["backend/**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    name: "agora/frontend",
    files: ["frontend/**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      globals: globals.browser,
    },
  },
);
