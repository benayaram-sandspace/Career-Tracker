import { NextRequest, NextResponse } from "next/server";
import {
  getUserSettings,
  upsertDailyLog,
  getDailyLog,
  get30DaysLogs,
} from "@/lib/db";
import { getTodayIST, getRoadmapDates, getDayNumber } from "@/lib/dateUtils";
import { isPinProtectionEnabled, isUserAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userSettings = await getUserSettings();
    const todayIST = getTodayIST(userSettings.timezone);

    const { searchParams } = new URL(req.url);
    const requestedDate = searchParams.get("date") || todayIST;

    const planStart = userSettings.planStartDate || todayIST;
    const roadmapDates = getRoadmapDates(planStart, 30);

    // Compute dayNumber for requested date if within roadmap
    const requestedDayNumber = getDayNumber(requestedDate, planStart);
    const validDayNumber =
      requestedDayNumber >= 1 && requestedDayNumber <= 30 ? requestedDayNumber : undefined;

    // Ensure logs exist
    const selectedLog = await upsertDailyLog(requestedDate, validDayNumber);
    const todayLog =
      requestedDate === todayIST
        ? selectedLog
        : await upsertDailyLog(todayIST, getDayNumber(todayIST, planStart));

    const history30Days = await get30DaysLogs(roadmapDates);

    const pinRequired = isPinProtectionEnabled();
    const authenticated = await isUserAuthenticated();

    return NextResponse.json({
      userSettings,
      todayIST,
      selectedDate: requestedDate,
      selectedLog,
      todayLog,
      roadmapDates,
      history30Days,
      pinRequired,
      authenticated,
    });
  } catch (error: any) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
