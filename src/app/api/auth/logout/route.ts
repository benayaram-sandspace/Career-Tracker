import { NextResponse } from "next/server";
import { PIN_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(PIN_COOKIE_NAME);
  return response;
}

