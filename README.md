# Career Shift Accountability & Streak Tracker

> **Next.js 14+ (App Router)** &bull; **MongoDB + Prisma ORM** &bull; **Nodemailer SMTP Automation** &bull; **Vercel Cron Jobs** &bull; **Distraction-Free Focused UI/UX**

A calm, distraction-free accountability system designed specifically for software engineers and professionals executing a high-stakes career transition. Instead of overwhelming you with folders, kanban boards, or infinite backlogs, this app enforces a single daily ritual: commit to one primary **#1 Core Goal**, execute focused practice, protect an unbroken streak, and face structured accountability via automated SMTP email alerts if a day is skipped or missed.

---

## ⚡ Key Highlights & Architecture

- **Single-Screen Focus UI**: Centered 720px column (`max-w-2xl mx-auto`), high-contrast dark palette (`#0F172A`), zero-noise interface with generous whitespace and clear micro-interactions.
- **Micro-UX & State Transitions**:
  1. *Idle State*: Target Career Role badge, active streak flame counter, pinned Core Goal, and prominent *Start Today's Practice* CTA.
  2. *Active Focus Mode*: Real-time ticking focus timer (`00:45:12`), dimmed secondary distractions, and interactive checklist.
  3. *Completion Flow*: Checking off the #1 Core Goal unlocks the primary *Complete Today's Practice* button with celebratory confetti and streak increment.
  4. *Intentional Skip Friction*: Clicking *Skip Today* requires a mandatory 15-character genuine reason, resets streak to 0, and dispatches automated SMTP alerts to you and your partner.
  5. *30-Day Consistency Strip*: Visual 30-day block tracker with color-coded feedback (Emerald = Completed, Amber = Skipped, Rose = Missed, Indigo = Today).
- **Timezone-Normalized Streak Engine**: All dates are normalized to `Asia/Kolkata` (`YYYY-MM-DD`) to avoid UTC midnight drift:
  - *Yesterday match*: increments `currentStreak + 1`
  - *Same-day idempotency*: preserves streak without double counting
  - *Gap / First day*: resets `currentStreak = 1`
  - *Record tracking*: updates `longestStreak = max(longestStreak, currentStreak)`
- **Automated Vercel Cron Schedules**:
  - `03:30 UTC` (9:00 AM IST): Morning Reminder with today's Core Goal and checklist.
  - `15:30 UTC` (9:00 PM IST): Evening Audit. If pending, automatically marks `MISSED`, resets streak to 0, and sends streak reset alert.
- **PIN Gate Access Control**: Zero-friction 4-digit PIN authentication (`APP_PIN`) stored in an HTTP-only secure session cookie.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS, Lucide Icons, Canvas Confetti
- **Database & ORM**: MongoDB Atlas + Prisma ORM (with local fallback store for instant zero-dependency testing)
- **Email Automation**: Nodemailer (SMTP with Google App Passwords)
- **Cron Jobs**: Vercel Cron (`vercel.json`)
- **Deployment Target**: Vercel Serverless

---

## 📂 Project Structure

```
├── .env.example                     # Environment variable blueprint
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
│   │   │   ├── dashboard/route.ts           # Unified daily state API
│   │   │   ├── practice/start/route.ts      # Focus mode trigger
│   │   │   ├── practice/complete/route.ts   # Core goal verification & streak calculation
│   │   │   ├── practice/skip/route.ts       # Friction skip & email dispatch
│   │   │   ├── settings/route.ts            # User profile update
│   │   │   ├── settings/test-email/route.ts # SMTP delivery test
│   │   │   └── todos/route.ts               # Core goal and task manager
│   │   ├── globals.css              # Custom styling, dark/light variables
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Single-screen focus dashboard
│   ├── components/
│   │   ├── ConsistencyStrip.tsx     # 30-Day visual momentum strip
│   │   ├── Header.tsx               # Role badge, date display, theme & PIN lock
│   │   ├── PinModal.tsx             # 4-digit numeric access pad
│   │   ├── PracticeCard.tsx         # Idle / Focus / Completed / Skipped states
│   │   ├── SettingsModal.tsx        # Profile, partner email, SMTP test
│   │   ├── SkipModal.tsx            # 15-char minimum intentional skip friction
│   │   ├── StreakCard.tsx           # Streak flame, record tracker, status pill
│   │   └── TodoList.tsx             # #1 Core Goal highlight & checklist
│   └── lib/
│       ├── auth.ts                  # PIN authentication utilities
│       ├── dateUtils.ts             # Asia/Kolkata date normalizer & formatters
│       ├── db.ts                    # Resilient Prisma MongoDB + local fallback
│       ├── email.ts                 # Nodemailer transporter & connection verify
│       ├── emailTemplates.ts        # Responsive HTML email templates
│       └── prisma.ts                # Singleton Prisma client for serverless
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/benayaram-sandspace/Career-Tracker.git
cd Career-Tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the credentials:
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

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Deployment Guide (Vercel + MongoDB Atlas)

1. **MongoDB Atlas Network Access**:
   - In MongoDB Atlas &rarr; **Network Access**, add `0.0.0.0/0` (Allow Access from Anywhere) so Vercel's serverless lambdas can connect without timeout errors.
2. **Gmail SMTP App Password**:
   - Enable 2-Step Verification on your Google Account.
   - Go to Google Account &rarr; Security &rarr; App Passwords &rarr; Create "Career Tracker" to generate a 16-character password for `SMTP_PASS`.
3. **Deploy to Vercel**:
   - Import the repository into Vercel.
   - Add all environment variables from `.env.example` into Vercel Project Settings.
   - Deploy to the `main` production branch.
4. **Verify Vercel Cron Jobs**:
   - In the Vercel Dashboard, go to **Cron Jobs** tab to view `/api/cron/morning-reminder` (9:00 AM IST) and `/api/cron/evening-check` (9:00 PM IST).
   - Use the **Settings &rarr; Send Test Email** button in the app to verify SMTP credentials immediately.

---

## 📄 License
MIT License. Built for unbroken momentum.
