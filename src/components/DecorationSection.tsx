import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Camera,
  AlertTriangle,
  Maximize2,
  X,
  Play,
  Pause,
  Compass,
} from 'lucide-react';
import { playChime } from '../utils/audio';

export interface DecorationPhoto {
  id: number;
  url: string;
  isPolaroidSpot?: boolean;
  specialNotice?: string;
}

export const DECORATION_PHOTOS: DecorationPhoto[] = [
  {
    id: 1,
    url: 'https://r2.uploads.tw/2026/09/xXbuek8E3Y.webp',
  },
  {
    id: 2,
    url: 'https://r2.uploads.tw/2026/09/J7OoO1uAsq.webp',
  },
  {
    id: 3,
    url: 'https://r2.uploads.tw/2026/09/wB77e8Y0hn.webp',
  },
  {
    id: 4,
    url: 'https://r2.uploads.tw/2026/09/Z720qSpaMV.webp',
  },
  {
    id: 5,
    url: 'https://r2.uploads.tw/2026/09/wKw82iJf2v.webp',
  },
  {
    id: 6,
    url: 'https://r2.uploads.tw/2026/09/V5iuQ5wuoS.webp',
  },
  {
    id: 7,
    url: 'https://r2.uploads.tw/2026/09/1PDxpblvIi.webp',
  },
  {
    id: 8,
    url: 'https://r2.uploads.tw/2026/09/kBvHO4urPT.webp',
    isPolaroidSpot: true,
    specialNotice: '拍立得畫框於營業期間只開放員工拍立得使用，未營業期間可自由拍攝！',
  },
];

interface DecorationSectionProps {
  onNavigateToReservation?: () => void;
}

export function DecorationSection({ onNavigateToReservation }: DecorationSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const currentPhoto = DECORATION_PHOTOS[currentIndex];

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % DECORATION_PHOTOS.length);
    playChime(1.1);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + DECORATION_PHOTOS.length) % DECORATION_PHOTOS.length);
    playChime(0.95);
  }, []);

  const handleSelectPhoto = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    playChime(1.05);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape' && lightboxOpen) {
        setLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, lightboxOpen]);

  // Autoplay functionality
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay, handleNext]);

  return (
    <section id="decoration" className="pt-24 sm:pt-28 pb-20 bg-[#FAFBFD] min-h-screen text-[#2C3E50]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#BBD7EE] shadow-2xs text-[#204970] text-xs font-bold tracking-wider uppercase mb-2 backdrop-blur-xs font-cinzel">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Manor Architecture & Interior</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wider text-[#142C44] font-serif-tc text-stroke-white-title">
            Decoration 店舗内装
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm md:text-base text-[#466584] leading-relaxed font-serif-tc font-medium">
            踏入夜蒔館沉浸於典雅浪漫的歐式莊園氛圍。
          </p>
        </div>

        {/* ========================================================= */}
        {/* MAIN CAROUSEL FRAME (ONE PHOTO AT A TIME) */}
        {/* ========================================================= */}
        <div className="relative bg-white border border-[#CBDDEB] shadow-[0_12px_45px_rgba(26,46,66,0.08)] rounded-3xl overflow-hidden p-3 sm:p-5 md:p-6">
          {/* Top Bar inside Card: Progress, Index, and Controls */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#E1ECF4] mb-3 sm:mb-4 px-1 sm:px-2">
            {/* Left: Index badge */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#23466B] text-white font-mono text-xs sm:text-sm font-bold tracking-wider shadow-2xs">
                {String(currentIndex + 1).padStart(2, '0')} / {String(DECORATION_PHOTOS.length).padStart(2, '0')}
              </span>
              {currentPhoto.isPolaroidSpot && (
                <span className="text-xs font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-md border border-amber-200">
                  拍立得畫框
                </span>
              )}
            </div>

            {/* Right: Autoplay & Fullscreen buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isAutoPlay
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-white hover:bg-slate-50 text-[#3C6082] border-[#CBDDEB]'
                }`}
                title={isAutoPlay ? '暫停自動輪播' : '開啟自動輪播 (每5秒)'}
              >
                {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isAutoPlay ? '自動播放中' : '自動播放'}</span>
              </button>

              <button
                onClick={() => setLightboxOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-slate-50 text-[#3C6082] border border-[#CBDDEB] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                title="點擊放大檢視大圖"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">放大檢視</span>
              </button>
            </div>
          </div>

          {/* Photo Stage (One at a time with Prev / Next floating triggers) */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner group">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentPhoto.id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 50, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -direction * 50, scale: 0.98 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-0 w-full h-full cursor-pointer select-none"
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={currentPhoto.url}
                  alt={`店舗内装 ${currentIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  referrerPolicy="no-referrer"
                  loading="eager"
                />

                {/* Subtle dark vignette on top/bottom for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25 pointer-events-none" />

                {/* Quick Hint Overlay */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium backdrop-blur-xs flex items-center gap-1">
                    <Maximize2 className="w-3 h-3 text-amber-300" />
                    點擊放大看全圖
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Left Nav Button */}
            <button
              id="decoration-prev-button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/85 hover:bg-white text-[#183654] border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.25)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 z-20 backdrop-blur-xs"
              aria-label="上一張照片"
              title="上一張 (鍵盤 ←)"
            >
              <ChevronLeft className="w-6 h-6 -ml-0.5" />
            </button>

            {/* Right Nav Button */}
            <button
              id="decoration-next-button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/85 hover:bg-white text-[#183654] border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.25)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 z-20 backdrop-blur-xs"
              aria-label="下一張照片"
              title="下一張 (鍵盤 →)"
            >
              <ChevronRight className="w-6 h-6 -mr-0.5" />
            </button>

            {/* Special Tag Indicator Badge in bottom-left over photo if it's the polaroid spot */}
            {currentPhoto.isPolaroidSpot && (
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/95 text-white text-xs font-bold shadow-lg backdrop-blur-xs">
                  <Camera className="w-3.5 h-3.5" />
                  拍立得專用打卡畫框
                </span>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SPECIAL NOTICE / DESCRIPTION FOR POLAROID FRAME ONLY */}
          {/* ========================================================= */}
          {currentPhoto.specialNotice && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 text-amber-950 shadow-xs flex items-start sm:items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200/90 text-amber-900">
                    打卡畫框使用提醒
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    Important Notice
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-amber-950 font-serif-tc mt-1 leading-relaxed">
                  {currentPhoto.specialNotice}
                </p>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* THUMBNAIL STRIP (8 PHOTOS) */}
          {/* ========================================================= */}
          <div className="mt-5 pt-4 border-t border-[#E5EEF5]">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-[#4B6F92] font-cinzel tracking-wider uppercase">
                Photo Gallery Index ({DECORATION_PHOTOS.length})
              </span>
              <span className="text-[11px] text-[#6988A7]">
                點擊縮圖可直接切換照片
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-2.5">
              {DECORATION_PHOTOS.map((photo, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={photo.id}
                    onClick={() => handleSelectPhoto(idx)}
                    className={`group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2 ${
                      isActive
                        ? 'border-[#23466B] ring-2 ring-[#77A8D6] shadow-sm scale-102'
                        : 'border-[#CBDDEB] hover:border-[#86B4DC] opacity-75 hover:opacity-100'
                    }`}
                    title={`店舗内装 (${idx + 1}/${DECORATION_PHOTOS.length})`}
                  >
                    <img
                      src={photo.url}
                      alt={`店舗内装 ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    {/* Index label badge on thumbnail */}
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white font-mono text-[9px] font-bold leading-none">
                      {idx + 1}
                    </div>

                    {/* Camera icon badge if it's the polaroid spot */}
                    {photo.isPolaroidSpot && (
                      <div className="absolute bottom-1 right-1 p-0.5 rounded bg-amber-500 text-white text-[9px]">
                        <Camera className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM VISIT GUIDE & PHOTOGRAPHY RULES */}
        {/* ========================================================= */}
        <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-white/80 border border-[#CBDDEB] text-xs sm:text-sm text-[#466584] leading-relaxed shadow-2xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#1C3A5A]">
            <Compass className="w-4 h-4 text-[#2B547E]" />
            <span className="text-sm font-bold">夜蒔館拍攝與參訪禮儀</span>
          </div>
          <p>
            ✦ <strong>營業期間：</strong>歡迎主人於入席期間在不影響其他冒險者與走道動線的前提下合影留念。拍立得特製畫框專屬於加購之員工拍立得服務使用。
          </p>
          <p>
            ✦ <strong>非營業期間：</strong>夜蒔館大門為冒險者常態敞開，自由開放全館各處打卡參觀與 Gpose 拍攝，亦可自由站在拍立得畫框前拍照留念！
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* LIGHTBOX MODAL FOR FULL-SCREEN VIEW */}
      {/* ========================================================= */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Top Bar with Title and Close Button */}
            <div
              className="w-full max-w-6xl flex items-center justify-between text-white pb-3 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-mono font-bold">
                  {currentIndex + 1} / {DECORATION_PHOTOS.length}
                </span>
                {currentPhoto.isPolaroidSpot && (
                  <span className="text-sm font-bold text-amber-300 font-serif-tc">
                    拍立得畫框
                  </span>
                )}
              </div>

              <button
                onClick={() => setLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
                title="關閉放大視窗 (ESC)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Lightbox Image Stage */}
            <div
              className="relative max-w-6xl max-h-[82vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentPhoto.url}
                alt={`店舗内装 ${currentIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                referrerPolicy="no-referrer"
              />

              {/* Prev / Next within Lightbox */}
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/30 flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                title="上一張"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/30 flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                title="下一張"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Special Notice in Lightbox if applicable */}
            {currentPhoto.specialNotice && (
              <div
                className="mt-3 max-w-xl px-4 py-2 rounded-xl bg-amber-500/90 text-white text-xs font-bold text-center backdrop-blur-xs shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                ⚠️ {currentPhoto.specialNotice}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
