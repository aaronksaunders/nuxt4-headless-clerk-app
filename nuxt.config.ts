import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ["@nuxtjs/tailwindcss", "@nuxt/image"],

  // Plugins are automatically registered from app/plugins/ directory

  // Runtime config for Clerk
  runtimeConfig: {
    public: {
      clerk: {
        publishableKey: process.env.NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      },
    },
  },

  // Auto-import Clerk Vue composables
  imports: {
    dirs: ["composables/**"],
  },

  // Configure auto-imports for Clerk Vue
  nitro: {
    experimental: {
      wasm: true,
    },
  },

  // Force client-only rendering for clerk pages
  routeRules: {
    "/dashboard": { ssr: false },
    "/": { ssr: false },
  },

  compatibilityDate: "2025-05-15",
});
