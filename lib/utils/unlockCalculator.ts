export interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isUnlocked: boolean;
  totalMs: number;
}

interface LocalTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/**
 * Extracts localized year, month, day, hour, minute, second using Intl.DateTimeFormat.
 */
function getLocalizedParts(date: Date, timeZone: string): LocalTimeParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parseInt(parts.find((p) => p.type === type)?.value || "0", 10);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour") % 24,
    minute: get("minute"),
    second: get("second"),
  };
}

/**
 * Calculates the exact 2:00 AM UTC timestamp for the next day's unlock.
 * Habit Rule:
 * - Submissions between 12:00 AM and 1:59 AM unlock at 2:00 AM on that SAME morning.
 * - Submissions from 2:00 AM onwards unlock at 2:00 AM on the FOLLOWING morning.
 */
export function calculateNextUnlockTime(
  submissionDate: Date = new Date(),
  timeZone?: string
): Date {
  const tz = timeZone || "Asia/Kolkata";
  const parts = getLocalizedParts(submissionDate, tz);

  // If before 2:00 AM, unlocks today at 2:00 AM. Otherwise tomorrow at 2:00 AM.
  const dayOffset = parts.hour < 2 ? 0 : 1;

  // Approximate target date in UTC
  const targetUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + dayOffset, 2, 0, 0));

  // Determine timezone difference in milliseconds to align with 2:00 AM in local timezone
  const targetParts = getLocalizedParts(targetUtc, tz);
  const hourDiff = (targetParts.hour % 24) - 2;
  const dayDiff = targetParts.day - (parts.day + dayOffset);
  const totalOffsetMs = (dayDiff * 24 + hourDiff) * 3600 * 1000 + targetParts.minute * 60 * 1000;

  return new Date(targetUtc.getTime() - totalOffsetMs);
}

/**
 * Checks if a given unlock timestamp has been reached.
 */
export function isDayUnlocked(unlockAt: Date | string, now: Date = new Date()): boolean {
  const target = typeof unlockAt === "string" ? new Date(unlockAt) : unlockAt;
  return now.getTime() >= target.getTime();
}

/**
 * Formats the time remaining until next unlock as HH:MM:SS.
 */
export function formatTimeRemaining(unlockAt: Date | string, now: Date = new Date()): TimeRemaining {
  const target = typeof unlockAt === "string" ? new Date(unlockAt) : unlockAt;
  const totalMs = Math.max(0, target.getTime() - now.getTime());
  const isUnlocked = totalMs <= 0;

  if (isUnlocked) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: "00:00:00",
      isUnlocked: true,
      totalMs: 0,
    };
  }

  const totalSeconds = Math.floor(totalMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  const formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return {
    hours,
    minutes,
    seconds,
    formatted,
    isUnlocked: false,
    totalMs,
  };
}
