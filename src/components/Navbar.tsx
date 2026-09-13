import { Sparkles, Calendar } from 'lucide-react';
import { PageTab } from '../types';
import { SHOP_INFO } from '../data/cafeData';

interface NavbarProps {
  activeTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
}

export function Navbar({ activeTab, onSelectTab }: NavbarProps) {
  const navTabs: { id: PageTab; en: string; jp: string }[] = [
    { id: 'home', en: 'Home', jp: 'ホーム' },
    { id: 'about', en: 'About us', jp: '当店のご案内' },
    { id: 'staff', en: 'Maids', jp: 'メイド紹介' },
    { id: 'menu', en: 'Menu', jp: 'メニュー' },
    { id: 'decoration', en: 'Decoration', jp: '店舗内装' },
    { id: 'location', en: 'Location', jp: 'アクセス' },
    { id: 'faq', en: 'FAQ', jp: 'よくある質問' },
  ];

  const isReservationActive = activeTab === 'reservation';

  return (
    <header
      id="top-navbar"
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left Side: Shop Name */}
        <button
          id="navbar-brand-logo"
          onClick={() => onSelectTab('home')}
          className="pointer-events-auto group flex items-baseline gap-2 cursor-pointer text-left transition-transform duration-200 hover:scale-102 active:scale-98 shrink-0"
          title="回首頁"
        >
          <span className="text-2xl sm:text-3xl font-black font-serif-tc tracking-widest text-[#15324E] drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]">
            {SHOP_INFO.name}
          </span>
          <span className="hidden sm:inline-block text-[11px] sm:text-xs font-cinzel font-bold tracking-widest text-[#4A6E94] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
            {SHOP_INFO.subName}
          </span>
        </button>

        {/* Right Side: Horizontal Navigation Menu & 我要預約 CTA Button */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto scrollbar-none py-1">
          <nav
            id="main-nav-menu"
            aria-label="主要選單"
            className="flex items-center gap-1 sm:gap-1.5"
          >
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap text-center ${
                    isActive
                      ? 'bg-[#23466B] text-white shadow-[0_2px_8px_rgba(35,70,107,0.35)] ring-1 ring-[#1C3857]'
                      : 'bg-white/75 hover:bg-white text-[#305072] hover:text-[#15324E] border border-white/80 shadow-2xs backdrop-blur-xs'
                  }`}
                >
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-xs sm:text-sm font-bold tracking-wide font-cinzel leading-tight">
                      {tab.en}
                    </span>
                    <span
                      className={`text-[9px] sm:text-[10px] tracking-wider leading-tight mt-0.5 font-serif-tc ${
                        isActive ? 'text-[#C5DCF2]' : 'text-[#6787A9]'
                      }`}
                    >
                      {tab.jp}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* CTA: 我要預約 Button */}
          <button
            id="navbar-reservation-button"
            onClick={() => onSelectTab('reservation')}
            className={`group relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap shadow-xs ${
              isReservationActive
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-[0_2px_12px_rgba(245,158,11,0.4)] ring-2 ring-amber-300'
                : 'bg-gradient-to-r from-[#21456A] via-[#2F5A85] to-[#21456A] hover:from-[#183654] hover:to-[#22486E] text-white hover:shadow-[0_4px_16px_rgba(35,70,107,0.35)] hover:scale-102 active:scale-98'
            }`}
            title="進行入席預約"
          >
            <Calendar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isReservationActive ? 'text-white' : 'text-amber-300'}`} />
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left leading-none">
              <span className="text-xs sm:text-sm font-bold tracking-wide font-cinzel leading-tight">
                Reservation
              </span>
              <span
                className={`text-[9px] sm:text-[10px] tracking-wider leading-tight mt-0.5 font-serif-tc ${
                  isReservationActive ? 'text-amber-100' : 'text-amber-200'
                }`}
              >
                席予約
              </span>
            </div>
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse hidden sm:inline-block shrink-0" />
          </button>
        </div>
      </div>
    </header>
  );
}

