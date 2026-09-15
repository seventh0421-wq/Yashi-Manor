import { StaffAvatar } from './StaffAvatars';
import { CAFE_INTERACTION_SERVICES } from '../data/cafeData';
import { Sparkles, MessageCircle, Camera, PenTool, AlertCircle } from 'lucide-react';

export function MenuSection() {
  return (
    <section id="menu" className="pt-24 sm:pt-28 pb-20 bg-[#FAFBFD] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Physical Menu Card / Poster Canvas matching website palette */}
        <div className="bg-white border border-[#CBDDEB] shadow-[0_12px_40px_rgba(26,46,66,0.08)] rounded-2xl p-6 sm:p-10 md:p-14 text-[#1A2E42]">
          {/* Top Header */}
          <div className="relative pb-6 mb-8 border-b border-[#D6E3EF]">
            {/* Top rule decoration */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="h-[1px] bg-[#D6E3EF] flex-1" />
              <span className="text-[11px] sm:text-xs font-serif tracking-[0.35em] text-[#4D7196] uppercase font-semibold">
                YASHI MANOR
              </span>
              <div className="h-[1px] bg-[#D6E3EF] flex-1" />
            </div>

            {/* Main Header Row: Logo Badge | M E N U | Opening Hours */}
            <div className="flex items-center justify-between pt-1">
              {/* Left: Circle Emblem Badge */}
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-[#23466B] text-white flex flex-col items-center justify-center text-center p-1 shadow-sm shrink-0 select-none border border-[#CBDDEB]/60">
                <span className="text-[7.5px] sm:text-[8.5px] tracking-wider uppercase font-semibold text-[#A6C5E2] leading-none">
                  YASHI MANOR
                </span>
                <span className="text-[11px] sm:text-xs font-serif-tc font-bold mt-0.5 leading-none">
                  夜蒔館
                </span>
              </div>

              {/* Center: M E N U */}
              <div className="text-center px-4">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-[0.25em] text-[#1A2E42] font-normal pl-2 sm:pl-4">
                  MENU
                </h1>
              </div>

              {/* Right: Hours / Service time & Minimum Spend */}
              <div className="text-right shrink-0">
                <div className="text-[10px] sm:text-xs tracking-[0.2em] text-[#4D7196] uppercase font-serif font-semibold">
                  OPEN TIME
                </div>
                <div className="text-xs sm:text-sm font-mono text-[#23466B] font-bold mt-0.5 tracking-wider">
                  20:00 ~ 24:00
                </div>
                <div className="mt-1 inline-block px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] sm:text-[11px] font-bold text-amber-900">
                  低消 3w Gil
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Menu Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-start">
            {/* Left Column (5 Cols) - 沙拉、甜點、飲品 */}
            <div className="md:col-span-5 flex flex-col gap-6">
              {/* 1. SALAD Header & Items */}
              <div className="border-t border-b border-[#D6E3EF] py-2 text-center bg-[#F4F8FC] rounded-xs">
                <h3 className="text-[#23466B] font-serif font-bold tracking-[0.4em] text-sm sm:text-base pl-1">
                  SALAD・沙拉
                </h3>
              </div>

              <div className="space-y-3.5">
                {/* 無花果沙拉 */}
                <div className="flex items-baseline justify-between gap-2 border-b border-dotted border-[#CBDDEB] pb-2">
                  <span className="font-serif-tc font-bold text-[#1A2E42] text-base sm:text-lg tracking-wide">
                    無花果沙拉
                  </span>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#23466B]">
                      10,000
                    </span>
                    <span className="text-xs font-serif text-[#627D98]">Gil</span>
                  </div>
                </div>

                {/* 番茄沙拉 */}
                <div className="flex items-baseline justify-between gap-2 border-b border-dotted border-[#CBDDEB] pb-2">
                  <span className="font-serif-tc font-bold text-[#1A2E42] text-base sm:text-lg tracking-wide">
                    番茄沙拉
                  </span>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#23466B]">
                      10,000
                    </span>
                    <span className="text-xs font-serif text-[#627D98]">Gil</span>
                  </div>
                </div>
              </div>

              {/* 2. DESSERT Header & Items */}
              <div className="border-t border-b border-[#D6E3EF] py-2 text-center bg-[#F4F8FC] rounded-xs mt-2">
                <h3 className="text-[#23466B] font-serif font-bold tracking-[0.4em] text-sm sm:text-base pl-1">
                  DESSERT・甜點
                </h3>
              </div>

              <div className="space-y-3.5">
                {/* 巧克力奶油蛋糕 */}
                <div className="flex items-baseline justify-between gap-2 border-b border-dotted border-[#CBDDEB] pb-2">
                  <span className="font-serif-tc font-bold text-[#1A2E42] text-base sm:text-lg tracking-wide">
                    巧克力奶油蛋糕
                  </span>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#23466B]">
                      20,000
                    </span>
                    <span className="text-xs font-serif text-[#627D98]">Gil</span>
                  </div>
                </div>

                {/* 無花果餅乾 */}
                <div className="flex items-baseline justify-between gap-2 border-b border-dotted border-[#CBDDEB] pb-2">
                  <span className="font-serif-tc font-bold text-[#1A2E42] text-base sm:text-lg tracking-wide">
                    無花果餅乾
                  </span>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#23466B]">
                      20,000
                    </span>
                    <span className="text-xs font-serif text-[#627D98]">Gil</span>
                  </div>
                </div>
              </div>

              {/* 3. DRINKS Header */}
              <div className="border-t border-b border-[#D6E3EF] py-2 text-center bg-[#F4F8FC] rounded-xs mt-2">
                <h3 className="text-[#23466B] font-serif font-bold tracking-[0.4em] text-sm sm:text-base pl-1">
                  DRINKS・飲品
                </h3>
              </div>

              {/* Drink Items */}
              <div className="space-y-3.5">
                {/* 蜜瓜果汁 */}
                <div className="flex items-baseline justify-between gap-2 border-b border-dotted border-[#CBDDEB] pb-2">
                  <span className="font-serif-tc font-bold text-[#1A2E42] text-base sm:text-lg tracking-wide">
                    蜜瓜果汁
                  </span>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#23466B]">
                      10,000
                    </span>
                    <span className="text-xs font-serif text-[#627D98]">Gil</span>
                  </div>
                </div>

                {/* 高山茶 */}
                <div className="flex items-baseline justify-between gap-2 border-b border-dotted border-[#CBDDEB] pb-2">
                  <span className="font-serif-tc font-bold text-[#1A2E42] text-base sm:text-lg tracking-wide">
                    高山茶
                  </span>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#23466B]">
                      10,000
                    </span>
                    <span className="text-xs font-serif text-[#627D98]">Gil</span>
                  </div>
                </div>

                {/* 馬薩拉奶茶 */}
                <div className="flex items-baseline justify-between gap-2 border-b border-dotted border-[#CBDDEB] pb-2">
                  <span className="font-serif-tc font-bold text-[#1A2E42] text-base sm:text-lg tracking-wide">
                    馬薩拉奶茶
                  </span>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#23466B]">
                      10,000
                    </span>
                    <span className="text-xs font-serif text-[#627D98]">Gil</span>
                  </div>
                </div>

                {/* 抹茶 */}
                <div className="flex items-baseline justify-between gap-2 border-b border-dotted border-[#CBDDEB] pb-2">
                  <span className="font-serif-tc font-bold text-[#1A2E42] text-base sm:text-lg tracking-wide">
                    抹茶
                  </span>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#23466B]">
                      10,000
                    </span>
                    <span className="text-xs font-serif text-[#627D98]">Gil</span>
                  </div>
                </div>
              </div>

              {/* Atmosphere Beverage Photo */}
              <div className="overflow-hidden bg-[#F0F5FA] border border-[#CBDDEB] rounded-lg aspect-[16/10] mt-2 shadow-2xs">
                <img
                  src="https://i.meee.com.tw/kMO1yXj.png"
                  alt="夜蒔館精選茶飲"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right Column (7 Cols) - 主餐、特色餐點 */}
            <div className="md:col-span-7 flex flex-col gap-6">
              {/* 1. MAIN DISHES Header */}
              <div className="border-t border-b border-[#D6E3EF] py-2 text-center bg-[#F4F8FC] rounded-xs">
                <h3 className="text-[#23466B] font-serif font-bold tracking-[0.4em] text-sm sm:text-base pl-1">
                  MAIN DISHES・主餐
                </h3>
              </div>

              {/* Main Dishes List */}
              <div className="space-y-4">
                {/* 元氣蛋包飯 */}
                <div className="flex items-baseline justify-between gap-2 border-b border-dotted border-[#CBDDEB] pb-2">
                  <span className="font-serif-tc font-bold text-[#1A2E42] text-base sm:text-lg tracking-wide">
                    元氣蛋包飯
                  </span>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#23466B]">
                      20,000
                    </span>
                    <span className="text-xs font-serif text-[#627D98]">Gil</span>
                  </div>
                </div>

                {/* 雞肉奶油麵 */}
                <div className="flex items-baseline justify-between gap-2 border-b border-dotted border-[#CBDDEB] pb-2">
                  <span className="font-serif-tc font-bold text-[#1A2E42] text-base sm:text-lg tracking-wide">
                    雞肉奶油麵
                  </span>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#23466B]">
                      20,000
                    </span>
                    <span className="text-xs font-serif text-[#627D98]">Gil</span>
                  </div>
                </div>

                {/* 魚子醬三明治 */}
                <div className="flex items-baseline justify-between gap-2 border-b border-dotted border-[#CBDDEB] pb-2">
                  <span className="font-serif-tc font-bold text-[#1A2E42] text-base sm:text-lg tracking-wide">
                    魚子醬三明治
                  </span>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#23466B]">
                      20,000
                    </span>
                    <span className="text-xs font-serif text-[#627D98]">Gil</span>
                  </div>
                </div>
              </div>

              {/* 2. Gourmet Cuisine Photo */}
              <div className="overflow-hidden bg-[#F0F5FA] border border-[#CBDDEB] rounded-lg aspect-[16/9] shadow-2xs">
                <img
                  src="https://i.meee.com.tw/E5IKs5T.png"
                  alt="夜蒔館精緻主餐"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>

              {/* 3. SPECIALTIES Header */}
              <div className="border-t border-b border-[#D6E3EF] py-2 text-center bg-[#F4F8FC] rounded-xs">
                <h3 className="text-[#23466B] font-serif font-bold tracking-[0.3em] text-sm sm:text-base pl-1">
                  SPECIALTIES・特色餐點
                </h3>
              </div>

              {/* 4. Specialties List with Staff Recommendations */}
              <div className="space-y-4">
                {/* 開心汁 - 萊可推薦 */}
                <div className="flex items-center justify-between gap-3 border-b border-dotted border-[#CBDDEB] pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif-tc font-bold text-[#1A2E42] text-base sm:text-lg tracking-wide">
                      開心汁
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#EEF5FB] text-[#23466B] border border-[#CBDDEB]">
                      <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white shadow-2xs">
                        <StaffAvatar seed="laiko" className="w-4 h-4" />
                      </div>
                      <span>萊可推薦</span>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#23466B]">
                      50,000
                    </span>
                    <span className="text-xs font-serif text-[#627D98]">Gil</span>
                  </div>
                </div>

                {/* 無花果凍糕 - 璐可推薦 */}
                <div className="flex items-center justify-between gap-3 border-b border-dotted border-[#CBDDEB] pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif-tc font-bold text-[#1A2E42] text-base sm:text-lg tracking-wide">
                      無花果凍糕
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#EEF5FB] text-[#23466B] border border-[#CBDDEB]">
                      <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white shadow-2xs">
                        <StaffAvatar seed="luko" className="w-4 h-4" />
                      </div>
                      <span>璐可推薦</span>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#23466B]">
                      50,000
                    </span>
                    <span className="text-xs font-serif text-[#627D98]">Gil</span>
                  </div>
                </div>

                {/* 瑪黛茶餅乾 - 栗栗皆辛苦推薦 */}
                <div className="flex items-center justify-between gap-3 border-b border-dotted border-[#CBDDEB] pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif-tc font-bold text-[#1A2E42] text-base sm:text-lg tracking-wide">
                      瑪黛茶餅乾
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#EEF5FB] text-[#23466B] border border-[#CBDDEB]">
                      <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white shadow-2xs">
                        <StaffAvatar seed="kurikuri" className="w-4 h-4" />
                      </div>
                      <span>栗栗皆辛苦推薦</span>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#23466B]">
                      50,000
                    </span>
                    <span className="text-xs font-serif text-[#627D98]">Gil</span>
                  </div>
                </div>

                {/* 鮮紅羅蘭莓派 - 胖冬瓜推薦 */}
                <div className="flex items-center justify-between gap-3 border-b border-dotted border-[#CBDDEB] pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif-tc font-bold text-[#1A2E42] text-base sm:text-lg tracking-wide">
                      鮮紅羅蘭莓派
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#EEF5FB] text-[#23466B] border border-[#CBDDEB]">
                      <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white shadow-2xs">
                        <StaffAvatar seed="donggua" className="w-4 h-4" />
                      </div>
                      <span>胖冬瓜推薦</span>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#23466B]">
                      50,000
                    </span>
                    <span className="text-xs font-serif text-[#627D98]">Gil</span>
                  </div>
                </div>

                {/* 蜂蜜瑪芬 - 薯泥勇者推薦 */}
                <div className="flex items-center justify-between gap-3 border-b border-dotted border-[#CBDDEB] pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif-tc font-bold text-[#1A2E42] text-base sm:text-lg tracking-wide">
                      蜂蜜瑪芬
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#EEF5FB] text-[#23466B] border border-[#CBDDEB]">
                      <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white shadow-2xs">
                        <StaffAvatar seed="potatobrave" className="w-4 h-4" />
                      </div>
                      <span>薯泥勇者推薦</span>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#23466B]">
                      50,000
                    </span>
                    <span className="text-xs font-serif text-[#627D98]">Gil</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SPECIAL SERVICES (指名聊天服務 / 純拍照留影 / 簽繪) */}
          {/* ========================================================= */}
          <div className="mt-12 pt-8 border-t border-[#D6E3EF]">
            <div className="border-t border-b border-[#D6E3EF] py-2.5 text-center bg-[#F4F8FC] rounded-xs mb-6">
              <h3 className="text-[#23466B] font-serif font-bold tracking-[0.3em] text-sm sm:text-base pl-1">
                SPECIAL SERVICES・特別侍奉服務
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CAFE_INTERACTION_SERVICES.map((srv) => {
                const getIcon = () => {
                  if (srv.id === 'designated-chat') return <MessageCircle className="w-5 h-5 text-[#23466B]" />;
                  if (srv.id === 'photo-session') return <Camera className="w-5 h-5 text-[#23466B]" />;
                  return <PenTool className="w-5 h-5 text-[#23466B]" />;
                };

                return (
                  <div
                    key={srv.id}
                    className="p-5 rounded-xl border border-[#CBDDEB] bg-gradient-to-b from-white to-[#F8FAFC] shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="w-9 h-9 rounded-full bg-[#EBF2F8] flex items-center justify-center">
                          {getIcon()}
                        </div>
                        {srv.duration && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E3EDF6] text-[#23466B]">
                            {srv.duration}
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif-tc font-bold text-base sm:text-lg text-[#1A2E42]">
                        {srv.name}
                      </h4>

                      {srv.limitNote && (
                        <span className="inline-block mt-0.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {srv.limitNote}
                        </span>
                      )}

                      <p className="text-xs text-[#526B84] mt-2 leading-relaxed">
                        {srv.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-[#E3EDF6]">
                      <div className="text-xs sm:text-sm text-[#71879D] font-medium tracking-wide mb-1.5">
                        侍奉費用
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-serif text-2xl sm:text-3xl font-bold text-[#23466B]">
                          {srv.price.toLocaleString()}
                        </span>
                        <span className="text-xs sm:text-sm font-serif text-[#627D98]">
                          Gil
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================= */}
          {/* BOTTOM NOTICE & MINIMUM SPEND (低消與正式營運備註) */}
          {/* ========================================================= */}
          <div className="mt-8 p-4 sm:p-5 rounded-xl bg-[#F8FAFC] border border-[#D5E3EE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-[#48627C]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#285078] shrink-0" />
              <span className="font-semibold text-[#183654]">
                備註：以上價格將於正式營運時再做更動
              </span>
            </div>
            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 bg-white px-3 py-1.5 rounded-lg border border-[#CBDDEB] shadow-2xs">
              <span className="text-[#647C94]">入席基本消費：</span>
              <strong className="text-[#1A3858] font-serif text-sm sm:text-base">
                低消 30,000 Gil
              </strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
