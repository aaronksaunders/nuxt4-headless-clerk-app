<template>
  <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-center">Sign Up</h2>

    <form @submit.prevent="handleSignUp" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label
            for="firstName"
            class="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            id="firstName"
            v-model="firstName"
            type="text"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="First name"
          />
        </div>

        <div>
          <label for="lastName" class="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            id="lastName"
            v-model="lastName"
            type="text"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Last name"
          />
        </div>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter your password"
        />
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {{ loading ? "Signing up..." : "Sign Up" }}
      </button>
    </form>

    <div
      v-if="error"
      class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
    >
      {{ error }}
    </div>

    <div class="mt-4 text-center">
      <p class="text-sm text-gray-600">
        Already have an account?
        <button
          @click="$emit('switchToSignIn')"
          class="text-indigo-600 hover:text-indigo-500"
        >
          Sign in
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Sign up form component using Clerk headless authentication
 */

interface Props {
  loading?: boolean;
}

interface Emits {
  (
    e: "signUp",
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): void;
  (e: "switchToSignIn"): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<Emits>();

// Form data
const firstName = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");
const error = ref("");

/**
 * Handle sign up form submission
 */
const handleSignUp = () => {
  error.value = "";

  if (!email.value || !password.value) {
    error.value = "Please fill in email and password";
    return;
  }

  emit(
    "signUp",
    email.value,
    password.value,
    firstName.value || undefined,
    lastName.value || undefined
  );
};

// Clear error when form changes
watch([firstName, lastName, email, password], () => {
  error.value = "";
});
</script>
