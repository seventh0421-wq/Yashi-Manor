import { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Check,
  Monitor,
  MapPin,
  Copy
} from 'lucide-react';
import { MeteorBackground } from './MeteorBackground';
import { SHOP_INFO } from '../data/cafeData';
import { PageTab } from '../types';
import { playChime } from '../utils/audio';

interface HeroSectionProps {
  onNavigate?: (tab: PageTab) => void;
}

export function HeroSection({ onNavigate: _onNavigate }: HeroSectionProps) {
  const [hasDismissedDesktopNotice, setHasDismissedDesktopNotice] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(SHOP_INFO.fullLocation);
    setCopiedAddress(true);
    playChime(1.0);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

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
        {/* STORE ADDRESS WITH ONE-CLICK COPY (店面地址與一鍵複製) */}
        {/* ========================================================= */}
        <div className="mt-4 sm:mt-5 flex justify-center">
          <div
            id="hero-address-badge"
            className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/90 hover:bg-white/95 border border-[#BBD5EA] shadow-[0_3px_12px_rgba(45,85,130,0.08)] backdrop-blur-xs text-[#1D3B5C] text-xs sm:text-sm transition-all"
          >
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2C5882] shrink-0" />
            <span className="font-serif-tc font-bold tracking-wide text-[#142C44]">
              {SHOP_INFO.fullLocation}
            </span>
            <span className="w-px h-3.5 bg-[#CBDDEB] mx-0.5" />
            <button
              type="button"
              onClick={handleCopyAddress}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EAF2FA] hover:bg-[#D9EAF7] text-[#214A70] hover:text-[#112A43] transition-all cursor-pointer shadow-2xs active:scale-95"
              title="一鍵複製門牌地址"
            >
              {copiedAddress ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">已複製門牌！</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>複製地址</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FLOATING PROMPT BOXES CONTAINER (頁面右下角提示區) */}
      {/* ========================================================= */}
      <div className="fixed bottom-5 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-none">
        {/* 建議使用電腦網頁觀看 (右下提示框樣式，小小一列字) */}
        {!hasDismissedDesktopNotice && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ delay: 1.0, duration: 0.3 }}
            className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md border border-[#BFD9EF] rounded-full shadow-[0_4px_20px_rgba(30,64,100,0.12)] text-[11px] sm:text-xs text-[#204467]"
          >
            <Monitor className="w-3.5 h-3.5 text-[#356796] shrink-0" />
            <span className="font-medium whitespace-nowrap">
              💡 建議使用<strong className="font-bold text-[#14324F] mx-0.5 underline decoration-[#8BB5DB]">電腦網頁</strong>觀看體驗最佳
            </span>
            <button
              type="button"
              onClick={() => setHasDismissedDesktopNotice(true)}
              className="p-0.5 text-[#84A2BD] hover:text-[#325272] transition-colors rounded-full hover:bg-slate-100 cursor-pointer ml-0.5"
              title="關閉提示"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

