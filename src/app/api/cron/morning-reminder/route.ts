import { NextRequest, NextResponse } from "next/server";
import { getUserSettings, upsertDailyLog, getDailyLog } from "@/lib/db";
import { getTodayIST } from "@/lib/dateUtils";
import { sendEmail } from "@/lib/email";
import { getMorningReminderTemplate } from "@/lib/emailTemplates";

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

    // Upsert today's log
    await upsertDailyLog(today);
    const log = await getDailyLog(today);

    if (!log) {
      return NextResponse.json(
        { error: "Could not retrieve today's daily log" },
        { status: 500 }
      );
    }

    // Only send reminder if PENDING and session has not been started yet
    if (log.status === "PENDING" && log.startedAt === null) {
      const coreGoalItem = log.todos.find((t) => t.isCoreGoal);
      const coreGoalTitle = coreGoalItem ? coreGoalItem.title : "Deep work on core transition skills";
      const secondaryTodos = log.todos.filter((t) => !t.isCoreGoal);

      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const { subject, html } = getMorningReminderTemplate({
        userName: settings.userName,
        targetRole: settings.targetCareerRole,
        streak: settings.currentStreak,
        coreGoal: coreGoalTitle,
        todos: secondaryTodos,
        appUrl,
      });

      const emailResult = await sendEmail({
        to: settings.userEmail,
        subject,
        html,
      });

      return NextResponse.json({
        message: "Morning reminder sent successfully",
        today,
        emailResult,
      });
    }

    return NextResponse.json({
      message: "Morning reminder skipped: practice already started, completed, or skipped.",
      status: log.status,
      startedAt: log.startedAt,
    });
  } catch (error: any) {
    console.error("GET /api/cron/morning-reminder error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute morning reminder cron" },
      { status: 500 }
    );
  }
}
