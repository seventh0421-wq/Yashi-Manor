import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  HeartHandshake,
  Quote,
  Check,
  ExternalLink,
  Coffee,
  Clock,
  Shield,
  ChevronLeft,
  ChevronRight,
  RotateCw
} from 'lucide-react';
import { STAFF_MEMBERS } from '../data/cafeData';
import { StaffMember } from '../types';
import { StaffAvatar } from './StaffAvatars';
import { StaffPortrait } from './StaffPortrait';
import { StaffRibbonBackground } from './StaffRibbonBackground';
import { playChime, playMagicSpell } from '../utils/audio';
import { triggerTopProgress } from '../utils/progress';

interface StaffSectionProps {
  onSelectStaffForReservation?: (staffName: string) => void;
  onBack?: () => void;
}

export function StaffSection({ onSelectStaffForReservation, onBack }: StaffSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rotationDirection, setRotationDirection] = useState<'forward' | 'backward'>('forward');
  const [confirmedNotice, setConfirmedNotice] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentStaff = STAFF_MEMBERS[selectedIndex] || STAFF_MEMBERS[0];

  const handleSelectStaff = (targetIndex: number) => {
    if (targetIndex === selectedIndex) return;
    triggerTopProgress();
    const count = STAFF_MEMBERS.length;
    // Calculate shortest circular step on count-item ring
    let step = (targetIndex - selectedIndex) % count;
    if (step > Math.floor(count / 2)) step -= count;
    if (step < -Math.floor((count - 1) / 2)) step += count;

    const dir = step > 0 ? 'forward' : 'backward';
    setRotationDirection(dir);
    playChime(1.1);
    setSelectedIndex(targetIndex);
  };

  const handlePrevStaff = () => {
    const nextIdx = (selectedIndex - 1 + STAFF_MEMBERS.length) % STAFF_MEMBERS.length;
    handleSelectStaff(nextIdx);
  };

  const handleNextStaff = () => {
    const nextIdx = (selectedIndex + 1) % STAFF_MEMBERS.length;
    handleSelectStaff(nextIdx);
  };

  const handleConfirm = () => {
    playMagicSpell();
    setConfirmedNotice(true);
    if (onSelectStaffForReservation) {
      onSelectStaffForReservation(currentStaff.name);
    }
    setTimeout(() => setConfirmedNotice(false), 2500);
  };

  const getStaffPosition = (staffIdx: number) => {
    // Relative difference from selectedIndex on circular loop
    const count = STAFF_MEMBERS.length;
    let diff = (staffIdx - selectedIndex) % count;
    if (diff < 0) diff += count;

    let slot = 0;
    if (diff === 0) {
      slot = 0; // CENTER APEX (The selected person!)
    } else if (count === 4 && diff === 2) {
      // 4-item ring: place opposite based on rotation direction
      slot = rotationDirection === 'backward' ? -2 : 2;
    } else if (diff <= Math.floor(count / 2)) {
      slot = diff; // 1, 2
    } else {
      slot = diff - count; // -2, -1
    }

    let x = 0;
    let y = 0;

    if (isMobile) {
      switch (slot) {
        case 0:
          x = 0;
          y = 0;
          break;
        case 1:
          x = 108;
          y = 16;
          break;
        case -1:
          x = -108;
          y = 16;
          break;
        case 2:
          x = 188;
          y = 44;
          break;
        case -2:
          x = -188;
          y = 44;
          break;
      }
    } else if (isTablet) {
      switch (slot) {
        case 0:
          x = 0;
          y = 0;
          break;
        case 1:
          x = 185;
          y = 22;
          break;
        case -1:
          x = -185;
          y = 22;
          break;
        case 2:
          x = 320;
          y = 62;
          break;
        case -2:
          x = -320;
          y = 62;
          break;
      }
    } else {
      switch (slot) {
        case 0:
          x = 0;
          y = 0;
          break;
        case 1:
          x = 230;
          y = 22;
          break;
        case -1:
          x = -230;
          y = 22;
          break;
        case 2:
          x = 390;
          y = 66;
          break;
        case -2:
          x = -390;
          y = 66;
          break;
      }
    }

    const isSelected = slot === 0;
    const isAdjacent = Math.abs(slot) === 1;
    const scale = isSelected ? (isMobile ? 1.12 : 1.2) : (isAdjacent ? (isMobile ? 0.88 : 0.94) : (isMobile ? 0.72 : 0.8));
    const opacity = isSelected ? 1.0 : (isAdjacent ? 0.88 : 0.65);
    const zIndex = isSelected ? 30 : (isAdjacent ? 20 : 10);

    return { x, y, scale, opacity, zIndex, slot, isSelected };
  };

  return (
    <motion.section
      id="staff-section"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative min-h-[calc(100vh-60px)] pt-16 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#EAF3FA] via-[#F4F9FD] to-[#DFEDF7] overflow-hidden"
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

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* UPPER MAIN AREA: CENTERED PORTRAIT & RIGHT INFO STRIPS */}
        <div className="relative flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-6 lg:gap-10 mb-4 lg:mb-6">
          {/* Left Spacer on wide screens to keep the photo in the visual center */}
          <div className="hidden xl:block xl:w-[380px] shrink-0 pointer-events-none select-none" />

          {/* ========================================================= */}
          {/* CENTER: CURRENT STAFF PORTRAIT (ENLARGED & CENTERED) */}
          {/* ========================================================= */}
          <div className="w-full max-w-[540px] sm:max-w-[620px] lg:max-w-[700px] xl:max-w-[760px] flex-1 shrink-0 flex justify-center items-center">
            <div className="w-full flex justify-center items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStaff.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-full flex justify-center items-center"
                >
                  <StaffPortrait staff={currentStaff} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: STREAMLINED INFO PANEL (店員介紹靠右，再精簡一點，名稱放更大在上方) */}
          {/* ========================================================= */}
          <div className="w-full max-w-[440px] lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col justify-center space-y-4 text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStaff.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-4"
              >
                {/* 0. 店員名稱 (放更大，呈現在介紹上方，稱號已刪除) */}
                <div className="space-y-1">
                  <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
                    <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-wider font-cinzel text-stroke-white-title">
                      {currentStaff.name}
                    </h3>
                    {/* Small Elegant Glowing Status Badge next to Staff Name */}
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide border shadow-2xs backdrop-blur-xs"
                      style={{
                        backgroundColor: currentStaff.shiftStatus === 'available' ? 'rgba(236, 253, 245, 0.92)' : 'rgba(241, 245, 249, 0.92)',
                        borderColor: currentStaff.shiftStatus === 'available' ? 'rgba(110, 231, 183, 0.8)' : 'rgba(203, 213, 225, 0.8)',
                        color: currentStaff.shiftStatus === 'available' ? '#065F46' : '#475569',
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
                        {currentStaff.shiftStatus === 'available' ? '值班中・Available' : '忙碌中・Busy'}
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

                {/* 1. 店員介紹 (精簡流暢) */}
                <div id="status-strip-intro" className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2 pb-1 border-b border-[#3A6B94]/30">
                    <UserCheck className="w-4 h-4 text-[#1B4269]" />
                    <h4 className="text-stroke-white-title font-bold text-base tracking-wider">
                      店員介紹
                    </h4>
                    <span className="text-[10px] tracking-widest text-[#224A73] font-bold text-stroke-white uppercase ml-1">
                      PROFILE
                    </span>
                  </div>
                  <p className="text-stroke-white text-xs sm:text-sm leading-relaxed font-serif-tc font-bold">
                    {currentStaff.intro}
                  </p>
                </div>

                {/* 1.5 店員推薦 (RECOMMENDATION) */}
                {currentStaff.recommendedDish && (
                  <div id="status-strip-recommendation" className="space-y-1 p-2.5 sm:p-3 rounded-xl bg-white/75 border border-[#B8D5ED] shadow-2xs backdrop-blur-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1A3D63] font-serif-tc">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{currentStaff.name}推薦｜{currentStaff.recommendedDish}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#20456B] text-white">
                        RECOMMEND
                      </span>
                    </div>
                    {currentStaff.recommendationQuote && (
                      <p className="text-xs italic text-[#234568] font-semibold pl-2 border-l-2 border-amber-400 leading-relaxed font-serif-tc">
                        {currentStaff.recommendationQuote}
                      </p>
                    )}
                    {currentStaff.recommendationNote && (
                      <p className="text-[11px] text-[#4A6E91] pl-2 font-medium">
                        {currentStaff.recommendationNote}
                      </p>
                    )}
                  </div>
                )}

                {/* 2. 服務項目 (精簡俐落) */}
                <div id="status-strip-services" className="space-y-1.5">
                  <div className="flex items-center gap-2 pb-1 border-b border-[#3A6B94]/30">
                    <HeartHandshake className="w-4 h-4 text-[#1B4269]" />
                    <h4 className="text-stroke-white-title font-bold text-base tracking-wider">
                      服務項目
                    </h4>
                    <span className="text-[10px] tracking-widest text-[#224A73] font-bold text-stroke-white uppercase ml-1">
                      RP SERVICES
                    </span>
                  </div>
                  <ul className="flex flex-wrap items-center gap-x-5 sm:gap-x-6 gap-y-1.5 text-xs sm:text-[13px]">
                    {currentStaff.services.map((srv, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-1.5 text-stroke-white font-bold"
                      >
                        <span className="text-[#1E4870] text-xs">✦</span>
                        <span>{srv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. 店員語錄 */}
                <div id="status-strip-quote" className="space-y-1.5">
                  <div className="flex items-center gap-2 pb-1 border-b border-[#3A6B94]/30">
                    <Quote className="w-4 h-4 text-[#1B4269]" />
                    <h4 className="text-stroke-white-title font-bold text-base tracking-wider">
                      店員語錄
                    </h4>
                  </div>
                  <div className="relative pl-3 border-l-2 border-[#244F78] italic text-stroke-white text-xs sm:text-sm font-serif-tc font-bold leading-relaxed">
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

        {/* ========================================================= */}
        {/* BOTTOM AREA: ROTATING ARC CAROUSEL (弧線旋轉選單 居中切換) */}
        {/* ========================================================= */}
        <div className="relative max-w-5xl mx-auto pt-6 pb-4">
          {/* Section Indicator: ❤️選擇你的專屬女僕/執事❤️ */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-12 sm:w-24 bg-gradient-to-r from-transparent to-[#8DB5DB]" />
            <span className="text-base sm:text-lg tracking-widest text-[#1B3E63] font-bold font-serif-tc flex items-center gap-2 text-stroke-white">
              ❤️ 選擇你的專屬女僕/執事 ❤️
            </span>
            <span className="h-px w-12 sm:w-24 bg-gradient-to-l from-transparent to-[#8DB5DB]" />
          </div>

          {/* SVG Arc Trajectory Curved Path + Rotating Carousel Arena */}
          <div className="relative w-full min-h-[190px] sm:min-h-[215px] md:min-h-[235px] flex items-center justify-center overflow-visible">
            {/* Left Chevron Button */}
            <button
              id="arc-prev-btn"
              onClick={handlePrevStaff}
              className="absolute left-1 sm:left-4 z-40 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-[#193F66] hover:text-[#0C243E] border-2 border-[#82B1DB] hover:border-[#3876A9] shadow-[0_2px_12px_rgba(40,80,120,0.18)] hover:shadow-[0_0_18px_rgba(56,118,169,0.5)] transition-all cursor-pointer group active:scale-95"
              title="切換至上一個侍從"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Right Chevron Button */}
            <button
              id="arc-next-btn"
              onClick={handleNextStaff}
              className="absolute right-1 sm:right-4 z-40 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-[#193F66] hover:text-[#0C243E] border-2 border-[#82B1DB] hover:border-[#3876A9] shadow-[0_2px_12px_rgba(40,80,120,0.18)] hover:shadow-[0_0_18px_rgba(56,118,169,0.5)] transition-all cursor-pointer group active:scale-95"
              title="切換至下一個侍從"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Background Curved Arc Path SVG with Rotating Astrolabe dial markings */}
            <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center overflow-visible">
              <svg
                viewBox="-440 -20 880 160"
                className="w-full h-full max-w-[880px] overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="bottom-arc-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8ABAE2" stopOpacity="0.1" />
                    <stop offset="25%" stopColor="#4D92C9" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#256BA2" stopOpacity="0.95" />
                    <stop offset="75%" stopColor="#4D92C9" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#8ABAE2" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Primary Arched Curved Trajectory Line (Gentle upward arch) */}
                <path
                  d="M -410,75 Q 0,-10 410,75"
                  fill="none"
                  stroke="url(#bottom-arc-grad)"
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                />

                {/* Subtle soft glowing line beneath for celestial aura */}
                <path
                  d="M -410,75 Q 0,-10 410,75"
                  fill="none"
                  stroke="#9EC8EC"
                  strokeWidth="8"
                  opacity="0.38"
                />

                {/* Static celestial ticks on the astrolabe arc */}
                <g>
                  <circle cx="-380" cy="70" r="4.5" fill="#68A5D8" opacity="0.8" />
                  <circle cx="-230" cy="24" r="4.5" fill="#5093C9" />
                  <circle cx="0" cy="-10" r="6.5" fill="#256BA2" />
                  <circle cx="230" cy="24" r="4.5" fill="#5093C9" />
                  <circle cx="380" cy="70" r="4.5" fill="#68A5D8" opacity="0.8" />
                  <line x1="0" y1="-18" x2="0" y2="-4" stroke="#256BA2" strokeWidth="2.5" />
                  <line x1="-230" y1="16" x2="-230" y2="32" stroke="#5093C9" strokeWidth="2" />
                  <line x1="230" y1="16" x2="230" y2="32" stroke="#5093C9" strokeWidth="2" />
                </g>
              </svg>
            </div>

            {/* Avatars dynamically positioned along the rotating arc */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              {STAFF_MEMBERS.map((member, idx) => {
                const pos = getStaffPosition(idx);

                return (
                  <motion.div
                    key={member.id}
                    animate={{
                      x: pos.x,
                      y: pos.y,
                      scale: pos.scale,
                      opacity: pos.opacity,
                      zIndex: pos.zIndex,
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                    className="absolute flex flex-col items-center select-none"
                  >
                    <button
                      id={`arc-staff-btn-${member.id}`}
                      onClick={() => handleSelectStaff(idx)}
                      className="group relative flex flex-col items-center cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 active:scale-98"
                      title={`指名 ${member.name}`}
                    >
                      {/* Glowing Circular Avatar Button with White Background & Gold Border Accent */}
                      <div
                        className={`relative w-22 h-22 sm:w-26 sm:h-26 md:w-32 md:h-32 rounded-full transition-all duration-300 ease-out overflow-hidden bg-white ${
                          pos.isSelected
                            ? 'ring-4 ring-[#D4AF37] border-2 border-amber-50 shadow-[0_0_24px_rgba(212,175,55,0.85),0_6px_20px_rgba(160,115,20,0.35)]'
                            : 'ring-2 ring-white/95 group-hover:ring-3 group-hover:ring-[#E5C158] shadow-sm group-hover:shadow-[0_8px_20px_rgba(30,60,90,0.18),0_0_16px_rgba(229,193,88,0.45)]'
                        }`}
                      >
                        <StaffAvatar seed={member.avatarSeed} avatarUrl={member.photoUrl} size="xl" className="w-full h-full" />

                        {/* Active Radiant Gold Pulse Indicator for selected avatar */}
                        {pos.isSelected && (
                          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 z-20">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E5C158] opacity-80" />
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#C59B27] border-2 border-white shadow-xs" />
                          </span>
                        )}
                      </div>

                      {/* Staff Name directly underneath with text stroke */}
                      <div className="flex flex-col items-center text-center mt-2 transition-transform duration-300 group-hover:-translate-y-0.5">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          {/* Small elegant glowing status dot */}
                          <span
                            className="relative flex h-2 w-2 shrink-0"
                            title={member.shiftStatus === 'available' ? '值班中 (Available)' : '忙碌中 (Busy)'}
                          >
                            {member.shiftStatus === 'available' && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            )}
                            <span
                              className={`relative inline-flex rounded-full h-2 w-2 ${
                                member.shiftStatus === 'available'
                                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.95)]'
                                  : 'bg-slate-400 shadow-[0_0_4px_rgba(148,163,184,0.6)]'
                              }`}
                            />
                          </span>
                          <span
                            className={`text-xs sm:text-sm font-bold tracking-wider transition-colors text-stroke-white ${
                              pos.isSelected
                                ? 'text-[#946C00] font-extrabold drop-shadow-xs'
                                : 'text-[#3A5B7D] group-hover:text-[#183654]'
                            }`}
                          >
                            {member.name}
                          </span>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Quick Indicator Navigation Pills Beneath Arc */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 mt-2">
            {STAFF_MEMBERS.map((member, idx) => {
              const isSelected = selectedIndex === idx;
              const isAvailable = member.shiftStatus === 'available';
              return (
                <button
                  key={`pill-${member.id}`}
                  onClick={() => handleSelectStaff(idx)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#224A73] text-white shadow-[0_0_14px_rgba(34,74,115,0.35)] border border-white scale-105'
                      : 'bg-white/75 hover:bg-white text-[#2C4F75] border border-[#BFD4E6] hover:border-[#8CB2D4]'
                  }`}
                >
                  {/* Small elegant glowing status dot in pill */}
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    {isAvailable && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                        isAvailable
                          ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.95)]'
                          : 'bg-slate-400'
                      }`}
                    />
                  </span>
                  <span>{member.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
