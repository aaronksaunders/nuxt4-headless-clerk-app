/**
 * Protected API route using proper Nuxt 4 requireUserSession pattern
 * Example: GET /api/protected
 * Uses requireUserSession for authentication
 */
import { requireUserSession } from "../utils/auth";

export default defineEventHandler(async (event) => {
  try {
    // Use proper Nuxt 4 pattern - requireUserSession
    const { user } = await requireUserSession(event);

    console.log("✅ User authenticated via requireUserSession:", user);

    // Return user information
    return {
      success: true,
      message: "Access granted to protected resource (requireUserSession)",
      user: {
        id: user.id,
        sessionId: user.sessionId,
        email: user.email,
        name:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : "Not available",
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Authentication failed:", error);

    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 401,
      statusMessage: "Authentication failed",
    });
  }
});
