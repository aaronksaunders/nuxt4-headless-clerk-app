<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Verify Your Email</h1>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"
          ></div>
          <p class="mt-4 text-gray-600">Verifying your email...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="isVerified" class="text-center">
          <div class="text-green-600 text-6xl mb-4">✅</div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">
            Email Verified!
          </h2>
          <p class="text-gray-600 mb-6">
            Your email has been successfully verified.
          </p>
          <button
            @click="goToDashboard"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Continue to Dashboard
          </button>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center">
          <div class="text-red-600 text-6xl mb-4">❌</div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">
            Verification Failed
          </h2>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <button
            @click="retryVerification"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>

        <!-- Default State -->
        <div v-else class="text-center">
          <div class="text-blue-600 text-6xl mb-4">📧</div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">
            Check Your Email
          </h2>
          <p class="text-gray-600 mb-6">
            We've sent you a verification link. Please check your email and
            click the link to verify your account.
          </p>
          <button
            @click="resendVerification"
            :disabled="isResending"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ isResending ? "Sending..." : "Resend Verification Email" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Email verification page
 * Handles email verification flow with Clerk
 */

// Meta tags
useHead({
  title: "Verify Email - Nuxt 4 + Clerk",
  meta: [
    {
      name: "description",
      content: "Verify your email address to complete your account setup",
    },
  ],
});

// Use Clerk authentication composable
const { user, isSignedIn, isLoaded, signOut } = useClerkAuth();

// UI state
const isLoading = ref(true);
const isVerified = ref(false);
const error = ref("");
const isResending = ref(false);

/**
 * Handle email verification
 */
const handleVerification = async () => {
  try {
    isLoading.value = true;
    error.value = "";

    // Wait for Clerk to be loaded
    if (typeof window !== "undefined" && window.Clerk) {
      while (!window.Clerk.loaded) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Check if user is already verified
      if (
        user.value?.emailAddresses?.[0]?.verification?.status === "verified"
      ) {
        isVerified.value = true;
        return;
      }

      // Handle verification from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const code = urlParams.get("code");

      if (token || code) {
        // Attempt to verify with the token/code
        try {
          if (token) {
            await window.Clerk.client.verifyEmailAddress({ token });
          } else if (code) {
            await window.Clerk.client.verifyEmailAddress({ code });
          }
          isVerified.value = true;
        } catch (verifyError: any) {
          console.error("Verification failed:", verifyError);
          error.value = verifyError.message || "Verification failed";
        }
      } else {
        // No token/code provided, show instructions
        isVerified.value = false;
      }
    }
  } catch (err: any) {
    console.error("Verification error:", err);
    error.value = err.message || "An error occurred during verification";
  } finally {
    isLoading.value = false;
  }
};

/**
 * Resend verification email
 */
const resendVerification = async () => {
  try {
    isResending.value = true;
    error.value = "";

    if (typeof window !== "undefined" && window.Clerk) {
      await window.Clerk.client.emailAddresses.create({
        emailAddress: user.value?.emailAddresses?.[0]?.emailAddress || "",
      });

      // Show success message
      console.log("Verification email resent");
    }
  } catch (err: any) {
    console.error("Failed to resend verification:", err);
    error.value = err.message || "Failed to resend verification email";
  } finally {
    isResending.value = false;
  }
};

/**
 * Retry verification
 */
const retryVerification = () => {
  error.value = "";
  handleVerification();
};

/**
 * Go to dashboard
 */
const goToDashboard = () => {
  navigateTo("/dashboard");
};

// Handle verification on mount
onMounted(() => {
  handleVerification();
});

// Redirect if already signed in and verified
watch([isSignedIn, isLoaded], ([signedIn, loaded]) => {
  if (
    loaded &&
    signedIn &&
    user.value?.emailAddresses?.[0]?.verification?.status === "verified"
  ) {
    navigateTo("/dashboard");
  }
});
</script>
