/**
 * Custom Clerk authentication composable for Nuxt 4
 * Based on Ionic Vue app pattern using @clerk/vue composables
 * Following Nuxt 4 best practices
 */
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useClerk, useUser } from "@clerk/vue";

export const useClerkAuth = () => {
  const router = useRouter();
  const clerk = useClerk();
  const { isSignedIn, user, isLoaded } = useUser();

  // Internal state
  const isLoading = ref(false);
  const error = ref("");
  const authState = ref<"loading" | "authenticated" | "unauthenticated">(
    "loading"
  );

  /**
   * Watch for authentication state changes
   */
  const watchAuthState = () => {
    watch(
      [isLoaded, isSignedIn, user],
      ([newIsLoaded, newIsSignedIn, newUser]) => {
        if (!newIsLoaded) {
          authState.value = "loading";
        } else if (newIsSignedIn && newUser) {
          authState.value = "authenticated";
        } else {
          authState.value = "unauthenticated";
        }
      },
      { immediate: true }
    );
  };

  /**
   * Set Clerk session token in cookie for server-side access
   */
  const setSessionCookie = async () => {
    if (import.meta.client && clerk.value?.session) {
      try {
        console.log("🍪 Attempting to set session cookie...");
        const token = await clerk.value.session.getToken();
        console.log("🍪 Got token:", token ? "Yes" : "No");
        if (token) {
          document.cookie = `__clerk_session_token=${token}; path=/; samesite=strict`;
          console.log("🍪 Set Clerk session cookie for server-side access");
        } else {
          console.log("❌ No token available for cookie");
        }
      } catch (error) {
        console.error("❌ Failed to set session cookie:", error);
      }
    } else {
      console.log("❌ Cannot set cookie - not on client or no session");
    }
  };

  /**
   * Get JWT token from Clerk
   */
  const getToken = async (): Promise<string | null> => {
    if (clerk.value?.session) {
      try {
        const token = await clerk.value.session.getToken();
        return token;
      } catch (err) {
        console.error("Error getting JWT token:", err);
        return null;
      }
    }
    return null;
  };

  /**
   * Sign in with email and password
   */
  const handleSignIn = async (email: string, password: string) => {
    isLoading.value = true;
    error.value = "";

    try {
      if (!clerk.value) {
        throw new Error("Clerk not initialized");
      }

      const signInResult = await clerk.value.client?.signIn.create({
        identifier: email,
        password: password,
      });

      if (!signInResult) {
        throw new Error("Sign in attempt failed - no response");
      }

      if (signInResult.status === "complete") {
        // Activate new session
        await clerk.value.setActive({ session: signInResult.createdSessionId });

        // Set cookie for server-side access (httpOnly via server exchange)
        const token = await getToken();
        if (token) {
          await fetch("/api/auth/exchange", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
        }

        return { success: true, error: null };
      } else {
        error.value = `Sign in status: ${signInResult.status}`;
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      error.value = `Sign in failed: ${err.message}`;
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Sign up with email and password
   */
  const handleSignUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    isLoading.value = true;
    error.value = "";

    try {
      if (!clerk.value) {
        throw new Error("Clerk not initialized");
      }

      const signUpResult = await clerk.value.client?.signUp.create({
        emailAddress: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
      });

      if (!signUpResult) {
        throw new Error("Sign up attempt failed - no response");
      }

      if (signUpResult.status === "complete") {
        await clerk.value.setActive({ session: signUpResult.createdSessionId });

        // Set cookie for server-side access (httpOnly via server exchange)
        const token = await getToken();
        if (token) {
          await fetch("/api/auth/exchange", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
        }

        return { success: true, error: null };
      } else if (signUpResult.status === "missing_requirements") {
        // Redirect to verification page
        await router.push("/verify-email");
        return { success: true, error: null, requiresVerification: true };
      } else {
        error.value = `Sign up status: ${signUpResult.status}`;
        return { success: false, error: error.value };
      }
    } catch (err: any) {
      console.error("Sign up error:", err);
      error.value = `Sign up failed: ${err.message}`;
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Sign out the current user
   */
  const handleSignOut = async () => {
    try {
      await clerk.value?.signOut();
      return { success: true, error: null };
    } catch (err: any) {
      console.error("Sign out error:", err);
      error.value = `Sign out failed: ${err.message}`;
      return { success: false, error: error.value };
    }
  };

  /**
   * API call with authentication
   */
  const apiCall = async (url: string, options: RequestInit = {}) => {
    if (import.meta.client) {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error("No authentication token available");
        }

        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `API call failed: ${response.status} ${response.statusText}`
          );
        }

        return await response.json();
      } catch (error) {
        console.error("❌ API call failed:", error);
        throw error;
      }
    } else {
      throw new Error("API calls can only be made on the client side");
    }
  };

  /**
   * Get user profile information
   */
  const getUserProfile = () => {
    if (!isSignedIn.value || !user.value) {
      return null;
    }

    return {
      id: user.value.id,
      email: user.value.emailAddresses[0]?.emailAddress,
      firstName: user.value.firstName,
      lastName: user.value.lastName,
      fullName: user.value.fullName,
      imageUrl: user.value.imageUrl,
    };
  };

  /**
   * Get session information
   */
  const getSessionInfo = () => {
    if (!isSignedIn.value || !clerk.value?.session) {
      return null;
    }

    return {
      id: clerk.value.session.id,
      status: clerk.value.session.status,
      createdAt: clerk.value.session.createdAt,
      updatedAt: clerk.value.session.updatedAt,
    };
  };

  // Helper: exchange current session token for httpOnly SSR cookie
  const exchangeToken = async () => {
    if (!import.meta.client) return;
    try {
      const token = await getToken();
      if (token) {
        await fetch("/api/auth/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      }
    } catch (e) {
      console.error("Token exchange failed:", e);
    }
  };

  // Call exchange on client load if a session already exists
  if (import.meta.client) {
    const exchangedOnce = ref(false);
    watch(
      [isSignedIn],
      async ([signedIn]) => {
        if (signedIn && !exchangedOnce.value) {
          await exchangeToken();
          exchangedOnce.value = true;
        }
      },
      { immediate: true }
    );
  }

  // Initialize auth state watching immediately
  watchAuthState();

  // Watch for session changes to set cookie
  watch(
    [isSignedIn, user],
    ([newIsSignedIn, newUser]) => {
      if (newIsSignedIn && newUser) {
        setSessionCookie();
      }
    },
    { immediate: true }
  );

  return {
    // State
    isSignedIn: computed(() => isSignedIn.value),
    user: computed(() => user.value),
    isLoaded: computed(() => isLoaded.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    authState: computed(() => authState.value),

    // Methods
    handleSignIn,
    handleSignUp,
    handleSignOut,
    apiCall,
    getToken,
    getUserProfile,
    getSessionInfo,
    setSessionCookie,
  };
};
