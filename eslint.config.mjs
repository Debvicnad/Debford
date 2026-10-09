import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // These rules produce false positives for valid React patterns:
      // - hydration guards (`setIsMounted(true)` on mount)
      // - derived state initialization from props in effects
      // - clearing state when a dependency becomes falsy
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Server actions and Supabase integration files use `any` extensively
  // because Supabase's JS client returns untyped generics for dynamic queries.
  // Without generated database types (supabase gen types), stricter typing
  // requires extensive manual casting that adds noise without safety benefit.
  {
    files: [
      "src/lib/actions/**/*.ts",
      "src/lib/db/**/*.ts",
      "src/lib/supabase/**/*.ts",
      "src/lib/context/**/*.tsx",
      "src/app/api/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
