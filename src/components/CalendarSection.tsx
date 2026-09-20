import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Heart,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
} from 'lucide-react';
import {
  getMonthSchedule,
  getStaffMembersByIds,
  findNearestOpenDay,
} from '../data/scheduleData';
import { StaffAvatar } from './StaffAvatars';
import { DutyScheduleDay, PageTab } from '../types';
import { playChime } from '../utils/audio';

interface CalendarSectionProps {
  id?: string;
  onSelectStaffForReservation?: (staffName: string, dateString?: string) => void;
  onNavigate?: (tab: PageTab) => void;
}

export function CalendarSection({
  id = 'schedule-calendar',
  onSelectStaffForReservation,
  onNavigate,
}: CalendarSectionProps) {
  // Use current date
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1); // 1-12

  // Generate schedule for current month
  const monthSchedule = useMemo(() => {
    return getMonthSchedule(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Only open days for the duty roster (每週五、週六開館日)
  const openDays = useMemo(() => {
    return monthSchedule.filter((d) => d.isOpen);
  }, [monthSchedule]);

  // Find default selected day: if today is open, use today; otherwise nearest open day
  const defaultSelectedDay = useMemo(() => {
    const isThisCurrentMonth =
      today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth;
    const targetDayNumber = isThisCurrentMonth ? today.getDate() : 1;
    const nearest = findNearestOpenDay(monthSchedule, targetDayNumber);
    return nearest || openDays[0] || monthSchedule[0];
  }, [currentYear, currentMonth, monthSchedule, today, openDays]);

  const [selectedDateString, setSelectedDateString] = useState<string>(
    defaultSelectedDay?.date || `${currentYear}-09-11`
  );

  // Keep selected date synced when month changes
  useEffect(() => {
    if (openDays.length > 0 && !openDays.some((d) => d.date === selectedDateString)) {
      setSelectedDateString(openDays[0].date);
    }
  }, [openDays, selectedDateString]);

  const activeDay = useMemo(() => {
    const found = openDays.find((d) => d.date === selectedDateString);
    if (found) return found;
    return openDays[0] || monthSchedule[0];
  }, [openDays, monthSchedule, selectedDateString]);

  const handlePrevMonth = () => {
    playChime(1.0);
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    playChime(1.0);
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    playChime(1.1);
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
    const todayPad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const todayStr = `${today.getFullYear()}-${todayPad(today.getMonth() + 1)}-${todayPad(
      today.getDate()
    )}`;
    setSelectedDateString(todayStr);
  };

  const handleSelectDay = (dayItem: DutyScheduleDay) => {
    playChime(1.15);
    setSelectedDateString(dayItem.date);
  };

  // Staff on duty for the selected active day (女僕與執事出勤名單)
  const staffOnDuty = useMemo(() => {
    if (!activeDay || !activeDay.isOpen) return [];
    return getStaffMembersByIds(activeDay.dutyStaffIds);
  }, [activeDay]);

  // Format date header nicely
  const formattedActiveDate = useMemo(() => {
    if (!activeDay) return '';
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[activeDay.dayOfWeek];
    return `${activeDay.year}年${activeDay.month}月${activeDay.day}日 (${weekday})`;
  }, [activeDay]);

  const handleReserveStaff = (staffName: string) => {
    if (onSelectStaffForReservation) {
      onSelectStaffForReservation(staffName, activeDay?.date);
    }
  };

  const handleGeneralReservation = () => {
    if (onSelectStaffForReservation) {
      onSelectStaffForReservation('不指名', activeDay?.date);
    }
  };

  return (
    <section
      id={id}
      className="relative pt-6 sm:pt-8 pb-14 sm:pb-18 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F5F8FA] via-[#FAFBFD] to-[#F0F5FA] text-[#2C3E50] overflow-hidden"
    >
      {/* Background Soft Starlight Accents */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-[#E2EFF9]/70 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-[#EAF2FB] rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#E8F1FC] rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* ========================================================= */}
        {/* SECTION HEADER: COMPACT & ELEGANT */}
        {/* ========================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#BBD7EE] shadow-2xs text-[#204970] text-xs font-bold tracking-wider uppercase mb-2 backdrop-blur-xs font-cinzel">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Staff Duty Schedule・侍從出勤班表</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider text-[#142C44] font-serif-tc text-stroke-white-title">
            侍從出勤班表
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-[#466584] leading-relaxed font-serif-tc font-medium">
            夜蒔館每週五、週六 晚間 <span className="font-bold text-[#1B3E63]">20:30 - 24:00</span> 開館。
            點選開館日期，即可查看當日值班侍從名冊與預約席位！
          </p>
        </div>

        {/* ========================================================= */}
        {/* MONTH SWITCHER & INFO BAR */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between gap-3 bg-white/90 backdrop-blur-md rounded-2xl border border-[#CBDDEB] px-3.5 sm:px-5 py-3 shadow-[0_4px_16px_rgba(20,50,85,0.06)] mb-6">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#F0F5FA] hover:bg-[#E2EDF7] text-[#244A72] border border-[#CBDDEB] transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold active:scale-95"
            title="上一個月"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">上個月</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3 text-center">
            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-[#2A527A]" />
            <h3 className="text-base sm:text-lg font-bold font-serif-tc text-[#15324E] tracking-wider">
              {currentYear} 年 {currentMonth} 月
            </h3>
            <span className="text-[11px] sm:text-xs font-bold text-[#204970] bg-[#E8F1F9] px-2.5 py-0.5 rounded-full border border-[#CBDDEB]">
              共 {openDays.length} 個開館日
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleResetToCurrentMonth}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#2A527A] bg-[#F0F5FA] hover:bg-[#E2EDF7] border border-[#CBDDEB] transition-colors cursor-pointer hidden sm:inline-block"
              title="回到本月"
            >
              回到本月
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#F0F5FA] hover:bg-[#E2EDF7] text-[#244A72] border border-[#CBDDEB] transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold active:scale-95"
              title="下一個月"
            >
              <span className="hidden sm:inline">下個月</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* DUTY SCHEDULE MAIN CONTAINER (NO CALENDAR MATRIX) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ======================================================= */}
          {/* LEFT 5 COLS: OPEN DAYS LIST (開館日清單) */}
          {/* ======================================================= */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-xs font-bold text-[#2C4E72] uppercase tracking-wider font-cinzel">
                Open Dates・開館日列表
              </span>
              <span className="text-[11px] text-[#55789B]">
                點選切換查看當值名冊
              </span>
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
              {openDays.map((dayItem) => {
                const isSelected = activeDay?.date === dayItem.date;
                const isToday =
                  today.getFullYear() === currentYear &&
                  today.getMonth() + 1 === currentMonth &&
                  today.getDate() === dayItem.day;
                const dayStaff = getStaffMembersByIds(dayItem.dutyStaffIds);
                const weekdayText = dayItem.dayOfWeek === 5 ? '週五' : '週六';

                return (
                  <button
                    key={dayItem.date}
                    type="button"
                    onClick={() => handleSelectDay(dayItem)}
                    className={`w-full p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-r from-white via-[#F3F8FD] to-[#E9F3FC] border-[#244A72] ring-2 ring-[#244A72]/20 shadow-[0_4px_16px_rgba(35,70,107,0.14)] translate-x-1'
                        : 'bg-white/80 hover:bg-white border-[#CBDDEB] hover:border-[#86B4DC] shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-base font-bold font-serif-tc ${
                          isSelected ? 'text-[#122F4C]' : 'text-[#204060]'
                        }`}>
                          {dayItem.month}月{dayItem.day}日 ({weekdayText})
                        </span>

                        {isToday && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-500 text-white leading-tight">
                            今日
                          </span>
                        )}

                        <span className="text-[11px] font-medium text-[#41688E] bg-[#EAF2F9] px-2 py-0.5 rounded-md">
                          常規開館夜
                        </span>
                      </div>

                      {/* Regular duty staff preview */}
                      <div className="flex items-center gap-1 mt-2">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {dayStaff.map((s) => (
                            <div
                              key={s.id}
                              className="inline-block w-6 h-6 rounded-full ring-1.5 ring-white overflow-hidden shadow-2xs bg-white"
                              title={s.name}
                            >
                              <StaffAvatar
                                seed={s.avatarSeed}
                                avatarUrl={s.photoUrl}
                                size="sm"
                                className="w-full h-full"
                              />
                            </div>
                          ))}
                        </div>
                        <span className="text-[11px] text-[#55789B] ml-1 font-medium">
                          {dayStaff.map((s) => s.name).join('、')}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-[#244A72] text-white flex items-center justify-center shadow-2xs">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <ArrowRight className="w-4 h-4 text-[#89AECF]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================================================= */}
          {/* RIGHT 7 COLS: ACTIVE DAY DUTY ROSTER DETAILS */}
          {/* ======================================================= */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDay?.date}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#CBDDEB] shadow-[0_12px_40px_rgba(20,50,85,0.1)] p-5 sm:p-6 text-left"
              >
                {/* Header of Active Selected Date */}
                <div className="pb-3.5 border-b border-[#E6EFF6]">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    {/* Status Pill */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>本日開館營業</span>
                    </span>

                    <span className="text-xs font-semibold text-[#3B628A] bg-[#EBF3FA] px-3 py-0.5 rounded-full border border-[#C5DBEE]">
                      常規開館夜
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[#15324E] font-serif-tc">
                    {formattedActiveDate}
                  </h3>

                  {/* Operating hours chip */}
                  <div className="flex items-center gap-2 mt-2 text-xs font-bold text-[#2C5077]">
                    <Clock className="w-4 h-4 text-[#356391] shrink-0" />
                    <span>營業時間：</span>
                    <span className="px-2 py-0.5 rounded bg-[#EAF2F9] text-[#1B3F66] font-mono font-bold">
                      {activeDay?.businessHours || '20:30 - 24:00 (GMT+8)'}
                    </span>
                  </div>

                  {activeDay?.note && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-[#EAF3FA] to-[#F4F9FD] border border-[#C5DCF0] text-xs">
                      <p className="text-[#3A5D80] leading-relaxed">{activeDay.note}</p>
                    </div>
                  )}
                </div>

                {/* SHOW STAFF ON DUTY (MAIDS & BUTLERS) */}
                <div className="pt-3.5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                        <h4 className="text-sm sm:text-base font-bold text-[#15324E] font-serif-tc">
                          當日值班侍從
                        </h4>
                      </div>
                      {onNavigate && (
                        <button
                          type="button"
                          onClick={() => onNavigate('staff')}
                          className="text-xs font-bold text-[#234568] hover:text-[#122A42] bg-[#E8F1F9] hover:bg-[#D8E8F5] px-2.5 py-0.5 rounded-full border border-[#CBDDEB] transition-all cursor-pointer flex items-center gap-1 shadow-2xs group"
                          title="查看侍從名冊"
                        >
                          <span>查看名冊</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>

                    {staffOnDuty.length > 0 ? (
                      <div className="space-y-2.5">
                        {staffOnDuty.map((staff) => (
                          <div
                            key={staff.id}
                            className="group relative p-3 rounded-2xl bg-gradient-to-br from-white to-[#F8FAFC] border border-[#CBDDEB] shadow-2xs hover:border-[#86B4DC] hover:shadow-xs transition-all flex items-center justify-between gap-3"
                          >
                            {/* Left: Staff Avatar & Basic Info */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-12 h-12 rounded-full border-2 shadow-2xs overflow-hidden shrink-0 bg-white ring-2 ring-white ${
                                staff.role === 'butler' ? 'border-slate-300' : 'border-pink-200'
                              }`}>
                                <StaffAvatar
                                  seed={staff.avatarSeed}
                                  avatarUrl={staff.photoUrl}
                                  size="md"
                                  className="w-full h-full"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h5 className="text-base font-bold text-[#142F4B] font-serif-tc">
                                    {staff.name}
                                  </h5>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold border ${
                                    staff.role === 'butler'
                                      ? 'bg-slate-100 text-slate-800 border-slate-300'
                                      : 'bg-pink-100 text-pink-800 border-pink-200'
                                  }`}>
                                    {staff.role === 'butler' ? '執事 Butler' : '女僕 Maid'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Quick Reserve button for this specific Staff */}
                            <div className="shrink-0 flex items-center">
                              <button
                                type="button"
                                onClick={() => handleReserveStaff(staff.name)}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#21456A] to-[#34628E] hover:from-[#163350] hover:to-[#254A6F] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                                title={`指名 ${staff.name} 預約此日席位`}
                              >
                                <span>指名預約</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                        本日侍從輪休中，敬請留意其他開館日。
                      </p>
                    )}
                  </div>

                  {/* GENERAL RESERVATION CTA */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleGeneralReservation}
                      className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#21456A] via-[#2F5A85] to-[#21456A] hover:from-[#183654] hover:to-[#22486E] text-white text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(35,70,107,0.28)] transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <CalendarDays className="w-4 h-4 text-amber-300" />
                      <span>預約此日席位 ({activeDay.date})</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
