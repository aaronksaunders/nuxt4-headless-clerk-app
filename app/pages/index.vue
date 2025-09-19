<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Nuxt 4 + Clerk Headless
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Complete authentication flow with token passing
        </p>
      </div>

      <!-- Authentication State -->
      <ClientOnly>
        <div class="space-y-4">
          <!-- Debug Info -->
          <div
            class="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded text-sm"
          >
            <p>
              <strong>Debug:</strong> isLoaded = {{ isLoaded }}, isSignedIn =
              {{ isSignedIn }}
            </p>
          </div>

          <div v-if="isLoaded" class="space-y-4">
            <!-- Signed In State -->
            <div
              v-if="isSignedIn"
              class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
            >
              <h3 class="font-bold">✅ Authenticated</h3>
              <p>
                Welcome,
                {{
                  user?.firstName || user?.emailAddresses?.[0]?.emailAddress
                }}!
              </p>
              <p class="text-sm mt-2">User ID: {{ user?.id }}</p>
            </div>

            <!-- Not Signed In State -->
            <div
              v-else
              class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded"
            >
              <h3 class="font-bold">🔒 Not Authenticated</h3>
              <p>Please sign in to access protected features</p>
            </div>

            <!-- Auth Forms -->
            <div v-if="!isSignedIn">
              <LoginForm
                v-if="showSignUp === false"
                :loading="authLoading"
                @sign-in="handleSignIn"
                @switch-to-sign-up="showSignUp = true"
              />
              <SignUpForm
                v-else
                :loading="authLoading"
                @sign-up="handleSignUp"
                @switch-to-sign-in="showSignUp = false"
              />
            </div>

            <!-- Authenticated Actions -->
            <div v-else class="space-y-4">
              <button
                @click="testProtectedAPI"
                :disabled="apiLoading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {{ apiLoading ? "Testing..." : "Test Protected API" }}
              </button>

              <button
                @click="handleSignOut"
                :disabled="authLoading"
                class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {{ authLoading ? "Signing out..." : "Sign Out" }}
              </button>
            </div>

            <!-- API Response -->
            <div
              v-if="apiResponse"
              class="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded text-sm"
            >
              <h4 class="font-bold">API Response:</h4>
              <pre class="mt-2 whitespace-pre-wrap">{{
                JSON.stringify(apiResponse, null, 2)
              }}</pre>
            </div>

            <!-- Error Messages -->
            <div
              v-if="error"
              class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
            >
              {{ error }}
            </div>
          </div>

          <!-- Loading State -->
          <div v-else class="text-center">
            <p>Loading authentication...</p>
          </div>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Main page demonstrating Clerk headless authentication with token passing
 */
// ClerkProvider is not available in @clerk/vue, we'll use a different approach

// Apply guest middleware following Nuxt 4 pattern
definePageMeta({
  // middleware: "guest",
  ssr: false,
});

// Meta tags
useHead({
  title: "Nuxt 4 + Clerk Headless",
  meta: [
    {
      name: "description",
      content: "Complete authentication flow with token passing to server",
    },
  ],
});

// Use Clerk authentication composable
const {
  user,
  isSignedIn,
  isLoaded,
  apiCall,
  handleSignIn: signIn,
  handleSignUp: signUp,
  handleSignOut: signOut,
} = useClerkAuth();

// UI state
const showSignUp = ref(false);
const authLoading = ref(false);
const apiLoading = ref(false);
const error = ref("");
const apiResponse = ref<any>(null);

/**
 * Handle sign in
 */
const handleSignIn = async (email: string, password: string) => {
  authLoading.value = true;
  error.value = "";
  apiResponse.value = null;

  try {
    const result = await signIn(email, password);

    if (result.success) {
      console.log("✅ Sign in successful");
      // The watcher in useClerkAuth will handle the redirect
    } else {
      error.value = result.error || "Sign in failed";
    }
  } catch (err: any) {
    error.value = err.message || "Sign in failed";
  } finally {
    authLoading.value = false;
  }
};

/**
 * Handle sign up
 */
const handleSignUp = async (
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
) => {
  authLoading.value = true;
  error.value = "";
  apiResponse.value = null;

  try {
    const result = await signUp(email, password, firstName, lastName);

    if (result.success) {
      console.log("✅ Sign up successful");
      if (result.requiresVerification) {
        console.log("📧 Email verification required");
        // User will be redirected to verification page
      } else {
        // The watcher in useClerkAuth will handle the redirect
      }
    } else {
      error.value = result.error || "Sign up failed";
    }
  } catch (err: any) {
    error.value = err.message || "Sign up failed";
  } finally {
    authLoading.value = false;
  }
};

/**
 * Handle sign out
 */
const handleSignOut = async () => {
  authLoading.value = true;
  error.value = "";
  apiResponse.value = null;

  try {
    const result = await signOut();

    if (result.success) {
      console.log("✅ Sign out successful");
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
    console.log("✅ Protected API call successful:", response);
  } catch (err: any) {
    error.value = err.message || "API call failed";
    console.error("❌ Protected API call failed:", err);
  } finally {
    apiLoading.value = false;
  }
};

// Clear error when switching between forms
watch(showSignUp, () => {
  error.value = "";
  apiResponse.value = null;
});

// Page mounted
onMounted(() => {
  console.log("🏠 Page mounted");
});
</script>
