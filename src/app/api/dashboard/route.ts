import { NextResponse } from "next/server";
import {
  getUserSettings,
  upsertDailyLog,
  get30DaysLogs,
} from "@/lib/db";
import { getTodayIST, getLast30DaysIST } from "@/lib/dateUtils";
import { isPinProtectionEnabled, isUserAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userSettings = await getUserSettings();
    const todayIST = getTodayIST(userSettings.timezone);
    const todayLog = await upsertDailyLog(todayIST);
    const last30Dates = getLast30DaysIST(userSettings.timezone);
    const history30Days = await get30DaysLogs(last30Dates);

    const pinRequired = isPinProtectionEnabled();
    const authenticated = await isUserAuthenticated();

    return NextResponse.json({
      userSettings,
      todayLog,
      history30Days,
      todayIST,
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
