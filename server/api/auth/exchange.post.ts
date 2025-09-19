/**
 * @fileoverview Exchange a Clerk session token for an httpOnly cookie
 *
 * Verifies a client-provided Clerk JWT and sets an httpOnly cookie that
 * the server middleware can read during SSR. This keeps the token out of
 * document.cookie and aligns with production best practices.
 */
import { defineEventHandler, readBody, createError, setCookie } from "h3";
import { verifyToken } from "@clerk/backend";

interface ExchangeBody {
  token?: string;
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as ExchangeBody;
  const token = body?.token;
  const secretKey = process.env.NUXT_CLERK_SECRET_KEY;

  if (!secretKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing Clerk secret key",
    });
  }
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: "Missing token" });
  }

  // Verify the token before setting the cookie
  await verifyToken(token, { secretKey });

  // Set httpOnly cookie readable by server (SSR)
  setCookie(event, "__clerk_session_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Max-Age should reflect your token TTL; keeping modest for safety
    maxAge: 60 * 60,
  });

  return { ok: true };
});
