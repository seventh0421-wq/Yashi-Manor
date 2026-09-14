import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Calendar,
  Clock,
  Gift,
  ChevronRight,
  X,
  ArrowRight,
  Check,
  Star,
  PartyPopper,
  Monitor
} from 'lucide-react';
import { MeteorBackground } from './MeteorBackground';
import { SPECIAL_EVENTS } from '../data/cafeData';
import { PageTab, SpecialEvent } from '../types';

interface HeroSectionProps {
  onNavigate?: (tab: PageTab) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>(SPECIAL_EVENTS[0]?.id || 'meteor-shower-rp');
  const [hasDismissedFloatingBanner, setHasDismissedFloatingBanner] = useState(false);

  const featuredEvent = SPECIAL_EVENTS.find((e) => e.isFeatured) || SPECIAL_EVENTS[0];
  const activeEvent = SPECIAL_EVENTS.find((e) => e.id === selectedEventId) || featuredEvent;

  return (
    <section
      id="home"
      className="relative flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-10 sm:pb-14 overflow-hidden min-h-[78vh] text-center"
    >
      {/* Home Page Background Image with 70% Opacity */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <img
          src="https://r2.uploads.tw/2026/09/hfozJ4Hgb7.webp"
          alt="夜蒔館首頁背景"
          className="w-full h-full object-cover object-center opacity-70"
          referrerPolicy="no-referrer"
        />
        {/* Soft gradient wash to ensure smooth blending and optimal text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFBFD]/40 via-[#FAFBFD]/20 to-[#F5F8FA]" />
      </div>

      {/* Subtle, slowly drifting shooting stars & stardust meteor background */}
      <MeteorBackground />

      {/* Soft Ethereal Starlight Background Accents */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#DFECF8]/70 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/3 right-[15%] w-60 h-60 bg-[#E8F1FB] rounded-full blur-2xl opacity-60" />
        <div className="absolute bottom-1/4 left-[15%] w-64 h-64 bg-[#EAF2FC] rounded-full blur-3xl opacity-60" />

        {/* Subtle Stardust Twinkle Highlights */}
        <div className="absolute top-24 left-[20%] w-1.5 h-1.5 bg-[#89AFD2] rounded-full animate-ping opacity-60" />
        <div className="absolute top-36 right-[22%] w-1.5 h-1.5 bg-[#A8C7E2] rounded-full animate-pulse opacity-70" />
        <div className="absolute bottom-32 left-[30%] w-1.5 h-1.5 bg-[#94B8DC] rounded-full animate-pulse opacity-50" />
        <div className="absolute bottom-40 right-[28%] w-1 h-1 bg-[#85A8CC] rounded-full animate-ping opacity-60" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full my-auto py-2 sm:py-4">
        {/* Store Name (店名 - 更大、更具氣勢) */}
        <div className="mb-5 sm:mb-7">
          <h1
            id="home-store-name"
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[0.22em] text-[#162B3F] font-cinzel select-none drop-shadow-[0_2px_14px_rgba(255,255,255,0.95)] leading-none"
          >
            夜蒔館
          </h1>
          <p className="text-xs sm:text-sm md:text-base tracking-[0.45em] sm:tracking-[0.55em] text-[#24476B] uppercase mt-3 font-bold font-cinzel pl-1 drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)]">
            Y A S H I &nbsp; M A N O R
          </p>
        </div>

        {/* Copy (文案 - 縮小版面與內距) */}
        <div
          id="home-copy-content"
          className="relative max-w-xl mx-auto px-5 sm:px-6 py-4 sm:py-4.5 rounded-2xl bg-white/85 border border-[#D9E5F0] shadow-sm backdrop-blur-sm"
        >
          <p className="text-xs sm:text-sm md:text-base leading-relaxed text-[#2C4156] font-serif-tc font-medium tracking-wide">
            當流星劃過夜空，每次的相逢皆如星辰般璀璨，
            <br className="hidden sm:inline" />
            願我們傾心的侍奉，能為您拂去漫長旅途中的疲憊。
          </p>
          <div className="mt-2.5 pt-2.5 border-t border-[#EDF3F8]">
            <p className="text-xs sm:text-sm md:text-base font-semibold text-[#274768] tracking-[0.18em] font-serif-tc">
              ご主人様！おかえり。
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* DESKTOP VIEWING RECOMMENDATION (建議使用電腦網頁觀看) */}
        {/* ========================================================= */}
        <div className="mt-4 sm:mt-5 flex justify-center">
          <div
            id="desktop-view-notice"
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/85 hover:bg-white/95 border border-[#BBD5EA] shadow-[0_2px_10px_rgba(45,85,130,0.08)] backdrop-blur-xs text-[#204467] text-xs sm:text-sm transition-all"
          >
            <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#356796] shrink-0" />
            <span className="font-medium">
              💡 建議使用<strong className="font-bold text-[#14324F] mx-1 underline decoration-[#8BB5DB] underline-offset-2">電腦網頁</strong>觀看，以獲得最佳視覺與互動體驗
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SPECIAL EVENTS BADGE (活動訊息按鈕) */}
        {/* ========================================================= */}
        <div className="mt-4 sm:mt-5 flex justify-center">
          <button
            id="hero-special-events-badge"
            type="button"
            onClick={() => setIsNoticeOpen(true)}
            className="group relative inline-flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-white/95 via-[#F3F8FD]/95 to-[#E7F2FC]/95 border border-[#BBD7EE] shadow-[0_3px_14px_rgba(74,124,178,0.14)] hover:shadow-[0_6px_22px_rgba(74,124,178,0.22)] hover:border-[#86B7E2] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer backdrop-blur-xs"
          >
            {/* Sparkle ping accent */}
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_8px_#f59e0b]" />
            </span>

            {/* Event Category Tag */}
            <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold tracking-wider uppercase bg-[#23466B] text-white shadow-2xs font-cinzel">
              Special Event
            </span>

            {/* Event Headline */}
            <span className="text-xs sm:text-sm font-bold text-[#1D3B5C] group-hover:text-[#11253C] transition-colors flex items-center gap-1.5">
              <span>{featuredEvent.title}</span>
              <span className="hidden md:inline-block text-[#5B7E9F] font-normal text-xs">
                ・{featuredEvent.date}
              </span>
            </span>

            {/* Action arrow */}
            <span className="inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold text-[#305C8A] group-hover:text-[#1B3E63] group-hover:translate-x-0.5 transition-all">
              <span>活動詳情</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FLOATING MINI NOTICE CARD (頁面右下角微型提示氣泡) */}
      {/* ========================================================= */}
      {!hasDismissedFloatingBanner && (
        <motion.aside
          aria-label="即將登場活動公告"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="fixed bottom-5 sm:bottom-6 right-4 sm:right-6 z-40 max-w-[340px] sm:max-w-[370px] bg-white/95 backdrop-blur-md border border-[#BFD9EF] rounded-2xl p-3.5 sm:p-4 shadow-[0_8px_30px_rgba(30,64,100,0.16)] text-left"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600 shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500 text-white tracking-wider">
                  Upcoming
                </span>
                <span className="text-[11px] text-[#557697] font-medium">
                  {featuredEvent.date}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#16304C] mt-1 truncate">
                {featuredEvent.title}
              </h4>
              <p className="text-[11px] text-[#597591] line-clamp-1 mt-0.5">
                {featuredEvent.subtitle}
              </p>
            </div>
            <button
              onClick={() => setHasDismissedFloatingBanner(true)}
              className="p-1 text-[#84A2BD] hover:text-[#325272] transition-colors rounded-lg hover:bg-slate-100 cursor-pointer"
              title="關閉提示"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#EEF4FA] flex items-center justify-between gap-2">
            <span className="text-[11px] text-[#718FA9]">全體侍從星光夜話</span>
            <button
              onClick={() => setIsNoticeOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#23466B] hover:text-[#132A42] cursor-pointer hover:underline"
            >
              <span>查看活動詳情</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.aside>
      )}

      {/* ========================================================= */}
      {/* SPECIAL EVENTS DETAIL POPUP MODAL (活動詳情彈出視窗) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isNoticeOpen && (
          <div
            id="special-events-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="special-events-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#FAFBFD] border border-[#CBDDEB] rounded-3xl shadow-[0_20px_50px_rgba(15,35,60,0.3)] overflow-hidden text-left"
            >
              {/* Header */}
              <div className="px-5 sm:px-7 py-5 bg-gradient-to-r from-[#1E3958] via-[#2A4D75] to-[#1E3958] text-white flex items-center justify-between shrink-0 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 font-cinzel">
                        Special Events & RP Nights
                      </span>
                    </div>
                    <h2
                      id="special-events-modal-title"
                      className="text-lg sm:text-xl font-bold font-serif-tc tracking-wide"
                    >
                      夜蒔館・特別活動企劃公告
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNoticeOpen(false)}
                  className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="關閉"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Event Switcher Tabs */}
              <div className="px-5 sm:px-7 pt-4 pb-2 bg-[#F1F6FB] border-b border-[#D8E6F2] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
                {SPECIAL_EVENTS.map((event) => {
                  const isSelected = event.id === activeEvent.id;
                  return (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#23466B] text-white shadow-xs'
                          : 'bg-white/80 hover:bg-white text-[#416283] border border-[#CBDDEB]'
                      }`}
                    >
                      {event.isFeatured && (
                        <Star className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-amber-500'}`} />
                      )}
                      <span>{event.title.replace(/【.*?】/, '')}</span>
                    </button>
                  );
                })}
              </div>

              {/* Content Body (Scrollable) */}
              <div className="p-5 sm:p-7 overflow-y-auto space-y-5 flex-1">
                {/* Event Main Banner Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#EAF3FA] via-white to-[#F2F7FB] border border-[#BFD6E8] shadow-2xs">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-2xs">
                      {activeEvent.badge}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E2EBF4] text-[#294B6F] border border-[#C5D8EA]">
                      {activeEvent.tag}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[#15324E] font-serif-tc">
                    {activeEvent.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4E7092] font-medium mt-1">
                    {activeEvent.subtitle}
                  </p>

                  {/* Date & Time chips */}
                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-[#DDEAF5] text-xs font-semibold text-[#25486C]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#3E6C99]" />
                      <span>{activeEvent.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#3E6C99]" />
                      <span>{activeEvent.time}</span>
                    </div>
                  </div>
                </div>

                {/* Event Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#547597] font-cinzel mb-2">
                    活動詳情說明
                  </h4>
                  <p className="text-sm leading-relaxed text-[#2A445F] bg-white p-4 rounded-xl border border-[#E0ECF6]">
                    {activeEvent.description}
                  </p>
                </div>

                {/* Exclusive Perks list */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#547597] font-cinzel mb-2.5 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-500" />
                    <span>入席主人專屬禮遇 (Exclusive Perks)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeEvent.perks.map((perk, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#E0ECF6] text-xs font-semibold text-[#1F3E60]"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer with quick navigation actions */}
              <div className="px-5 sm:px-7 py-4 bg-[#F2F7FB] border-t border-[#D8E6F2] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {onNavigate && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNoticeOpen(false);
                          onNavigate('reservation');
                        }}
                        className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold bg-[#23466B] text-white hover:bg-[#183654] transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>立即線上預約</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNoticeOpen(false);
                          onNavigate('staff');
                        }}
                        className="flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold bg-white text-[#294B6F] border border-[#CBDDEB] hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        瀏覽侍從名冊
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNoticeOpen(false);
                          onNavigate('menu');
                        }}
                        className="flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold bg-white text-[#294B6F] border border-[#CBDDEB] hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        特色菜單
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsNoticeOpen(false)}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#23466B] hover:bg-[#183654] text-white shadow-xs transition-colors cursor-pointer text-center"
                >
                  確認並關閉
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

