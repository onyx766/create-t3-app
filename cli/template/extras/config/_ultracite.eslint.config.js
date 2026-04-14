import { defineConfig } from "eslint/config";
import core from "ultracite/eslint/core";
import next from "ultracite/eslint/next";
import react from "ultracite/eslint/react";
export default defineConfig([
  {
    extends: [core, next, react],
  },
]);
