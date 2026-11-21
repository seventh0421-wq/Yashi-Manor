import crypto from 'node:crypto';
import { FieldPath, type Firestore } from 'firebase-admin/firestore';
import { ApiError, sanitizeText } from './firebaseAdmin.js';

function isClosedReservationDate(input: string): boolean {
  if (!input) return false;
  const normalized = input.trim().replace(/\//g, '-');
  return (
    normalized.startsWith('2026-11-27') || normalized.startsWith('2026-11-28')
  );
}

export const COLLECTION_RESERVATIONS = 'reservations';
export const COLLECTION_RESERVATION_REQUESTS = 'reservationRequests';
export const COLLECTION_RESERVATION_COUNTERS = 'reservationCounters';
export const DEFAULT_LEASE_TTL_MS = 30 * 1000;
export const MAX_SEQUENCE_PROBE = 50;

export interface ReservationDishInput {
  name: string;
  price: number;
  quantity: number;
}

export interface NormalizedReservationPayload {
  date: string;
  timeSlot: string;
  staffName: string;
  guestCount: number;
  customerName: string;
  worldServer: string;
  contactMethod: string;
  selectedDishes: ReservationDishInput[];
  specialRequests: string;
}

export interface ReservationRecord extends NormalizedReservationPayload {
  id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  adminNotes: string;
  createdAt: string;
}

export interface ReservationDocRef {
  id: string;
  path: string;
}

export interface ReservationDocSnapshot<T = Record<string, any>> {
  exists: boolean;
  id: string;
  data(): T | undefined;
}

export interface ReservationTransaction {
  get<T = Record<string, any>>(ref: ReservationDocRef): Promise<ReservationDocSnapshot<T>>;
  set(ref: ReservationDocRef, data: Record<string, any>, options?: { merge?: boolean }): void;
  update(ref: ReservationDocRef, data: Record<string, any>): void;
}

export interface ReservationDbAdapter {
  doc(collectionName: string, docId: string): ReservationDocRef;
  findMaxSeqForDatePrefix(dateKey: string): Promise<number>;
  runTransaction<T>(fn: (tx: ReservationTransaction) => Promise<T>): Promise<T>;
}

export interface CreateReservationOptions {
  now?: () => number;
  leaseTtlMs?: number;
  dateKey?: string;
  generateToken?: () => string;
  onBeforeCommit?: () => Promise<void> | void;
}

export interface CreateReservationResult {
  reservation: ReservationRecord;
  idempotentReplay: boolean;
  recoveredFromTimeout: boolean;
}

export function getTaipeiDateKey(nowMs = Date.now()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(nowMs));

  const year = parts.find((p) => p.type === 'year')?.value || '2026';
  const month = parts.find((p) => p.type === 'month')?.value || '01';
  const day = parts.find((p) => p.type === 'day')?.value || '01';
  return `${year}${month}${day}`;
}

export function formatBookingId(dateKey: string, seq: number): string {
  return `${dateKey}-${String(seq).padStart(4, '0')}`;
}

export function parseSequenceFromBookingId(docId: string, dateKey: string): number {
  const match = new RegExp(`^${dateKey}-(\\d+)$`).exec(docId);
  if (!match) return 0;
  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function validateAndNormalizeReservationInput(rawBody: Record<string, any>): {
  requestId: string;
  payload: NormalizedReservationPayload;
  payloadHash: string;
} {
  const rawRequestId = typeof rawBody.requestId === 'string' ? rawBody.requestId.trim() : '';
  if (!rawRequestId) {
    throw new ApiError(
      400,
      '預約表單缺少請求識別碼，請重新整理頁面後再試。',
      'MISSING_REQUEST_ID'
    );
  }
  if (!/^[a-zA-Z0-9_-]{16,64}$/.test(rawRequestId)) {
    throw new ApiError(
      400,
      '預約請求識別碼格式無效，請重新整理頁面後再試。',
      'INVALID_REQUEST_ID'
    );
  }

  const customerName = sanitizeText(rawBody.customerName, false).slice(0, 64);
  if (!customerName) {
    throw new ApiError(400, '請輸入冒險者名稱。', 'INVALID_CUSTOMER_NAME');
  }

  const worldServer = sanitizeText(rawBody.worldServer, false).slice(0, 64);
  if (!worldServer) {
    throw new ApiError(400, '請選擇冒險者伺服器。', 'INVALID_WORLD_SERVER');
  }

  const date = sanitizeText(rawBody.date, false).slice(0, 32);
  if (!date) {
    throw new ApiError(400, '請選擇預約日期。', 'INVALID_DATE');
  }
  if (isClosedReservationDate(date)) {
    throw new ApiError(
      400,
      '下週五（11/27）與下週六（11/28）時段暫不開放預約，請改選其他日期。',
      'RESERVATION_DATE_CLOSED'
    );
  }

  const timeSlot = sanitizeText(rawBody.timeSlot, false).slice(0, 32);
  if (!timeSlot) {
    throw new ApiError(400, '請填寫預計入席時段。', 'INVALID_TIME_SLOT');
  }

  const parsedCount = Number(rawBody.guestCount);
  if (!Number.isInteger(parsedCount) || parsedCount < 1 || parsedCount > 20) {
    throw new ApiError(400, '預約人數需為 1 至 20 之間的整數。', 'INVALID_GUEST_COUNT');
  }

  const staffName = (sanitizeText(rawBody.staffName ?? '不指名', false) || '不指名').slice(0, 64);
  const contactMethod = sanitizeText(rawBody.contactMethod ?? '', false).slice(0, 100);
  const specialRequests = sanitizeText(rawBody.specialRequests ?? '', true).slice(0, 500);

  const selectedDishes: ReservationDishInput[] = [];
  if (Array.isArray(rawBody.selectedDishes)) {
    for (const rawItem of rawBody.selectedDishes.slice(0, 20)) {
      if (!rawItem || typeof rawItem !== 'object') continue;
      const name = sanitizeText((rawItem as any).name, false).slice(0, 64);
      const price = Number((rawItem as any).price);
      const quantity = Number((rawItem as any).quantity);
      if (!name) continue;
      if (name === '簽繪') {
        throw new ApiError(
          400,
          '此次營業兩日暫不開放簽繪服務，請移除該項目後再送出。',
          'SERVICE_NOT_AVAILABLE'
        );
      }
      if (!Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
        throw new ApiError(400, '預選餐點或服務數量格式無效。', 'INVALID_DISH_SELECTION');
      }
      selectedDishes.push({ name, price, quantity });
    }
  }

  const payload: NormalizedReservationPayload = {
    date,
    timeSlot,
    staffName,
    guestCount: parsedCount,
    customerName,
    worldServer,
    contactMethod,
    selectedDishes,
    specialRequests,
  };

  const payloadHash = computeReservationPayloadHash(payload);
  return {
    requestId: rawRequestId,
    payload,
    payloadHash,
  };
}

export function computeReservationPayloadHash(payload: NormalizedReservationPayload): string {
  const canonical = {
    date: payload.date,
    timeSlot: payload.timeSlot,
    staffName: payload.staffName,
    guestCount: payload.guestCount,
    customerName: payload.customerName,
    worldServer: payload.worldServer,
    contactMethod: payload.contactMethod,
    selectedDishes: payload.selectedDishes.map((d) => ({
      name: d.name,
      price: d.price,
      quantity: d.quantity,
    })),
    specialRequests: payload.specialRequests,
  };
  return crypto.createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}

export function createFirestoreReservationDbAdapter(db: Firestore): ReservationDbAdapter {
  return {
    doc(collectionName: string, docId: string): ReservationDocRef {
      return db.collection(collectionName).doc(docId);
    },
    async findMaxSeqForDatePrefix(dateKey: string): Promise<number> {
      const snapshot = await db
        .collection(COLLECTION_RESERVATIONS)
        .where(FieldPath.documentId(), '>=', `${dateKey}-`)
        .where(FieldPath.documentId(), '<=', `${dateKey}-\uf8ff`)
        .select()
        .get();

      let maxSeq = 0;
      for (const docSnap of snapshot.docs) {
        const seq = parseSequenceFromBookingId(docSnap.id, dateKey);
        if (seq > maxSeq) {
          maxSeq = seq;
        }
      }
      return maxSeq;
    },
    async runTransaction<T>(fn: (tx: ReservationTransaction) => Promise<T>): Promise<T> {
      return db.runTransaction(async (firestoreTx) => {
        const wrappedTx: ReservationTransaction = {
          get<D = Record<string, any>>(ref: ReservationDocRef): Promise<ReservationDocSnapshot<D>> {
            return firestoreTx.get(ref as FirebaseFirestore.DocumentReference<D>) as Promise<
              ReservationDocSnapshot<D>
            >;
          },
          set(ref: ReservationDocRef, data: Record<string, any>, options?: { merge?: boolean }) {
            if (options?.merge) {
              firestoreTx.set(ref as FirebaseFirestore.DocumentReference, data, { merge: true });
            } else {
              firestoreTx.set(ref as FirebaseFirestore.DocumentReference, data);
            }
          },
          update(ref: ReservationDocRef, data: Record<string, any>) {
            firestoreTx.update(ref as FirebaseFirestore.DocumentReference, data);
          },
        };
        return fn(wrappedTx);
      });
    },
  };
}

export async function createReservationWithIdempotency(
  db: ReservationDbAdapter,
  input: {
    requestId: string;
    payload: NormalizedReservationPayload;
    payloadHash: string;
  },
  options: CreateReservationOptions = {}
): Promise<CreateReservationResult> {
  const getNow = options.now ?? (() => Date.now());
  const leaseTtlMs = options.leaseTtlMs ?? DEFAULT_LEASE_TTL_MS;
  const generateToken = options.generateToken ?? (() => crypto.randomUUID());

  const startMs = getNow();
  const dateKey = options.dateKey ?? getTaipeiDateKey(startMs);
  const requestRef = db.doc(COLLECTION_RESERVATION_REQUESTS, input.requestId);
  const counterRef = db.doc(COLLECTION_RESERVATION_COUNTERS, dateKey);

  // =========================================================
  // PHASE 1: Acquire or resume idempotency lease (Reads before Writes)
  // =========================================================
  const leaseResult = await db.runTransaction(async (tx) => {
    const now = getNow();
    const nowIso = new Date(now).toISOString();
    const requestSnap = await tx.get<Record<string, any>>(requestRef);

    if (requestSnap.exists) {
      const existing = requestSnap.data() || {};

      if (existing.payloadHash && existing.payloadHash !== input.payloadHash) {
        throw new ApiError(
          409,
          '此請求識別碼已綁定不同預約內容，請重新確認表單後再送出。',
          'REQUEST_ID_PAYLOAD_MISMATCH'
        );
      }

      if (existing.status === 'completed' && typeof existing.bookingId === 'string' && existing.bookingId) {
        const existingResRef = db.doc(COLLECTION_RESERVATIONS, existing.bookingId);
        const existingResSnap = await tx.get<ReservationRecord>(existingResRef);
        const reservation = existingResSnap.exists
          ? existingResSnap.data()
          : (existing.reservationSnapshot as ReservationRecord | undefined);
        if (reservation) {
          return {
            kind: 'already_completed' as const,
            reservation,
            recoveredFromTimeout: false,
          };
        }
      }

      if (existing.status === 'processing') {
        const expiresAt = Number(existing.processingExpiresAt || 0);
        if (now < expiresAt) {
          throw new ApiError(
            409,
            '該筆預約正在處理中，請稍候幾秒後再點擊確認，系統不會重複建單。',
            'RESERVATION_IN_PROGRESS'
          );
        }
      }

      // Recover expired 'processing' lease or retry after 'failed'
      const recoveredFromTimeout = existing.status === 'processing';
      const processingToken = generateToken();
      tx.set(
        requestRef,
        {
          requestId: input.requestId,
          status: 'processing',
          payloadHash: input.payloadHash,
          processingToken,
          processingExpiresAt: now + leaseTtlMs,
          attemptCount: Number(existing.attemptCount || 0) + 1,
          createdAt: existing.createdAt || nowIso,
          updatedAt: nowIso,
        },
        { merge: true }
      );
      return {
        kind: 'acquired' as const,
        processingToken,
        recoveredFromTimeout,
      };
    }

    // First attempt for this requestId
    const processingToken = generateToken();
    tx.set(requestRef, {
      requestId: input.requestId,
      status: 'processing',
      payloadHash: input.payloadHash,
      processingToken,
      processingExpiresAt: now + leaseTtlMs,
      attemptCount: 1,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    return {
      kind: 'acquired' as const,
      processingToken,
      recoveredFromTimeout: false,
    };
  });

  if (leaseResult.kind === 'already_completed') {
    return {
      reservation: leaseResult.reservation,
      idempotentReplay: true,
      recoveredFromTimeout: false,
    };
  }

  const { processingToken, recoveredFromTimeout } = leaseResult;

  try {
    if (options.onBeforeCommit) {
      await options.onBeforeCommit();
    }

    // Pre-scan max existing sequence on this date so we never collide with historical IDs (e.g. YYYYMMDD-01 or manually created docs)
    const maxHistoricalSeq = await db.findMaxSeqForDatePrefix(dateKey);

    // =========================================================
    // PHASE 2: Atomic sequence allocation + reservation creation + lock completion
    // Strict Firestore Transaction invariant: ALL reads before ANY writes!
    // =========================================================
    const commitResult = await db.runTransaction(async (tx) => {
      const now = getNow();
      const nowIso = new Date(now).toISOString();

      // Read 1: Re-verify lease ownership & payloadHash
      const requestSnap = await tx.get<Record<string, any>>(requestRef);
      if (!requestSnap.exists) {
        throw new ApiError(
          409,
          '預約請求鎖定狀態已失效，請重新送出。',
          'RESERVATION_LEASE_LOST'
        );
      }

      const reqData = requestSnap.data() || {};
      if (reqData.payloadHash && reqData.payloadHash !== input.payloadHash) {
        throw new ApiError(
          409,
          '此請求識別碼已綁定不同預約內容，請重新確認表單後再送出。',
          'REQUEST_ID_PAYLOAD_MISMATCH'
        );
      }

      if (reqData.status === 'completed' && typeof reqData.bookingId === 'string' && reqData.bookingId) {
        const existingResRef = db.doc(COLLECTION_RESERVATIONS, reqData.bookingId);
        const existingResSnap = await tx.get<ReservationRecord>(existingResRef);
        const reservation = existingResSnap.exists
          ? existingResSnap.data()
          : (reqData.reservationSnapshot as ReservationRecord | undefined);
        if (reservation) {
          return {
            reservation,
            idempotentReplay: true,
          };
        }
      }

      if (reqData.status !== 'processing' || reqData.processingToken !== processingToken) {
        throw new ApiError(
          409,
          '此筆預約已逾時並由新的請求接手處理中，請稍候再試。',
          'RESERVATION_LEASE_LOST'
        );
      }

      // Read 2: Read daily counter
      const counterSnap = await tx.get<Record<string, any>>(counterRef);
      const counterLastSeq = counterSnap.exists ? Number(counterSnap.data()?.lastSeq || 0) : 0;
      const startSeq = Math.max(counterLastSeq, maxHistoricalSeq) + 1;

      // Read 3..N: Probe candidate reservation document IDs until we find an unused slot
      let allocatedSeq = 0;
      let bookingId = '';
      let targetReservationRef: ReservationDocRef | null = null;

      for (let i = 0; i < MAX_SEQUENCE_PROBE; i++) {
        const candidateSeq = startSeq + i;
        const candidateId = formatBookingId(dateKey, candidateSeq);
        const candidateRef = db.doc(COLLECTION_RESERVATIONS, candidateId);
        const candidateSnap = await tx.get(candidateRef);
        if (!candidateSnap.exists) {
          allocatedSeq = candidateSeq;
          bookingId = candidateId;
          targetReservationRef = candidateRef;
          break;
        }
      }

      if (!targetReservationRef || !bookingId || allocatedSeq <= 0) {
        throw new ApiError(
          503,
          '目前預約編號分配忙碌中，請稍後再試。',
          'SEQUENCE_ALLOCATION_EXHAUSTED'
        );
      }

      const reservationData: ReservationRecord = {
        id: bookingId,
        date: input.payload.date,
        timeSlot: input.payload.timeSlot,
        staffName: input.payload.staffName,
        guestCount: input.payload.guestCount,
        customerName: input.payload.customerName,
        worldServer: input.payload.worldServer,
        contactMethod: input.payload.contactMethod,
        selectedDishes: input.payload.selectedDishes,
        specialRequests: input.payload.specialRequests,
        status: 'pending',
        adminNotes: '',
        createdAt: nowIso,
      };

      // ALL WRITES ONLY AFTER ALL READS HAVE COMPLETED
      tx.set(
        counterRef,
        {
          dateKey,
          lastSeq: allocatedSeq,
          updatedAt: nowIso,
        },
        { merge: true }
      );

      tx.set(targetReservationRef, reservationData);

      tx.update(requestRef, {
        status: 'completed',
        bookingId,
        reservationSnapshot: reservationData,
        processingToken: null,
        processingExpiresAt: null,
        completedAt: nowIso,
        updatedAt: nowIso,
      });

      return {
        reservation: reservationData,
        idempotentReplay: false,
      };
    });

    return {
      reservation: commitResult.reservation,
      idempotentReplay: commitResult.idempotentReplay,
      recoveredFromTimeout,
    };
  } catch (err) {
    // Do NOT clear the lock if this worker simply lost a race/lease to another active worker
    if (
      err instanceof ApiError &&
      (err.code === 'RESERVATION_LEASE_LOST' ||
        err.code === 'RESERVATION_IN_PROGRESS' ||
        err.code === 'REQUEST_ID_PAYLOAD_MISMATCH')
    ) {
      throw err;
    }

    // Best-effort release so transient failure does not keep the guest locked out for LEASE_TTL_MS
    try {
      await db.runTransaction(async (tx) => {
        const nowIso = new Date(getNow()).toISOString();
        const requestSnap = await tx.get<Record<string, any>>(requestRef);
        if (!requestSnap.exists) return;
        const reqData = requestSnap.data() || {};
        if (reqData.status === 'processing' && reqData.processingToken === processingToken) {
          tx.update(requestRef, {
            status: 'failed',
            processingToken: null,
            processingExpiresAt: null,
            lastError: err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200),
            updatedAt: nowIso,
          });
        }
      });
    } catch {
      // If cleanup itself fails, lease TTL guarantees automatic recovery after LEASE_TTL_MS
    }

    throw err;
  }
}
