import {
  ALLOWED_BADGES,
  ApiError,
  codePointLength,
  getAdminFirestore,
  getTrustedClientIp,
  handleApiError,
  hashGuestbookContent,
  hashSourceIp,
  parseJsonBody,
  sanitizeText,
  verifyOptionalAppCheck,
} from './_lib/firebaseAdmin';

const COLLECTION_MESSAGES = 'guestbookMessages';
const COLLECTION_RATE_LIMITS = 'guestbookRateLimits';
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 20;
const COOLDOWN_MS = 60 * 1000; // 1 message per 60 seconds
const HOURLY_WINDOW_MS = 60 * 60 * 1000; // max 5 messages per hour
const HOURLY_MAX_COUNT = 5;
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // reject identical duplicate content within 5 mins

function toPublicEntry(docSnap: FirebaseFirestore.DocumentSnapshot) {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    characterName: String(data.characterName || ''),
    server: String(data.server || ''),
    favoriteMaid: String(data.favoriteMaid || ''),
    badge: String(data.badge || '✨'),
    message: String(data.message || ''),
    createdAt: String(data.createdAt || ''),
    status: 'published' as const,
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Firebase-AppCheck');
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const db = getAdminFirestore();
      const rawLimit = Number(req.query?.limit ?? DEFAULT_PAGE_SIZE);
      const pageSize =
        Number.isFinite(rawLimit) && rawLimit >= 1
          ? Math.min(Math.floor(rawLimit), MAX_PAGE_SIZE)
          : DEFAULT_PAGE_SIZE;

      const rawCursor = typeof req.query?.cursor === 'string' ? req.query.cursor.trim() : '';

      const colRef = db.collection(COLLECTION_MESSAGES);
      let queryRef = colRef
        .where('status', '==', 'published')
        .orderBy('createdAt', 'desc');

      if (rawCursor) {
        if (!/^[a-zA-Z0-9_-]{1,64}$/.test(rawCursor)) {
          throw new ApiError(400, '無效的分頁游標參數。', 'INVALID_CURSOR');
        }
        const cursorSnap = await colRef.doc(rawCursor).get();
        // Only paginate from an existing published document (never reveal hidden doc positions)
        if (cursorSnap.exists && cursorSnap.data()?.status === 'published') {
          queryRef = queryRef.startAfter(cursorSnap);
        }
      }

      const snapshot = await queryRef.limit(pageSize + 1).get();
      const hasMore = snapshot.docs.length > pageSize;
      const pageDocs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;
      const items = pageDocs.map(toPublicEntry);
      const nextCursor = hasMore && pageDocs.length > 0 ? pageDocs[pageDocs.length - 1].id : null;

      return res.status(200).json({
        success: true,
        items,
        hasMore,
        nextCursor,
      });
    }

    if (req.method === 'POST') {
      await verifyOptionalAppCheck(req);

      const body = parseJsonBody(req);
      const characterName = sanitizeText(body.characterName, false);
      const server = sanitizeText(body.server, false);
      const favoriteMaid = sanitizeText(body.favoriteMaid ?? '', false);
      const badge = typeof body.badge === 'string' ? body.badge.trim() : '';
      const message = sanitizeText(body.message, true);
      const requestId =
        typeof body.requestId === 'string' ? body.requestId.trim().slice(0, 64) : '';

      // 1. Validate required fields & lengths
      const nameLen = codePointLength(characterName);
      if (nameLen < 2 || nameLen > 40) {
        throw new ApiError(400, '角色名稱 (ID) 需為 2 至 40 個字元。', 'INVALID_CHARACTER_NAME');
      }

      const serverLen = codePointLength(server);
      if (serverLen < 1 || serverLen > 32) {
        throw new ApiError(400, '請填寫所屬伺服器（最多 32 字元）。', 'INVALID_SERVER');
      }

      if (codePointLength(favoriteMaid) > 40) {
        throw new ApiError(400, '喜愛侍從欄位長度過長。', 'INVALID_FAVORITE_MAID');
      }

      if (!(ALLOWED_BADGES as readonly string[]).includes(badge)) {
        throw new ApiError(400, '請選擇有效的留念小徽章。', 'INVALID_BADGE');
      }

      const msgLen = codePointLength(message);
      if (msgLen < 1 || msgLen > 300) {
        throw new ApiError(400, '留言內容為必填，且需在 1 至 300 個字元內。', 'INVALID_MESSAGE');
      }

      const db = getAdminFirestore();
      const trustedIp = getTrustedClientIp(req);
      const sourceHash = hashSourceIp(trustedIp);
      const contentHash = hashGuestbookContent({
        characterName,
        server,
        favoriteMaid,
        badge,
        message,
      });

      const rateLimitRef = db.collection(COLLECTION_RATE_LIMITS).doc(sourceHash);
      const messageRef = db.collection(COLLECTION_MESSAGES).doc();
      const createdAt = new Date().toISOString();

      const newEntry = {
        id: messageRef.id,
        characterName,
        server,
        favoriteMaid,
        badge,
        message,
        createdAt,
        status: 'published' as const,
      };

      await db.runTransaction(async (tx) => {
        const now = Date.now();
        const rateSnap = await tx.get(rateLimitRef);
        const rateData = rateSnap.exists ? rateSnap.data() || {} : {};

        // A. Idempotency / double-click guard
        if (requestId && rateData.lastRequestId === requestId) {
          throw new ApiError(409, '此則留言已成功送出，請勿重複提交。', 'DUPLICATE_REQUEST');
        }

        // B. Identical content deduplication
        const lastContentAt = Number(rateData.lastContentAt || 0);
        if (rateData.lastContentHash === contentHash && now - lastContentAt < DEDUP_WINDOW_MS) {
          throw new ApiError(
            409,
            '您剛剛已經送出過相同內容的留言囉，請勿重複提交。',
            'DUPLICATE_CONTENT'
          );
        }

        // C. 60-second cooldown per source
        const lastSuccessAt = Number(rateData.lastSuccessAt || 0);
        const elapsedSinceLast = now - lastSuccessAt;
        if (lastSuccessAt > 0 && elapsedSinceLast < COOLDOWN_MS) {
          const waitSec = Math.max(1, Math.ceil((COOLDOWN_MS - elapsedSinceLast) / 1000));
          throw new ApiError(
            429,
            `旅人蓋章太快啦！請稍候 ${waitSec} 秒後再留下下一則心意。`,
            'RATE_LIMIT_COOLDOWN'
          );
        }

        // D. Sliding 1-hour limit (max 5 posts per hour per source)
        const existingTimestamps: number[] = Array.isArray(rateData.hourlyTimestamps)
          ? rateData.hourlyTimestamps.filter(
              (ts: unknown): ts is number => typeof ts === 'number' && now - ts < HOURLY_WINDOW_MS
            )
          : [];

        if (existingTimestamps.length >= HOURLY_MAX_COUNT) {
          throw new ApiError(
            429,
            '同一位旅人每小時最多可留下 5 則手札心意，請稍後再來寫字吧！',
            'RATE_LIMIT_HOURLY'
          );
        }

        // Persist message (with internal sourceHash, never exposed on public GET)
        tx.set(messageRef, {
          ...newEntry,
          sourceHash,
        });

        // Update persistent cross-instance rate limit record
        tx.set(rateLimitRef, {
          lastSuccessAt: now,
          hourlyTimestamps: [...existingTimestamps, now],
          lastContentHash: contentHash,
          lastContentAt: now,
          lastRequestId: requestId || null,
          updatedAt: now,
        });
      });

      return res.status(201).json({
        success: true,
        item: newEntry,
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed.',
    });
  } catch (err) {
    return handleApiError(res, err);
  }
}
