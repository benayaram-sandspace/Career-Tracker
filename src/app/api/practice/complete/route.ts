import { NextResponse } from "next/server";
import {
  completeDailyPractice,
  getDailyLog,
  getUserSettings,
} from "@/lib/db";
import { getTodayIST } from "@/lib/dateUtils";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const settings = await getUserSettings();
    const today = getTodayIST(settings.timezone);
    const log = await getDailyLog(today);

    if (!log) {
      return NextResponse.json(
        { error: "Today's daily log not found" },
        { status: 404 }
      );
    }

    // Verify Core Goal status
    const coreGoal = log.todos?.find((t) => t.isCoreGoal);
    if (coreGoal && !coreGoal.isCompleted) {
      return NextResponse.json(
        {
          error:
            "Please check off your #1 Core Goal before marking today's practice complete.",
        },
        { status: 400 }
      );
    }

    const result = await completeDailyPractice(today);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /api/practice/complete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete practice" },
      { status: 500 }
    );
  }
}

