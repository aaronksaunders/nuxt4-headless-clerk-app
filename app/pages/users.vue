<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-6">
              Users List (Server Rendered)
            </h1>

            <!-- User info -->
            <div v-if="userData" class="mb-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">
                User Information
              </h2>
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span class="font-medium text-gray-700">User ID:</span>
                    <span class="ml-2 text-gray-900">{{ userData.id }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Email:</span>
                    <span class="ml-2 text-gray-900">{{
                      userData.email || "Not available"
                    }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Name:</span>
                    <span class="ml-2 text-gray-900">{{
                      userData.fullName || "Not available"
                    }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Status:</span>
                    <span class="ml-2 text-gray-900">
                      {{
                        userData.emailVerified ? "✅ Verified" : "⏳ Pending"
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- No user info -->
            <div v-else class="mb-6">
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 class="text-lg font-medium text-yellow-800">
                  Not Authenticated
                </h3>
                <p class="text-yellow-700 mt-2">
                  Please sign in to see user information.
                </p>
                <p class="text-yellow-700 mt-2">
                  <a href="/" class="text-yellow-800 underline"
                    >Go to Sign In</a
                  >
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="space-y-4">
              <button
                @click="testServerAPI"
                :disabled="apiLoading"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {{ apiLoading ? "Testing..." : "Test Protected API" }}
              </button>
            </div>

            <!-- API Response -->
            <div v-if="apiResponse" class="mt-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">
                API Response:
              </h3>
              <div class="bg-gray-100 border border-gray-300 rounded-lg p-4">
                <pre
                  class="text-sm text-gray-800 whitespace-pre-wrap overflow-auto"
                  >{{ JSON.stringify(apiResponse, null, 2) }}</pre
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useClerkAuth } from "../composables/useClerkAuth";
import { useRequestEvent, useState, navigateTo } from "nuxt/app";

// Page configuration - no middleware needed for demo

// Get user data from server middleware (already authenticated)
const event = useRequestEvent();
const serverUser = event?.context?.user || null;

// Use SSR-friendly state to avoid hydration mismatch
const userData = useState("user-data", () => serverUser);

// Use Clerk auth composable to ensure token exchange
const { isSignedIn, syncWithServer } = useClerkAuth();

// Simple API test
const apiLoading = ref(false);
const apiResponse = ref<any>(null);

const testServerAPI = async () => {
  apiLoading.value = true;
  try {
    const response = await $fetch("/api/protected");
    apiResponse.value = response;
  } catch (error) {
    console.error("API call failed:", error);
  } finally {
    apiLoading.value = false;
  }
};

// Ensure token is synced with server on page load
onMounted(async () => {
  console.log("🏠 Users page mounted");

  if (isSignedIn.value) {
    console.log("🔄 User is signed in, syncing with server...");
    try {
      await syncWithServer();
      console.log("✅ Token synced with server");

      // Refresh the page to get updated user data from server
      await navigateTo("/users", { replace: true });
    } catch (error) {
      console.error("❌ Failed to sync with server:", error);
    }
  } else {
    console.log("❌ User not signed in");
  }
});
</script>
