import { useState, useEffect, useMemo, useRef } from 'react';
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
import {
  getUpcomingCafeOpenDates,
  formatToYMDWithWeekday,
  CLOSED_RESERVATION_DATES,
  isClosedReservationDate,
} from '../utils/dateUtils';
import {
  DESIGNATED_CHAT_SERVICE_NAME,
  MINIMUM_SPEND_PER_GUEST,
  type ReservationItemCategory,
  calculateDesignatedChatUnitPrice,
  calculateReservationTotalGil,
  calculateSpecialServiceSummary,
} from '../../api/_lib/reservationPricing';

function createReservationRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `req-${crypto.randomUUID()}`;
  }
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

interface ReservationSectionProps {
  initialStaffName?: string;
  initialDate?: string;
  onNavigateToMenu?: () => void;
  onNavigateToStaff?: () => void;
  onNavigateToFaq?: () => void;
}

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

interface PreOrderCategoryItem {
  id: string;
  name: string;
  category: ReservationItemCategory;
  price: number;
  desc: string;
  tag?: string;
  staffSeed?: string;
  minQty?: number;
  maxQty?: number;
  disabled?: boolean;
  disabledLabel?: string;
}

interface PreOrderCategory {
  category: string;
  items: PreOrderCategoryItem[];
}

const SPECIAL_SERVICE_ITEMS: PreOrderCategoryItem[] = [
  {
    id: 'srv-designated-chat',
    name: '指名聊天服務',
    category: 'service',
    price: 200000,
    desc: '一節 20 分鐘・最多兩節（由專屬指名侍從與您單獨互動談心，可依需求選填）',
    tag: '選填・一節 20 分鐘・最多兩節',
    minQty: 0,
    maxQty: 2,
  },
  {
    id: 'srv-photo-session',
    name: '純拍照留影',
    category: 'service',
    price: 100000,
    desc: '與心儀的女僕或執事於店內特色角落合影紀念（Gpose / 拍立得動作）',
  },
  {
    id: 'srv-signature-drawing',
    name: '簽繪',
    category: 'service',
    price: 200000,
    desc: '此次營業兩日（11/20、11/21）暫不開放簽繪服務，敬請見諒。',
    tag: '不開放',
    disabled: true,
    disabledLabel: '不開放',
  },
  {
    id: 'srv-omurice-magic',
    name: '蛋包飯魔法',
    category: 'service',
    price: 20000,
    desc: '桌邊施放專屬美味魔法咒語與手繪互動（本項目不包含在低消內）',
    tag: '不包含在低消內',
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
        photoUrl: '/staff/luko-avatar.png',
        quote: `「主人 ${name}，歡迎回來。您的席位已精心登記妥當。今夜就請放慢腳步，放下旅途所有風塵與疲憊，璐可會為您沏上一壺溫熱甘甜的茶，靜候您的歸來。」`,
        badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      };
    case '栗栗':
    case '栗栗皆辛苦':
      return {
        speaker: '栗栗',
        avatarSeed: 'kurikuri',
        photoUrl: 'https://i.meee.com.tw/BM36fwZ.webp',
        quote: `「哼哼～主人 ${name}！小公主才、才沒有在時鐘前倒數等著你來呢！……不過既然你都特地指名本公主了，那天我就勉為其難好好陪你聊聊天、吃好吃的瑪黛茶餅乾吧，可絕對不能遲到喔！」`,
        badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
      };
    case '薯泥勇者':
      return {
        speaker: '薯泥勇者（執事）',
        avatarSeed: 'potatobrave',
        photoUrl: 'https://i.meee.com.tw/0ca30OC.png',
        quote: `「歡迎回來，我的主人 ${name}。剩下的時間請放心交給我吧。不用急著找到所有問題的答案，我已備好現烤熱騰騰的蜂蜜瑪芬，先陪您嚐點甜的。」`,
        badgeColor: 'bg-amber-950/10 text-[#30211B] border-[#30211B]/30',
      };
    case '陰濕男鬼':
      return {
        speaker: '陰濕男鬼（執事）',
        avatarSeed: 'yinshi',
        photoUrl: 'https://i.meee.com.tw/E34aApf.png',
        quote: `「很不高興為主人 ${name} 服務……席位與時段已登記妥當。我熬了一鍋南瓜濃湯，您若賞臉就喝一碗吧，本店是不會催促您的步調的。」`,
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      };
    case '翹屁嫩兔':
      return {
        speaker: '翹屁嫩兔（執事）',
        avatarSeed: 'ptowo',
        photoUrl: '/staff/ptowo-avatar.png',
        quote: `「⋯⋯歡、歡迎回來，主人 ${name}。預約已為您確認好了⋯⋯請、請不用太在意我緊張⋯⋯剛烤好的章魚燒很香，我會安靜地在您身邊陪伴您的。」`,
        badgeColor: 'bg-lime-100 text-lime-800 border-lime-200',
      };
    case '花鳴威':
      return {
        speaker: '花鳴威（執事）',
        avatarSeed: 'fuwaway',
        photoUrl: '/staff/fuwaway-avatar.png',
        quote: `「主、主人 ${name} 晚上好，歡迎回來⋯⋯預約已經記錄下來了。我幫您備好了溫暖的茶點與特調仙子莓茶，一起放鬆一下，好嗎？」`,
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    case '安海瑟薇大力':
      return {
        speaker: '安海瑟薇大力（女僕）',
        avatarSeed: 'anne',
        photoUrl: '/staff/anne-avatar.png',
        quote: `「主人 ${name} 終於回來了！歡迎歸宅～能夠見到您，瞬間又充滿活力了，嘻嘻☆ 天冷的時候就該來喝杯暖呼呼的馬薩拉奶茶，小安已經幫您備好了喔！」`,
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      };
    case '焚楓':
      return {
        speaker: '焚楓（女僕）',
        avatarSeed: 'maple',
        photoUrl: '/staff/maple-avatar.png',
        quote: `「今天也辛苦了！努力生活的主人 ${name} 今日依舊耀眼！小楓已經把您的席位記下來囉～快來夜蒔館好好休息，我也會為您準備庫爾扎斯仙女蘋果烤出的最香蘋果塔(ゝ∀・)b」`,
        badgeColor: 'bg-red-100 text-red-900 border-red-200',
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

  // Dynamic upcoming open dates with explicit YYYY/MM/DD
  const upcomingOpenDates = useMemo(() => getUpcomingCafeOpenDates(8), []);

  // Form Fields - Step 1
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (initialDate) {
      const formatted = formatToYMDWithWeekday(initialDate);
      if (!isClosedReservationDate(formatted)) return formatted;
    }
    return (
      upcomingOpenDates.find((d) => !CLOSED_RESERVATION_DATES.has(d.rawDate))?.value ||
      '2026/11/20 (週五)'
    );
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState<boolean>(false);
  const [customDateInput, setCustomDateInput] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<string>(() => {
    if (initialStaffName) {
      const matched = STAFF_MEMBERS.find((s) => s.name === initialStaffName);
      if (matched && matched.shiftStatus === 'off_duty') {
        return '不指名';
      }
      return initialStaffName;
    }
    return '不指名';
  });
  const [guestCount, setGuestCount] = useState<number>(1);

  // Form Fields - Step 2
  const [customerName, setCustomerName] = useState<string>('');
  const [worldServer, setWorldServer] = useState<string>('鳳凰 (Phoenix)');
  const [contactMethod, setContactMethod] = useState<string>('');

  // Form Fields - Step 3: Optional Special Services (all services optional; no food/beverage pre-ordering)
  // Store service name -> quantity
  const [selectedDishCounts, setSelectedDishCounts] = useState<Record<string, number>>({});
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Confirmed booking state
  const [confirmedReservation, setConfirmedReservation] = useState<ReservationData | null>(null);
  // Thank-you dialog modal & success celebration state
  const [showThankYouModal, setShowThankYouModal] = useState<boolean>(false);
  // Submission & idempotency guards
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const submittingRef = useRef<boolean>(false);
  const pendingRequestRef = useRef<{ signature: string; requestId: string } | null>(null);

  // Validation errors
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync initial staff name if prop changes (skip off-duty staff)
  useEffect(() => {
    if (initialStaffName) {
      const matched = STAFF_MEMBERS.find((s) => s.name === initialStaffName);
      if (matched && matched.shiftStatus === 'off_duty') {
        setSelectedStaff('不指名');
      } else {
        setSelectedStaff(initialStaffName);
      }
    }
  }, [initialStaffName]);

  // Sync initial date if prop changes
  useEffect(() => {
    if (initialDate) {
      const formatted = formatToYMDWithWeekday(initialDate);
      if (!isClosedReservationDate(formatted)) {
        setSelectedDate(formatted);
      }
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

  const isDishDisabled = (dishName: string) =>
    SPECIAL_SERVICE_ITEMS.some((item) => item.name === dishName && item.disabled);

  // Dish quantity handlers
  const handleAddDish = (dishName: string, maxQty?: number) => {
    if (isDishDisabled(dishName)) return;
    playChime(1.2);
    setSelectedDishCounts((prev) => {
      const current = prev[dishName] || 0;
      if (typeof maxQty === 'number' && current >= maxQty) {
        return prev;
      }
      return {
        ...prev,
        [dishName]: current + 1,
      };
    });
  };

  const handleSetDishQuantity = (dishName: string, quantity: number) => {
    if (isDishDisabled(dishName)) return;
    playChime(quantity > 0 ? 1.15 : 0.9);
    setValidationError(null);
    setSelectedDishCounts((prev) => {
      if (quantity <= 0) {
        const next = { ...prev };
        delete next[dishName];
        return next;
      }
      return { ...prev, [dishName]: quantity };
    });
  };

  const handleRemoveDish = (dishName: string, minQty?: number) => {
    playChime(0.9);
    setSelectedDishCounts((prev) => {
      const count = prev[dishName] || 0;
      if (typeof minQty === 'number' && count <= minQty) {
        return prev;
      }
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

  const designatedChatUnitPrice = calculateDesignatedChatUnitPrice(guestCount);

  // Convert selected map to active special service items while keeping PreOrderItem[] payload
  // (`selectedDishes`) backwards-compatible for API, Firestore, AdminDashboard & Purin Bot.
  const selectedLineItems = SPECIAL_SERVICE_ITEMS.flatMap((item) => {
    if (item.disabled) return [];
    const qty = selectedDishCounts[item.name] || 0;
    if (qty <= 0) return [];
    return [
      {
        id: item.id,
        name: item.name,
        category: item.category,
        price:
          item.name === DESIGNATED_CHAT_SERVICE_NAME
            ? designatedChatUnitPrice
            : item.price,
        quantity: qty,
      },
    ];
  });

  const selectedDishes: PreOrderItem[] = selectedLineItems.map(({ name, price, quantity }) => ({
    name,
    price,
    quantity,
  }));
  const serviceSummary = calculateSpecialServiceSummary(selectedLineItems, guestCount);
  const specialServiceTotal = serviceSummary.specialServiceTotal;
  const minimumSpendRequired = serviceSummary.minimumSpendRequired;
  const totalDishCount = selectedDishes.reduce((sum, item) => sum + item.quantity, 0);

  const handleNext = () => {
    setValidationError(null);

    // Validate Step 1
    if (currentStep === 1) {
      if (!selectedDate) {
        setValidationError('請選擇預約日期');
        return;
      }
      if (isClosedReservationDate(selectedDate)) {
        setValidationError('下週五（11/27）與下週六（11/28）時段暫不開放預約，請改選其他日期');
        return;
      }
      if (!selectedTimeSlot.trim()) {
        setValidationError('請自行填寫預計入席時段（當日營業時間 23:00~01:00）');
        return;
      }
      if (selectedTimeSlot.trim().length > 32) {
        setValidationError('入席時段請精簡填寫於 32 字元以內');
        return;
      }
      if (!selectedStaff) {
        setValidationError('請選擇專屬指名侍從或不指名選項');
        return;
      }
      const isSelectedStaffOffDuty = STAFF_MEMBERS.some(
        (s) => s.name === selectedStaff && s.shiftStatus === 'off_duty'
      );
      if (isSelectedStaffOffDuty) {
        setValidationError(`${selectedStaff} 目前未值勤，請改選其他侍從或不指名`);
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
    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setValidationError(null);
    playMagicSpell();

    const submissionPayload = {
      date: selectedDate,
      timeSlot: selectedTimeSlot.trim(),
      staffName: selectedStaff,
      guestCount,
      customerName: customerName.trim(),
      worldServer,
      contactMethod: contactMethod.trim(),
      selectedDishes: selectedDishes || [],
      specialRequests: specialRequests.trim(),
    };

    const signature = JSON.stringify(submissionPayload);
    if (!pendingRequestRef.current || pendingRequestRef.current.signature !== signature) {
      pendingRequestRef.current = {
        signature,
        requestId: createReservationRequestId(),
      };
    }
    const requestId = pendingRequestRef.current.requestId;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch('/api/create-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          ...submissionPayload,
        }),
        signal: controller.signal,
      });

      const result = await response.json().catch(() => null);

      if (response.ok && result?.success && result?.reservation) {
        const savedReservation: ReservationData = result.reservation;
        pendingRequestRef.current = null;
        setConfirmedReservation(savedReservation);
        try {
          localStorage.setItem('nocturne_active_reservation', JSON.stringify(savedReservation));
        } catch {
          // Ignore storage unavailability (e.g. private browsing)
        }
        setShowThankYouModal(true);
        window.scrollTo({ top: 80, behavior: 'smooth' });
        return;
      }

      const errorCode = typeof result?.code === 'string' ? result.code : '';
      const serverMessage =
        typeof result?.error === 'string' && result.error.trim()
          ? result.error.trim()
          : `預約伺服器回應異常（HTTP ${response.status}），請稍後再試。`;

      // If requestId cannot be reused (mismatch/invalid), rotate it for the next attempt;
      // for 409 RESERVATION_IN_PROGRESS or 429/5xx, keep the exact same requestId so retry is idempotent.
      if (
        errorCode === 'REQUEST_ID_PAYLOAD_MISMATCH' ||
        errorCode === 'MISSING_REQUEST_ID' ||
        errorCode === 'INVALID_REQUEST_ID'
      ) {
        pendingRequestRef.current = null;
      }

      setValidationError(errorCode ? `${serverMessage}（代碼：${errorCode}）` : serverMessage);
    } catch (apiErr: any) {
      if (apiErr?.name === 'AbortError') {
        setValidationError(
          '等候預約伺服器回應逾時。系統已保留本次請求識別碼，請直接再次點擊「正式送出預約」確認預約結果，不會重複建單。'
        );
      } else {
        setValidationError(
          '無法連線至預約伺服器，請確認網路連線後再次點擊送出。系統已保留本次請求識別碼，不會重複建立預約。'
        );
      }
    } finally {
      clearTimeout(timeoutId);
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleResetReservation = () => {
    playChime(1.0);
    pendingRequestRef.current = null;
    setValidationError(null);
    setConfirmedReservation(null);
    setShowThankYouModal(false);
    try {
      localStorage.removeItem('nocturne_active_reservation');
    } catch {
      // Ignore
    }
    setCurrentStep(1);
    setSelectedTimeSlot('');
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
                      <Calendar className="w-3.5 h-3.5" /> 預約日期 (YYYY/MM/DD)
                    </span>
                    <span className="text-base font-bold text-white font-serif-tc font-mono">
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

                  <div className="space-y-1.5">
                    <div>
                      <strong className="text-white">已預約特別侍奉服務：</strong>{' '}
                      {confirmedReservation.selectedDishes && confirmedReservation.selectedDishes.length > 0 ? (
                        <span className="text-amber-200">
                          {confirmedReservation.selectedDishes
                            .map(
                              (d) =>
                                `${d.name} x${d.quantity}（${(d.price * d.quantity).toLocaleString()} Gil）`
                            )
                            .join('、')}{' '}
                          （特別侍奉服務費用合計：
                          {calculateReservationTotalGil(
                            confirmedReservation.selectedDishes
                          ).toLocaleString()}{' '}
                          Gil）
                        </span>
                      ) : (
                        <span className="text-white/80">
                          未預約特別侍奉服務，餐點與飲品請於入席後現場點選。
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#B5D3EE]">
                      <strong className="text-white">入席低消提醒：</strong>
                      每人最低消費 {MINIMUM_SPEND_PER_GUEST.toLocaleString()} Gil（本次共{' '}
                      {confirmedReservation.guestCount} 位，入席低消門檻{' '}
                      {(
                        Math.max(1, confirmedReservation.guestCount || 1) * MINIMUM_SPEND_PER_GUEST
                      ).toLocaleString()}{' '}
                      Gil；餐點與飲品於入席後現場點選，一般餐飲與夜香花套餐計入低消，特色餐點與特別侍奉服務不計入低消）
                    </p>
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
                  { num: 3, label: '特別服務', sub: 'Services (Optional)' },
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
                  {/* 1.1 Date selection with explicit YYYY/MM/DD */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#35587E] font-cinzel">
                        1. 選擇預約日期 (Reservation Date・YYYY/MM/DD)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                        className="text-xs text-[#285078] hover:text-[#18395C] font-bold flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#3E658E]" />
                        <span>{showCustomDatePicker ? '收合日曆' : '挑選其他日期 (YYYY/MM/DD)'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-[#55789B] mb-2.5">
                      目前開放預約 11/20（五）、11/21（六）時段，下週五、週六（11/27、11/28）暫不開放預約：
                    </p>

                    {/* Quick Date Options with explicit YYYY/MM/DD */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {upcomingOpenDates.slice(0, 4).map((dateOption) => {
                        const isClosed = CLOSED_RESERVATION_DATES.has(dateOption.rawDate);
                        const isSelected = !isClosed && selectedDate === dateOption.value;
                        return (
                          <button
                            key={dateOption.value}
                            type="button"
                            disabled={isClosed}
                            aria-disabled={isClosed}
                            onClick={() => {
                              if (isClosed) return;
                              playChime(1.1);
                              setSelectedDate(dateOption.value);
                              setValidationError(null);
                            }}
                            title={
                              isClosed
                                ? `${dateOption.dateYMD} (${dateOption.weekday}) 暫不開放預約`
                                : `預約 ${dateOption.dateYMD} (${dateOption.weekday})`
                            }
                            className={`p-3 sm:p-3.5 rounded-2xl text-center border transition-all flex flex-col items-center justify-between min-h-[76px] ${
                              isClosed
                                ? 'bg-slate-50/90 text-slate-400 border-slate-200 opacity-75 cursor-not-allowed select-none'
                                : isSelected
                                ? 'bg-[#23466B] text-white border-[#1C3A5A] shadow-xs ring-2 ring-[#70A6D6] cursor-pointer'
                                : 'bg-white hover:bg-[#F3F8FC] text-[#2F5175] border-[#CBDDEB] cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <Calendar
                                className={`w-3.5 h-3.5 ${
                                  isClosed
                                    ? 'text-slate-400'
                                    : isSelected
                                    ? 'text-amber-300'
                                    : 'text-[#4A729A]'
                                }`}
                              />
                              <span className="font-mono text-xs sm:text-sm font-bold tracking-tight">
                                {dateOption.dateYMD}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap justify-center">
                              <span
                                className={`text-xs font-bold ${
                                  isClosed
                                    ? 'text-slate-400'
                                    : isSelected
                                    ? 'text-white'
                                    : 'text-[#1D3C5C]'
                                }`}
                              >
                                ({dateOption.weekday})
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                                  isClosed
                                    ? 'bg-slate-200 text-slate-600'
                                    : isSelected
                                    ? 'bg-white/20 text-amber-200'
                                    : 'bg-[#EBF3FA] text-[#486B8F]'
                                }`}
                              >
                                {isClosed ? `${dateOption.relativeLabel}・不開放` : dateOption.relativeLabel}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* If selectedDate is not among the top 4 (e.g. chosen via custom picker or CalendarSection) */}
                    {!upcomingOpenDates.slice(0, 4).some((d) => d.value === selectedDate) && selectedDate && (
                      <div className="mt-2.5 p-3 rounded-2xl bg-[#EEF5FB] border border-[#BBD5EB] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-xs text-[#204368] font-medium">目前已指定預約日期：</span>
                          <span className="text-xs sm:text-sm font-bold font-mono text-[#143252] bg-white px-2.5 py-0.5 rounded-lg border border-[#CBDDEB]">
                            {selectedDate}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          已選定
                        </span>
                      </div>
                    )}

                    {/* Custom Date Picker Accordion */}
                    <AnimatePresence>
                      {showCustomDatePicker && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 p-4 rounded-2xl bg-white border border-[#CBDDEB] shadow-2xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <label className="block text-xs font-bold text-[#23466B] mb-1">
                                輸入自選預約日期 (西元年月日 YYYY/MM/DD)
                              </label>
                              <p className="text-[11px] text-[#6384A2]">
                                挑選日曆或直接填寫，系統將自動解析為正式 YYYY/MM/DD 格式（11/27、11/28 暫不開放）。
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="date"
                                value={customDateInput}
                                min={upcomingOpenDates[0]?.rawDate || new Date().toISOString().split('T')[0]}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCustomDateInput(val);
                                  if (val) {
                                    if (CLOSED_RESERVATION_DATES.has(val)) {
                                      setValidationError(
                                        '下週五（11/27）與下週六（11/28）時段暫不開放預約，請改選其他日期。'
                                      );
                                      return;
                                    }
                                    const formatted = formatToYMDWithWeekday(val);
                                    setSelectedDate(formatted);
                                    setValidationError(null);
                                  }
                                }}
                                className="px-3 py-2 rounded-xl border border-[#CBDDEB] text-xs font-bold font-mono text-[#18395B] focus:ring-2 focus:ring-[#4878A8] focus:outline-none cursor-pointer bg-[#F8FAFD]"
                              />
                            </div>
                          </div>

                          {/* Extended upcoming open days quick chips */}
                          {upcomingOpenDates.slice(4).filter((d) => !CLOSED_RESERVATION_DATES.has(d.rawDate)).length > 0 && (
                            <div className="pt-2 border-t border-[#E5EEF5]">
                              <span className="text-[11px] text-[#55789B] font-bold block mb-1.5">
                                更多後續開館日快選：
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {upcomingOpenDates
                                  .slice(4)
                                  .filter((d) => !CLOSED_RESERVATION_DATES.has(d.rawDate))
                                  .map((d) => (
                                    <button
                                      key={d.value}
                                      type="button"
                                      onClick={() => {
                                        playChime(1.1);
                                        setSelectedDate(d.value);
                                        setValidationError(null);
                                      }}
                                      className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                                        selectedDate === d.value
                                          ? 'bg-[#23466B] text-white border-[#1B3654]'
                                          : 'bg-[#F2F6FA] hover:bg-[#E2EDF7] text-[#294B6F] border-[#CBDDEB]'
                                      }`}
                                    >
                                      {d.dateYMD} ({d.weekday})
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 1.2 Time Slot manual input */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <label
                        htmlFor="reservation-time-slot"
                        className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#35587E] font-cinzel"
                      >
                        2. 填寫入席時段 (Time Slot) <span className="text-rose-500">*</span>
                      </label>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF5FB] border border-[#CBDDEB] text-xs font-bold text-[#23466B]">
                        <Clock className="w-3.5 h-3.5 text-[#3B648D]" />
                        <span>當日營業時間 23:00~01:00</span>
                      </span>
                    </div>

                    <div className="relative">
                      <Clock className="w-4 h-4 text-[#4A729A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="reservation-time-slot"
                        type="text"
                        maxLength={32}
                        placeholder="請自行填寫預計入席時段（例：23:00、23:30 - 00:30）"
                        value={selectedTimeSlot}
                        onChange={(e) => {
                          setSelectedTimeSlot(e.target.value);
                          setValidationError(null);
                        }}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[#CBDDEB] text-[#1C3A5A] placeholder-[#8BA4BD] text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[#528AC0] shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* 1.3 Guest Count (先選入席人數) */}
                  <div className="space-y-2.5">
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#35587E] font-cinzel">
                      3. 入席人數 (Party Size)
                    </label>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="grid grid-cols-5 gap-2 max-w-lg flex-1 min-w-[280px]">
                        {[1, 2, 3, 4].map((count) => {
                          const isSelected = guestCount === count;
                          return (
                            <button
                              key={count}
                              type="button"
                              onClick={() => {
                                playChime(1.05);
                                setGuestCount(count);
                              }}
                              className={`p-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                isSelected
                                  ? 'bg-[#23466B] text-white border-[#1C3A5A] shadow-xs'
                                  : 'bg-white hover:bg-[#F3F8FC] text-[#2E5074] border-[#CBDDEB]'
                              }`}
                            >
                              <Users className="w-4 h-4 shrink-0" />
                              <span>{count} 位</span>
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => {
                            playChime(1.05);
                            setGuestCount((prev) => (prev >= 5 ? prev : 5));
                          }}
                          className={`p-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            guestCount >= 5
                              ? 'bg-[#23466B] text-white border-[#1C3A5A] shadow-xs'
                              : 'bg-white hover:bg-[#F3F8FC] text-[#2E5074] border-[#CBDDEB]'
                          }`}
                        >
                          <span>{guestCount >= 5 ? `${guestCount} 位` : '5+ 位'}</span>
                        </button>
                      </div>

                      {guestCount >= 5 && (
                        <div className="inline-flex items-center gap-2 bg-white border border-[#CBDDEB] rounded-2xl px-3 py-2 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => {
                              playChime(0.95);
                              setGuestCount((prev) => Math.max(1, prev - 1));
                            }}
                            className="w-7 h-7 rounded-xl bg-[#F0F5FA] hover:bg-[#E1EBF5] text-[#23466B] flex items-center justify-center cursor-pointer"
                            title="減少人數"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="min-w-[3.5rem] text-center text-xs sm:text-sm font-bold text-[#142F4B] font-mono">
                            {guestCount} 位
                          </span>
                          <button
                            type="button"
                            disabled={guestCount >= 20}
                            onClick={() => {
                              playChime(1.05);
                              setGuestCount((prev) => Math.min(20, prev + 1));
                            }}
                            className="w-7 h-7 rounded-xl bg-[#23466B] hover:bg-[#183654] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center cursor-pointer"
                            title="增加人數（最多 20 位）"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-[#4D7094]">
                      ※ 每位客人入席低消 {MINIMUM_SPEND_PER_GUEST.toLocaleString()} Gil（本次共 {guestCount} 位，門檻{' '}
                      <strong className="text-[#1E4064] font-mono">
                        {minimumSpendRequired.toLocaleString()} Gil
                      </strong>
                      ）；若於第 3 步選購「指名聊天服務」，目前 {guestCount} 位為{' '}
                      <strong className="text-[#1E4064] font-mono">
                        {designatedChatUnitPrice.toLocaleString()} Gil / 節
                      </strong>
                      。
                    </p>
                  </div>

                  {/* 1.4 Preferred Staff selection (再選專屬指名) */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#35587E] font-cinzel">
                        4. 專屬指名侍從 (Preferred Staff)
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

                    {/* Options Grid: 1 "不指名" Option + Staff Members */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {/* Option 1: 不指名 */}
                      <div
                        onClick={() => {
                          setSelectedStaff('不指名');
                          setValidationError(null);
                        }}
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

                      {/* Staff Options */}
                      {STAFF_MEMBERS.map((staff) => {
                        const isOffDuty = staff.shiftStatus === 'off_duty';
                        const isSelected = !isOffDuty && selectedStaff === staff.name;
                        return (
                          <div
                            key={staff.id}
                            role="button"
                            aria-disabled={isOffDuty}
                            onClick={() => {
                              if (!isOffDuty) {
                                setSelectedStaff(staff.name);
                                setValidationError(null);
                              }
                            }}
                            title={
                              isOffDuty
                                ? `${staff.name} 目前未值勤，暫不開放點選預約`
                                : `指名 ${staff.name}`
                            }
                            className={`relative p-3.5 sm:p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                              isOffDuty
                                ? 'bg-slate-50/90 text-slate-400 border-slate-200 opacity-75 cursor-not-allowed select-none'
                                : isSelected
                                ? 'bg-gradient-to-b from-[#1E3B5C] to-[#2B527E] text-white border-[#193452] shadow-xs ring-2 ring-[#70A6D6] cursor-pointer'
                                : 'bg-white hover:bg-[#F4F9FD] text-[#2A4C70] border-[#CBDDEB] cursor-pointer'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-[#142A42] flex items-center justify-center shadow-2xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}

                            {/* Staff Avatar */}
                            <div
                              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden mb-2 border-2 border-white shadow-xs bg-white flex items-center justify-center ${
                                isOffDuty ? 'grayscale opacity-75' : ''
                              }`}
                            >
                              <StaffAvatar seed={staff.avatarSeed} avatarUrl={staff.photoUrl} size="lg" className="w-full h-full" />
                            </div>

                            <div>
                              <span className="font-bold text-sm sm:text-base font-serif-tc block">
                                {staff.name}
                              </span>
                              {isOffDuty && (
                                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 border border-slate-300">
                                  未值勤
                                </span>
                              )}
                            </div>
                          </div>
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
              {/* STEP 3: SPECIAL SERVICES ONLY (特別侍奉服務・選填・不提供餐點預點) */}
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <Sparkles className="w-4 h-4 text-[#23466B]" />
                        <h3 className="text-sm sm:text-base font-bold text-[#142F4B] font-serif-tc">
                          特別侍奉服務預約（選填）
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          可跳過・純入席預約
                        </span>
                      </div>
                      <p className="text-xs text-[#5D7E9F] mt-1">
                        本館餐點與飲品皆於入席後現場點選，官網僅提供入席預約與特別侍奉服務預約；若無需加選服務，可直接點擊「下一步」。
                      </p>
                    </div>

                    {totalDishCount > 0 && (
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <span className="text-xs font-bold text-[#23466B] bg-white px-2.5 py-1 rounded-xl border border-[#CBDDEB]">
                          已選 {totalDishCount} 項・{specialServiceTotal.toLocaleString()} Gil
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

                  {/* Concise Minimum Spend Reminder (No progress bar) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF6] border border-amber-200/90 shadow-2xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-sm sm:text-base font-bold text-[#142F4B] font-serif-tc">
                        入席最低消費提醒
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-[#23466B] border border-[#CBDDEB] self-start sm:self-auto">
                        每位客人最低消費 {MINIMUM_SPEND_PER_GUEST.toLocaleString()} Gil
                      </span>
                    </div>
                    <p className="text-xs text-[#476787]">
                      本次預約總人數為 <strong className="text-[#142F4B]">{guestCount} 位</strong>，入席低消門檻為{' '}
                      <strong className="font-mono text-[#142F4B]">
                        {minimumSpendRequired.toLocaleString()} Gil
                      </strong>
                      。
                    </p>
                    <p className="text-[11px] text-[#557494] leading-relaxed">
                      餐點與飲品請於入席後現場點選。一般餐飲與夜香花套餐可計入低消；特色餐點（夜香花套餐除外）及特別侍奉服務不計入低消。
                    </p>
                  </div>

                  {/* Sub-block A: 指名聊天服務 (選填・依總人數計費・最多 2 節) */}
                  {(() => {
                    const chatSessions = selectedDishCounts[DESIGNATED_CHAT_SERVICE_NAME] || 0;
                    const chatUnitPrice = designatedChatUnitPrice;
                    const chatSubtotal = chatUnitPrice * chatSessions;
                    const isUnassigned = selectedStaff === '不指名';
                    return (
                      <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F8FC] border border-[#C6DAEC] space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm sm:text-base text-[#173554] font-serif-tc">
                                指名服務｜指名聊天服務
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#23466B] border border-[#CBDDEB]">
                                選填・一節 20 分鐘・最多兩節
                              </span>
                            </div>
                            <p className="text-xs text-[#55789B] mt-1">
                              依整筆預約總人數（目前 <strong className="text-[#1F4164]">{guestCount} 位</strong>）計費：1 位 200,000 Gil／節，每增加 1 位客人加收 100,000 Gil／節。
                            </p>
                          </div>
                          <div className="shrink-0 text-left sm:text-right">
                            <div>
                              <span className="font-serif font-bold text-base sm:text-lg text-[#1F4164]">
                                {chatUnitPrice.toLocaleString()}
                              </span>
                              <span className="text-xs font-serif text-[#5C7E9F] ml-1">Gil / 節</span>
                            </div>
                            <div className="text-[11px] font-bold text-[#23466B] font-mono">
                              {chatSessions > 0
                                ? `已選 ${chatSessions} 節小計：${chatSubtotal.toLocaleString()} Gil`
                                : '目前未選擇（0 Gil）'}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                          {[
                            {
                              qty: 0,
                              label: '不預約',
                              sub: '僅預約入席・0 Gil',
                            },
                            {
                              qty: 1,
                              label: '1 節',
                              sub: `20 分鐘・${chatUnitPrice.toLocaleString()} Gil`,
                            },
                            {
                              qty: 2,
                              label: '2 節',
                              sub: `40 分鐘・${(chatUnitPrice * 2).toLocaleString()} Gil`,
                            },
                          ].map((opt) => {
                            const isSelected = chatSessions === opt.qty;
                            return (
                              <button
                                key={opt.qty}
                                type="button"
                                onClick={() => handleSetDishQuantity(DESIGNATED_CHAT_SERVICE_NAME, opt.qty)}
                                className={`p-3 sm:p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                                  isSelected
                                    ? 'bg-[#23466B] text-white border-[#1C3A5A] shadow-xs ring-2 ring-[#70A6D6]'
                                    : 'bg-white hover:bg-[#EDF4FB] text-[#2B4E72] border-[#CBDDEB]'
                                }`}
                              >
                                <span className="text-xs sm:text-sm font-bold">{opt.label}</span>
                                <span
                                  className={`text-[10px] sm:text-[11px] mt-0.5 font-mono ${
                                    isSelected ? 'text-amber-200' : 'text-[#5C7E9F]'
                                  }`}
                                >
                                  {opt.sub}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {isUnassigned && chatSessions > 0 && (
                          <p className="text-[11px] font-medium text-[#476787] bg-white/80 border border-[#D4E3F0] rounded-xl px-3 py-2">
                            ※ 您在第 1 步選擇「不指名」，入席時將由館內現場為您安排值勤侍從提供指名聊天服務。
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Sub-block B: 其他特別侍奉服務 */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 pb-1 border-b border-[#D8E6F2]">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#23466B] font-serif">
                        SPECIAL SERVICES・其他特別侍奉服務（選填）
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {SPECIAL_SERVICE_ITEMS.filter((s) => s.id !== 'srv-designated-chat').map((service) => {
                        const isDisabled = Boolean(service.disabled);
                        const count = isDisabled ? 0 : selectedDishCounts[service.name] || 0;
                        const isAdded = count > 0;
                        return (
                          <div
                            key={service.id}
                            aria-disabled={isDisabled}
                            className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                              isDisabled
                                ? 'bg-slate-50/90 border-slate-200 opacity-75 cursor-not-allowed select-none'
                                : isAdded
                                ? 'bg-[#F2F7FB] border-[#23466B] shadow-2xs ring-1 ring-[#23466B]/20'
                                : 'bg-white hover:bg-[#FAFBFD] border-[#CBDDEB]'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span
                                  className={`font-bold text-sm font-serif-tc ${
                                    isDisabled ? 'text-slate-500' : 'text-[#193552]'
                                  }`}
                                >
                                  {service.name}
                                </span>
                                {service.tag && (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                      isDisabled
                                        ? 'bg-slate-200 text-slate-600 border-slate-300'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}
                                  >
                                    {service.tag}
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-[11px] mt-1 leading-relaxed ${
                                  isDisabled ? 'text-slate-500' : 'text-[#6484A2]'
                                }`}
                              >
                                {service.desc}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E6EFF7]">
                              <div className="flex items-baseline gap-1">
                                <span
                                  className={`font-serif font-bold text-sm sm:text-base ${
                                    isDisabled ? 'text-slate-400 line-through' : 'text-[#23466B]'
                                  }`}
                                >
                                  {service.price.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-serif text-[#64748B]">Gil</span>
                              </div>

                              {isDisabled ? (
                                <span className="px-3 py-1 rounded-xl bg-slate-200 text-slate-600 border border-slate-300 text-xs font-bold cursor-not-allowed">
                                  {service.disabledLabel || '不開放'}
                                </span>
                              ) : (
                                <div className="flex items-center gap-1 bg-white border border-[#CBDDEB] rounded-xl p-1 shadow-2xs">
                                  {count > 0 ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveDish(service.name)}
                                        className="w-6 h-6 rounded-lg bg-[#F0F5FA] hover:bg-[#E1EBF5] text-[#23466B] flex items-center justify-center transition-colors cursor-pointer"
                                        title="減少一份"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="w-5 text-center text-xs font-bold text-[#142F4B] font-mono">
                                        {count}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAddDish(service.name, service.maxQty)}
                                        className="w-6 h-6 rounded-lg bg-[#23466B] hover:bg-[#183654] text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="增加一份"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleAddDish(service.name, service.maxQty)}
                                      className="px-2.5 py-1 rounded-lg bg-[#F0F5FA] hover:bg-[#23466B] hover:text-white text-[#23466B] text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>點選</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Special Service Fee Summary */}
                  <div className="p-4 rounded-2xl bg-[#F4F8FC] border border-[#CBDDEB] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-[#23466B]">已預約特別侍奉服務費用</span>
                    {selectedDishes.length > 0 ? (
                      <span className="font-mono font-bold text-sm text-[#142F4B]">
                        {specialServiceTotal.toLocaleString()} Gil
                      </span>
                    ) : (
                      <span className="text-[#557494] font-medium">
                        未預約特別侍奉服務，餐點與飲品請於入席後現場點選。
                      </span>
                    )}
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#35587E] font-cinzel mb-1.5">
                      備註需求 / 祝賀留言 (選填)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="例：紀念日祝賀、希望互動的氛圍，或同行入席特別說明等..."
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
                        <span className="text-xs text-[#5D7E9F]">預約日期與時段 (YYYY/MM/DD)：</span>
                        <div className="text-base font-bold text-[#1A3858] font-serif-tc mt-0.5 flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[#193A5C] bg-[#EEF5FB] px-2 py-0.5 rounded-lg border border-[#CBDDEB] text-sm">
                            {selectedDate}
                          </span>
                          <span className="font-mono text-sm">{selectedTimeSlot}</span>
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

                    {/* Special Services & Fee / Minimum Spend Summary */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-[#5D7E9F]">已預約特別侍奉服務：</span>
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
                                  {dish.name === DESIGNATED_CHAT_SERVICE_NAME && (
                                    <span className="text-[10px] font-semibold text-[#35587E] bg-white px-1.5 py-0.5 rounded-md border border-[#CBDDEB]">
                                      依 {guestCount} 位計費・{dish.price.toLocaleString()}/節
                                    </span>
                                  )}
                                  {dish.name === '蛋包飯魔法' && (
                                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                                      不包含在低消內
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                            <div className="text-right text-xs font-bold text-[#23466B] pt-1">
                              已預約特別侍奉服務費用：{specialServiceTotal.toLocaleString()} Gil
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs font-medium text-[#557494] mt-1 p-3 rounded-2xl bg-white border border-[#CBDDEB]">
                            未預約特別侍奉服務，餐點與飲品請於入席後現場點選。
                          </p>
                        )}
                      </div>

                      {/* Step 4 Fee & Minimum Spend Reminder */}
                      <div className="p-3.5 rounded-2xl border bg-[#FFFDF6] border-amber-200 text-xs space-y-2.5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <div>
                            <span className="text-[#5D7E9F] block text-[11px]">預約總人數</span>
                            <strong className="text-[#173554] font-mono text-sm">
                              {guestCount} 位
                            </strong>
                          </div>
                          <div>
                            <span className="text-[#5D7E9F] block text-[11px]">每人低消</span>
                            <strong className="text-[#173554] font-mono text-sm">
                              {MINIMUM_SPEND_PER_GUEST.toLocaleString()} Gil
                            </strong>
                          </div>
                          <div>
                            <span className="text-[#5D7E9F] block text-[11px]">本次入席低消門檻</span>
                            <strong className="text-[#173554] font-mono text-sm">
                              {minimumSpendRequired.toLocaleString()} Gil
                            </strong>
                          </div>
                          <div>
                            <span className="text-[#5D7E9F] block text-[11px]">特別侍奉服務費用合計</span>
                            <strong className="text-[#173554] font-mono text-sm">
                              {specialServiceTotal.toLocaleString()} Gil
                            </strong>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-black/5 space-y-1 text-[11px] text-[#476787]">
                          <p className="font-medium text-[#203D5B]">
                            餐點與飲品請於入席後現場點選。一般餐飲與夜香花套餐可計入低消；特色餐點（夜香花套餐除外）及特別侍奉服務不計入低消。
                          </p>
                          <p className="text-[#557494]">
                            ※ 低消僅供入席點餐提醒，不阻擋預約建立、不會自動加收，亦不與特別侍奉服務費用合併成應付總額。
                          </p>
                        </div>
                      </div>
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

            {/* Inline Step 4 Error Banner near Submit Button */}
            {currentStep === 4 && validationError && (
              <div className="mt-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-center gap-2">
                <span>⚠️ {validationError}</span>
              </div>
            )}

            {/* STEP NAVIGATION BUTTONS (FOOTER OF WIZARD) */}
            <div className="mt-8 sm:mt-10 pt-5 border-t border-[#DDE7F0] flex items-center justify-between gap-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePrev}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-[#F2F6FA] disabled:opacity-60 disabled:cursor-not-allowed text-[#34597E] border border-[#CBDDEB] text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
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
                    {currentStep === 3 && selectedDishes.length === 0 ? '跳過特別服務 / 下一步' : '下一步'}
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
                      <span>正在確認並建立預約中...</span>
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
