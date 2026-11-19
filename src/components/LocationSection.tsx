import { useState, useEffect } from 'react';
import {
  MapPin,
  Copy,
  Check,
  Compass,
  Clock,
} from 'lucide-react';
import { SHOP_INFO } from '../data/cafeData';
import { playChime } from '../utils/audio';

export function LocationSection() {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Taiwan Time (GMT+8)
  const taipeiDate = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
  const dayOfWeek = taipeiDate.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  const hours = taipeiDate.getHours();
  const minutes = taipeiDate.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // Business hours: Friday & Saturday 23:00 - 01:00 (extends into Sat/Sun 00:00-01:00, GMT+8)
  const isOpen =
    (dayOfWeek === 5 && totalMinutes >= 23 * 60) ||
    (dayOfWeek === 6 && (totalMinutes < 60 || totalMinutes >= 23 * 60)) ||
    (dayOfWeek === 0 && totalMinutes < 60);

  const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  const currentDayName = dayNames[dayOfWeek];
  const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(taipeiDate.getSeconds()).padStart(2, '0')}`;

  // Next week Fri/Sat (2026/11/27, 11/28) are temporarily closed
  const isNextWeekClosed =
    taipeiDate.getFullYear() === 2026 &&
    taipeiDate.getMonth() === 10 &&
    ((taipeiDate.getDate() === 22 && totalMinutes >= 60) ||
      (taipeiDate.getDate() >= 23 && taipeiDate.getDate() <= 28));

  let nextOpenText = '本週五 23:00 開館';
  if (isNextWeekClosed) {
    nextOpenText = '下週五、週六時段暫不開放，下次開館時間請留意官網公告';
  } else if (dayOfWeek === 5) {
    if (totalMinutes < 23 * 60) {
      nextOpenText = '今日 (週五) 23:00 準時開館';
    } else {
      nextOpenText = '明日 (週六) 23:00 開館';
    }
  } else if (dayOfWeek === 6) {
    if (totalMinutes < 23 * 60) {
      nextOpenText = '今日 (週六) 23:00 準時開館';
    } else {
      nextOpenText = '下次開館時間請留意官網公告';
    }
  } else if (dayOfWeek === 0) {
    nextOpenText = '下次開館時間請留意官網公告';
  } else {
    nextOpenText = '本週五 23:00 開館';
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(SHOP_INFO.fullLocation);
    setCopiedAddress(true);
    playChime();
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <section id="location" className="pt-24 sm:pt-28 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF2F8] text-[#28496C] text-xs font-semibold tracking-wider uppercase mb-3 border border-[#D5E3EF]">
            <Compass className="w-3.5 h-3.5 text-[#4A729A]" />
            <span>Access &amp; Location</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1B3047] font-cinzel">
            夜蒔館・地址與交通指南
          </h2>
          <div className="w-12 h-0.5 bg-[#8FB3D5] mx-auto mt-4 mb-4 rounded-full" />
          <p className="text-[#516C85] text-sm sm:text-base leading-relaxed">
            位於黑衣森林懷抱中的薰衣草苗圃，循著星光與茶香前來。
          </p>
        </div>

        {/* Current Business Hours Display Area (目前營業時間) */}
        <div
          id="current-business-hours-area"
          className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-white via-[#F8FBFE] to-[#EFF6FC] border border-[#CBDDEB] shadow-2xs text-left"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4.5">
              {/* Clock Icon container with glowing outline */}
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs transition-colors ${
                  isOpen
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-600 shadow-[0_0_16px_rgba(16,185,129,0.25)]'
                    : 'bg-[#EBF3FA] border-[#CADDEC] text-[#30537A]'
                }`}
                title="目前營業時段"
              >
                <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <div>
                <div className="flex items-center flex-wrap gap-2.5 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4A6E94] font-cinzel">
                    Business Hours
                  </span>

                  {/* Status Indicator: 營業中 vs 休息中 */}
                  {isOpen ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500 text-white shadow-xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                      </span>
                      <span>營業中・OPEN</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#E2EBF5] text-[#335375] border border-[#C5D9EB]">
                      <span className="h-2 w-2 rounded-full bg-[#6484A4]" />
                      <span>休息中・CLOSED</span>
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#17304B] font-serif-tc flex flex-wrap items-baseline gap-2">
                  <span>目前營業時間：</span>
                  <span className="text-sm sm:text-base font-semibold text-[#2D5076]">
                    {SHOP_INFO.businessHours}
                  </span>
                </h3>

                <p className="text-xs sm:text-sm text-[#57728D] mt-1">
                  {isOpen
                    ? '門扉已為您敞開，女僕與執事恭候主人光臨！隨時歡迎入座。'
                    : `目前為閉館休養時段，${nextOpenText}，期待為您卸下一整天的疲憊。`}
                </p>
              </div>
            </div>

            {/* Current Real-time Clock display */}
            <div className="w-full md:w-auto shrink-0 flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-[#E2ECF5] pt-3 md:pt-0">
              <span className="text-[11px] font-semibold text-[#6684A2] tracking-wider uppercase">
                當前台灣時間 (GMT+8)
              </span>
              <div className="font-mono text-base sm:text-lg font-bold text-[#1C3A5A] tracking-wider bg-white/90 px-3.5 py-1 rounded-xl border border-[#D5E3EE] shadow-2xs">
                {currentDayName} {timeString}
              </div>
            </div>
          </div>
        </div>

        {/* Big Address Highlight Hero Box */}
        <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#EEF4FA] via-[#F8FAFC] to-[#E8F1F9] border border-[#CBDDEB] shadow-xs">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5 text-left">
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#CADDEC] flex items-center justify-center text-[#2A4C70] shrink-0 shadow-2xs">
                <MapPin className="w-7 h-7 text-[#3B628A]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#DCE8F5] text-[#244569] border border-[#CADAE8]">
                    {SHOP_INFO.server}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#19324B] tracking-wide font-cinzel">
                  {SHOP_INFO.fullLocation}
                </h3>
                <p className="text-xs sm:text-sm text-[#4E6A85] mt-1">
                  利維坦（Leviathan）伺服器・薰衣草苗圃第12分區46號
                </p>
              </div>
            </div>

            {/* Copy Address Button */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleCopyAddress}
                className="px-5 py-3 rounded-xl bg-[#2C4E73] hover:bg-[#203C5A] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {copiedAddress ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>已複製完整地址！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>一鍵複製門牌地址</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
