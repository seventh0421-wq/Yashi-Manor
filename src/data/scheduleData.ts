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
    let themeTitle: string | undefined = undefined;
    let specialTag: string | undefined = undefined;
    let note: string | undefined = undefined;

    if (isOpen) {
      // Calculate which occurrence of Friday or Saturday in the month this is
      const weekIndex = Math.ceil(day / 7);

      if (isFriday) {
        if (weekIndex === 1) {
          // First Friday of the month
          dutyStaffIds = ['luko', 'laiko', 'donggua'];
          themeTitle = '【香草晨露】細緻女僕奉茶夜';
          specialTag = '桌邊手沖';
          note = '由體貼侍從璐可為主人奉上初春雪山高山茶，主廚冬瓜備妥手作鹹甜點心。';
        } else if (weekIndex === 2) {
          // Second Friday
          dutyStaffIds = ['luko', 'kurikuri', 'laiko'];
          themeTitle = '【雙星相映】女僕雙倍侍奉夜';
          specialTag = '雙女僕在席';
          note = '璐可與小公主栗栗皆辛苦聯袂在席，提供最熱絡的桌邊陪伴與拍立得合影。';
        } else if (weekIndex === 3) {
          // Third Friday
          dutyStaffIds = ['luko', 'laiko', 'donggua'];
          themeTitle = '【星夜茶香】店長萊可手沖茶室';
          specialTag = '手沖茶沙龍';
          note = '由店長萊可親自解說艾歐澤亞草本茶道與舒心茶藝。';
        } else {
          // Fourth or Fifth Friday
          dutyStaffIds = ['kurikuri', 'luko', 'donggua'];
          themeTitle = '【月光柔波】靜謐傾聽沙龍';
          specialTag = '心事傾聽';
          note = '微弱燭光與舒緩豎琴樂聲，適合想卸下一週冒險疲憊、安靜放空的主人。';
        }
      } else if (isSaturday) {
        if (weekIndex === 1) {
          // First Saturday
          dutyStaffIds = ['luko', 'kurikuri', 'laiko', 'donggua'];
          themeTitle = '【星光盛典】全體女僕迎接夜';
          specialTag = '全員出勤';
          note = '全體女僕全員到齊，歡聚大廳，熱烈歡迎每位歸來的主人！';
        } else if (weekIndex === 2) {
          // Second Saturday: Meteor shower theme event
          dutyStaffIds = ['luko', 'kurikuri', 'laiko', 'donggua'];
          themeTitle = '【星月奇譚】流星雨特調觀星茶會';
          specialTag = '特別活動企劃';
          note = '全體女僕換上星宿主題正裝侍奉，招待入席主人流星限定特調「落入凡塵的淚光」。';
        } else if (weekIndex === 3) {
          // Third Saturday
          dutyStaffIds = ['kurikuri', 'luko', 'laiko'];
          themeTitle = '【萌力魔法】蛋包飯手繪甜點夜';
          specialTag = '桌邊手繪咒語';
          note = '女僕璐可與栗栗親自桌邊用番茄醬繪製專屬幸運符號與注入元氣魔法咒語！';
        } else {
          // Fourth or Fifth Saturday
          dutyStaffIds = ['luko', 'kurikuri', 'laiko', 'donggua'];
          themeTitle = '【星夜微光】週末忘憂歡聚夜';
          specialTag = '全員出勤';
          note = '週末深夜狂歡！點心特調無限續香草茶，侍從陪伴暢聊冒險軼事。';
        }
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
      themeTitle,
      specialTag,
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
