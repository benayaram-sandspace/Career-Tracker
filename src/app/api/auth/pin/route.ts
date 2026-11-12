import { NextRequest, NextResponse } from "next/server";
import { PIN_COOKIE_NAME, getExpectedPin, isUserAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authenticated = await isUserAuthenticated(req);
    return NextResponse.json({ authenticated });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pin = String(body.pin ?? "").trim();

    const expectedPin = getExpectedPin();

    if (!pin || pin !== expectedPin) {
      return NextResponse.json(
        { error: "Incorrect PIN code. Please try again." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      authenticated: true,
      token: pin,
    });

    // Set 30-day secure session cookie
    response.cookies.set(PIN_COOKIE_NAME, pin, {
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
