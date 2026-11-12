/**
 * Date and Time utilities normalized to Asia/Kolkata timezone
 * Prevents UTC midnight drift as specified in Technical Brief v2.
 */

export function getTodayIST(timezone: string = "Asia/Kolkata"): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

export function addDaysToDate(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return d.toISOString().split("T")[0];
}

export function getYesterdayIST(timezone: string = "Asia/Kolkata"): string {
  const today = getTodayIST(timezone);
  return addDaysToDate(today, -1);
}

export function getRoadmapDates(startDate: string, count: number = 30): string[] {
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    dates.push(addDaysToDate(startDate, i));
  }
  return dates;
}

export function getDayNumber(targetDate: string, startDate: string): number {
  const [y1, m1, d1] = startDate.split("-").map(Number);
  const [y2, m2, d2] = targetDate.split("-").map(Number);
  const start = Date.UTC(y1, m1 - 1, d1);
  const target = Date.UTC(y2, m2 - 1, d2);
  const diffDays = Math.round((target - start) / (1000 * 60 * 60 * 24));
  return diffDays + 1; // 1-based index
}

export function formatDateDisplay(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatHeaderDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatFullDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
