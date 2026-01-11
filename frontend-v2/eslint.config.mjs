import typescriptEslint from "@typescript-eslint/eslint-plugin";

import { FlatCompat } from "@eslint/eslintrc";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      "@typescript-eslint": typescriptEslint,
    },
    rules: {
      // Import sorting - types first, then other imports
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // Side effect imports
            ["^\\u0000"],
            // Type imports (must come before other imports)
            ["^type", "^@types"],
            // Node.js builtins
            ["^node:"],
            // Packages (things that start with a letter or digit)
            ["^@?\\w"],
            // Internal packages (absolute imports starting with @/)
            ["^@/"],
            // Parent imports (../)
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            // Other relative imports (./)
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            // Style imports
            ["^.+\\.s?css$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      
      // Enforce type imports for type-only imports
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
          disallowTypeAnnotations: false,
        },
      ],
      
      // Other important rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "prefer-const": "error",

      
    },
  },
];

export default eslintConfig;
