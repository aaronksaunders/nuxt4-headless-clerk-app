/**
 * Server-side authentication utilities
 * Mimics nuxt-auth-utils requireUserSession pattern
 * Following Nuxt 4 server-side authentication patterns
 */
import { verifyToken } from "@clerk/backend";

/**
 * Require user session - Nuxt 4 style
 * Returns user data if authenticated, throws error if not
 */
export async function requireUserSession(event: any) {
  try {
    // Check for Authorization header first (API calls)
    const authHeader = getHeader(event, "authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Handle API calls with Authorization header
      const token = authHeader.substring(7);
      const clerkSecretKey = process.env.NUXT_CLERK_SECRET_KEY;

      if (!clerkSecretKey) {
        throw createError({
          statusCode: 500,
          statusMessage: "Server configuration error",
        });
      }

      // Verify the token
      const payload = await verifyToken(token, {
        secretKey: clerkSecretKey,
      });

      return {
        user: {
          id: payload.sub || payload.user_id,
          sessionId: payload.sid || payload.session_id,
          email: payload.email,
          firstName: payload.given_name,
          lastName: payload.family_name,
        },
      };
    }

    // For page requests, check for Clerk session cookie
    const clerkSessionToken = getCookie(event, "__clerk_session_token");

    console.log(
      "🔍 Checking for Clerk session cookie:",
      clerkSessionToken ? "Found" : "Not found"
    );

    if (!clerkSessionToken) {
      console.log("❌ No Clerk session cookie found");
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized - No valid session",
      });
    }

    // Verify the session token from cookie
    const clerkSecretKey = process.env.NUXT_CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      throw createError({
        statusCode: 500,
        statusMessage: "Server configuration error",
      });
    }

    const payload = await verifyToken(clerkSessionToken, {
      secretKey: clerkSecretKey,
    });

    return {
      user: {
        id: payload.sub || payload.user_id,
        sessionId: payload.sid || payload.session_id,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
      },
    };
  } catch (error) {
    console.error("❌ requireUserSession failed:", error);

    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized - Authentication failed",
    });
  }
}
