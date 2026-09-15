import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  User,
  Users,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  RotateCcw,
  CalendarPlus,
  Coffee,
  MessageSquare,
  ShieldCheck,
  Star,
  ExternalLink,
  Plus,
  Minus,
  Utensils,
  Shuffle,
  Heart,
  X,
  PartyPopper,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { STAFF_MEMBERS } from '../data/cafeData';
import { ReservationData, PreOrderItem } from '../types';
import { playChime, playMagicSpell } from '../utils/audio';
import { StaffAvatar } from './StaffAvatars';

interface ReservationSectionProps {
  initialStaffName?: string;
  initialDate?: string;
  onNavigateToMenu?: () => void;
  onNavigateToStaff?: () => void;
  onNavigateToFaq?: () => void;
}

const TIME_SLOTS = [
  { id: 'slot-1', label: '20:30 - 21:30', note: '星夜開館首場（氣氛熱烈）' },
  { id: 'slot-2', label: '21:30 - 22:30', note: '黃金夜話場（推薦預約）' },
  { id: 'slot-3', label: '22:30 - 23:30', note: '深夜靜謐場（舒心談心）' },
  { id: 'slot-4', label: '23:30 - 24:00', note: '星末閉館送別場' },
];

// 7 Specified FF14 Servers
const SERVERS = [
  '鳳凰 (Phoenix)',
  '伊弗利特 (Ifrit)',
  '迦樓羅 (Garuda)',
  '利維坦 (Leviathan)',
  '巴哈姆特 (Bahamut)',
  '奧汀 (Odin)',
  '泰坦 (Titan)',
];

const DISCORD_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1548170544594292787/EFRJd3SvLWE8_oOz_gKkuOXnbAr4A-QKj9hYh3UNTqvfOIhavcDbWwuxTddX9hNCa3Ag';

/**
 * Sends a structured rich embed reservation notification to Discord Webhook
 */
async function sendReservationToDiscord(reservation: ReservationData): Promise<boolean> {
  try {
    const dishesList =
      reservation.selectedDishes && reservation.selectedDishes.length > 0
        ? reservation.selectedDishes
            .map((d) => `• **${d.name}** × ${d.quantity}（${(d.price * d.quantity).toLocaleString()} Gil）`)
            .join('\n')
        : '未預選（入席後現場向女僕點餐）';

    const totalDishGil =
      reservation.selectedDishes && reservation.selectedDishes.length > 0
        ? reservation.selectedDishes.reduce((sum, d) => sum + d.price * d.quantity, 0)
        : 0;

    const payload = {
      username: '夜蒔館 預約管家',
      avatar_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&fit=crop&q=80',
      content: `✨ **【夜蒔館】收到新的主人入席預約！** 請值班女僕與執事確認留位 ✨`,
      embeds: [
        {
          title: `✦ 預約通知單：${reservation.id}`,
          description: `主人 **${reservation.customerName}** 已在官方網站完成預約登記！`,
          color: 0x23466b, // Elegant Nocturne Navy Blue
          fields: [
            {
              name: '📅 預約日期與時段',
              value: `**${reservation.date}**\n${reservation.timeSlot}`,
              inline: true,
            },
            {
              name: '🎀 指定侍奉侍從',
              value: `**${reservation.staffName}**`,
              inline: true,
            },
            {
              name: '👥 入席人數',
              value: `${reservation.guestCount} 位主人`,
              inline: true,
            },
            {
              name: '👤 主人尊稱 (角色名)',
              value: `**${reservation.customerName}**`,
              inline: true,
            },
            {
              name: '🌐 所屬伺服器',
              value: `${reservation.worldServer}`,
              inline: true,
            },
            {
              name: '💬 遊戲內聯絡方式',
              value: `${reservation.contactMethod || '未填寫'}`,
              inline: true,
            },
            {
              name: '🍽️ 預選餐點清單',
              value: `${dishesList}\n${totalDishGil > 0 ? `**餐點預估合計：${totalDishGil.toLocaleString()} Gil**` : ''}`,
              inline: false,
            },
            {
              name: '📝 特別備註與需求',
              value: reservation.specialRequests ? `> ${reservation.specialRequests}` : '無特別備註',
              inline: false,
            },
          ],
          footer: {
            text: '夜蒔館・女僕執事咖啡廳 (Leviathan 12-46) ｜ 官網預約系統即時傳送',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to notify Discord webhook:', err);
    return false;
  }
}

// Menu items for pre-ordering
const PRE_ORDER_CATEGORIES = [
  {
    category: 'SALAD・沙拉輕食',
    items: [
      { id: 'salad-1', name: '無花果沙拉', price: 10000, desc: '鮮採無花果佐清脆生菜特調油醋' },
      { id: 'salad-2', name: '番茄沙拉', price: 10000, desc: '熟成紅番茄切片佐新鮮水牛起司' },
    ],
  },
  {
    category: 'MAIN DISHES・飽足主餐',
    items: [
      { id: 'dish-1', name: '元氣蛋包飯', price: 20000, desc: '金黃歐姆蛋番茄燉飯，含桌邊女僕手繪' },
      { id: 'dish-2', name: '雞肉奶油麵', price: 20000, desc: '濃郁白醬燉嫩雞義大利麵' },
      { id: 'dish-3', name: '魚子醬三明治', price: 20000, desc: '特選珍品魚子醬手作軟吐司' },
    ],
  },
  {
    category: 'DESSERTS・甜蜜點心',
    items: [
      { id: 'dessert-1', name: '巧克力奶油蛋糕', price: 20000, desc: '濃郁絲滑黑巧克力佐手打鮮奶油' },
      { id: 'dessert-2', name: '無花果餅乾', price: 20000, desc: '低溫烘烤手作香酥無花果碎餅乾' },
    ],
  },
  {
    category: 'DRINKS・沁涼飲品與熱茶',
    items: [
      { id: 'drink-1', name: '蜜瓜果汁', price: 10000, desc: '鮮榨冰鎮香甜蜜瓜汁' },
      { id: 'drink-2', name: '高山茶', price: 10000, desc: '甘醇清雅手採高山溫潤熱茶' },
      { id: 'drink-3', name: '馬薩拉奶茶', price: 10000, desc: '近東芳香辛香料厚濃暖胃奶茶' },
      { id: 'drink-4', name: '抹茶', price: 10000, desc: '遠東特級石臼抹茶現點手工刷泡' },
    ],
  },
  {
    category: 'SPECIALTIES・特色餐點',
    items: [
      { id: 'spec-1', name: '開心汁', price: 50000, desc: '夢幻微醺氣泡特調飲品', tag: '萊可推薦', staffSeed: 'laiko' },
      { id: 'spec-2', name: '無花果凍糕', price: 50000, desc: '層次豐富的法式清甜凍糕', tag: '璐可推薦', staffSeed: 'luko' },
      { id: 'spec-3', name: '瑪黛茶餅乾', price: 50000, desc: '香脆微甘的手作瑪黛茶酥餅', tag: '栗栗皆辛苦推薦', staffSeed: 'kurikuri' },
      { id: 'spec-4', name: '鮮紅羅蘭莓派', price: 50000, desc: '黑衣森林酸甜飽滿漿果派', tag: '胖冬瓜推薦', staffSeed: 'donggua' },
      { id: 'spec-5', name: '蜂蜜瑪芬', price: 50000, desc: '融入野花蜂蜜與香醇奶油的鬆軟溫潤瑪芬', tag: '薯泥勇者推薦', staffSeed: 'potatobrave' },
    ],
  },
];

// Helper to retrieve in-character thank you messages for dialog
const getPersonalizedMaidMessage = (staffName: string, customerName: string) => {
  const name = customerName || '主人';
  switch (staffName) {
    case '萊可':
      return {
        speaker: '萊可（店長）',
        avatarSeed: 'laiko',
        photoUrl: 'https://i.meee.com.tw/dkSZ6nR.png',
        quote: `「主人 ${name}！歡迎回家～萊可已經親手把您的名字記在大本本上囉！今天的星光特別璀璨，一定是因為主人要來了～我會準備好最棒的笑容與特調開心汁，期待在星夜下見到您！✨」`,
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    case '璐可':
      return {
        speaker: '璐可',
        avatarSeed: 'luko',
        photoUrl: 'https://i.meee.com.tw/CMH9DxK.png',
        quote: `「主人 ${name}，歡迎回來。您的席位已精心登記妥當。今夜就請放慢腳步，放下旅途所有風塵與疲憊，璐可會為您沏上一壺溫熱甘甜的茶，靜候您的歸來。」`,
        badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      };
    case '栗栗皆辛苦':
      return {
        speaker: '栗栗皆辛苦',
        avatarSeed: 'kurikuri',
        photoUrl: 'https://i.meee.com.tw/Hneru75.png',
        quote: `「哼哼～主人 ${name}！小公主才、才沒有在時鐘前倒數等著你來呢！……不過既然你都特地指名本公主了，那天我就勉為其難好好陪你聊聊天、吃好吃的瑪黛茶餅乾吧，可絕對不能遲到喔！」`,
        badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
      };
    case '胖冬瓜':
      return {
        speaker: '胖冬瓜',
        avatarSeed: 'donggua',
        photoUrl: 'https://i.meee.com.tw/EmzeSiG.png',
        quote: `「主人 ${name}，預約已妥善收悉。漫長夜色會溫柔包容一切冒險者的故事，若主人不嫌棄，我已備妥私心最愛的鮮紅羅蘭莓派，願能在靜謐的燭光下成為您的傾聽者。」`,
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      };
    case '薯泥勇者':
      return {
        speaker: '薯泥勇者（執事）',
        avatarSeed: 'potatobrave',
        photoUrl: 'https://i.meee.com.tw/V4AC8Ds.png',
        quote: `「歡迎回來，我的主人 ${name}。剩下的時間請放心交給我吧。不用急著找到所有問題的答案，我已備好現烤熱騰騰的蜂蜜瑪芬，先陪您嚐點甜的。」`,
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      };
    default:
      return {
        speaker: '夜蒔館全體女僕與執事',
        avatarSeed: undefined,
        photoUrl: undefined,
        quote: `「敬愛的主人 ${name}，夜蒔館全體女僕與執事向您致上最誠摯的敬意與感激！星光庇護所的溫暖壁爐與雅座已為您點亮，我們正滿懷期待，靜候您推開館邸大門的瞬間。」`,
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      };
  }
};

export function ReservationSection({
  initialStaffName,
  initialDate,
  onNavigateToMenu,
  onNavigateToStaff,
  onNavigateToFaq,
}: ReservationSectionProps) {
  // Step state (1: 時段與侍從, 2: 主人資訊, 3: 餐點選擇, 4: 確認預約)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // Form Fields - Step 1
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || '本週五 (20:30起)');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('21:30 - 22:30');
  const [selectedStaff, setSelectedStaff] = useState<string>(initialStaffName || '不指名');
  const [guestCount, setGuestCount] = useState<number>(1);

  // Form Fields - Step 2
  const [customerName, setCustomerName] = useState<string>('');
  const [worldServer, setWorldServer] = useState<string>('鳳凰 (Phoenix)');
  const [contactMethod, setContactMethod] = useState<string>('');

  // Form Fields - Step 3: Pre-order Menu Selection (Optional)
  // Store dish name -> quantity
  const [selectedDishCounts, setSelectedDishCounts] = useState<Record<string, number>>({});
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Confirmed booking state
  const [confirmedReservation, setConfirmedReservation] = useState<ReservationData | null>(null);
  // Thank-you dialog modal & success celebration state
  const [showThankYouModal, setShowThankYouModal] = useState<boolean>(false);
  // Webhook submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [webhookSentSuccess, setWebhookSentSuccess] = useState<boolean>(false);

  // Validation errors
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync initial staff name if prop changes
  useEffect(() => {
    if (initialStaffName) {
      setSelectedStaff(initialStaffName);
    }
  }, [initialStaffName]);

  // Sync initial date if prop changes
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  // Load existing reservation from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nocturne_active_reservation');
      if (saved) {
        setConfirmedReservation(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Dish quantity handlers
  const handleAddDish = (dishName: string) => {
    playChime(1.2);
    setSelectedDishCounts((prev) => ({
      ...prev,
      [dishName]: (prev[dishName] || 0) + 1,
    }));
  };

  const handleRemoveDish = (dishName: string) => {
    playChime(0.9);
    setSelectedDishCounts((prev) => {
      const count = prev[dishName] || 0;
      if (count <= 1) {
        const next = { ...prev };
        delete next[dishName];
        return next;
      }
      return { ...prev, [dishName]: count - 1 };
    });
  };

  const handleClearDishes = () => {
    playChime(0.85);
    setSelectedDishCounts({});
  };

  // Convert selected map to PreOrderItem array
  const getSelectedDishesList = (): PreOrderItem[] => {
    const list: PreOrderItem[] = [];
    PRE_ORDER_CATEGORIES.forEach((cat) => {
      cat.items.forEach((item) => {
        const qty = selectedDishCounts[item.name] || 0;
        if (qty > 0) {
          list.push({
            name: item.name,
            price: item.price,
            quantity: qty,
          });
        }
      });
    });
    return list;
  };

  const selectedDishes = getSelectedDishesList();
  const totalGil = selectedDishes.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDishCount = selectedDishes.reduce((sum, item) => sum + item.quantity, 0);

  const handleNext = () => {
    setValidationError(null);

    // Validate Step 1
    if (currentStep === 1) {
      if (!selectedDate || !selectedTimeSlot || !selectedStaff) {
        setValidationError('請完整選擇預約日期、時段與指名侍從選項');
        return;
      }
      playChime(1.1);
      setCurrentStep(2);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    // Validate Step 2
    if (currentStep === 2) {
      if (!customerName.trim()) {
        setValidationError('請填寫主人的尊稱或角色名稱，以便女僕與執事為您登記銘牌');
        return;
      }
      playChime(1.15);
      setCurrentStep(3);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    // Step 3 is optional, directly advance to Step 4
    if (currentStep === 3) {
      playChime(1.2);
      setCurrentStep(4);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
  };

  const handlePrev = () => {
    setValidationError(null);
    if (currentStep > 1) {
      playChime(0.9);
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    playMagicSpell();

    // Calculate today's date formatted as YYYYMMDD (e.g. 20260912)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Get today's order sequence number
    let orderSeqNum = 1;
    const storageKey = `nocturne_order_seq_${dateStr}`;
    try {
      const storedCount = localStorage.getItem(storageKey);
      if (storedCount) {
        orderSeqNum = parseInt(storedCount, 10) + 1;
      }
      localStorage.setItem(storageKey, orderSeqNum.toString());
    } catch {
      // fallback
    }

    // Format: 日期 + 今天第幾個訂單 (例如：20260912-01)
    const formattedSeq = orderSeqNum < 10 ? `0${orderSeqNum}` : `${orderSeqNum}`;
    const bookingId = `${dateStr}-${formattedSeq}`;

    const reservation: ReservationData = {
      id: bookingId,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      staffName: selectedStaff,
      guestCount,
      customerName: customerName.trim(),
      worldServer,
      contactMethod: contactMethod.trim(),
      selectedDishes,
      specialRequests: specialRequests.trim(),
      createdAt: new Date().toISOString(),
    };

    setConfirmedReservation(reservation);
    try {
      localStorage.setItem('nocturne_active_reservation', JSON.stringify(reservation));
    } catch {
      // Ignore
    }

    // Transmit to Discord Webhook asynchronously
    try {
      const success = await sendReservationToDiscord(reservation);
      setWebhookSentSuccess(success);
    } catch {
      setWebhookSentSuccess(false);
    } finally {
      setIsSubmitting(false);
      setShowThankYouModal(true);
      window.scrollTo({ top: 80, behavior: 'smooth' });
    }
  };

  const handleResetReservation = () => {
    playChime(1.0);
    setConfirmedReservation(null);
    setShowThankYouModal(false);
    setWebhookSentSuccess(false);
    try {
      localStorage.removeItem('nocturne_active_reservation');
    } catch {
      // Ignore
    }
    setCurrentStep(1);
    setCustomerName('');
    setSelectedDishCounts({});
    setSpecialRequests('');
  };

  const handleCopyCode = () => {
    if (!confirmedReservation) return;
    navigator.clipboard.writeText(confirmedReservation.id);
    setHasCopiedCode(true);
    playChime(1.3);
    setTimeout(() => setHasCopiedCode(false), 2000);
  };

  return (
    <div
      id="reservation-page"
      className="min-h-[calc(100vh-70px)] pt-20 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F2F7FB] via-[#FAFBFD] to-[#EEF5FB] text-[#223B55]"
    >
      <div className="max-w-4xl mx-auto">
        {/* ========================================================= */}
        {/* PAGE HEADER */}
        {/* ========================================================= */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-[#CBDDEB] shadow-2xs text-[#2F5278] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Reservation Wizard・預約登記</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif-tc tracking-wide text-[#142F4B]">
            夜蒔館・主人入席預約
          </h1>
          <p className="text-sm sm:text-base text-[#567594] mt-2 max-w-xl mx-auto font-medium">
            為確保每位主人皆能享有專屬侍從悉心侍奉，請登記您的冒險者資訊。
          </p>

          {/* Quick FAQ Helper Bar */}
          {onNavigateToFaq && (
            <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF3FA] border border-[#CBDDEB] text-xs text-[#305378]">
              <HelpCircle className="w-3.5 h-3.5 text-[#416892]" />
              <span>初次前來？低消或流程有疑問嗎？</span>
              <button
                type="button"
                onClick={onNavigateToFaq}
                className="text-[#1D4A75] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>點此查看常見問題 FAQ</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* CONFIRMED RESERVATION VIEW (If already submitted) */}
        {/* ========================================================= */}
        {confirmedReservation ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Elegant Certificate Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B3552] via-[#244569] to-[#182F48] text-white p-6 sm:p-9 shadow-[0_16px_40px_rgba(20,40,70,0.22)] border border-[#486D94]">
              {/* Background ambient glow */}
              <div className="absolute inset-0 pointer-events-none select-none opacity-30">
                <div className="absolute top-10 right-16 w-32 h-32 bg-[#70A8DB] rounded-full blur-2xl" />
                <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#93C5FD] rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                {/* Header ribbon */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-2xs">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[11px] font-cinzel tracking-widest text-amber-300 font-bold uppercase">
                        Reservation Confirmed
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold font-serif-tc text-white tracking-wide">
                        預約已順利確立
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/20">
                    <span className="text-xs text-white/70">預約代碼：</span>
                    <span className="font-mono font-bold text-amber-300 tracking-wider">
                      {confirmedReservation.id}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-1 hover:bg-white/10 rounded text-white/80 hover:text-white transition-colors cursor-pointer"
                      title="複製代碼"
                    >
                      {hasCopiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-b border-white/15">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-xs text-[#A8C8E6] flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3.5 h-3.5" /> 預約日期
                    </span>
                    <span className="text-base font-bold text-white font-serif-tc">
                      {confirmedReservation.date}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-xs text-[#A8C8E6] flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5" /> 預約時段
                    </span>
                    <span className="text-base font-bold text-white font-mono">
                      {confirmedReservation.timeSlot}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-xs text-[#A8C8E6] flex items-center gap-1.5 mb-1">
                      <Star className="w-3.5 h-3.5 text-amber-300" /> 專屬指名侍從
                    </span>
                    <span className="text-base font-bold text-amber-300 font-serif-tc">
                      {confirmedReservation.staffName === '不指名'
                        ? '不指名 (館內安排)'
                        : confirmedReservation.staffName}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-xs text-[#A8C8E6] flex items-center gap-1.5 mb-1">
                      <User className="w-3.5 h-3.5" /> 預約主人尊稱
                    </span>
                    <span className="text-base font-bold text-white font-serif-tc">
                      {confirmedReservation.customerName} ({confirmedReservation.guestCount}位)
                    </span>
                  </div>
                </div>

                {/* Sub details: Server & Pre-order items */}
                <div className="pt-6 space-y-3 text-xs sm:text-sm text-[#C9DEF0]">
                  <p>
                    <strong className="text-white">所屬伺服器：</strong> {confirmedReservation.worldServer}
                  </p>

                  <div>
                    <strong className="text-white">預選餐點：</strong>{' '}
                    {confirmedReservation.selectedDishes && confirmedReservation.selectedDishes.length > 0 ? (
                      <span className="text-amber-200">
                        {confirmedReservation.selectedDishes
                          .map((d) => `${d.name} x${d.quantity}`)
                          .join('、')}{' '}
                        （合計:{' '}
                        {confirmedReservation.selectedDishes
                          .reduce((s, d) => s + d.price * d.quantity, 0)
                          .toLocaleString()}{' '}
                        Gil）
                      </span>
                    ) : (
                      <span className="text-white/70">未提前預選（入席後現場向女僕或執事點餐）</span>
                    )}
                  </div>

                  {confirmedReservation.specialRequests && (
                    <p>
                      <strong className="text-white">特別備註：</strong> {confirmedReservation.specialRequests}
                    </p>
                  )}

                  {/* Modification Note */}
                  <div className="pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-[#C2DCF2]">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span>
                      <strong className="text-amber-200">修改須知：</strong> 若預約需修改或變更時段，請在 DC 聯絡萊可。
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions below certificate */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={handleResetReservation}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-[#F0F5FA] text-[#244A72] border border-[#CBDDEB] text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xs hover:border-[#96B8D9] transition-all cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4 text-[#35618F]" />
                <span>再次預約 (挑選其他日子)</span>
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <div className="text-xs text-[#527191] font-medium hidden sm:flex items-center gap-1.5 mr-1">
                  <span>※ 若預約需修改請在 DC 聯絡萊可</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playMagicSpell();
                    setShowThankYouModal(true);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#142A42] text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <PartyPopper className="w-4 h-4" />
                  <span>💌 查看侍從感謝信</span>
                </button>

                {onNavigateToMenu && (
                  <button
                    type="button"
                    onClick={onNavigateToMenu}
                    className="px-6 py-2.5 rounded-2xl bg-[#23466B] hover:bg-[#183654] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Coffee className="w-4 h-4" />
                    <span>瀏覽美味菜單</span>
                  </button>
                )}
              </div>
            </div>
            <div className="sm:hidden text-center text-xs text-[#527191] font-medium pt-1">
              <span>※ 若預約需修改請在 DC 聯絡萊可</span>
            </div>
          </motion.div>
        ) : (
          /* ========================================================= */
          /* STEP-BY-STEP RESERVATION FORM WIZARD */
          /* ========================================================= */
          <div className="bg-white/90 rounded-3xl border border-[#CBDDEB] shadow-sm backdrop-blur-xs p-6 sm:p-8 md:p-10">
            {/* STEP PROGRESS BAR INDICATOR */}
            <div className="mb-8 sm:mb-10">
              <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
                {[
                  { num: 1, label: '時段與侍從', sub: 'Date & Staff' },
                  { num: 2, label: '主人資訊', sub: 'Guest Info' },
                  { num: 3, label: '餐點選擇', sub: 'Menu (Optional)' },
                  { num: 4, label: '確認預約', sub: 'Review' },
                ].map((step) => {
                  const isActive = currentStep === step.num;
                  const isDone = currentStep > step.num;
                  return (
                    <div
                      key={step.num}
                      className={`relative flex flex-col items-center text-center p-2 rounded-2xl transition-all duration-200 ${
                        isActive
                          ? 'bg-[#EBF3FA] border border-[#BBD5EB]'
                          : isDone
                          ? 'text-[#264D73]'
                          : 'text-[#8AA4BE]'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mb-1.5 transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-2xs'
                            : isActive
                            ? 'bg-[#21456A] text-white shadow-xs scale-105'
                            : 'bg-[#E8EFF6] text-[#718EA8]'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : step.num}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-[#193A5C] truncate max-w-full">
                        {step.label}
                      </span>
                      <span className="hidden sm:inline-block text-[10px] uppercase font-cinzel text-[#6384A2]">
                        {step.sub}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ERROR ALERT */}
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-center gap-2"
              >
                <span>⚠️ {validationError}</span>
              </motion.div>
            )}

            {/* STEP CONTENT SWITCHER */}
            <AnimatePresence mode="wait">
              {/* ========================================================= */}
              {/* STEP 1: DATE, TIME & MAID (專屬指名女僕 + 不指名選項) */}
              {/* ========================================================= */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-7"
                >
                  {/* 1.1 Date selection */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#35587E] font-cinzel mb-2.5">
                      1. 選擇預約日期 (Reservation Date)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        '本週五 (20:30起)',
                        '本週六 (20:30起)',
                        '下週五 (20:30起)',
                        '下週六 (20:30起)',
                      ].map((dateOption) => {
                        const isSelected = selectedDate === dateOption;
                        return (
                          <button
                            key={dateOption}
                            type="button"
                            onClick={() => setSelectedDate(dateOption)}
                            className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold text-center border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#23466B] text-white border-[#1C3A5A] shadow-xs'
                                : 'bg-white hover:bg-[#F3F8FC] text-[#2F5175] border-[#CBDDEB]'
                            }`}
                          >
                            <Calendar className="w-4 h-4 mx-auto mb-1 opacity-80" />
                            <span>{dateOption}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 1.2 Time Slot selection */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#35587E] font-cinzel mb-2.5">
                      2. 選擇入席時段 (Time Slot)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {TIME_SLOTS.map((slot) => {
                        const isSelected = selectedTimeSlot === slot.label;
                        return (
                          <div
                            key={slot.id}
                            onClick={() => setSelectedTimeSlot(slot.label)}
                            className={`py-3 px-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-[#23466B] text-white border-[#1C3A5A] shadow-xs'
                                : 'bg-white hover:bg-[#F3F8FC] text-[#2F5175] border-[#CBDDEB]'
                            }`}
                          >
                            <div className="text-sm font-bold font-mono flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{slot.label}</span>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-white bg-white/20 text-white' : 'border-[#CBDDEB]'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 1.3 Preferred Staff selection (專屬指名侍從) */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#35587E] font-cinzel">
                        3. 專屬指名女僕 (Preferred Staff)
                      </label>
                      {onNavigateToStaff && (
                        <button
                          type="button"
                          onClick={onNavigateToStaff}
                          className="text-xs text-[#285078] hover:underline font-semibold flex items-center gap-1"
                        >
                          <span>查看侍從詳情</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Options Grid: 1 "不指名" Option + 4 Maid Members */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {/* Option 1: 不指名 */}
                      <div
                        onClick={() => setSelectedStaff('不指名')}
                        className={`relative p-3.5 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                          selectedStaff === '不指名'
                            ? 'bg-gradient-to-b from-[#1E3B5C] to-[#2B527E] text-white border-[#193452] shadow-xs ring-2 ring-[#70A6D6]'
                            : 'bg-white hover:bg-[#F4F9FD] text-[#2A4C70] border-[#CBDDEB]'
                        }`}
                      >
                        {selectedStaff === '不指名' && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-[#142A42] flex items-center justify-center shadow-2xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        <div className="w-14 h-14 rounded-full overflow-hidden mb-2 border-2 border-white shadow-xs bg-[#EAF2F9] flex items-center justify-center text-[#23466B]">
                          <Shuffle className="w-6 h-6" />
                        </div>

                        <div>
                          <span className="font-bold text-sm sm:text-base font-serif-tc block">
                            不指名
                          </span>
                          <span
                            className={`text-[10px] sm:text-[11px] font-semibold mt-0.5 block ${
                              selectedStaff === '不指名' ? 'text-amber-300' : 'text-[#5C7E9F]'
                            }`}
                          >
                            隨機安排 / 自由指派
                          </span>
                        </div>
                      </div>

                      {/* Maid Options */}
                      {STAFF_MEMBERS.map((staff) => {
                        const isSelected = selectedStaff === staff.name;
                        return (
                          <div
                            key={staff.id}
                            onClick={() => setSelectedStaff(staff.name)}
                            className={`relative p-3.5 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                              isSelected
                                ? 'bg-gradient-to-b from-[#1E3B5C] to-[#2B527E] text-white border-[#193452] shadow-xs ring-2 ring-[#70A6D6]'
                                : 'bg-white hover:bg-[#F4F9FD] text-[#2A4C70] border-[#CBDDEB]'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-[#142A42] flex items-center justify-center shadow-2xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}

                            {/* Staff Avatar */}
                            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden mb-2 border-2 border-white shadow-xs bg-white flex items-center justify-center">
                              <StaffAvatar seed={staff.avatarSeed} avatarUrl={staff.photoUrl} size="lg" className="w-full h-full" />
                            </div>

                            <div>
                              <span className="font-bold text-sm sm:text-base font-serif-tc block">
                                {staff.name}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 1.4 Guest Count */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#35587E] font-cinzel mb-2.5">
                      4. 入席人數 (Party Size)
                    </label>
                    <div className="grid grid-cols-4 gap-2.5 max-w-md">
                      {[1, 2, 3, 4].map((count) => {
                        const isSelected = guestCount === count;
                        return (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setGuestCount(count)}
                            className={`p-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#23466B] text-white border-[#1C3A5A] shadow-xs'
                                : 'bg-white hover:bg-[#F3F8FC] text-[#2E5074] border-[#CBDDEB]'
                            }`}
                          >
                            <Users className="w-4 h-4" />
                            <span>{count} 位</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ========================================================= */}
              {/* STEP 2: GUEST PROFILE & CONTACT (7指定伺服器, 移除初次特典) */}
              {/* ========================================================= */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#35587E] font-cinzel mb-1.5">
                      主人尊稱 / 角色暱稱 (Character Name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="例：光之戰士 / 艾莉絲 / 冒險者名稱"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-[#CBDDEB] text-[#1C3A5A] placeholder-[#8BA4BD] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#528AC0] shadow-2xs"
                    />
                    <p className="text-[11px] text-[#6383A0] mt-1.5">
                      女僕與執事將以此尊稱向您問候行禮，並為您呈上專屬桌牌。
                    </p>
                  </div>

                  {/* World / Server - Only 7 servers requested */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#35587E] font-cinzel mb-1.5">
                      所屬伺服器 (World / Server)
                    </label>
                    <select
                      value={worldServer}
                      onChange={(e) => setWorldServer(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-[#CBDDEB] text-[#1C3A5A] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#528AC0] shadow-2xs cursor-pointer"
                    >
                      {SERVERS.map((srv) => (
                        <option key={srv} value={srv}>
                          {srv}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-[#6383A0] mt-1.5">
                      目前夜蒔館優先接待以上 7 大伺服器之光之冒險者。
                    </p>
                  </div>

                  {/* Contact Method */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#35587E] font-cinzel mb-1.5">
                      聯絡方式 (Discord / 遊戲內ID) (選填)
                    </label>
                    <input
                      type="text"
                      placeholder="例：Discord: warrior_of_light#1234 或 遊戲內ID"
                      value={contactMethod}
                      onChange={(e) => setContactMethod(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-[#CBDDEB] text-[#1C3A5A] placeholder-[#8BA4BD] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#528AC0] shadow-2xs"
                    />
                    <p className="text-[11px] text-[#6383A0] mt-1.5">
                      若遇特別活動時段異動，將透過此方式提前告知主人。
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ========================================================= */}
              {/* STEP 3: PRE-ORDER MENU (餐點選擇・非必填・客人可跳過) */}
              {/* ========================================================= */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* Informational Banner */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#EEF5FB] to-[#F5F9FD] border border-[#CBDDEB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-[#23466B]" />
                        <h3 className="text-sm sm:text-base font-bold text-[#142F4B] font-serif-tc">
                          美味餐點優先點選（非必填）
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          可跳過
                        </span>
                      </div>
                      <p className="text-xs text-[#5D7E9F] mt-1">
                        提前為您備妥精緻茶點與主餐。若尚未決定，可直接點擊「下一步」跳過，入席時再向女僕或執事點餐。
                      </p>
                    </div>

                    {totalDishCount > 0 && (
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <span className="text-xs font-bold text-[#23466B] bg-white px-2.5 py-1 rounded-xl border border-[#CBDDEB]">
                          已選 {totalDishCount} 份・{totalGil.toLocaleString()} Gil
                        </span>
                        <button
                          type="button"
                          onClick={handleClearDishes}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline"
                        >
                          清除
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Menu Categories Accordion/Blocks */}
                  <div className="space-y-6">
                    {PRE_ORDER_CATEGORIES.map((catGroup) => (
                      <div key={catGroup.category} className="space-y-2.5">
                        <div className="flex items-center gap-2 pb-1 border-b border-[#D8E6F2]">
                          <span className="text-xs font-bold uppercase tracking-widest text-[#23466B] font-serif">
                            {catGroup.category}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {catGroup.items.map((item) => {
                            const count = selectedDishCounts[item.name] || 0;
                            const isAdded = count > 0;

                            return (
                              <div
                                key={item.id}
                                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                  isAdded
                                    ? 'bg-[#F2F7FB] border-[#23466B] shadow-2xs ring-1 ring-[#23466B]/20'
                                    : 'bg-white hover:bg-[#FAFBFD] border-[#CBDDEB]'
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm sm:text-base text-[#193552] font-serif-tc">
                                      {item.name}
                                    </span>
                                    {item.tag && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF5FB] text-[#23466B] border border-[#CBDDEB]">
                                        {item.staffSeed && (
                                          <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 border border-white">
                                            <StaffAvatar seed={item.staffSeed} className="w-3.5 h-3.5" />
                                          </div>
                                        )}
                                        <span>{item.tag}</span>
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#6484A2] mt-0.5 truncate">
                                    {item.desc}
                                  </p>
                                  <div className="flex items-baseline gap-1 mt-1">
                                    <span className="font-serif font-bold text-sm sm:text-base text-[#23466B]">
                                      {item.price.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] font-serif text-[#64748B]">Gil</span>
                                  </div>
                                </div>

                                {/* Counter Stepper */}
                                <div className="flex items-center gap-1.5 shrink-0 bg-white border border-[#CBDDEB] rounded-xl p-1 shadow-2xs">
                                  {count > 0 ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveDish(item.name)}
                                        className="w-7 h-7 rounded-lg bg-[#F0F5FA] hover:bg-[#E1EBF5] text-[#23466B] flex items-center justify-center transition-colors cursor-pointer"
                                        title="減少一份"
                                      >
                                        <Minus className="w-3.5 h-3.5" />
                                      </button>
                                      <span className="w-6 text-center text-xs font-bold text-[#142F4B] font-mono">
                                        {count}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAddDish(item.name)}
                                        className="w-7 h-7 rounded-lg bg-[#23466B] hover:bg-[#183654] text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="增加一份"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleAddDish(item.name)}
                                      className="px-2.5 py-1 rounded-lg bg-[#F0F5FA] hover:bg-[#23466B] hover:text-white text-[#23466B] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>點選</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#35587E] font-cinzel mb-1.5">
                      備註需求 / 餐點口味客製 / 祝賀留言 (選填)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="例：希望蛋包飯手繪畫莫古力、茶飲溫熱微甜，或紀念日特別留言等..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#CBDDEB] text-[#1C3A5A] placeholder-[#8BA4BD] text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#528AC0] shadow-2xs"
                    />
                  </div>
                </motion.div>
              )}

              {/* ========================================================= */}
              {/* STEP 4: REVIEW & CONFIRMATION */}
              {/* ========================================================= */}
              {currentStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="text-center pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                      Step 4: Final Confirmation
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold font-serif-tc text-[#173351] mt-2">
                      請核對您的入席預約明細
                    </h3>
                  </div>

                  {/* Summary Card */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-[#F5F9FD] via-white to-[#EAF2F8] border border-[#BFD6E8] shadow-2xs space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#D8E6F2]">
                      <div>
                        <span className="text-xs text-[#5D7E9F]">預約日期與時段：</span>
                        <div className="text-base font-bold text-[#1A3858] font-serif-tc mt-0.5">
                          {selectedDate} {selectedTimeSlot}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-[#5D7E9F]">專屬指名侍從：</span>
                        <div className="text-base font-bold text-[#23466B] font-serif-tc mt-0.5 flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>
                            {selectedStaff === '不指名'
                              ? '不指名 (館內隨機安排)'
                              : `${selectedStaff}（專屬侍從）`}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-[#5D7E9F]">主人尊稱與人數：</span>
                        <div className="text-base font-bold text-[#1A3858] font-serif-tc mt-0.5">
                          {customerName}（共 {guestCount} 位）
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-[#5D7E9F]">所屬伺服器：</span>
                        <div className="text-base font-bold text-[#1A3858] mt-0.5">
                          {worldServer}
                        </div>
                      </div>
                    </div>

                    {/* Pre-ordered items summary */}
                    <div>
                      <span className="text-xs text-[#5D7E9F]">優先預選餐點：</span>
                      {selectedDishes.length > 0 ? (
                        <div className="mt-1 p-3 rounded-2xl bg-white border border-[#CBDDEB] space-y-1.5">
                          <div className="flex flex-wrap gap-2">
                            {selectedDishes.map((dish) => (
                              <span
                                key={dish.name}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#EEF5FB] text-[#23466B] text-xs font-bold border border-[#D0E0EE]"
                              >
                                <span>{dish.name}</span>
                                <span className="text-[#5B7E9E]">x{dish.quantity}</span>
                                <span className="text-[11px] text-[#23466B]">
                                  ({(dish.price * dish.quantity).toLocaleString()} Gil)
                                </span>
                              </span>
                            ))}
                          </div>
                          <div className="text-right text-xs font-bold text-[#23466B] pt-1">
                            預選餐點合計：{totalGil.toLocaleString()} Gil
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs font-medium text-[#6484A2] mt-0.5">
                          未預選餐點（入席後現場向女僕點餐）
                        </p>
                      )}
                    </div>

                    {specialRequests && (
                      <div className="pt-2 border-t border-[#DCE8F3] text-xs">
                        <span className="text-[#5D7E9F]">特別備註需求：</span>
                        <p className="text-[#203D5B] font-medium mt-0.5 italic">"{specialRequests}"</p>
                      </div>
                    )}
                  </div>

                  {/* Cafe Etiquette Reminder */}
                  <div className="p-4 rounded-2xl bg-[#EBF3FA] border border-[#CADDEC] text-xs text-[#476787] flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#2C5279] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#193B5D]">夜蒔館預約守則：</strong>
                      <span className="ml-1">
                        送出預約後將為您保留專屬桌位與侍從時段。若需更改時段，可在營業日前一天向女僕或執事告知。請保持紳士淑女禮儀，夜蒔館願為您提供最安心舒心的庇護所。
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STEP NAVIGATION BUTTONS (FOOTER OF WIZARD) */}
            <div className="mt-8 sm:mt-10 pt-5 border-t border-[#DDE7F0] flex items-center justify-between gap-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-[#F2F6FA] text-[#34597E] border border-[#CBDDEB] text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>上一步</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-7 py-2.5 rounded-2xl bg-[#23466B] hover:bg-[#183654] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <span>
                    {currentStep === 3 && selectedDishes.length === 0 ? '跳過點餐 / 下一步' : '下一步'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#21456A] via-[#2F5A85] to-[#21456A] hover:from-[#183654] hover:to-[#22486E] disabled:opacity-75 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-black tracking-wide flex items-center gap-2 shadow-[0_4px_16px_rgba(35,70,107,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                      <span>正在同步傳送至 Discord...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>正式送出預約 (確立入席)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SUCCESS ANIMATION & THANK-YOU DIALOG MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showThankYouModal && confirmedReservation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setShowThankYouModal(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 20 }}
              transition={{ type: 'spring', damping: 24, stiffness: 320 }}
              className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#1E3B5C] via-[#23466B] to-[#172E47] text-white p-6 sm:p-8 shadow-[0_25px_70px_rgba(10,25,45,0.45)] border border-[#527DA8] z-10 overflow-hidden my-8"
            >
              {/* Background celebration glow & floating ambient particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-[#70A8DB]/25 rounded-full blur-3xl" />

                {/* Floating animated sparkles & hearts */}
                {[
                  { top: '10%', left: '8%', delay: 0, icon: '✨' },
                  { top: '18%', right: '12%', delay: 0.3, icon: '🌟' },
                  { top: '65%', left: '6%', delay: 0.6, icon: '💖' },
                  { top: '75%', right: '10%', delay: 0.9, icon: '✨' },
                  { top: '40%', right: '6%', delay: 0.4, icon: '🌸' },
                ].map((particle, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: [0.4, 1, 0.4],
                      y: [-8, 8, -8],
                      rotate: [-10, 10, -10],
                    }}
                    transition={{
                      duration: 3 + idx * 0.5,
                      repeat: Infinity,
                      delay: particle.delay,
                      ease: 'easeInOut',
                    }}
                    style={{
                      top: particle.top,
                      left: particle.left,
                      right: particle.right,
                    }}
                    className="absolute text-lg sm:text-xl filter drop-shadow"
                  >
                    {particle.icon}
                  </motion.span>
                ))}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  playChime(0.9);
                  setShowThankYouModal(false);
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/75 hover:text-white transition-colors cursor-pointer z-20"
                title="關閉"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10 space-y-5 text-center sm:text-left">
                {/* Success Header Pill */}
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-bold font-cinzel tracking-wider flex items-center gap-1.5 shadow-2xs"
                  >
                    <PartyPopper className="w-3.5 h-3.5 text-amber-300" />
                    <span>Reservation Successful・預約確立</span>
                  </motion.div>
                </div>

                {/* Main Heading & Animated Success Badge */}
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.15 }}
                    className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-[#142A42] flex items-center justify-center shadow-[0_8px_20px_rgba(245,158,11,0.35)]"
                  >
                    <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                  </motion.div>
                  <h3 className="text-2xl sm:text-3xl font-black font-serif-tc text-white tracking-wide">
                    感謝主人預約歸館！
                  </h3>
                  <p className="text-xs sm:text-sm text-[#B7D4EE] mt-1 font-medium">
                    您的席位與侍從侍奉時段已妥善保留於星夜紀錄簿中
                  </p>
                </div>

                {/* Maid In-Character Thank You Message */}
                {(() => {
                  const maidNote = getPersonalizedMaidMessage(
                    confirmedReservation.staffName,
                    confirmedReservation.customerName
                  );
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.25 }}
                      className="p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs text-left relative overflow-hidden"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative shrink-0">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-300 shadow-xs bg-white flex items-center justify-center">
                            {maidNote.avatarSeed ? (
                              <StaffAvatar
                                seed={maidNote.avatarSeed}
                                avatarUrl={maidNote.photoUrl}
                                size="md"
                                className="w-full h-full"
                              />
                            ) : (
                              <Sparkles className="w-6 h-6 text-[#23466B]" />
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-[#142A42] flex items-center justify-center text-[10px] shadow-2xs font-bold">
                            ❤️
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm sm:text-base text-white font-serif-tc">
                              {maidNote.speaker}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#A9CCE9] flex items-center gap-1 mt-0.5">
                            <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                            <span>侍從的感謝私語</span>
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[#E2EEF8] font-medium leading-relaxed bg-black/20 p-3 rounded-xl border border-white/10 italic">
                        {maidNote.quote}
                      </p>
                    </motion.div>
                  );
                })()}

                {/* Reservation Summary Mini Ticket */}
                <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 text-xs space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-[#A2C4E3]">預約識別代碼：</span>
                    <span className="font-mono font-bold text-amber-300 tracking-wider">
                      {confirmedReservation.id}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs">
                    <div>
                      <span className="text-[#88AFD4]">日期與時段：</span>
                      <div className="text-white font-bold font-mono mt-0.5">
                        {confirmedReservation.date} {confirmedReservation.timeSlot}
                      </div>
                    </div>
                    <div>
                      <span className="text-[#88AFD4]">指定侍從：</span>
                      <div className="text-amber-200 font-bold font-serif-tc mt-0.5">
                        {confirmedReservation.staffName}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dialog Buttons */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      playChime(1.1);
                      setShowThankYouModal(false);
                    }}
                    className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#142A42] font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(245,158,11,0.35)] transition-all cursor-pointer"
                  >
                    <span>查看預約憑證</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
