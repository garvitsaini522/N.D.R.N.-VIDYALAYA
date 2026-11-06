export const SCHOOL_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns the current day of the week in Indian Standard Time (Asia/Kolkata).
 * If Sunday, defaults to Monday for school scheduling purposes.
 */
export function getKolkataDayOfWeek(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: SCHOOL_TIMEZONE,
    weekday: 'long',
  });
  const day = formatter.format(date);
  return day === 'Sunday' ? 'Monday' : day;
}

/**
 * Formats a Date object to YYYY-MM-DD in Asia/Kolkata timezone
 */
export function formatKolkataDate(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: SCHOOL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

