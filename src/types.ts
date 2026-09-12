export type PageTab = 'home' | 'about' | 'staff' | 'menu' | 'location' | 'faq' | 'reservation';

export interface PreOrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface ReservationData {
  id: string;
  date: string;
  timeSlot: string;
  staffName: string;
  guestCount: number;
  customerName: string;
  worldServer: string;
  contactMethod: string;
  selectedDishes?: PreOrderItem[];
  specialRequests?: string;
  createdAt: string;
  isFirstVisit?: boolean;
  interactionStyle?: 'immersive_rp' | 'casual_chat' | 'quiet_reading';
  welcomeDrink?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  jpName?: string;
  role: 'maid' | 'butler';
  title: string;
  threadsHandle: string;
  threadsUrl: string;
  quote: string;
  personality: string;
  intro: string;
  services: string[];
  ff14Job: string;
  favoriteDrink: string;
  recommendedDish?: string;
  recommendationQuote?: string;
  recommendationNote?: string;
  avatarSeed: string;
  photoUrl?: string;
  themeColor: string;
  greetingVoiceLine: string;
  tags: string[];
  shiftStatus?: 'available' | 'busy';
}

export interface MenuItem {
  id: string;
  name: string;
  jpName?: string;
  category: 'signature' | 'entree' | 'beverage' | 'dessert' | 'salad' | 'service';
  price: number; // in Gil
  description: string;
  rpFeature: string; // RP 特色
  isSpicy?: boolean;
  isCold?: boolean;
  recommendedStaff?: string;
  imageIcon: string;
}

export interface GuestbookEntry {
  id: string;
  characterName: string;
  server: string;
  message: string;
  favoriteStaff: string;
  date: string;
  stamp: string;
}

export interface SpecialEvent {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  tag: string;
  description: string;
  perks: string[];
  isFeatured?: boolean;
}

export interface DutyScheduleDay {
  date: string; // 'YYYY-MM-DD'
  year: number;
  month: number; // 1-12
  day: number;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  isOpen: boolean;
  businessHours: string; // e.g. "20:30 - 24:00"
  themeTitle?: string;
  specialTag?: string;
  dutyStaffIds: string[]; // list of staff ids on duty
  note?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'reservation' | 'spend' | 'rules' | 'general';
  highlight?: string;
}

