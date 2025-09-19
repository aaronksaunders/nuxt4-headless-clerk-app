/**
 * Global type declarations for Clerk
 */
declare global {
  interface Window {
    Clerk: any; // Simplified for now - will be properly typed by @clerk/vue
  }
}

export {};
