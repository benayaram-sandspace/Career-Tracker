import { cookies } from "next/headers";

export const PIN_COOKIE_NAME = "career_tracker_pin_auth";

export function getExpectedPin(): string | null {
  return process.env.APP_PIN || null;
}

export function isPinProtectionEnabled(): boolean {
  return Boolean(process.env.APP_PIN && process.env.APP_PIN.trim().length > 0);
}

export async function isUserAuthenticated(): Promise<boolean> {
  const expectedPin = getExpectedPin();
  if (!expectedPin) {
    return true; // No PIN configured, allow access
  }

  const cookieStore = cookies();
  const pinCookie = cookieStore.get(PIN_COOKIE_NAME);

  return pinCookie?.value === expectedPin;
}

