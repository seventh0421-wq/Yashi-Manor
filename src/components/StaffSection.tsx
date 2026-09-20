import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  HeartHandshake,
  Quote,
  ExternalLink,
} from 'lucide-react';
import { STAFF_MEMBERS } from '../data/cafeData';
import { StaffPortrait } from './StaffPortrait';
import { StaffRibbonBackground } from './StaffRibbonBackground';
import { StaffArcMenu } from './StaffArcMenu';
import { playChime, playMagicSpell } from '../utils/audio';
import { triggerTopProgress } from '../utils/progress';

interface StaffSectionProps {
  onSelectStaffForReservation?: (staffName: string) => void;
  onBack?: () => void;
}

export function StaffSection({ onSelectStaffForReservation, onBack }: StaffSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [confirmedNotice, setConfirmedNotice] = useState(false);

  const currentStaff = STAFF_MEMBERS[selectedIndex] || STAFF_MEMBERS[0];

  const handleSelectStaff = (targetIndex: number) => {
    if (targetIndex === selectedIndex) return;
    triggerTopProgress();
    playChime(1.1);
    setSelectedIndex(targetIndex);
  };

  const handleConfirm = () => {
    playMagicSpell();
    setConfirmedNotice(true);
    if (onSelectStaffForReservation) {
      onSelectStaffForReservation(currentStaff.name);
    }
    setTimeout(() => setConfirmedNotice(false), 2500);
  };

  return (
    <motion.section
      id="staff-section"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative min-h-[calc(100vh-60px)] pt-14 sm:pt-16 pb-8 lg:pb-0 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#EAF3FA] via-[#F4F9FD] to-[#DFEDF7] overflow-hidden flex flex-col justify-end"
    >
      {/* Seamless Ribbon Bow Trellis Wallpaper Background with Staff Cheer Color */}
      <StaffRibbonBackground
        cheerColor={currentStaff.themeColor}
        staffName={currentStaff.name}
      />

      {/* Background Soft Ambient Light & Star Accents */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-20 left-1/4 w-[500px] h-[350px] bg-gradient-to-b from-[#CDE2F4]/60 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[350px] bg-gradient-to-t from-[#D6E8F7]/60 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute top-36 right-16 w-2 h-2 bg-[#77A4CD] rounded-full animate-ping opacity-50" />
        <div className="absolute bottom-28 left-20 w-1.5 h-1.5 bg-[#8DB5DB] rounded-full animate-pulse opacity-60" />
      </div>

      <div className="relative z-10 max-w-[1560px] mx-auto w-full flex-1 flex flex-col justify-center px-1 sm:px-4 lg:px-6">
        {/* ========================================================= */}
        {/* THREE-COLUMN LAYOUT: LEFT ARC MENU | CENTER PORTRAIT | RIGHT INFO */}
        {/* ========================================================= */}
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 lg:gap-4 xl:gap-8 w-full my-auto py-1">
          {/* ========================================================= */}
          {/* LEFT: 7-NODE CRESCENT ARC STAFF MENU (圓弧造型左側侍從選單) */}
          {/* ========================================================= */}
          <div className="w-full lg:w-[280px] xl:w-[310px] shrink-0 order-1 lg:self-center flex justify-center lg:justify-start">
            <StaffArcMenu
              selectedIndex={selectedIndex}
              onSelectStaff={handleSelectStaff}
            />
          </div>

          {/* ========================================================= */}
          {/* CENTER: CURRENT STAFF PORTRAIT (CENTERED 店員照片置中) */}
          {/* ========================================================= */}
          <div className="w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[500px] xl:max-w-[560px] flex-1 shrink-0 flex justify-center items-center order-2 lg:self-center">
            <div className="w-full flex justify-center items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStaff.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-full flex justify-center items-center"
                >
                  <StaffPortrait staff={currentStaff} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: STREAMLINED INFO PANEL (店員介紹靠右，名稱放更大在上方) */}
          {/* ========================================================= */}
          <div className="w-full max-w-[440px] lg:w-[340px] xl:w-[380px] shrink-0 flex flex-col justify-center space-y-4 text-left order-3 lg:self-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStaff.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-4"
              >
                {/* 0. 店員名稱 (呈現在介紹上方) */}
                <div className="space-y-1">
                  <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
                    <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-wider font-cinzel text-stroke-white-title">
                      {currentStaff.name}
                    </h3>
                    {/* Glowing Status Badge next to Staff Name */}
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide border shadow-2xs backdrop-blur-xs"
                      style={{
                        backgroundColor:
                          currentStaff.shiftStatus === 'available'
                            ? 'rgba(236, 253, 245, 0.92)'
                            : 'rgba(241, 245, 249, 0.92)',
                        borderColor:
                          currentStaff.shiftStatus === 'available'
                            ? 'rgba(110, 231, 183, 0.8)'
                            : 'rgba(203, 213, 225, 0.8)',
                        color:
                          currentStaff.shiftStatus === 'available' ? '#065F46' : '#475569',
                      }}
                    >
                      <span className="relative flex h-2 w-2">
                        {currentStaff.shiftStatus === 'available' && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                        )}
                        <span
                          className={`relative inline-flex rounded-full h-2 w-2 ${
                            currentStaff.shiftStatus === 'available'
                              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]'
                              : 'bg-slate-400 shadow-[0_0_4px_rgba(148,163,184,0.6)]'
                          }`}
                        />
                      </span>
                      <span className="text-[11px] font-sans">
                        {currentStaff.shiftStatus === 'available'
                          ? '值班中・Available'
                          : '忙碌中・Busy'}
                      </span>
                    </div>

                    {currentStaff.jpName && (
                      <span className="text-sm sm:text-base lg:text-lg font-bold tracking-widest text-[#244A72] uppercase font-sans text-stroke-white">
                        {currentStaff.jpName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap pt-0.5">
                    {/* Threads Handle Link */}
                    <a
                      href={currentStaff.threadsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#204970] font-bold hover:text-[#0C243E] transition-colors underline-offset-2 hover:underline text-stroke-white"
                    >
                      <span>{currentStaff.threadsHandle}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>

                    {/* Staff Cheer Color Badge */}
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/85 border border-[#C5D8E8] text-[11px] font-bold text-[#1E4366] shadow-2xs backdrop-blur-xs"
                      title={`${currentStaff.name} 的專屬應援色：${currentStaff.themeColor}`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/15 shadow-2xs shrink-0"
                        style={{ backgroundColor: currentStaff.themeColor }}
                      />
                      <span>應援色 {currentStaff.themeColor}</span>
                    </div>

                    {/* Staff Role Tag (女僕 / 執事) */}
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1E3B5C]/10 border border-[#1E3B5C]/20 text-[11px] font-bold text-[#1E3B5C] shadow-2xs backdrop-blur-xs">
                      <span>{currentStaff.role === 'butler' ? '執事・Butler' : '女僕・Maid'}</span>
                    </div>
                  </div>
                </div>

                {/* 1. 店員介紹 */}
                <div id="status-strip-intro" className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2 pb-1 border-b border-[#3A6B94]/30">
                    <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#1B4269]" />
                    <h4 className="text-stroke-white-title font-bold text-lg sm:text-xl tracking-wider">
                      店員介紹
                    </h4>
                    <span className="text-xs tracking-widest text-[#224A73] font-bold text-stroke-white uppercase ml-1">
                      PROFILE
                    </span>
                  </div>
                  <p className="text-stroke-white text-base sm:text-lg leading-relaxed font-serif-tc font-bold">
                    {currentStaff.intro}
                  </p>
                </div>

                {/* 1.5 店員推薦 (RECOMMENDATION) */}
                {currentStaff.recommendedDish && (
                  <div
                    id="status-strip-recommendation"
                    className="space-y-1.5 p-3 sm:p-3.5 rounded-xl bg-white/75 border border-[#B8D5ED] shadow-2xs backdrop-blur-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#1A3D63] font-serif-tc">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{currentStaff.name}推薦｜{currentStaff.recommendedDish}</span>
                      </div>
                      <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#20456B] text-white">
                        RECOMMEND
                      </span>
                    </div>
                    {currentStaff.recommendationQuote && (
                      <p className="text-sm sm:text-base italic text-[#234568] font-semibold pl-2.5 border-l-2 border-amber-400 leading-relaxed font-serif-tc">
                        {currentStaff.recommendationQuote}
                      </p>
                    )}
                    {currentStaff.recommendationNote && (
                      <p className="text-xs sm:text-sm text-[#4A6E91] pl-2.5 font-medium">
                        {currentStaff.recommendationNote}
                      </p>
                    )}
                  </div>
                )}

                {/* 2. 服務項目 */}
                <div id="status-strip-services" className="space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-[#3A6B94]/30">
                    <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5 text-[#1B4269]" />
                    <h4 className="text-stroke-white-title font-bold text-lg sm:text-xl tracking-wider">
                      服務項目
                    </h4>
                    <span className="text-xs tracking-widest text-[#224A73] font-bold text-stroke-white uppercase ml-1">
                      RP SERVICES
                    </span>
                  </div>
                  <ul className="flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-2 text-sm sm:text-base">
                    {currentStaff.services.map((srv, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-1.5 text-stroke-white font-bold"
                      >
                        <span className="text-[#1E4870] text-sm">✦</span>
                        <span>{srv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. 店員語錄 */}
                <div id="status-strip-quote" className="space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-[#3A6B94]/30">
                    <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-[#1B4269]" />
                    <h4 className="text-stroke-white-title font-bold text-lg sm:text-xl tracking-wider">
                      店員語錄
                    </h4>
                  </div>
                  <div className="relative pl-3.5 border-l-2 border-[#244F78] italic text-stroke-white text-base sm:text-lg font-serif-tc font-bold leading-relaxed">
                    {currentStaff.quote}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ACTION BUTTONS (CONFIRM & BACK) */}
            <div className="pt-2 flex items-center justify-end gap-3 sm:gap-4">
              {/* BACK BUTTON */}
              <button
                id="staff-back-button"
                onClick={onBack}
                className="group px-6 py-2 rounded-full bg-white/70 hover:bg-white text-[#22466B] border-2 border-[#3A6B94] hover:border-[#1E4368] text-xs sm:text-sm font-bold tracking-wider transition-all duration-300 shadow-2xs cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 text-[#2C5A85] group-hover:-translate-x-1 transition-transform" />
                <span>BACK</span>
              </button>

              {/* CONFIRM BUTTON */}
              <button
                id="staff-confirm-button"
                onClick={handleConfirm}
                className="group px-7 py-2 rounded-full bg-gradient-to-r from-[#21456A] to-[#366795] hover:from-[#183452] hover:to-[#285177] text-white text-xs sm:text-sm font-bold tracking-wider transition-all duration-300 border-2 border-white hover:shadow-[0_0_22px_rgba(54,103,149,0.7)] hover:scale-[1.03] active:scale-[0.98] cursor-pointer flex items-center gap-2 shadow-xs"
                title="確認指名並前往預約頁面"
              >
                <span>CONFIRM 預約侍從</span>
                <ArrowRight className="w-4 h-4 text-[#C1DEF5] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Confirmation Alert */}
            {confirmedNotice && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-right text-xs font-bold text-[#193F66] text-stroke-white"
              >
                ✓ 已確認指名 {currentStaff.name}，正在為您開啟預約登記頁面！
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
