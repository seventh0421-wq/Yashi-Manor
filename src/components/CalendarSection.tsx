import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  Coffee,
  ArrowRight,
  Info,
  CalendarDays,
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

  // Find default selected day: if today is in this month, use today; otherwise nearest open day
  const defaultSelectedDay = useMemo(() => {
    const isThisCurrentMonth =
      today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth;
    const targetDayNumber = isThisCurrentMonth ? today.getDate() : 1;
    const nearest = findNearestOpenDay(monthSchedule, targetDayNumber);
    return nearest || monthSchedule[0];
  }, [currentYear, currentMonth, monthSchedule, today]);

  const [selectedDateString, setSelectedDateString] = useState<string>(
    defaultSelectedDay?.date || `${currentYear}-09-11`
  );

  // When month changes, if current selectedDateString is not in this month, reset to first open day
  const activeDay = useMemo(() => {
    const found = monthSchedule.find((d) => d.date === selectedDateString);
    if (found) return found;
    return defaultSelectedDay || monthSchedule[0];
  }, [monthSchedule, selectedDateString, defaultSelectedDay]);

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

  // Calculate calendar grid padding (days from previous month and days for next month)
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const prevMonthDaysCount = new Date(currentYear, currentMonth - 1, 0).getDate();

  // Preceding placeholder days
  const leadingDays = Array.from({ length: firstDayOfWeek }, (_, i) => {
    return prevMonthDaysCount - firstDayOfWeek + 1 + i;
  });

  // Trailing placeholder days to complete rows of 7
  const totalCells = firstDayOfWeek + daysInMonth;
  const trailingDaysCount = (7 - (totalCells % 7)) % 7;
  const trailingDays = Array.from({ length: trailingDaysCount }, (_, i) => i + 1);

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

  const weekdaysList = [
    { label: '日', full: '週日', isWeekend: true },
    { label: '一', full: '週一', isWeekend: false },
    { label: '二', full: '週二', isWeekend: false },
    { label: '三', full: '週三', isWeekend: false },
    { label: '四', full: '週四', isWeekend: false },
    { label: '五', full: '週五', isWeekend: false, isOpenRegular: true },
    { label: '六', full: '週六', isWeekend: true, isOpenRegular: true },
  ];

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
        {/* SECTION HEADER: COMPACT & TIED CLOSELY TO EVENT INFO */}
        {/* ========================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#BBD7EE] shadow-2xs text-[#204970] text-xs font-bold tracking-wider uppercase mb-2 backdrop-blur-xs font-cinzel">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Monthly Hours & Staff Schedule</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider text-[#142C44] font-serif-tc text-stroke-white-title">
            本月營業時間與出勤班表
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-[#466584] leading-relaxed font-serif-tc font-medium">
            夜蒔館每週五、週六 晚間 <span className="font-bold text-[#1B3E63]">20:30 - 24:00</span> 開館。
            點選月曆日期，即可查看當日出勤女僕名單！
          </p>

          {/* Quick Legend Tags: Simple Open / Closed */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>營業日 (每週五、週六)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>休館日 (週日～週四)</span>
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN CALENDAR & DUTY PANEL CONTAINER */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* ======================================================= */}
          {/* LEFT 7 COLS: MONTHLY CALENDAR GRID (CLEAN: ONLY OPEN/CLOSED) */}
          {/* ======================================================= */}
          <div className="lg:col-span-7 bg-white/90 backdrop-blur-md rounded-3xl border border-[#CBDDEB] shadow-[0_10px_35px_rgba(20,50,85,0.08)] p-4 sm:p-6">
            {/* Month Navigator Header */}
            <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-[#E6EFF6]">
              {/* Prev Month Button */}
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 sm:p-2.5 rounded-xl bg-[#F0F5FA] hover:bg-[#E2EDF7] text-[#244A72] border border-[#CBDDEB] transition-colors cursor-pointer active:scale-95"
                title="上一個月"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Month Title Display */}
              <div className="flex items-center gap-2 sm:gap-3 text-center">
                <CalendarIcon className="w-5 h-5 text-[#2A527A]" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-serif-tc text-[#15324E] tracking-wider">
                    {currentYear} 年 {currentMonth} 月
                  </h3>
                  <p className="text-[10px] font-cinzel font-semibold text-[#5B7F9F] tracking-widest uppercase">
                    {new Date(currentYear, currentMonth - 1, 1).toLocaleDateString('en-US', {
                      month: 'long',
                    })}
                  </p>
                </div>
              </div>

              {/* Next Month & Reset Buttons */}
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
                  className="p-2 sm:p-2.5 rounded-xl bg-[#F0F5FA] hover:bg-[#E2EDF7] text-[#244A72] border border-[#CBDDEB] transition-colors cursor-pointer active:scale-95"
                  title="下一個月"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Weekdays Header Row */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center mb-2">
              {weekdaysList.map((wd, i) => (
                <div
                  key={i}
                  className={`py-1.5 sm:py-2 rounded-lg text-xs font-bold font-serif-tc tracking-wider ${
                    wd.isOpenRegular
                      ? 'bg-[#E3EFF9] text-[#133A5E] font-black border border-[#BFD9EE]'
                      : 'text-[#6C8DAE]'
                  }`}
                >
                  <span>{wd.label}</span>
                  {wd.isOpenRegular && (
                    <span className="block text-[9px] font-sans font-bold text-[#225785] scale-90">
                      開館
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Calendar Grid Days - ONLY SHOW OPEN / CLOSED */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {/* Previous month trailing padding days */}
              {leadingDays.map((prevDay, i) => (
                <div
                  key={`leading-${i}`}
                  className="min-h-[52px] sm:min-h-[62px] p-1.5 rounded-xl bg-slate-50/40 border border-slate-100 text-slate-300 text-xs flex flex-col justify-between opacity-50 select-none"
                >
                  <span className="font-semibold">{prevDay}</span>
                </div>
              ))}

              {/* Current Month Days: Clean Open/Closed only */}
              {monthSchedule.map((dayItem) => {
                const isSelected = activeDay?.date === dayItem.date;
                const isToday =
                  today.getFullYear() === currentYear &&
                  today.getMonth() + 1 === currentMonth &&
                  today.getDate() === dayItem.day;

                return (
                  <button
                    key={dayItem.date}
                    type="button"
                    onClick={() => handleSelectDay(dayItem)}
                    className={`group relative min-h-[52px] sm:min-h-[62px] p-1.5 rounded-xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
                      isSelected
                        ? 'ring-2 sm:ring-3 ring-[#23466B] bg-white shadow-[0_4px_14px_rgba(35,70,107,0.22)] border-[#23466B] z-20 scale-[1.03]'
                        : dayItem.isOpen
                        ? 'bg-gradient-to-br from-white via-[#F5FAFF] to-[#E9F3FC] hover:bg-white border-[#BBD7EE] shadow-2xs hover:border-[#7AAED6]'
                        : 'bg-slate-50/70 hover:bg-white border-slate-200/60 text-slate-400'
                    }`}
                  >
                    {/* Top Row: Day Number & Today indicator */}
                    <div className="flex items-start justify-between gap-1 w-full">
                      <span
                        className={`text-xs sm:text-sm font-bold leading-none ${
                          isSelected
                            ? 'text-[#183654] font-black'
                            : dayItem.isOpen
                            ? 'text-[#18385A]'
                            : 'text-slate-400'
                        }`}
                      >
                        {dayItem.day}
                      </span>

                      {/* Today Badge */}
                      {isToday && (
                        <span className="px-1 py-0.2 text-[8px] sm:text-[9px] font-bold rounded bg-amber-500 text-white leading-tight">
                          今日
                        </span>
                      )}
                    </div>

                    {/* Middle: ONLY Open or Closed Status Pill */}
                    <div className="my-0.5">
                      {dayItem.isOpen ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>營業</span>
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-400 bg-slate-100/80">
                          休館
                        </span>
                      )}
                    </div>

                    {/* Bottom active line */}
                    <div className="w-full">
                      {isSelected && (
                        <div className="h-0.5 w-full bg-[#23466B] rounded-full" />
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Next month leading padding days */}
              {trailingDays.map((nextDay, i) => (
                <div
                  key={`trailing-${i}`}
                  className="min-h-[52px] sm:min-h-[62px] p-1.5 rounded-xl bg-slate-50/40 border border-slate-100 text-slate-300 text-xs flex flex-col justify-between opacity-50 select-none"
                >
                  <span className="font-semibold">{nextDay}</span>
                </div>
              ))}
            </div>

            {/* Calendar Footer Tip */}
            <div className="mt-3 pt-2.5 border-t border-[#EDF3F8] flex items-center justify-between text-xs text-[#527394]">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#305C88]" />
                <span>點擊任一日期，即可在右側查看當值女僕名單</span>
              </div>
              <span className="text-[11px] font-bold text-[#23466B]">
                當前選取：{activeDay?.month}月{activeDay?.day}日 ({activeDay?.isOpen ? '營業' : '休館'})
              </span>
            </div>
          </div>

          {/* ======================================================= */}
          {/* RIGHT 5 COLS: SELECTED DAY DETAILS & MAIDS ON DUTY ONLY */}
          {/* ======================================================= */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
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
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold tracking-wide ${
                        activeDay?.isOpen
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          activeDay?.isOpen ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      <span>{activeDay?.isOpen ? '本日開館營業' : '本日休館整備'}</span>
                    </span>

                    {activeDay?.specialTag && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <span>{activeDay.specialTag}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[#15324E] font-serif-tc">
                    {formattedActiveDate}
                  </h3>

                  {/* Operating hours chip */}
                  <div className="flex items-center gap-2 mt-2 text-xs font-bold text-[#2C5077]">
                    <Clock className="w-4 h-4 text-[#356391] shrink-0" />
                    <span>營業時間：</span>
                    <span className="px-2 py-0.5 rounded bg-[#EAF2F9] text-[#1B3F66] font-mono font-bold">
                      {activeDay?.businessHours}
                    </span>
                  </div>

                  {activeDay?.themeTitle && (
                    <div className="mt-2.5 p-2 rounded-xl bg-gradient-to-r from-[#EAF3FA] to-[#F4F9FD] border border-[#C5DCF0] text-xs">
                      <span className="font-bold text-[#18395C] block">
                        ✦ {activeDay.themeTitle}
                      </span>
                      {activeDay.note && (
                        <p className="text-[#4E7092] mt-0.5 leading-relaxed">{activeDay.note}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* =================================================== */}
                {/* CASE 1: OPEN DAY - SHOW STAFF ON DUTY (MAIDS & BUTLERS) */}
                {/* =================================================== */}
                {activeDay?.isOpen ? (
                  <div className="pt-3.5 space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                          <h4 className="text-sm sm:text-base font-bold text-[#15324E] font-serif-tc">
                            當日值班女僕
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
                ) : (
                  /* =================================================== */
                  /* CASE 2: CLOSED DAY - EXPLAIN & OFFER NEAREST OPEN DAY */
                  /* =================================================== */
                  <div className="pt-4 space-y-3.5">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-[#527290] leading-relaxed space-y-2">
                      <div className="flex items-center gap-2 font-bold text-[#1C3A5A]">
                        <Coffee className="w-4 h-4 text-amber-600" />
                        <span>休館研習與茶葉備料日</span>
                      </div>
                      <p>
                        本日為夜蒔館休館整備日，女僕與執事們正在黑衣森林採集香草葉與研習新調飲。
                      </p>
                      <p className="font-medium text-[#2A4C70]">
                        ✦ 夜蒔館常態營業時間為每週五、週六 晚間 20:30 - 24:00。
                      </p>
                    </div>

                    {/* Button to quickly jump to the next nearest open day */}
                    <button
                      type="button"
                      onClick={() => {
                        const nearest = findNearestOpenDay(monthSchedule, activeDay?.day || 1);
                        if (nearest) {
                          handleSelectDay(nearest);
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#23466B] hover:bg-[#183654] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>查看鄰近週五/週六開館日</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
