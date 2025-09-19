/**
 * Authentication middleware for protected routes
 * Redirects unauthenticated users to the home page
 * Following Nuxt 4 authentication patterns
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server side - use correct Nuxt 4 pattern
  if (import.meta.server) return;

  // Only check Clerk directly to avoid useAuth() sync issues
  if (typeof window !== "undefined" && window.Clerk && window.Clerk.loaded) {
    if (!window.Clerk.user || !window.Clerk.session) {
      console.log("❌ User not authenticated, redirecting to home...");
      return navigateTo("/");
    }
  }

  console.log("✅ User is authenticated, allowing access to:", to.path);
});
