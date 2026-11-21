export const DESIGNATED_CHAT_SERVICE_NAME = '指名聊天服務';
export const DESIGNATED_CHAT_SERVICE_ID = 'srv-designated-chat';
export const SIGNATURE_DRAWING_SERVICE_NAME = '簽繪';
export const SIGNATURE_DRAWING_SERVICE_ID = 'srv-signature-drawing';

export const DESIGNATED_CHAT_BASE_PRICE = 200000;
export const DESIGNATED_CHAT_EXTRA_GUEST_PRICE = 100000;
export const MINIMUM_SPEND_PER_GUEST = 30000;

export type ReservationItemCategory =
  | 'salad'
  | 'entree'
  | 'dessert'
  | 'beverage'
  | 'signature'
  | 'set'
  | 'service';

export interface ReservationCatalogItem {
  id: string;
  name: string;
  category: ReservationItemCategory;
  price: number;
  minimumSpendEligible: boolean;
}

export const RESERVATION_CATALOG_ITEMS: readonly ReservationCatalogItem[] = [
  // SALAD・沙拉輕食
  { id: 'salad-1', name: '無花果沙拉', category: 'salad', price: 10000, minimumSpendEligible: true },
  { id: 'salad-2', name: '番茄沙拉', category: 'salad', price: 10000, minimumSpendEligible: true },
  // MAIN DISHES・飽足主餐
  { id: 'dish-1', name: '元氣蛋包飯', category: 'entree', price: 20000, minimumSpendEligible: true },
  { id: 'dish-2', name: '雞肉奶油麵', category: 'entree', price: 20000, minimumSpendEligible: true },
  { id: 'dish-3', name: '魚子醬三明治', category: 'entree', price: 20000, minimumSpendEligible: true },
  // DESSERTS・甜蜜點心
  { id: 'dessert-1', name: '巧克力奶油蛋糕', category: 'dessert', price: 20000, minimumSpendEligible: true },
  { id: 'dessert-2', name: '無花果餅乾', category: 'dessert', price: 20000, minimumSpendEligible: true },
  { id: 'dessert-3', name: '炸紅白湯圓', category: 'dessert', price: 20000, minimumSpendEligible: true },
  // DRINKS・沁涼飲品與熱茶
  { id: 'drink-1', name: '蜜瓜果汁', category: 'beverage', price: 10000, minimumSpendEligible: true },
  { id: 'drink-2', name: '高山茶', category: 'beverage', price: 10000, minimumSpendEligible: true },
  { id: 'drink-4', name: '抹茶', category: 'beverage', price: 10000, minimumSpendEligible: true },
  // SPECIALTIES・特色餐點 (不列入低消)
  { id: 'spec-1', name: '開心汁', category: 'signature', price: 50000, minimumSpendEligible: false },
  { id: 'spec-2', name: '無花果凍糕', category: 'signature', price: 50000, minimumSpendEligible: false },
  { id: 'spec-3', name: '瑪黛茶餅乾', category: 'signature', price: 50000, minimumSpendEligible: false },
  { id: 'spec-5', name: '蜂蜜瑪芬', category: 'signature', price: 50000, minimumSpendEligible: false },
  { id: 'spec-soup', name: '南瓜濃湯', category: 'signature', price: 50000, minimumSpendEligible: false },
  { id: 'spec-takoyaki', name: '章魚燒', category: 'signature', price: 50000, minimumSpendEligible: false },
  { id: 'spec-berry-tea', name: '仙子莓茶', category: 'signature', price: 50000, minimumSpendEligible: false },
  { id: 'spec-masala-chai', name: '馬薩拉奶茶', category: 'signature', price: 50000, minimumSpendEligible: false },
  { id: 'spec-apple-tart', name: '蘋果塔', category: 'signature', price: 50000, minimumSpendEligible: false },
  // SET・尊榮套餐
  { id: 'spec-6', name: '夜香花套餐', category: 'set', price: 60000, minimumSpendEligible: true },
  // SPECIAL SERVICES・特別侍奉服務 (獨立計費，不列入餐點低消)
  { id: 'srv-designated-chat', name: DESIGNATED_CHAT_SERVICE_NAME, category: 'service', price: DESIGNATED_CHAT_BASE_PRICE, minimumSpendEligible: false },
  { id: 'srv-photo-session', name: '純拍照留影', category: 'service', price: 100000, minimumSpendEligible: false },
  { id: 'srv-omurice-magic', name: '蛋包飯魔法', category: 'service', price: 20000, minimumSpendEligible: false },
];

export const RESERVATION_CATALOG_BY_ID: Readonly<Record<string, ReservationCatalogItem>> =
  Object.fromEntries(RESERVATION_CATALOG_ITEMS.map((item) => [item.id, item]));

export const RESERVATION_CATALOG_BY_NAME: Readonly<Record<string, ReservationCatalogItem>> =
  Object.fromEntries(RESERVATION_CATALOG_ITEMS.map((item) => [item.name, item]));

export const FIXED_RESERVATION_ITEM_PRICES: Readonly<Record<string, number>> = Object.fromEntries(
  RESERVATION_CATALOG_ITEMS.filter((item) => item.id !== DESIGNATED_CHAT_SERVICE_ID).map((item) => [
    item.name,
    item.price,
  ])
);

/**
 * Calculates the per-session unit price (in Gil) for 「指名聊天服務」
 * based on the total reservation party size (`guestCount`):
 * - 1 guest: 200,000 Gil
 * - 2 guests: 300,000 Gil
 * - 3 guests: 400,000 Gil
 * - 4 guests: 500,000 Gil
 * - Each additional guest: +100,000 Gil
 */
export function calculateDesignatedChatUnitPrice(guestCount: number): number {
  const normalizedGuests =
    Number.isFinite(guestCount) && guestCount >= 1 ? Math.trunc(guestCount) : 1;
  return (
    DESIGNATED_CHAT_BASE_PRICE +
    (normalizedGuests - 1) * DESIGNATED_CHAT_EXTRA_GUEST_PRICE
  );
}

/**
 * Returns the authoritative server-side unit price for a menu or service item.
 * Returns null if the item name is not in the active reservation catalog.
 */
export function getAuthoritativeReservationItemUnitPrice(
  itemName: string,
  guestCount: number
): number | null {
  if (itemName === DESIGNATED_CHAT_SERVICE_NAME) {
    return calculateDesignatedChatUnitPrice(guestCount);
  }
  if (Object.prototype.hasOwnProperty.call(FIXED_RESERVATION_ITEM_PRICES, itemName)) {
    return FIXED_RESERVATION_ITEM_PRICES[itemName];
  }
  return null;
}

export function calculateReservationTotalGil(
  items?: ReadonlyArray<{ price: number; quantity: number }> | null
): number {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return items.reduce((sum, item) => {
    const price = Number(item?.price);
    const quantity = Number(item?.quantity);
    if (!Number.isFinite(price) || !Number.isFinite(quantity)) return sum;
    return sum + price * quantity;
  }, 0);
}

export interface MinimumSpendLineItem {
  id?: string;
  name?: string;
  category?: ReservationItemCategory;
  price: number;
  quantity: number;
}

export interface MinimumSpendSummary {
  totalAmount: number;
  minimumSpendEligibleAmount: number;
  minimumSpendRequired: number;
  minimumSpendRemaining: number;
  isMinimumSpendMet: boolean;
  signatureItemsAmount: number;
  serviceItemsAmount: number;
  progressPercent: number;
}

/**
 * Resolves the stable category of an item using its explicit category or stable catalog ID first,
 * falling back to exact canonical catalog name only for legacy payloads without id/category.
 */
export function resolveReservationItemCategory(
  item: Pick<MinimumSpendLineItem, 'id' | 'name' | 'category'>
): ReservationItemCategory | null {
  if (item.category) {
    return item.category;
  }
  if (item.id && Object.prototype.hasOwnProperty.call(RESERVATION_CATALOG_BY_ID, item.id)) {
    return RESERVATION_CATALOG_BY_ID[item.id].category;
  }
  if (item.name && Object.prototype.hasOwnProperty.call(RESERVATION_CATALOG_BY_NAME, item.name)) {
    return RESERVATION_CATALOG_BY_NAME[item.name].category;
  }
  return null;
}

/**
 * Determines whether an item counts toward minimum spend:
 * - Signature specialties (`category === 'signature'`) do NOT count toward minimum spend.
 * - Special interactive services (`category === 'service'`) do NOT count toward minimum spend.
 * - Regular food, desserts, salads, drinks, and sets (`salad`, `entree`, `dessert`, `beverage`, `set`) DO count.
 */
export function isMinimumSpendEligibleItem(
  item: Pick<MinimumSpendLineItem, 'id' | 'name' | 'category'>
): boolean {
  if (item.id && Object.prototype.hasOwnProperty.call(RESERVATION_CATALOG_BY_ID, item.id)) {
    return RESERVATION_CATALOG_BY_ID[item.id].minimumSpendEligible;
  }
  const category = resolveReservationItemCategory(item);
  if (!category) return false;
  return category !== 'signature' && category !== 'service';
}

/**
 * Computes reservation total and minimum spend progress strictly from stable item IDs / categories
 * and per-guest minimum spend rule (30,000 Gil per guest).
 */
export const BOOKABLE_SERVICE_IDS = new Set<string>([
  DESIGNATED_CHAT_SERVICE_ID,
  'srv-photo-session',
  'srv-omurice-magic',
]);

export const BOOKABLE_SERVICE_ITEMS: readonly ReservationCatalogItem[] =
  RESERVATION_CATALOG_ITEMS.filter((item) => BOOKABLE_SERVICE_IDS.has(item.id));

/**
 * Legacy / Menu display ID aliases (e.g. from cafeData.ts) mapped to canonical catalog IDs
 * so manually crafted API requests using menu IDs are cleanly recognized and rejected.
 */
export const CAFE_DATA_ID_ALIASES: Readonly<Record<string, string>> = {
  'fig-salad': 'salad-1',
  'tomato-salad': 'salad-2',
  'genki-omurice': 'dish-1',
  'chicken-cream-pasta': 'dish-2',
  'caviar-sandwich': 'dish-3',
  'chocolate-cream-cake': 'dessert-1',
  'fig-cookies': 'dessert-2',
  'fried-tangyuan': 'dessert-3',
  'melon-juice': 'drink-1',
  'alpine-tea': 'drink-2',
  matcha: 'drink-4',
  'happy-juice': 'spec-1',
  'fig-jelly-cake': 'spec-2',
  'mate-tea-cookies': 'spec-3',
  'honey-muffin': 'spec-5',
  'pumpkin-soup': 'spec-soup',
  takoyaki: 'spec-takoyaki',
  'fairy-berry-tea': 'spec-berry-tea',
  'anne-masala-chai': 'spec-masala-chai',
  'fairy-apple-tart': 'spec-apple-tart',
  'night-jasmine-set': 'spec-6',
  'designated-chat': DESIGNATED_CHAT_SERVICE_ID,
  'photo-session': 'srv-photo-session',
  'signature-drawing': SIGNATURE_DRAWING_SERVICE_ID,
  'omurice-magic': 'srv-omurice-magic',
};

export type BookableServiceResolution =
  | {
      kind: 'ok';
      item: ReservationCatalogItem;
      unitPrice: number;
    }
  | {
      kind: 'disabled_service';
      itemName: string;
    }
  | {
      kind: 'food_preorder_disabled';
      itemName: string;
    }
  | {
      kind: 'unknown';
      label: string;
    };

/**
 * Authoritative resolver for new reservation submissions:
 * - Allows ONLY active bookable special services (`指名聊天服務`, `純拍照留影`, `蛋包飯魔法`)
 * - Explicitly rejects disabled services (`簽繪`)
 * - Explicitly rejects any food/beverage/signature/set item (`FOOD_PREORDER_NOT_ALLOWED`)
 * - Rejects unknown/unrecognized IDs or names
 */
export function resolveAuthoritativeBookableService(
  identifier: { id?: string; name?: string },
  guestCount: number
): BookableServiceResolution {
  const rawId = typeof identifier.id === 'string' ? identifier.id.trim() : '';
  const rawName = typeof identifier.name === 'string' ? identifier.name.trim() : '';

  const canonicalId = rawId
    ? CAFE_DATA_ID_ALIASES[rawId] || rawId
    : '';

  if (
    canonicalId === SIGNATURE_DRAWING_SERVICE_ID ||
    rawName === SIGNATURE_DRAWING_SERVICE_NAME
  ) {
    return { kind: 'disabled_service', itemName: SIGNATURE_DRAWING_SERVICE_NAME };
  }

  const matchedById = canonicalId
    ? RESERVATION_CATALOG_BY_ID[canonicalId]
    : undefined;
  const matchedByName = rawName
    ? RESERVATION_CATALOG_BY_NAME[rawName]
    : undefined;

  if (matchedById && matchedByName && matchedById.id !== matchedByName.id) {
    // ID and name point to different catalog entries — reject tampering/mismatch
    if (matchedById.category !== 'service' || matchedByName.category !== 'service') {
      return {
        kind: 'food_preorder_disabled',
        itemName: matchedById.category !== 'service' ? matchedById.name : matchedByName.name,
      };
    }
    return { kind: 'unknown', label: `${rawName} (${rawId})` };
  }

  const matched = matchedById || matchedByName;
  if (!matched) {
    return { kind: 'unknown', label: rawName || rawId || '(空白項目)' };
  }

  if (matched.category !== 'service') {
    return { kind: 'food_preorder_disabled', itemName: matched.name };
  }

  if (!BOOKABLE_SERVICE_IDS.has(matched.id)) {
    return { kind: 'disabled_service', itemName: matched.name };
  }

  const unitPrice =
    matched.id === DESIGNATED_CHAT_SERVICE_ID
      ? calculateDesignatedChatUnitPrice(guestCount)
      : matched.price;

  return {
    kind: 'ok',
    item: matched,
    unitPrice,
  };
}

export interface SpecialServiceFeeSummary {
  guestCount: number;
  minimumSpendPerGuest: number;
  minimumSpendRequired: number;
  specialServiceTotal: number;
  hasSpecialServices: boolean;
}

export function calculateSpecialServiceSummary(
  items: ReadonlyArray<MinimumSpendLineItem> | null | undefined,
  guestCount: number
): SpecialServiceFeeSummary {
  const normalizedGuests =
    Number.isFinite(guestCount) && guestCount >= 1 ? Math.trunc(guestCount) : 1;
  const minimumSpendRequired = MINIMUM_SPEND_PER_GUEST * normalizedGuests;
  const specialServiceTotal = calculateReservationTotalGil(items);

  return {
    guestCount: normalizedGuests,
    minimumSpendPerGuest: MINIMUM_SPEND_PER_GUEST,
    minimumSpendRequired,
    specialServiceTotal,
    hasSpecialServices: Array.isArray(items) && items.length > 0 && specialServiceTotal >= 0,
  };
}

export function calculateMinimumSpendSummary(
  items: ReadonlyArray<MinimumSpendLineItem> | null | undefined,
  guestCount: number
): MinimumSpendSummary {
  const normalizedGuests =
    Number.isFinite(guestCount) && guestCount >= 1 ? Math.trunc(guestCount) : 1;
  const minimumSpendRequired = MINIMUM_SPEND_PER_GUEST * normalizedGuests;

  let totalAmount = 0;
  let minimumSpendEligibleAmount = 0;
  let signatureItemsAmount = 0;
  let serviceItemsAmount = 0;

  if (Array.isArray(items)) {
    for (const item of items) {
      const price = Number(item?.price);
      const quantity = Number(item?.quantity);
      if (!Number.isFinite(price) || !Number.isFinite(quantity) || price < 0 || quantity <= 0) {
        continue;
      }
      const subtotal = price * quantity;
      totalAmount += subtotal;

      const category = resolveReservationItemCategory(item);
      if (isMinimumSpendEligibleItem(item)) {
        minimumSpendEligibleAmount += subtotal;
      } else if (category === 'signature') {
        signatureItemsAmount += subtotal;
      } else if (category === 'service') {
        serviceItemsAmount += subtotal;
      }
    }
  }

  const minimumSpendRemaining = Math.max(0, minimumSpendRequired - minimumSpendEligibleAmount);
  const isMinimumSpendMet = minimumSpendEligibleAmount >= minimumSpendRequired;
  const progressPercent =
    minimumSpendRequired > 0
      ? Math.min(100, Math.round((minimumSpendEligibleAmount / minimumSpendRequired) * 100))
      : 100;

  return {
    totalAmount,
    minimumSpendEligibleAmount,
    minimumSpendRequired,
    minimumSpendRemaining,
    isMinimumSpendMet,
    signatureItemsAmount,
    serviceItemsAmount,
    progressPercent,
  };
}
