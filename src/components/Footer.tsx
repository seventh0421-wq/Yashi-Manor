import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Heart, Clock } from 'lucide-react';
import { SHOP_INFO } from '../data/cafeData';
import { PageTab } from '../types';

interface FooterProps {
  onSelectTab?: (tab: PageTab) => void;
}

export function Footer({ onSelectTab }: FooterProps) {
  const [eorzeaTime, setEorzeaTime] = useState('');

  // Calculate real-time Eorzea Time (ET)
  useEffect(() => {
    const updateET = () => {
      // 1 Eorzea Day = 70 real-world minutes (factor ~20.571428)
      const epoch = Date.now();
      const eorzeaMilliseconds = epoch * (24 * 60 / (70 * 60)) * (60 / 60) * 20.571428571428573;
      const d = new Date(eorzeaMilliseconds);
      const hours = String(d.getUTCHours()).padStart(2, '0');
      const minutes = String(d.getUTCMinutes()).padStart(2, '0');
      setEorzeaTime(`${hours}:${minutes} ET`);
    };

    updateET();
    const interval = setInterval(updateET, 2900);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-[#182635] text-[#BAC9D8] pt-12 sm:pt-14 pb-8 sm:pb-10 border-t border-[#2A3E54]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 sm:pb-10 border-b border-[#2C425A]">
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#2E4866] border border-[#486B94] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-[#8BB9E6]" />
              </div>
              <span className="text-2xl font-bold tracking-widest text-white font-cinzel">
                {SHOP_INFO.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#273E56] text-[#A6C8EC] border border-[#3E5F85]">
                女僕執事咖啡廳
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#8BA4BD] leading-relaxed max-w-md font-serif-tc">
              {SHOP_INFO.heroQuote}
            </p>

            <div className="flex items-center gap-2 text-xs text-[#A8C4DE] pt-2">
              <MapPin className="w-4 h-4 text-[#6A96C2]" />
              <span>{SHOP_INFO.fullLocation}</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              館內導覽
            </h4>
            <ul className="space-y-1.5 text-xs text-[#8BA4BD]">
              <li>
                <button
                  onClick={() => {
                    onSelectTab?.('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Home（ホーム）
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectTab?.('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  About us（当店のご案内）
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectTab?.('staff');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  STAFF（スタッフ紹介）
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectTab?.('menu');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Menu（メニュー）
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectTab?.('decoration');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Decoration（店舗内装）
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectTab?.('location');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Location（アクセス）
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectTab?.('faq');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  FAQ（よくある質問）
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectTab?.('reservation');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-amber-300 hover:text-amber-200 font-bold transition-colors cursor-pointer text-left flex items-center gap-1"
                >
                  <span>✦ 我要預約</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Eorzea Atmosphere & Schedule */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              艾歐澤亞即時動態
            </h4>
            <div className="p-3.5 rounded-xl bg-[#203347] border border-[#314D6B] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#8AA3BC]">艾歐澤亞時間</span>
                <span className="font-mono font-bold text-[#72B4F3] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {eorzeaTime || '讀取中...'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#2F4763]">
                <span className="text-[#8AA3BC]">固定營業時段</span>
                <span className="text-white font-medium">每週五、六 20:30起</span>
              </div>
            </div>
            <p className="text-[11px] text-[#7189A0]">
              推開大門的那一刻，所有的冒險疲憊都將化作星塵。ご主人様！おかえり。
            </p>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-4 sm:pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6F869D]">
          <div className="flex items-center gap-1">
            <span>© 2026 夜蒔館 Yashi Manor. Crafted with</span>
            <Heart className="w-3 h-3 text-[#DE6B7C] fill-[#DE6B7C]" />
            <span>for Eorzea Adventurers.</span>
          </div>
          <div className="text-center sm:text-right text-[11px] text-[#586E83]">
            FINAL FANTASY XIV © SQUARE ENIX CO., LTD. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
