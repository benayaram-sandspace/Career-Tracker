import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const PIN_COOKIE_NAME = "career_tracker_pin_auth";

/**
 * Cleanly retrieves the expected PIN configured in environment variables.
 * Strips surrounding quotes (which often get pasted into Vercel dashboard) and trims whitespace.
 * Defaults to "1234" if not explicitly configured.
 */
export function getExpectedPin(): string {
  const envPin = process.env.APP_PIN;
  if (!envPin) return "1234";
  const cleaned = envPin.replace(/^["']|["']$/g, "").trim();
  return cleaned || "1234";
}

export function isPinProtectionEnabled(): boolean {
  return true; // Always protect the workspace with PIN authentication
}

/**
 * Verifies whether the incoming request is authenticated.
 * Checks both:
 * 1. Custom authentication headers (x-app-pin, x-pin, Bearer token) from localStorage backup.
 * 2. Next.js HTTP-only session cookies.
 * This dual-layer check ensures authentication never fails due to third-party cookie blocking,
 * cross-site cookie restrictions, or serverless cookie timing delays.
 */
export async function isUserAuthenticated(req?: NextRequest): Promise<boolean> {
  const expectedPin = getExpectedPin();

  // 1. Check custom headers if request object is provided
  if (req) {
    const headerPin =
      req.headers.get("x-app-pin") ||
      req.headers.get("x-pin") ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (headerPin && headerPin.trim() === expectedPin) {
      return true;
    }
  }

  // 2. Check Next.js cookie store
  try {
    const cookieStore = cookies();
    const pinCookie = cookieStore.get(PIN_COOKIE_NAME);
    if (pinCookie?.value && pinCookie.value.trim() === expectedPin) {
      return true;
    }
  } catch {
    // cookies() can throw in certain Next.js edge/background contexts
  }

  return false;
}
