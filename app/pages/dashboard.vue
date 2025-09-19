<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

            <!-- User Info - Client Only to prevent hydration mismatch -->
            <ClientOnly>
              <div class="mb-6">
                <!-- Loading State -->
                <div
                  v-if="!isLoaded"
                  class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4"
                >
                  <h3 class="font-bold">🔄 Loading Authentication...</h3>
                  <p>Please wait while we load your authentication state.</p>
                </div>

                <!-- Not Signed In -->
                <div
                  v-else-if="isLoaded && !isSignedIn"
                  class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
                >
                  <h3 class="font-bold">❌ Not Signed In</h3>
                  <p>
                    You are not currently signed in. Please sign in to view your
                    dashboard.
                  </p>
                  <p class="mt-2">
                    <a href="/" class="text-red-800 underline">Go to Sign In</a>
                  </p>
                </div>

                <!-- Signed In but No User Data -->
                <div
                  v-else-if="isLoaded && isSignedIn && !user"
                  class="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-4"
                >
                  <h3 class="font-bold">⚠️ Signed In but No User Data</h3>
                  <p>
                    You are signed in but user information is not available.
                  </p>
                </div>

                <!-- Signed In with User Data -->
                <div
                  v-else-if="isLoaded && isSignedIn && user"
                  class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
                >
                  <h3 class="font-bold text-lg">
                    ✅ Welcome to your Dashboard!
                  </h3>
                  <div class="mt-3 space-y-2">
                    <div class="flex items-center">
                      <span class="font-semibold w-20">Email:</span>
                      <span class="text-green-800">{{
                        user?.emailAddresses?.[0]?.emailAddress ||
                        "No email found"
                      }}</span>
                    </div>
                    <div class="flex items-center">
                      <span class="font-semibold w-20">Name:</span>
                      <span class="text-green-800">{{
                        user?.firstName && user?.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user?.firstName || user?.lastName || "No name found"
                      }}</span>
                    </div>
                    <div class="flex items-center">
                      <span class="font-semibold w-20">ID:</span>
                      <span class="text-green-800 font-mono text-sm">{{
                        user?.id || "No ID found"
                      }}</span>
                    </div>
                    <div class="flex items-center">
                      <span class="font-semibold w-20">Session:</span>
                      <span class="text-green-800 font-mono text-sm">{{
                        sessionInfo?.id || "None"
                      }}</span>
                    </div>
                    <div class="flex items-center">
                      <span class="font-semibold w-20">Status:</span>
                      <span class="text-green-800">
                        {{
                          user?.emailAddresses?.[0]?.verification?.status ===
                          "verified"
                            ? "✅ Verified"
                            : "⏳ Pending"
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ClientOnly>

            <!-- Actions -->
            <div class="space-y-4">
              <button
                @click="testProtectedAPI"
                :disabled="apiLoading"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {{ apiLoading ? "Testing..." : "Test Protected API (JWT)" }}
              </button>

              <button
                @click="handleSignOutClick"
                :disabled="authLoading"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {{ authLoading ? "Signing out..." : "Sign Out" }}
              </button>
            </div>

            <!-- API Response -->
            <div
              v-if="apiResponse"
              class="mt-6 bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded text-sm"
            >
              <h4 class="font-bold">API Response:</h4>
              <pre class="mt-2 whitespace-pre-wrap">{{
                JSON.stringify(apiResponse, null, 2)
              }}</pre>
            </div>

            <!-- Debug Info (Development Only) - Client Only -->
            <ClientOnly>
              <div
                v-if="isLoaded"
                class="mt-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm"
              >
                <h4 class="font-bold">Debug Info:</h4>
                <div class="mt-2 space-y-1">
                  <p>
                    <strong>Auth State:</strong>
                    {{ isSignedIn ? "Signed In" : "Signed Out" }}
                  </p>
                  <p><strong>Loaded:</strong> {{ isLoaded ? "Yes" : "No" }}</p>
                  <p>
                    <strong>Session ID:</strong> {{ sessionInfo?.id || "None" }}
                  </p>
                  <p>
                    <strong>User Created:</strong>
                    {{
                      user?.createdAt
                        ? new Date(user.createdAt).toLocaleString()
                        : "Unknown"
                    }}
                  </p>
                  <p>
                    <strong>Last Sign In:</strong>
                    {{
                      user?.lastSignInAt
                        ? new Date(user.lastSignInAt).toLocaleString()
                        : "Unknown"
                    }}
                  </p>
                  <div class="mt-3">
                    <strong>Raw User Object:</strong>
                    <pre
                      class="mt-1 text-xs bg-blue-100 p-2 rounded overflow-auto max-h-32"
                      >{{ safeStringify(user, 2) }}</pre
                    >
                  </div>
                </div>
              </div>
            </ClientOnly>

            <!-- Error Messages -->
            <div
              v-if="error"
              class="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
            >
              {{ error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Dashboard page - protected route that requires authentication
 */

// Apply auth middleware following Nuxt 4 pattern
definePageMeta({
  middleware: "auth",
  // Disable SSR for this page so @clerk/vue composables only run on client
  ssr: false,
});

// Meta tags
useHead({
  title: "Dashboard - Nuxt 4 + Clerk",
  meta: [
    {
      name: "description",
      content: "Protected dashboard page with Clerk authentication",
    },
  ],
});

// Use Clerk authentication composable
const { user, isSignedIn, isLoaded, apiCall, handleSignOut, getSessionInfo } =
  useClerkAuth();

// Expose a computed session info for template
const sessionInfo = computed(() => getSessionInfo());

// Safe JSON serialization function that handles circular references
const safeStringify = (obj: any, space?: number) => {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular Reference]";
        }
        seen.add(value);
      }
      return value;
    },
    space
  );
};

// UI state
const authLoading = ref(false);
const apiLoading = ref(false);
const error = ref("");
const apiResponse = ref<any>(null);

/**
 * Handle sign out
 */
const handleSignOutClick = async () => {
  authLoading.value = true;
  error.value = "";
  apiResponse.value = null;

  try {
    const result = await handleSignOut();

    if (result.success) {
      await navigateTo("/");
    } else {
      error.value = result.error || "Sign out failed";
    }
  } catch (err: any) {
    error.value = err.message || "Sign out failed";
  } finally {
    authLoading.value = false;
  }
};

/**
 * Test protected API call with token
 */
const testProtectedAPI = async () => {
  apiLoading.value = true;
  error.value = "";
  apiResponse.value = null;

  try {
    const response = await apiCall("/api/protected");
    apiResponse.value = response;
  } catch (err: any) {
    error.value = err.message || "API call failed";
  } finally {
    apiLoading.value = false;
  }
};

// Page mounted
onMounted(() => {
  console.log("🏠 Dashboard mounted");
});
</script>
