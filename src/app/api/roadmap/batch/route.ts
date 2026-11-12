import { NextRequest, NextResponse } from "next/server";
import { saveRoadmapBatch, getUserSettings } from "@/lib/db";
import { getTodayIST } from "@/lib/dateUtils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startDate, days } = body;

    if (!days || !Array.isArray(days) || days.length === 0) {
      return NextResponse.json(
        { error: "Invalid payload: 'days' array is required." },
        { status: 400 }
      );
    }

    const settings = await getUserSettings();
    const effectiveStartDate =
      startDate || days[0]?.date || settings.planStartDate || getTodayIST(settings.timezone);

    const result = await saveRoadmapBatch(effectiveStartDate, days);

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${result.count} days in the 30-day roadmap.`,
      startDate: effectiveStartDate,
    });
  } catch (error: any) {
    console.error("POST /api/roadmap/batch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save roadmap batch" },
      { status: 500 }
    );
  }
}
