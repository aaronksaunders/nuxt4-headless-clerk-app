/**
 * Server-side user data endpoint
 * Uses proper Nuxt 4 requireUserSession pattern
 * Example: GET /api/server-user
 */
import { defineEventHandler } from "h3"; // Import defineEventHandler from h3
import { requireUserSession } from "../utils/auth";

export default defineEventHandler(async (event) => {
  try {
    // Use proper Nuxt 4 pattern - requireUserSession
    const { user } = await requireUserSession(event);

    return {
      success: true,
      message: "User data retrieved using requireUserSession",
      user: user,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Server user data error:", error);

    return {
      success: false,
      message: "No user data available - not authenticated",
      user: null,
      error: error.message,
    };
  }
});
