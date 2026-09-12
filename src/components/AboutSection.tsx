import { Compass, Sparkles, Clock, ShieldCheck, Heart, Camera, Coffee, HelpCircle, ChevronRight } from 'lucide-react';
import { SHOP_INFO, RP_RULES } from '../data/cafeData';

interface AboutSectionProps {
  onNavigateToFaq?: () => void;
}

export function AboutSection({ onNavigateToFaq }: AboutSectionProps) {
  return (
    <section id="about" className="pt-24 sm:pt-28 pb-20 bg-[#FAFBFD]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF2F8] text-[#2F4D6D] text-xs font-semibold tracking-wider uppercase mb-3 border border-[#D5E3EF]">
            <Compass className="w-3.5 h-3.5 text-[#4E7399]" />
            <span>About Nocturne Herbal Cafe</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1C3146] font-cinzel">
            夜蒔館・店內簡介
          </h2>
          <div className="w-12 h-0.5 bg-[#8FB3D5] mx-auto mt-4 mb-4 rounded-full" />
          <p className="text-[#556D85] text-sm sm:text-base leading-relaxed">
            為艾歐澤亞疲憊的旅人，點亮一盞永不熄滅的溫暖星光。
          </p>
        </div>

        {/* Narrative & Concept Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          {/* Main Story Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE7F0] shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#35577B] text-sm font-semibold">
                <Coffee className="w-4 h-4 text-[#547C9E]" />
                <span>黑衣森林中的溫柔庇護所</span>
              </div>
              <h3 className="text-2xl font-bold text-[#1F3348] font-serif-tc">
                何為「夜蒔館」？
              </h3>
              <p className="text-[#496179] text-sm sm:text-base leading-relaxed font-serif-tc">
                座落於利維坦伺服器、薰衣草苗圃靜謐的第12分區。「夜蒔」寓意著在夜幕低垂、天際星辰灑落之際，蒔花弄草、細火慢焙。
              </p>
              <p className="text-[#496179] text-sm sm:text-base leading-relaxed font-serif-tc">
                不論您剛結束漫長嚴苛的高難討伐，抑或是採集製作奔波一日的光之戰士，只要輕輕推開夜蒔館雕花雙扇門，女僕與執事們便會躬身相迎，為您奉上暖心的熱茶與精緻料理，用最純粹的敬意拂去您旅途上的風霜。
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-[#EDF3F8] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-[#465F77]">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F4F8FB]">
                <Clock className="w-4 h-4 text-[#4A729A] shrink-0" />
                <div>
                  <div className="font-semibold text-[#1F364D]">營業時間</div>
                  <div className="text-xs text-[#637D96]">{SHOP_INFO.businessHours}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F4F8FB]">
                <ShieldCheck className="w-4 h-4 text-[#4A729A] shrink-0" />
                <div>
                  <div className="font-semibold text-[#1F364D]">入場費用</div>
                  <div className="text-xs text-[#637D96]">{SHOP_INFO.entryFee}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Feature Highlights */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#EEF4F9] to-[#E3EDF6] border border-[#CADDEC] flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#2D4D70] shrink-0 shadow-2xs">
                <Heart className="w-5 h-5 text-[#DE6B7C]" />
              </div>
              <div>
                <h4 className="font-bold text-[#1E344A] text-base mb-1">
                  傾心侍奉與魔法咒語
                </h4>
                <p className="text-xs sm:text-sm text-[#4D657D] leading-relaxed">
                  每道餐點皆享有女僕手繪、萌萌魔法或執事專屬手沖降溫禮遇，讓每一口滋味都充滿愛心。
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#DCE7F0] flex items-start gap-4 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#EDF4FA] flex items-center justify-center text-[#35577B] shrink-0">
                <Camera className="w-5 h-5 text-[#4E769E]" />
              </div>
              <div>
                <h4 className="font-bold text-[#1E344A] text-base mb-1">
                  唯美 Gpose 打卡點
                </h4>
                <p className="text-xs sm:text-sm text-[#4D657D] leading-relaxed">
                  館內精心佈置雙人英式下午茶沙發席、星光溫室露台與壁爐琴房，隨處皆是絕美合影景致。
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#DCE7F0] flex items-start gap-4 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#EDF4FA] flex items-center justify-center text-[#35577B] shrink-0">
                <Sparkles className="w-5 h-5 text-[#4E769E]" />
              </div>
              <div>
                <h4 className="font-bold text-[#1E344A] text-base mb-1">
                  新手友善・輕鬆沉浸
                </h4>
                <p className="text-xs sm:text-sm text-[#4D657D] leading-relaxed">
                  即使是第一次接觸 FF14 RP（角色扮演）的主人，侍從們也會親切引導交流，完全無需擔心！
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RP Rules & Etiquette Grid */}
        <div className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-[#1F3348] flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-[#38618B]" />
              <span>夜蒔館歸宅守則</span>
            </h3>
            <span className="text-sm text-[#5D7791]">共同守護優雅溫柔的宅邸時光</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {RP_RULES.map((rule, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-[#DCE8F2] hover:border-[#B8D1E6] transition-all hover:shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#EDF4FA] text-[#284C72] flex items-center justify-center text-sm font-bold font-mono">
                      0{idx + 1}
                    </div>
                    <h4 className="font-bold text-[#18344E] text-base sm:text-lg tracking-wide">
                      {rule.title}
                    </h4>
                  </div>
                  <div className="text-sm sm:text-base text-[#3E5872] leading-relaxed space-y-2.5">
                    {rule.desc.split('\n').map((line, lIdx) => (
                      <p
                        key={lIdx}
                        className={
                          line.startsWith('#')
                            ? 'text-amber-800 font-semibold text-sm sm:text-base pt-1.5 inline-block bg-amber-50/90 px-3 py-1 rounded-lg border border-amber-200/70'
                            : ''
                        }
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Navigation Banner */}
          {onNavigateToFaq && (
            <div className="mt-8 p-5 rounded-2xl bg-[#F0F6FB] border border-[#CBDDEB] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#264D75] shrink-0 shadow-2xs">
                  <HelpCircle className="w-5 h-5 text-[#3E658E]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1B3550]">
                    想了解更多入店低消規定、預約流程或注意事項？
                  </h4>
                  <p className="text-xs text-[#52708E]">
                    我們整理了詳細的常見問題與答疑，為您解開入席的所有疑慮。
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onNavigateToFaq}
                className="px-5 py-2 rounded-xl bg-[#23466B] hover:bg-[#183654] text-white text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>前往常見問題 FAQ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
