import fs from "fs";
import path from "path";
import { prisma } from "./prisma";
import { getTodayIST, getYesterdayIST } from "./dateUtils";

export type DayStatus = "PENDING" | "COMPLETED" | "SKIPPED" | "MISSED";

export interface UserSettingsType {
  id: string;
  userName: string;
  userEmail: string;
  partnerEmail: string | null;
  targetCareerRole: string;
  timezone: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

export interface TodoItemType {
  id: string;
  dailyLogId: string;
  title: string;
  isCoreGoal: boolean;
  isCompleted: boolean;
  createdAt: Date;
}

export interface DailyLogType {
  id: string;
  date: string;
  status: DayStatus;
  skipReason: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  todos: TodoItemType[];
}

const LOCAL_DATA_FILE = path.join(process.cwd(), "data", "db.json");

interface LocalStore {
  userSettings: UserSettingsType;
  dailyLogs: Record<string, DailyLogType>; // keyed by date (YYYY-MM-DD)
}

function getInitialStore(): LocalStore {
  return {
    userSettings: {
      id: "default-settings",
      userName: "Career Shifter",
      userEmail: "user@example.com",
      partnerEmail: null,
      targetCareerRole: "Full-Stack Software Engineer",
      timezone: "Asia/Kolkata",
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
    },
    dailyLogs: {},
  };
}

function readLocalStore(): LocalStore {
  try {
    if (!fs.existsSync(LOCAL_DATA_FILE)) {
      const initial = getInitialStore();
      const dir = path.dirname(LOCAL_DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const data = fs.readFileSync(LOCAL_DATA_FILE, "utf-8");
    const parsed = JSON.parse(data);
    // Revive dates
    if (parsed.dailyLogs) {
      for (const date in parsed.dailyLogs) {
        const log = parsed.dailyLogs[date];
        if (log.startedAt) log.startedAt = new Date(log.startedAt);
        if (log.completedAt) log.completedAt = new Date(log.completedAt);
        if (log.todos) {
          for (const todo of log.todos) {
            if (todo.createdAt) todo.createdAt = new Date(todo.createdAt);
          }
        }
      }
    }
    return parsed;
  } catch (e) {
    console.error("Error reading local store fallback:", e);
    return getInitialStore();
  }
}

function writeLocalStore(store: LocalStore) {
  try {
    const dir = path.dirname(LOCAL_DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing local store fallback:", e);
  }
}

function isPrismaConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  if (url.includes("<username>") || url.includes("cluster0.xxxxx")) return false;
  return url.startsWith("mongodb");
}

// ----------------- Public Data Access Functions -----------------

export async function getUserSettings(): Promise<UserSettingsType> {
  if (isPrismaConfigured()) {
    try {
      let settings = await prisma.userSettings.findFirst();
      if (!settings) {
        settings = await prisma.userSettings.create({
          data: {
            userName: "Career Shifter",
            userEmail: "user@example.com",
            targetCareerRole: "Full-Stack Software Engineer",
            timezone: "Asia/Kolkata",
            currentStreak: 0,
            longestStreak: 0,
          },
        });
      }
      return settings as UserSettingsType;
    } catch (e) {
      console.warn("Prisma error connecting to MongoDB, falling back to local storage:", e);
    }
  }

  const store = readLocalStore();
  return store.userSettings;
}

export async function updateUserSettings(
  data: Partial<UserSettingsType>
): Promise<UserSettingsType> {
  if (isPrismaConfigured()) {
    try {
      const current = await getUserSettings();
      const updated = await prisma.userSettings.update({
        where: { id: current.id },
        data,
      });
      return updated as UserSettingsType;
    } catch (e) {
      console.warn("Prisma update error, falling back to local storage:", e);
    }
  }

  const store = readLocalStore();
  store.userSettings = {
    ...store.userSettings,
    ...data,
  };
  writeLocalStore(store);
  return store.userSettings;
}

export async function upsertDailyLog(date: string): Promise<DailyLogType> {
  if (isPrismaConfigured()) {
    try {
      let log = await prisma.dailyLog.findUnique({
        where: { date },
        include: { todos: { orderBy: { createdAt: "asc" } } },
      });
      if (!log) {
        log = await prisma.dailyLog.create({
          data: {
            date,
            status: "PENDING",
          },
          include: { todos: true },
        });
      }
      return log as DailyLogType;
    } catch (e) {
      console.warn("Prisma upsertDailyLog error, falling back to local storage:", e);
    }
  }

  const store = readLocalStore();
  if (!store.dailyLogs[date]) {
    store.dailyLogs[date] = {
      id: `local-log-${date}`,
      date,
      status: "PENDING",
      skipReason: null,
      startedAt: null,
      completedAt: null,
      todos: [],
    };
    writeLocalStore(store);
  }
  return store.dailyLogs[date];
}

export async function getDailyLog(date: string): Promise<DailyLogType | null> {
  if (isPrismaConfigured()) {
    try {
      const log = await prisma.dailyLog.findUnique({
        where: { date },
        include: { todos: { orderBy: { createdAt: "asc" } } },
      });
      return log as DailyLogType | null;
    } catch (e) {
      console.warn("Prisma getDailyLog error, falling back to local storage:", e);
    }
  }

  const store = readLocalStore();
  return store.dailyLogs[date] || null;
}

export async function get30DaysLogs(
  dates: string[]
): Promise<Record<string, { status: DayStatus; skipReason?: string | null; durationMinutes?: number }>> {
  const result: Record<
    string,
    { status: DayStatus; skipReason?: string | null; durationMinutes?: number }
  > = {};

  if (isPrismaConfigured()) {
    try {
      const logs = await prisma.dailyLog.findMany({
        where: {
          date: { in: dates },
        },
      });
      for (const log of logs) {
        let durationMinutes: number | undefined;
        if (log.startedAt && log.completedAt) {
          durationMinutes = Math.max(
            1,
            Math.round(
              (new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime()) / 60000
            )
          );
        }
        result[log.date] = {
          status: log.status as DayStatus,
          skipReason: log.skipReason,
          durationMinutes,
        };
      }
      return result;
    } catch (e) {
      console.warn("Prisma get30DaysLogs error, falling back to local storage:", e);
    }
  }

  const store = readLocalStore();
  for (const date of dates) {
    const log = store.dailyLogs[date];
    if (log) {
      let durationMinutes: number | undefined;
      if (log.startedAt && log.completedAt) {
        durationMinutes = Math.max(
          1,
          Math.round(
            (new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime()) / 60000
          )
        );
      }
      result[date] = {
        status: log.status,
        skipReason: log.skipReason,
        durationMinutes,
      };
    }
  }
  return result;
}

export async function createTodoItem(
  date: string,
  title: string,
  isCoreGoal: boolean
): Promise<TodoItemType> {
  const log = await upsertDailyLog(date);

  if (isPrismaConfigured()) {
    try {
      if (isCoreGoal) {
        // Demote any existing core goal for this daily log
        await prisma.todoItem.updateMany({
          where: { dailyLogId: log.id, isCoreGoal: true },
          data: { isCoreGoal: false },
        });
      }

      const item = await prisma.todoItem.create({
        data: {
          dailyLogId: log.id,
          title,
          isCoreGoal,
          isCompleted: false,
        },
      });
      return item as TodoItemType;
    } catch (e) {
      console.warn("Prisma createTodoItem error, falling back to local storage:", e);
    }
  }

  const store = readLocalStore();
  const targetLog = store.dailyLogs[date];
  if (isCoreGoal && targetLog.todos) {
    targetLog.todos.forEach((t) => {
      t.isCoreGoal = false;
    });
  }

  const newTodo: TodoItemType = {
    id: `local-todo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    dailyLogId: targetLog.id,
    title,
    isCoreGoal,
    isCompleted: false,
    createdAt: new Date(),
  };

  targetLog.todos.push(newTodo);
  writeLocalStore(store);
  return newTodo;
}

export async function updateTodoItem(
  id: string,
  data: { isCompleted?: boolean; title?: string; isCoreGoal?: boolean }
): Promise<TodoItemType | null> {
  if (isPrismaConfigured()) {
    try {
      if (data.isCoreGoal) {
        const item = await prisma.todoItem.findUnique({ where: { id } });
        if (item) {
          await prisma.todoItem.updateMany({
            where: { dailyLogId: item.dailyLogId, isCoreGoal: true },
            data: { isCoreGoal: false },
          });
        }
      }
      const updated = await prisma.todoItem.update({
        where: { id },
        data,
      });
      return updated as TodoItemType;
    } catch (e) {
      console.warn("Prisma updateTodoItem error, falling back to local storage:", e);
    }
  }

  const store = readLocalStore();
  for (const date in store.dailyLogs) {
    const log = store.dailyLogs[date];
    const todo = log.todos.find((t) => t.id === id);
    if (todo) {
      if (data.isCoreGoal) {
        log.todos.forEach((t) => {
          t.isCoreGoal = false;
        });
      }
      if (data.isCompleted !== undefined) todo.isCompleted = data.isCompleted;
      if (data.title !== undefined) todo.title = data.title;
      if (data.isCoreGoal !== undefined) todo.isCoreGoal = data.isCoreGoal;
      writeLocalStore(store);
      return todo;
    }
  }
  return null;
}

export async function deleteTodoItem(id: string): Promise<boolean> {
  if (isPrismaConfigured()) {
    try {
      await prisma.todoItem.delete({ where: { id } });
      return true;
    } catch (e) {
      console.warn("Prisma deleteTodoItem error, falling back to local storage:", e);
    }
  }

  const store = readLocalStore();
  for (const date in store.dailyLogs) {
    const log = store.dailyLogs[date];
    const index = log.todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      log.todos.splice(index, 1);
      writeLocalStore(store);
      return true;
    }
  }
  return false;
}

export async function startDailyPractice(date: string): Promise<DailyLogType> {
  const now = new Date();
  if (isPrismaConfigured()) {
    try {
      const log = await upsertDailyLog(date);
      const updated = await prisma.dailyLog.update({
        where: { id: log.id },
        data: {
          startedAt: log.startedAt ? log.startedAt : now,
        },
        include: { todos: true },
      });
      return updated as DailyLogType;
    } catch (e) {
      console.warn("Prisma startDailyPractice error, falling back to local storage:", e);
    }
  }

  const store = readLocalStore();
  const log = store.dailyLogs[date] || (await upsertDailyLog(date));
  if (!log.startedAt) {
    log.startedAt = now;
  }
  store.dailyLogs[date] = log;
  writeLocalStore(store);
  return log;
}

export async function completeDailyPractice(
  date: string
): Promise<{ log: DailyLogType; userSettings: UserSettingsType }> {
  const settings = await getUserSettings();
  const now = new Date();
  const yesterdayIST = getYesterdayIST(settings.timezone);
  const todayIST = getTodayIST(settings.timezone);

  let newStreak = settings.currentStreak;

  // Streak Calculation Rules (IST Normalized)
  if (settings.lastCompletedDate === yesterdayIST) {
    newStreak = settings.currentStreak + 1;
  } else if (settings.lastCompletedDate === todayIST) {
    newStreak = settings.currentStreak; // Same-day idempotency
  } else {
    // Gap or first-day reset
    newStreak = 1;
  }

  const newLongestStreak = Math.max(settings.longestStreak, newStreak);

  // Update Settings
  const updatedSettings = await updateUserSettings({
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    lastCompletedDate: todayIST,
  });

  // Update Daily Log
  if (isPrismaConfigured()) {
    try {
      const log = await upsertDailyLog(date);
      const updatedLog = await prisma.dailyLog.update({
        where: { id: log.id },
        data: {
          status: "COMPLETED",
          completedAt: now,
          startedAt: log.startedAt ? log.startedAt : now,
        },
        include: { todos: true },
      });
      return { log: updatedLog as DailyLogType, userSettings: updatedSettings };
    } catch (e) {
      console.warn("Prisma completeDailyPractice error, falling back to local storage:", e);
    }
  }

  const store = readLocalStore();
  const log = store.dailyLogs[date] || (await upsertDailyLog(date));
  log.status = "COMPLETED";
  log.completedAt = now;
  if (!log.startedAt) log.startedAt = now;
  store.dailyLogs[date] = log;
  writeLocalStore(store);

  return { log, userSettings: updatedSettings };
}

export async function skipDailyPractice(
  date: string,
  skipReason: string
): Promise<{ log: DailyLogType; userSettings: UserSettingsType }> {
  // Skipping resets streak to 0
  const updatedSettings = await updateUserSettings({
    currentStreak: 0,
  });

  if (isPrismaConfigured()) {
    try {
      const log = await upsertDailyLog(date);
      const updatedLog = await prisma.dailyLog.update({
        where: { id: log.id },
        data: {
          status: "SKIPPED",
          skipReason,
        },
        include: { todos: true },
      });
      return { log: updatedLog as DailyLogType, userSettings: updatedSettings };
    } catch (e) {
      console.warn("Prisma skipDailyPractice error, falling back to local storage:", e);
    }
  }

  const store = readLocalStore();
  const log = store.dailyLogs[date] || (await upsertDailyLog(date));
  log.status = "SKIPPED";
  log.skipReason = skipReason;
  store.dailyLogs[date] = log;
  writeLocalStore(store);

  return { log, userSettings: updatedSettings };
}

export async function missDailyPractice(
  date: string
): Promise<{ log: DailyLogType; userSettings: UserSettingsType }> {
  // Missed day resets streak to 0
  const updatedSettings = await updateUserSettings({
    currentStreak: 0,
  });

  if (isPrismaConfigured()) {
    try {
      const log = await upsertDailyLog(date);
      const updatedLog = await prisma.dailyLog.update({
        where: { id: log.id },
        data: {
          status: "MISSED",
        },
        include: { todos: true },
      });
      return { log: updatedLog as DailyLogType, userSettings: updatedSettings };
    } catch (e) {
      console.warn("Prisma missDailyPractice error, falling back to local storage:", e);
    }
  }

  const store = readLocalStore();
  const log = store.dailyLogs[date] || (await upsertDailyLog(date));
  log.status = "MISSED";
  store.dailyLogs[date] = log;
  writeLocalStore(store);

  return { log, userSettings: updatedSettings };
}
