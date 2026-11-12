import { NextRequest, NextResponse } from "next/server";
import { undoDailyPractice, getUserSettings } from "@/lib/db";
import { getTodayIST } from "@/lib/dateUtils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let date: string | undefined;
    try {
      const body = await req.json();
      date = body.date;
    } catch {
      // Empty body is okay, will default to todayIST
    }

    const settings = await getUserSettings();
    const targetDate = date || getTodayIST(settings.timezone);

    const result = await undoDailyPractice(targetDate);
    return NextResponse.json({
      success: true,
      message: `Practice status and streak successfully reverted for ${targetDate}.`,
      ...result,
    });
  } catch (error: any) {
    console.error("POST /api/practice/undo error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to undo practice status" },
      { status: 500 }
    );
  }
}
