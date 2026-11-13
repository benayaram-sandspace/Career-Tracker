import { NextRequest, NextResponse } from "next/server";
import {
  getUserSettings,
  upsertDailyLog,
  get30DaysLogs,
} from "@/lib/db";
import { getTodayIST, getRoadmapDates, getDayNumber } from "@/lib/dateUtils";
import { isPinProtectionEnabled, isUserAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch user settings (cached in-memory for 30s)
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

    // 2. Concurrently execute selectedLog, todayLog, history30Days, and auth check
    const isToday = requestedDate === todayIST;

    const [selectedLog, todayLog, history30Days, authenticated] = await Promise.all([
      upsertDailyLog(requestedDate, validDayNumber),
      isToday
        ? Promise.resolve(null)
        : upsertDailyLog(todayIST, getDayNumber(todayIST, planStart)),
      get30DaysLogs(roadmapDates),
      isUserAuthenticated(req),
    ]);

    const pinRequired = isPinProtectionEnabled();

    return NextResponse.json({
      userSettings,
      todayIST,
      selectedDate: requestedDate,
      selectedLog,
      todayLog: todayLog || selectedLog,
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
