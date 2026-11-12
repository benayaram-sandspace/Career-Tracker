# Career Shift Accountability & 30-Day Streak Tracker (v2 — 30-Day Roadmap Edition)

> **Next.js 14+ (App Router)** &bull; **MongoDB + Prisma ORM** &bull; **Light Editorial UI (65/35 Split)** &bull; **30-Day Pre-Planned Schedule & SMTP**

A calm, high-agency career transition operating system. Instead of waking up wondering what to study, pre-plan an entire 30-day (1-month) transition sprint upfront or import a 30-day syllabus. Each day, the workspace loads that specific date's pre-scheduled Core Goal and checklist, counts live focus time, maintains an unbroken streak, and enforces accountability through automated SMTP notifications and Vercel Cron.

---

## ⚡ What's New in v2 (Roadmap Edition)

- **Asymmetric 65 / 35 Split Workspace**:
  - **Left Execution Canvas (65% Width)**: Features the active day badge (`DAY 14 OF 30 • TODAY`), bold Core Goal card, sub-tasks checklist (with inline add/edit/delete), and the solid obsidian `Complete Practice` action bar alongside a quiet `Skip today` link.
  - **Right Telemetry Rail (35% Width)**: Swiss-grid cards separating telemetry from execution: (1) Active Streak & Personal Best record, (2) Live Focus Session Timer (`Start Practice` / `00:42:18 Active`), and (3) Interactive 30-Day Consistency Matrix.
- **Light-Mode Editorial UI**: Built on warm off-white surfaces (`#FAFAFA`), pure white elevated cards (`#FFFFFF`), crisp hairline borders (`1px solid #E4E4E7`), and obsidian typography (`#09090B`) inspired by Linear, Vercel Geist, and Notion.
- **30-Day Batch Roadmap Planner**:
  - Dedicated drawer to plan and schedule all 30 days upfront.
  - One-click *Load 30-Day Full-Stack Syllabus* (TypeScript, Next.js 14, PostgreSQL, MongoDB, System Design, Testing, Docker, CI/CD, Capstone, Resume & Mock Interviews).
  - Ability to paste any 30-day custom syllabus in plain text.
  - Batch-upserts 30 `DailyLog` documents and linked `TodoItem`s in MongoDB via `POST /api/roadmap/batch`.
- **Interactive Day-Wise Navigation**:
  - Top header date switcher (`< Thu, Nov 12 >`) to browse any day in the 30-day roadmap.
  - Clicking any cell in the 30-Day Consistency Matrix immediately jumps to that date's plan.
  - Future days open in *Pre-Planning Mode* (editable tasks; practice execution unlocks on the calendar date).
  - Past days open in *Audit Mode* with completion badges, duration, or logged skip reasons.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js 14+ (App Router, Server & Client Components, Route Handlers)
- **Database & ORM**: MongoDB Atlas + Prisma ORM (with local fallback store for instant zero-dependency testing)
- **Styling**: Tailwind CSS, Lucide Icons, Canvas Confetti
- **Email Automation**: Nodemailer (SMTP with Google App Passwords)
- **Cron Jobs**: Vercel Cron (`vercel.json` at 9:00 AM IST & 9:00 PM IST)
- **Access Control**: PIN Gate (`APP_PIN` + HTTP-only session cookie)

---

## 📂 Project Structure

```
├── .env.example                     # Environment configuration
├── vercel.json                      # Vercel Cron schedule (9 AM & 9 PM IST)
├── prisma/
│   └── schema.prisma                # MongoDB schema (UserSettings, DailyLog, TodoItem)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/pin/route.ts            # PIN gate verification
│   │   │   ├── auth/logout/route.ts         # Session clearance
│   │   │   ├── cron/morning-reminder/route.ts # 9:00 AM IST Cron handler
│   │   │   ├── cron/evening-check/route.ts    # 9:00 PM IST Cron handler
│   │   │   ├── dashboard/route.ts           # Day-wise state (?date=YYYY-MM-DD)
│   │   │   ├── practice/start/route.ts      # Focus timer trigger
│   │   │   ├── practice/complete/route.ts   # Core goal verification & streak calculation
│   │   │   ├── practice/skip/route.ts       # Friction skip & email dispatch
│   │   │   ├── roadmap/batch/route.ts       # 30-Day batch syllabus persistence
│   │   │   ├── settings/route.ts            # User profile update
│   │   │   ├── settings/test-email/route.ts # SMTP delivery test
│   │   │   └── todos/route.ts               # Date-aware task manager
│   │   ├── globals.css              # Light-mode editorial design tokens
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # 65/35 Asymmetric Workspace
│   ├── components/
│   │   ├── ExecutionCanvas.tsx      # Left 65% execution canvas & checklists
│   │   ├── Header.tsx               # Minimalist breadcrumb & date switcher
│   │   ├── PinModal.tsx             # 4-digit access pad
│   │   ├── RoadmapPlannerDrawer.tsx # 30-Day batch syllabus editor
│   │   ├── SettingsModal.tsx        # Profile, partner email, SMTP test
│   │   ├── SkipModal.tsx            # 15-char intentional skip friction
│   │   └── TelemetryRail.tsx        # Right 35% rail (Streak, Live Timer, 30-Day Matrix)
│   └── lib/
│       ├── auth.ts                  # PIN authentication utilities
│       ├── dateUtils.ts             # Asia/Kolkata date normalizer & roadmap math
│       ├── db.ts                    # Resilient Prisma MongoDB + local fallback
│       ├── email.ts                 # Nodemailer transporter & connection verify
│       ├── emailTemplates.ts        # Responsive HTML email templates
│       └── prisma.ts                # Singleton Prisma client for serverless
```

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/benayaram-sandspace/Career-Tracker.git
cd Career-Tracker
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Populate `.env`:
```env
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/careershift?retryWrites=true&w=majority"
APP_PIN="1234"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-char-google-app-password"
SMTP_FROM="Career Shift Tracker <your-email@gmail.com>"
CRON_SECRET="replace-with-random-32-character-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 🌐 Production Deployment Guide (Vercel + MongoDB Atlas)

1. **MongoDB Atlas Network Access**:
   - In MongoDB Atlas &rarr; **Network Access**, add `0.0.0.0/0` (Allow Access from Anywhere) so Vercel's serverless functions connect without timeouts.
2. **Gmail SMTP App Password**:
   - Enable 2-Step Verification on the sender Google account.
   - Go to Google Account &rarr; Security &rarr; App Passwords &rarr; Generate a 16-character password for `SMTP_PASS`.
3. **Deploy to Vercel**:
   - Push to `main` and import into Vercel.
   - Supply environment variables in Vercel Project Settings.
4. **Vercel Cron Verification**:
   - Vercel Cron automatically picks up `vercel.json` (03:30 UTC for 9:00 AM IST and 15:30 UTC for 9:00 PM IST).
   - Test both cron routes directly from the Vercel Dashboard &rarr; Cron Jobs tab.

---

## 📄 License
MIT License. Built for unbroken momentum.
