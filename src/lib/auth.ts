import { cookies } from "next/headers";

export const PIN_COOKIE_NAME = "career_tracker_pin_auth";

export function getExpectedPin(): string {
  return process.env.APP_PIN?.trim() || "1234";
}

export function isPinProtectionEnabled(): boolean {
  return true; // Always protect the workspace with PIN authentication
}

export async function isUserAuthenticated(): Promise<boolean> {
  const expectedPin = getExpectedPin();
  const cookieStore = cookies();
  const pinCookie = cookieStore.get(PIN_COOKIE_NAME);

  return Boolean(pinCookie?.value && pinCookie.value === expectedPin);
}
