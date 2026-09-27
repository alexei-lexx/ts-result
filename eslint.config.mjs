// @ts-check
//
// See https://typescript-eslint.io/getting-started/

import eslint from "@eslint/js";
import checkFilePlugin from "eslint-plugin-check-file";
import importPlugin from "eslint-plugin-import-x";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    ignores: ["**/dist/"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    // flatConfigs.typescript's resolver doesn't support package.json "exports".
    // Swap in eslint-import-resolver-typescript, which does.
    settings: {
      "import-x/resolver": {
        typescript: true,
      },
    },
    plugins: {
      "check-file": checkFilePlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{ts,tsx}": "KEBAB_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      "import-x/order": [
        "error",
        {
          alphabetize: {
            order: "asc",
            caseInsensitive: false,
          },
        },
      ],
      "sort-imports": [
        "error",
        {
          ignoreDeclarationSort: true, // Let import-x/order handle this
          ignoreMemberSort: false, // Sort members alphabetically
        },
      ],
    },
  },
);
