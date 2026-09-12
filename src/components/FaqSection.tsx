import { useState } from 'react';
import { FAQ_ITEMS } from '../data/cafeData';
import { HelpCircle, ChevronDown, Calendar, Coins, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FaqSectionProps {
  onNavigateToReservation?: () => void;
}

export function FaqSection({ onNavigateToReservation }: FaqSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'reservation' | 'spend' | 'rules'>('all');
  const [openFaqIds, setOpenFaqIds] = useState<Record<string, boolean>>({
    'faq-res-1': true,
    'faq-spd-1': true,
    'faq-rul-1': true,
  });

  const categories = [
    { id: 'all', name: '全部問答', icon: Sparkles },
    { id: 'reservation', name: '預約流程', icon: Calendar },
    { id: 'spend', name: '低消與收費', icon: Coins },
    { id: 'rules', name: '店內規範與 RP 禮儀', icon: ShieldCheck },
  ] as const;

  const filteredItems = FAQ_ITEMS.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section id="faq" className="pt-24 sm:pt-28 pb-20 bg-[#FAFBFD]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF2F8] text-[#2F4D6D] text-xs font-semibold tracking-wider uppercase mb-3 border border-[#D5E3EF]">
            <HelpCircle className="w-3.5 h-3.5 text-[#4E7399]" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1C3146] font-cinzel">
            常見問題・答疑解惑
          </h2>
          <div className="w-12 h-0.5 bg-[#8FB3D5] mx-auto mt-4 mb-3 rounded-full" />
          <p className="text-[#556D85] text-sm sm:text-base leading-relaxed font-serif-tc">
            針對預約流程、低消規定與店內入席注意事項進行解答，讓您的夜蒔館之旅無憂舒心。
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#23466B] text-white shadow-xs'
                    : 'bg-white text-[#4A6887] hover:text-[#183654] hover:bg-[#F2F6FA] border border-[#CBDDEB]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-[#5B7C9E]'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {filteredItems.map((item) => {
            const isOpen = !!openFaqIds[item.id];
            const getCategoryBadge = () => {
              if (item.category === 'reservation') {
                return { label: '預約指引', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
              }
              if (item.category === 'spend') {
                return { label: '低消收費', bg: 'bg-amber-50 text-amber-900 border-amber-200' };
              }
              return { label: '店內規範', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
            };
            const badge = getCategoryBadge();

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-[#96B8D6] shadow-[0_4px_20px_rgba(35,70,107,0.06)]'
                    : 'bg-white/80 hover:bg-white border-[#CBDDEB] shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(item.id)}
                  className="w-full text-left px-5 sm:px-6 py-4 flex items-start sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <span
                      className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md border shrink-0 mt-0.5 sm:mt-0 ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-[#1A2E42] font-serif-tc leading-snug">
                      {item.question}
                    </h3>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'bg-[#23466B] text-white rotate-180' : 'bg-[#EBF2F8] text-[#34597E]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-[#4E6782] leading-relaxed border-t border-[#EDF3F8]">
                        <p className="mt-1 font-serif-tc">{item.answer}</p>
                        {item.highlight && (
                          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F0F6FB] border border-[#CBDDEB] text-[11px] sm:text-xs font-semibold text-[#1F4164]">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>重點提醒：{item.highlight}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Box */}
        <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#21456A] via-[#2F5A85] to-[#21456A] text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-300 text-xs font-bold tracking-wider uppercase">
              <MessageCircle className="w-4 h-4" />
              <span>仍有其他疑問？</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold font-serif-tc">
              女僕們隨時守候在館內，為您獻上最貼心的解答
            </h4>
            <p className="text-xs sm:text-sm text-[#C4DCF2]">
              您可以在營業時間遊戲內 /tell 密語洽詢，或是直接填寫預約單保留專屬席次。
            </p>
          </div>

          {onNavigateToReservation && (
            <button
              type="button"
              onClick={onNavigateToReservation}
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#152B42] font-black text-xs sm:text-sm tracking-wide shrink-0 shadow-sm transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#152B42]" />
              <span>立即預約入席</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
