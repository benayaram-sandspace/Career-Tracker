import { NextRequest, NextResponse } from "next/server";
import { PIN_COOKIE_NAME, getExpectedPin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin } = body;

    const expectedPin = getExpectedPin();

    // If no pin is configured in environment, allow through or match default
    if (expectedPin && pin !== expectedPin) {
      return NextResponse.json(
        { error: "Incorrect PIN code. Please try again." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    // Set 30-day session cookie
    response.cookies.set(PIN_COOKIE_NAME, pin || "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("POST /api/auth/pin error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to authenticate PIN" },
      { status: 500 }
    );
  }
}
