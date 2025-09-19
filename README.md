# Nuxt 4 Authentication with Clerk

This guide outlines the steps to integrate Clerk for authentication in a Nuxt 4 application, ensuring a secure and efficient setup.

## Prerequisites

- **Nuxt 4**: Ensure you have a Nuxt 4 project set up.
- **Node.js**: Version 18.17.0 or later.
- **Clerk Account**: Create a free account at [Clerk](https://clerk.com/).

## Installation

1. **Install Clerk Nuxt SDK**: The Clerk Nuxt SDK provides prebuilt components, Vue composables, and helpers to simplify user authentication.

   ```bash
   npm install @clerk/nuxt
   ```

2. **Set Environment Variables**: Create a `.env` file in your project's root directory and add your Clerk API keys:

   ```
   NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   NUXT_CLERK_SECRET_KEY=your_secret_key
   ```

   Replace `your_publishable_key` and `your_secret_key` with the keys from your Clerk dashboard.

3. **Configure Nuxt**: Update your `nuxt.config.ts` to include the Clerk module:

   ```typescript
   export default defineNuxtConfig({
     modules: ['@clerk/nuxt'],
   });
   ```

## Implementing Authentication

1. **Create a Header with Clerk Components**: Utilize Clerk's prebuilt components to manage user authentication states.

   ```vue
   <template>
     <header>
       <SignedOut>
         <SignInButton />
       </SignedOut>
       <SignedIn>
         <UserButton />
       </SignedIn>
     </header>

     <main>
       <NuxtPage />
     </main>
   </template>
   ```

   In this setup:

   - `<SignedOut>`: Displays content only when the user is signed out.
   - `<SignInButton>`: Provides a button to sign in.
   - `<SignedIn>`: Displays content only when the user is signed in.
   - `<UserButton>`: Shows the signed-in user's avatar with account management options.

2. **Protect Routes**: To restrict access to certain pages, use route middleware.

   ```vue
   <script setup>
   definePageMeta({
     middleware: 'clerk:auth',
     auth: {
       navigateUnauthenticatedTo: '/sign-in',
     },
   });
   </script>

   <template>
     <h1>Authenticated Content</h1>
   </template>
   ```

   This configuration ensures that only authenticated users can access the page.

3. **Protect API Routes**: Secure your API endpoints by verifying the user's authentication status.

   ```typescript
   import { clerkClient, getAuth } from 'vue-clerk/server';

   export default eventHandler((event) => {
     const { userId } = getAuth(event);

     if (!userId) {
       setResponseStatus(event, 401);
       return;
     }

     return clerkClient(event).users.getUser(userId);
   });
   ```

   This handler checks if the user is authenticated before processing the request.

## Secure Session Management

After implementing the above steps, your Nuxt 4 application will have a secure authentication system using Clerk. Ensure that all sensitive routes and data are appropriately protected, and always test your authentication flow to confirm its robustness.

For more detailed information and advanced configurations, refer to the [Clerk Nuxt Quickstart Guide](https://clerk.com/docs/quickstarts/nuxt) and the [Vue Clerk Nuxt Documentation](https://www.vue-clerk.com/guides/nuxt).
