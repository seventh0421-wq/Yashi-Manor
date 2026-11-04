/**
 * Utility functions for formatting and generating reservation dates with explicit YYYY/MM/DD format.
 * Ensures guests always see and select exact calendar dates to prevent any misunderstanding.
 */

export function padZero(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export const WEEKDAYS = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

/**
 * Format a Date object to "YYYY/MM/DD"
 */
export function formatToYMD(d: Date): string {
  return `${d.getFullYear()}/${padZero(d.getMonth() + 1)}/${padZero(d.getDate())}`;
}

/**
 * Format a Date object or YYYY-MM-DD string to "YYYY/MM/DD (週X)"
 */
export function formatToYMDWithWeekday(input: Date | string): string {
  if (!input) return '';

  if (typeof input === 'string') {
    // If already in YYYY/MM/DD (週X) format
    const ymdWeekdayRegex = /^(\d{4})\/(\d{1,2})\/(\d{1,2})\s*\(([週星期][日一二三四五六])\)/;
    const match = input.match(ymdWeekdayRegex);
    if (match) {
      const [, y, m, d, w] = match;
      const cleanW = w.startsWith('星期') ? w.replace('星期', '週') : w;
      return `${y}/${padZero(Number(m))}/${padZero(Number(d))} (${cleanW})`;
    }

    // Try parsing YYYY-MM-DD or YYYY/MM/DD
    const parts = input.trim().split(/[-/]/);
    if (parts.length >= 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const d = new Date(year, month - 1, day);
        const weekday = WEEKDAYS[d.getDay()];
        return `${year}/${padZero(month)}/${padZero(day)} (${weekday})`;
      }
    }

    // If it's a legacy label like "本週五 (20:30起)"
    const upcoming = getUpcomingCafeOpenDates(4);
    if (input.includes('本週五') && upcoming[0]) return upcoming[0].value;
    if (input.includes('本週六') && upcoming[1]) return upcoming[1].value;
    if (input.includes('下週五') && upcoming[2]) return upcoming[2].value;
    if (input.includes('下週六') && upcoming[3]) return upcoming[3].value;
  }

  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return '';
  const weekday = WEEKDAYS[d.getDay()];
  return `${formatToYMD(d)} (${weekday})`;
}

export interface UpcomingOpenDate {
  dateYMD: string; // e.g. "2026/11/06"
  rawDate: string; // e.g. "2026-11-06"
  weekday: string; // e.g. "週五"
  relativeLabel: string; // e.g. "本週五", "下週六"
  fullDisplay: string; // e.g. "2026/11/06 (週五)・本週五"
  value: string; // e.g. "2026/11/06 (週五)"
}

/**
 * Calculates upcoming open dates (Fridays & Saturdays) from the current time.
 */
export function getUpcomingCafeOpenDates(count: number = 6): UpcomingOpenDate[] {
  const result: UpcomingOpenDate[] = [];
  const now = new Date();

  // If today is Friday or Saturday, check if it's already past midnight closing (24:00)
  // If still within Friday or Saturday before 24:00, allow today.
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // If today is Friday/Saturday and hours are past 23:59, start looking from tomorrow
  if (now.getHours() >= 24) {
    cursor.setDate(cursor.getDate() + 1);
  }

  let foundFridays = 0;
  let foundSaturdays = 0;

  for (let offset = 0; offset < 60 && result.length < count; offset++) {
    const checkDate = new Date(cursor.getTime() + offset * 86400000);
    const dayOfWeek = checkDate.getDay();

    if (dayOfWeek === 5 || dayOfWeek === 6) {
      const isFriday = dayOfWeek === 5;
      const dateYMD = formatToYMD(checkDate);
      const rawDate = `${checkDate.getFullYear()}-${padZero(checkDate.getMonth() + 1)}-${padZero(
        checkDate.getDate()
      )}`;
      const weekday = isFriday ? '週五' : '週六';

      let relativeLabel = '';
      if (isFriday) {
        foundFridays++;
        if (foundFridays === 1) relativeLabel = '本週五';
        else if (foundFridays === 2) relativeLabel = '下週五';
        else relativeLabel = `${foundFridays}週後週五`;
      } else {
        foundSaturdays++;
        if (foundSaturdays === 1) relativeLabel = '本週六';
        else if (foundSaturdays === 2) relativeLabel = '下週六';
        else relativeLabel = `${foundSaturdays}週後週六`;
      }

      const value = `${dateYMD} (${weekday})`;
      result.push({
        dateYMD,
        rawDate,
        weekday,
        relativeLabel,
        fullDisplay: `${dateYMD} (${weekday})・${relativeLabel}`,
        value,
      });
    }
  }

  return result;
}
