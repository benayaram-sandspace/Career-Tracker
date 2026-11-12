import { NextRequest, NextResponse } from "next/server";
import {
  getUserSettings,
  upsertDailyLog,
  getDailyLog,
  missDailyPractice,
} from "@/lib/db";
import { getTodayIST } from "@/lib/dateUtils";
import { sendEmail } from "@/lib/email";
import { getMissedDayTemplate } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && cronSecret !== "replace-with-random-32-character-secret") {
      const authHeader = req.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid or missing Cron Bearer token" },
          { status: 401 }
        );
      }
    }

    const settings = await getUserSettings();
    const today = getTodayIST(settings.timezone);

    await upsertDailyLog(today);
    const log = await getDailyLog(today);

    if (!log) {
      return NextResponse.json(
        { error: "Could not retrieve today's daily log" },
        { status: 500 }
      );
    }

    // If still PENDING by 9:00 PM IST, mark MISSED and reset streak
    if (log.status === "PENDING") {
      const previousStreak = settings.currentStreak;
      const longestStreak = settings.longestStreak;

      // Mark missed and reset streak to 0
      await missDailyPractice(today);

      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const { subject, html } = getMissedDayTemplate({
        userName: settings.userName,
        targetRole: settings.targetCareerRole,
        previousStreak,
        longestStreak,
        appUrl,
      });

      const emailResult = await sendEmail({
        to: settings.userEmail,
        cc: settings.partnerEmail || undefined,
        subject,
        html,
      });

      return NextResponse.json({
        message: "9:00 PM check complete: Day marked MISSED, streak reset to 0.",
        previousStreak,
        emailResult,
      });
    }

    return NextResponse.json({
      message: `9:00 PM check complete: Day status was already "${log.status}". No action needed.`,
      status: log.status,
    });
  } catch (error: any) {
    console.error("GET /api/cron/evening-check error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute evening check cron" },
      { status: 500 }
    );
  }
}

