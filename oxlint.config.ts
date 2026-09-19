import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import { jsPluginSettings, selectJsPlugins } from "ultracite/oxlint/js-plugins";
import react from "ultracite/oxlint/react";
import tanstack from "ultracite/oxlint/tanstack";
import tanstackJsPlugins from "ultracite/oxlint/tanstack/js-plugins";
import vitest from "ultracite/oxlint/vitest";

const jsPlugins = selectJsPlugins(["react-doctor"]);

export default defineConfig({
  extends: [core, react, tanstack, vitest, tanstackJsPlugins, jsPlugins],
  ignorePatterns: core.ignorePatterns,
  jsPlugins: jsPlugins.jsPlugins,
  settings: jsPluginSettings,
  rules: {
    "react/function-component-definition": "off",
    "eslint/complexity": "off",
    "eslint/no-nested-ternary": "warn",
    "react-doctor/use-lazy-motion": "off",
    "react-doctor/only-export-components": "off",
    "react-doctor/no-long-transition-duration": "off",
    "react-doctor/prefer-use-effect-event": "off",
    "react-doctor/no-permanent-will-change": "warn",
    "react-doctor/no-layout-property-animation": "off",
    "jsx-a11y/prefer-tag-over-role": "off",
    "react/set-state-in-effect": "off",
  },
});
