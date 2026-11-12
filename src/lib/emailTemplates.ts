/**
 * Production HTML Email Templates for Career Shift Accountability
 * High-contrast, mobile-responsive, and client-compatible inline styles.
 */

interface MorningReminderProps {
  userName: string;
  targetRole: string;
  streak: number;
  coreGoal: string;
  todos: { title: string; isCompleted: boolean }[];
  appUrl: string;
}

interface SkipAlertProps {
  userName: string;
  targetRole: string;
  previousStreak: number;
  skipReason: string;
  appUrl: string;
}

interface MissedDayProps {
  userName: string;
  targetRole: string;
  previousStreak: number;
  longestStreak: number;
  appUrl: string;
}

interface TestEmailProps {
  userName: string;
  targetRole: string;
  appUrl: string;
}

const baseStyles = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  backgroundColor: "#0F172A",
  cardBg: "#1E293B",
  textColor: "#F8FAFC",
  mutedColor: "#94A3B8",
  accentIndigo: "#4F46E5",
  accentEmerald: "#10B981",
  accentAmber: "#F59E0B",
  accentRose: "#F43F5E",
};

export function getMorningReminderTemplate({
  userName,
  targetRole,
  streak,
  coreGoal,
  todos,
  appUrl,
}: MorningReminderProps): { subject: string; html: string } {
  const nextDay = streak + 1;
  const subject = `Day ${nextDay}: Start Today's ${targetRole} Practice`;

  const todosHtml =
    todos.length > 0
      ? todos
          .map(
            (t) =>
              `<li style="margin-bottom: 8px; color: ${baseStyles.textColor}; font-size: 14px;">
                ${t.title}
              </li>`
          )
          .join("")
      : `<li style="color: ${baseStyles.mutedColor}; font-size: 14px;">No secondary tasks added yet.</li>`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #090D16; font-family: ${baseStyles.fontFamily}; color: ${baseStyles.textColor};">
  <div style="max-width: 560px; margin: 0 auto; background-color: ${baseStyles.cardBg}; border: 1px solid #334155; border-radius: 12px; padding: 32px 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    
    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 24px;">
      <div>
        <span style="display: inline-block; background-color: rgba(79, 70, 229, 0.2); color: #818CF8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">
          ${targetRole}
        </span>
      </div>
      <div style="font-family: monospace; font-size: 14px; color: #F59E0B; font-weight: bold;">
        🔥 Streak: ${streak} Days
      </div>
    </div>

    <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 12px 0; color: ${baseStyles.textColor}; line-height: 1.3;">
      Time to Practice, ${userName}
    </h1>
    <p style="font-size: 15px; line-height: 1.5; color: ${baseStyles.mutedColor}; margin: 0 0 24px 0;">
      It is 9:00 AM IST. Your career shift requires unbroken momentum. Protect your current ${streak}-day streak and take step <strong>#${nextDay}</strong> today.
    </p>

    <!-- Core Goal Box -->
    <div style="background-color: #0F172A; border-left: 4px solid ${baseStyles.accentIndigo}; border-radius: 6px; padding: 16px 20px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 700; color: #818CF8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">
        TODAY'S #1 CORE GOAL
      </div>
      <div style="font-size: 16px; font-weight: 600; color: #FFFFFF;">
        ${coreGoal || "Execute career development deep work"}
      </div>
    </div>

    <!-- Action Plan / Sub-tasks -->
    <div style="margin-bottom: 28px;">
      <div style="font-size: 12px; font-weight: 600; color: ${baseStyles.mutedColor}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">
        Daily Checklist Items:
      </div>
      <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
        ${todosHtml}
      </ul>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${appUrl}" style="display: inline-block; background-color: ${baseStyles.accentIndigo}; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);">
        Start Practice Session Now &rarr;
      </a>
    </div>

    <p style="text-align: center; font-size: 12px; color: ${baseStyles.mutedColor}; margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px;">
      Career Shift Tracker &bull; Accountability Automated &bull; 9:00 AM IST Schedule
    </p>
  </div>
</body>
</html>
`;

  return { subject, html };
}

export function getSkipAlertTemplate({
  userName,
  targetRole,
  previousStreak,
  skipReason,
  appUrl,
}: SkipAlertProps): { subject: string; html: string } {
  const subject = "Practice Skipped Today — Reason Logged";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #090D16; font-family: ${baseStyles.fontFamily}; color: ${baseStyles.textColor};">
  <div style="max-width: 560px; margin: 0 auto; background-color: ${baseStyles.cardBg}; border: 1px solid #334155; border-radius: 12px; padding: 32px 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    
    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 24px;">
      <span style="display: inline-block; background-color: rgba(245, 158, 11, 0.2); color: #FBBF24; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">
        Intentional Skip Notice
      </span>
      <div style="font-family: monospace; font-size: 13px; color: #94A3B8;">
        Prior Streak: ${previousStreak} Days
      </div>
    </div>

    <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 12px 0; color: #F59E0B;">
      Practice Skipped Today
    </h1>
    <p style="font-size: 14px; line-height: 1.5; color: ${baseStyles.mutedColor}; margin: 0 0 20px 0;">
      <strong>${userName}</strong> has logged an intentional skip for today's <strong>${targetRole}</strong> practice session.
    </p>

    <!-- Reason Box -->
    <div style="background-color: #0F172A; border-left: 4px solid ${baseStyles.accentAmber}; border-radius: 6px; padding: 16px 20px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 700; color: #FBBF24; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
        OFFICIAL REASON LOGGED
      </div>
      <blockquote style="margin: 0; font-size: 14px; font-style: italic; color: #E2E8F0; line-height: 1.6;">
        &ldquo;${skipReason}&rdquo;
      </blockquote>
    </div>

    <!-- Rule / Accountability Statement -->
    <div style="background-color: rgba(245, 158, 11, 0.08); border: 1px dashed rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <div style="font-size: 13px; font-weight: 600; color: #FCD34D; margin-bottom: 4px;">
        The Cardinal Rule: "Never Miss Twice"
      </div>
      <p style="font-size: 13px; color: #CBD5E1; margin: 0; line-height: 1.4;">
        One skip is a conscious choice. Two skips in a row is the start of a new, broken habit. Tomorrow's practice is non-negotiable.
      </p>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 28px 0 16px 0;">
      <a href="${appUrl}" style="display: inline-block; background-color: #334155; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
        View Accountability Dashboard &rarr;
      </a>
    </div>

    <p style="text-align: center; font-size: 12px; color: ${baseStyles.mutedColor}; margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px;">
      Delivered automatically to you and your designated accountability partner.
    </p>
  </div>
</body>
</html>
`;

  return { subject, html };
}

export function getMissedDayTemplate({
  userName,
  targetRole,
  previousStreak,
  longestStreak,
  appUrl,
}: MissedDayProps): { subject: string; html: string } {
  const subject = "9:00 PM Check: Today Missed — Streak Reset to 0";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #090D16; font-family: ${baseStyles.fontFamily}; color: ${baseStyles.textColor};">
  <div style="max-width: 560px; margin: 0 auto; background-color: ${baseStyles.cardBg}; border: 1px solid #334155; border-radius: 12px; padding: 32px 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    
    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 24px;">
      <span style="display: inline-block; background-color: rgba(244, 63, 94, 0.2); color: #FB7185; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">
        9:00 PM Accountability Check
      </span>
      <div style="font-family: monospace; font-size: 13px; color: #FB7185; font-weight: bold;">
        Streak: Reset to 0
      </div>
    </div>

    <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 12px 0; color: #F43F5E;">
      Today Was Missed, ${userName}
    </h1>
    <p style="font-size: 14px; line-height: 1.5; color: ${baseStyles.mutedColor}; margin: 0 0 20px 0;">
      The 9:00 PM IST cutoff has passed. No practice was logged for your transition into <strong>${targetRole}</strong> today.
    </p>

    <!-- Streak Comparison Box -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
      <div style="background-color: #0F172A; border-radius: 8px; padding: 16px; text-align: center; border: 1px solid #334155;">
        <div style="font-size: 11px; color: #94A3B8; text-transform: uppercase; font-weight: 600;">Lost Streak</div>
        <div style="font-size: 24px; font-weight: 700; color: #F43F5E; font-family: monospace; margin-top: 4px;">
          ${previousStreak} ${previousStreak === 1 ? "day" : "days"}
        </div>
      </div>
      <div style="background-color: #0F172A; border-radius: 8px; padding: 16px; text-align: center; border: 1px solid #334155;">
        <div style="font-size: 11px; color: #94A3B8; text-transform: uppercase; font-weight: 600;">All-Time Record</div>
        <div style="font-size: 24px; font-weight: 700; color: #10B981; font-family: monospace; margin-top: 4px;">
          ${longestStreak} ${longestStreak === 1 ? "day" : "days"}
        </div>
      </div>
    </div>

    <p style="font-size: 14px; color: #E2E8F0; line-height: 1.5; margin-bottom: 24px;">
      A missed day is a data point, not a defeat. The best developers and professionals rebuild immediately. Define tomorrow's #1 Core Goal tonight so you hit the ground running.
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 28px 0 16px 0;">
      <a href="${appUrl}" style="display: inline-block; background-color: ${baseStyles.accentIndigo}; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);">
        Set Tomorrow's Core Goal Now &rarr;
      </a>
    </div>

    <p style="text-align: center; font-size: 12px; color: ${baseStyles.mutedColor}; margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px;">
      Automated via Vercel Cron at 15:30 UTC (9:00 PM IST).
    </p>
  </div>
</body>
</html>
`;

  return { subject, html };
}

export function getTestEmailTemplate({
  userName,
  targetRole,
  appUrl,
}: TestEmailProps): { subject: string; html: string } {
  const subject = "[Verified] Career Shift Tracker: SMTP Credentials Active";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #090D16; font-family: ${baseStyles.fontFamily}; color: ${baseStyles.textColor};">
  <div style="max-width: 560px; margin: 0 auto; background-color: ${baseStyles.cardBg}; border: 1px solid #334155; border-radius: 12px; padding: 32px 24px;">
    
    <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.2); color: #34D399; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 20px;">
      Connection Test Passed
    </div>

    <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 12px 0; color: #10B981;">
      SMTP Automation Active
    </h1>
    <p style="font-size: 14px; line-height: 1.5; color: ${baseStyles.mutedColor}; margin: 0 0 20px 0;">
      Hello ${userName}, this confirms that your Nodemailer SMTP transport is configured correctly for your career shift tracking toward <strong>${targetRole}</strong>.
    </p>

    <div style="background-color: #0F172A; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #CBD5E1; line-height: 1.6;">
      <div>&bull; <strong>9:00 AM IST Morning Nudge:</strong> Will deliver daily objectives & countdown.</div>
      <div style="margin-top: 8px;">&bull; <strong>Instant Skip Alert:</strong> Will deliver skip reasons to you and your partner.</div>
      <div style="margin-top: 8px;">&bull; <strong>9:00 PM IST Evening Reset:</strong> Will audit practice completion and trigger streak alerts.</div>
    </div>

    <div style="text-align: center;">
      <a href="${appUrl}" style="display: inline-block; background-color: ${baseStyles.accentIndigo}; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
        Open Career Shift Tracker &rarr;
      </a>
    </div>
  </div>
</body>
</html>
`;

  return { subject, html };
}
