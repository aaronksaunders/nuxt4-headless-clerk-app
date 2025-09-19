# Nuxt 4 + Clerk Headless Authentication

A complete example of headless authentication with Clerk in Nuxt 4, including token passing to server-side API routes.

## Features

- ✅ **Headless Authentication**: Complete sign-in/sign-up flow without pre-built UI components
- ✅ **Token Passing**: Automatic token inclusion in API calls
- ✅ **Server-side Protection**: Protected API routes with Clerk token validation
- ✅ **Reactive State**: Real-time authentication state management
- ✅ **TypeScript Support**: Full TypeScript support throughout

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file with your Clerk keys:
   ```env
   NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
   CLERK_SECRET_KEY=sk_test_your_secret_key
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## How It Works

### 1. Authentication Flow

The app uses Clerk's headless authentication with custom forms:

- **Sign In**: Email/password authentication
- **Sign Up**: Email/password with optional first/last name
- **Sign Out**: Clean session termination

### 2. Token Passing

When making API calls, tokens are automatically included:

```typescript
// In your composable or component
const { apiCall } = useClerkAuth();

// This automatically includes the Bearer token
const response = await apiCall('/api/protected');
```

### 3. Server-side Protection

API routes are protected using Clerk's server-side authentication:

```typescript
// server/api/protected.get.ts
export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth();
  
  if (!isAuthenticated) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }
  
  // Handle authenticated request
});
```

## File Structure

```
├── app/
│   ├── components/
│   │   ├── LoginForm.vue          # Sign-in form component
│   │   └── SignUpForm.vue         # Sign-up form component
│   ├── composables/
│   │   └── useClerkAuth.ts        # Authentication composable
│   └── pages/
│       └── index.vue              # Main page with auth demo
├── plugins/
│   ├── clerk.client.ts            # Clerk plugin (minimal)
│   ├── debug.server.ts            # Server debug plugin
│   └── test.client.ts             # Client test plugin
├── server/
│   └── api/
│       └── protected.get.ts       # Protected API route example
└── nuxt.config.ts                 # Nuxt configuration with Clerk module
```

## Usage Examples

### Using the Authentication Composable

```typescript
// In any component
const { user, isSignedIn, signIn, signOut, apiCall } = useClerkAuth();

// Check auth state
if (isSignedIn.value) {
  console.log('User is signed in:', user.value);
}

// Sign in
const result = await signIn('user@example.com', 'password');

// Make authenticated API call
const data = await apiCall('/api/protected');
```

### Creating Protected API Routes

```typescript
// server/api/my-protected-route.get.ts
export default defineEventHandler(async (event) => {
  const { isAuthenticated, userId } = event.context.auth();
  
  if (!isAuthenticated) {
    throw createError({
      statusCode: 401,
      statusMessage: "Please sign in to access this resource"
    });
  }
  
  return {
    message: `Hello user ${userId}!`,
    data: "Your protected data here"
  };
});
```

## Testing the Flow

1. **Start the app**: `npm run dev`
2. **Sign up**: Create a new account using the sign-up form
3. **Sign in**: Use your credentials to sign in
4. **Test API**: Click "Test Protected API" to see token passing in action
5. **Sign out**: End your session

## Key Benefits

- **No UI Dependencies**: Complete control over authentication UI
- **Automatic Token Management**: Tokens are handled automatically
- **Server-side Security**: Built-in server-side token validation
- **Reactive State**: Real-time updates when auth state changes
- **TypeScript**: Full type safety throughout the application

This implementation provides a solid foundation for building authenticated applications with Nuxt 4 and Clerk.
