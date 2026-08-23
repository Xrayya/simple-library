import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import pluginQuery from "@tanstack/eslint-plugin-query";
import reactHooks from "eslint-plugin-react-hooks";
import eslintPluginTailwindcss from "eslint-plugin-tailwindcss";

export default defineConfig([
  {
    ignores: ["**/dist", "**/node_modules", "**/.routeTree.gen.ts"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  {
    // @ts-expect-error this is tsserver error but eslint behave just fine
    extends: [eslintPluginTailwindcss.configs.recommended],
    settings: {
      tailwindcss: {
        cssConfigPath: "./src/styles.css",
      },
    },
  },
  tseslint.configs.recommended,
  {
    extends: [pluginReact.configs.flat.recommended],
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
    },
  },
  reactHooks.configs.flat.recommended,
  ...pluginQuery.configs["flat/recommended-strict"],
]);
