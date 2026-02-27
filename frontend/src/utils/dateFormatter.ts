/**
 * Shared date+time formatter utility.
 * Formats any date string, timestamp (number), or Date object as:
 * "28 Feb 2026, 3:45 AM" (12-hour format with AM/PM).
 *
 * If the input is a date-only string (no time component), defaults to 12:00 AM.
 * Never throws — returns an empty string on invalid input.
 */
export function formatDateTime(value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined) return '';

  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'number') {
    date = new Date(value);
  } else {
    // String: check if it's a date-only string (YYYY-MM-DD) with no time component
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (dateOnlyPattern.test(value.trim())) {
      // Append midnight time to avoid timezone shifting the date
      date = new Date(`${value}T00:00:00`);
    } else {
      date = new Date(value);
    }
  }

  if (isNaN(date.getTime())) return '';

  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minutesStr = minutes.toString().padStart(2, '0');

  return `${day} ${month} ${year}, ${hours}:${minutesStr} ${ampm}`;
}
