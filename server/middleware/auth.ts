/**
 * Server middleware for API authentication only
 * Page authentication is handled by server/plugins/auth-init.ts
 */
import { verifyToken } from "@clerk/backend";

export default defineEventHandler(async (event) => {
  const url = getRouterParam(event, "_") || event.node.req.url;

  console.log("🔍 Server middleware processing URL:", url);

  // Skip static assets and public routes
  if (url?.includes("/_nuxt") || url?.includes("/api/public") || url === "/") {
    console.log("⏭️ Skipping middleware for public route:", url);
    return;
  }

  console.log("🔐 Processing route:", url);

  try {
    // Check for Authorization header first (API calls)
    const authHeader = getHeader(event, "authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      // API call with Authorization header
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

      // Set user data in event context
      event.context.user = {
        id: payload.sub || payload.user_id,
        sessionId: payload.sid || payload.session_id,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
      };

      console.log("✅ API call authenticated:", event.context.user);
      return;
    }

    // For page requests, check for Clerk session cookie
    const clerkSessionToken = getCookie(event, "__clerk_session_token");

    console.log(
      "🔍 Checking for Clerk session cookie:",
      clerkSessionToken ? "Found" : "Not found"
    );

    if (!clerkSessionToken) {
      console.log("❌ No Clerk session cookie found");
      // No session cookie found - page will show "Not Authenticated"
      return;
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

    // Set basic user data in event context
    const userId = payload.sub || payload.user_id;
    event.context.user = {
      id: userId,
      sessionId: payload.sid || payload.session_id,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
    };

    // Fetch full user profile from Clerk API
    try {
      const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        // Update context with full user data
        event.context.user = {
          id: userData.id,
          sessionId: payload.sid || payload.session_id,
          email: userData.email_addresses?.[0]?.email_address,
          firstName: userData.first_name,
          lastName: userData.last_name,
          fullName:
            userData.first_name && userData.last_name
              ? `${userData.first_name} ${userData.last_name}`
              : userData.first_name || userData.last_name || "Not available",
          emailVerified:
            userData.email_addresses?.[0]?.verification?.status === "verified",
        };
        console.log("✅ Fetched full user data from Clerk API:", {
          id: userData.id,
          email: userData.email_addresses?.[0]?.email_address,
          firstName: userData.first_name,
          lastName: userData.last_name,
        });
      }
    } catch (error) {
      console.error("❌ Failed to fetch full user profile:", error);
    }

    console.log(
      "✅ Page request authenticated via cookie:",
      event.context.user
    );
  } catch (error) {
    console.error("❌ Authentication failed:", error);

    // Clear invalid cookie if it was present
    setCookie(event, "__clerk_session_token", "", {
      httpOnly: true,
      secure: false, // Allow for localhost
      sameSite: "strict",
      maxAge: 0,
    });

    // For API routes, return 401
    if (url?.startsWith("/api/")) {
      if (error.statusCode) {
        throw error;
      }
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized - Invalid token",
      });
    }
    // For pages, simply return without setting user context
  }
});
