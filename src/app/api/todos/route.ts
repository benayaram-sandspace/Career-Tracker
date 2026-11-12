import { NextRequest, NextResponse } from "next/server";
import { createTodoItem, getUserSettings } from "@/lib/db";
import { getTodayIST } from "@/lib/dateUtils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, isCoreGoal } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    const settings = await getUserSettings();
    const today = getTodayIST(settings.timezone);

    const todo = await createTodoItem(today, title.trim(), Boolean(isCoreGoal));
    return NextResponse.json({ todo }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/todos error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create task" },
      { status: 500 }
    );
  }
}
