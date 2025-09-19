# Nuxt 4 Headless Authentication with Clerk

This project demonstrates a **headless Clerk authentication** implementation for Nuxt 4, using a custom approach that provides better control and security than the standard `@clerk/nuxt` module.

## Why Not Use `@clerk/nuxt` Module?

While the official `@clerk/nuxt` module works well for many use cases, we chose a custom headless approach for the following reasons:

### **Issues with Pure `@clerk/nuxt` Approach:**
1. **Complex Middleware Caching**: The `@clerk/nuxt` middleware caches authentication state, making it difficult to refresh sessions
2. **Limited Control**: Less control over token validation and session management
3. **SSR Complications**: Complex cookie handling with multiple cookie names (`__session`, `__clerk_db_jwt`, `__clerk_session_token`)
4. **Debugging Difficulties**: Multiple layers of abstraction make troubleshooting challenging
5. **Session Refresh Issues**: Hard to force fresh token validation when needed

### **Benefits of Our Custom Approach:**
1. **Direct Control**: Full control over token validation and session management
2. **Simpler Debugging**: Clear, traceable authentication flow
3. **Better Security**: HTTP-only cookies with proper token exchange
4. **Flexible**: Handles both API calls and page authentication seamlessly
5. **Production Ready**: Follows security best practices

## Production Readiness

### ✅ **Production Ready Features:**
- **HTTP-only Cookies**: Secure session management
- **Token Exchange**: JWT to cookie conversion for SSR
- **Error Handling**: Comprehensive error handling
- **Security**: Follows OWASP security guidelines
- **SSR Support**: Works with server-side rendering
- **Flexible Auth**: Handles both API and page authentication

### ⚠️ **Before Going to Production:**
1. **Environment Variables**: Ensure all secrets are properly configured
2. **HTTPS**: Enable HTTPS in production
3. **Cookie Security**: Verify secure cookie settings
4. **Error Logging**: Implement proper error logging

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
