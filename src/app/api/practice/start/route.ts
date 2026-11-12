import { NextResponse } from "next/server";
import { startDailyPractice, getUserSettings } from "@/lib/db";
import { getTodayIST } from "@/lib/dateUtils";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const settings = await getUserSettings();
    const today = getTodayIST(settings.timezone);
    const log = await startDailyPractice(today);

    return NextResponse.json({ log });
  } catch (error: any) {
    console.error("POST /api/practice/start error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start practice" },
      { status: 500 }
    );
  }
}

