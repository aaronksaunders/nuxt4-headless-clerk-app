/**
 * Guest middleware for public routes
 * Redirects authenticated users to the dashboard
 * Following Nuxt 4 authentication patterns
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server side - use correct Nuxt 4 pattern
  if (import.meta.server) return;

  // Only check Clerk directly to avoid useAuth() sync issues
  if (typeof window !== "undefined" && window.Clerk && window.Clerk.loaded) {
    if (window.Clerk.user && window.Clerk.session) {
      console.log(
        "✅ User is authenticated (direct Clerk check), redirecting to dashboard..."
      );
      return navigateTo("/dashboard");
    }
  }

  console.log("ℹ️ User not authenticated, allowing access to:", to.path);
});
