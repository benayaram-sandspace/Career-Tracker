import { NextRequest, NextResponse } from "next/server";
import { getUserSettings, updateUserSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getUserSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userName, userEmail, partnerEmail, targetCareerRole, timezone } = body;

    const updated = await updateUserSettings({
      ...(userName ? { userName: userName.trim() } : {}),
      ...(userEmail ? { userEmail: userEmail.trim() } : {}),
      partnerEmail: partnerEmail ? partnerEmail.trim() : null,
      ...(targetCareerRole ? { targetCareerRole: targetCareerRole.trim() } : {}),
      ...(timezone ? { timezone: timezone.trim() } : {}),
    });

    return NextResponse.json({ settings: updated });
  } catch (error: any) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}

