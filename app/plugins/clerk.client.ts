/**
 * Clerk initialization plugin for Nuxt 4
 * Uses @clerk/vue clerkPlugin like in Ionic Vue app
 */
import { defineNuxtPlugin, useRuntimeConfig } from "#app";

export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on client side
  if (import.meta.client) {
    const runtimeConfig = useRuntimeConfig();
    const publishableKey = runtimeConfig.public.clerk.publishableKey;

    if (!publishableKey) {
      console.error(
        "Clerk: Missing publishableKey. Please set NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file."
      );
      return;
    }

    // Import clerkPlugin from @clerk/vue (same as your Ionic Vue app)
    const { clerkPlugin } = await import("@clerk/vue");

    // Initialize Clerk using the plugin approach
    await nuxtApp.vueApp.use(clerkPlugin, {
      publishableKey: publishableKey,
    });

    // Make Clerk available globally for compatibility
    if (window.Clerk) {
      console.log("✅ Clerk client initialized successfully via clerkPlugin.");
    } else {
      console.warn("⚠️ Clerk not available on window object after plugin initialization");
    }
  }
});
