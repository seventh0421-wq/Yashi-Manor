import { DutyScheduleDay, StaffMember } from '../types';
import { STAFF_MEMBERS } from './cafeData';

export const BUSINESS_HOURS_STANDARD = '20:30 - 24:00 (GMT+8)';

// Helper to look up staff by ID
export function getStaffById(id: string): StaffMember | undefined {
  return STAFF_MEMBERS.find((s) => s.id === id);
}

export function getStaffMembersByIds(ids: string[]): StaffMember[] {
  return ids
    .map((id) => getStaffById(id))
    .filter((s): s is StaffMember => Boolean(s));
}

export function getMaidsOnDuty(ids: string[]): StaffMember[] {
  return getStaffMembersByIds(ids).filter((s) => s.role === 'maid');
}

export function getButlersOnDuty(ids: string[]): StaffMember[] {
  return getStaffMembersByIds(ids).filter((s) => s.role === 'butler');
}

/**
 * Generates the full month calendar schedule for a given year & month (1-indexed month: 1=Jan, 9=Sep).
 * Night Herbal Cafe is regularly open on Fridays (5) and Saturdays (6) 20:30 - 24:00.
 */
export function getMonthSchedule(year: number, month: number): DutyScheduleDay[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const schedule: DutyScheduleDay[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay(); // 0: Sun, 1: Mon, ..., 5: Fri, 6: Sat
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const dateString = `${year}-${pad(month)}-${pad(day)}`;

    const isFriday = dayOfWeek === 5;
    const isSaturday = dayOfWeek === 6;
    const isOpen = isFriday || isSaturday;

    let dutyStaffIds: string[] = [];
    let note: string | undefined = undefined;

    if (isOpen) {
      // Regular open days: Friday and Saturday standard duty rosters
      if (isFriday) {
        // Friday roster: maids & butlers
        dutyStaffIds = ['luko', 'laiko', 'donggua', 'yinshi', 'fuwaway', 'ptowo'];
        note = '週五常規開館夜，歡迎主人歸來小憩品茶。';
      } else if (isSaturday) {
        // Saturday roster: weekend roster with all staff
        dutyStaffIds = ['luko', 'kurikuri', 'laiko', 'donggua', 'potatobrave', 'yinshi', 'ptowo', 'fuwaway'];
        note = '週六常規開館夜，侍從全員候命侍奉。';
      }
    } else {
      note = '本日為夜蒔館休館整備日，女僕與執事們正在研習新調飲與烘焙點心。';
    }

    schedule.push({
      date: dateString,
      year,
      month,
      day,
      dayOfWeek,
      isOpen,
      businessHours: isOpen ? BUSINESS_HOURS_STANDARD : '本日公休',
      dutyStaffIds,
      note,
    });
  }

  return schedule;
}

/**
 * Finds the closest upcoming open day in the month starting from a specific day,
 * or the first open day if none after.
 */
export function findNearestOpenDay(
  schedule: DutyScheduleDay[],
  preferredDay: number
): DutyScheduleDay | undefined {
  // First try to find on or after preferred day
  const upcoming = schedule.find((d) => d.day >= preferredDay && d.isOpen);
  if (upcoming) return upcoming;
  // If none later in this month, return first open day of month
  return schedule.find((d) => d.isOpen);
}
