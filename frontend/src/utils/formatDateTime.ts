/**
 * Shared date/time formatter utility.
 * Returns dates in "DD MMM YYYY, h:mm A" format (e.g., "28 Feb 2026, 3:45 AM").
 * Handles ISO strings, date-only strings, Date objects, and timestamps.
 * Falls back gracefully on invalid input.
 */
export function formatDateTime(ts: string | number | Date | null | undefined): string {
  if (ts === null || ts === undefined || ts === '') {
    return 'No date';
  }

  try {
    let date: Date;

    if (ts instanceof Date) {
      date = ts;
    } else if (typeof ts === 'number') {
      date = new Date(ts);
    } else {
      // String input
      const str = ts.trim();
      // Check if it's a date-only string (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        // Treat as local midnight to avoid timezone shifts
        date = new Date(str + 'T00:00:00');
      } else {
        date = new Date(str);
      }
    }

    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  } catch {
    return 'Invalid Date';
  }
}
