import {
  ApiError,
  getAdminFirestore,
  getTrustedClientIp,
  parseJsonBody,
} from './_lib/firebaseAdmin.js';
import {
  createFirestoreReservationDbAdapter,
  createReservationWithIdempotency,
  validateAndNormalizeReservationInput,
} from './_lib/reservationService.js';

// Per-instance anti-spam rate limiter: max 8 requests per 10 minutes per IP
const ipRateMap = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRateMap.get(ip);
  if (!record || now > record.expiresAt) {
    ipRateMap.set(ip, { count: 1, expiresAt: now + 10 * 60 * 1000 });
    return false;
  }
  if (record.count >= 8) {
    return true;
  }
  record.count += 1;
  return false;
}

function handleReservationApiError(res: any, err: unknown) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      error: err.message,
    });
  }

  const message = err instanceof Error ? err.message : String(err);
  console.error('[Reservation API Error]', message);

  if (
    message.includes('Could not load the default credentials') ||
    message.includes('PERMISSION_DENIED') ||
    message.includes('UNAUTHENTICATED')
  ) {
    return res.status(503).json({
      success: false,
      code: 'FIREBASE_ADMIN_UNAUTHENTICATED',
      error: '預約系統後端尚未設定有效的 Firebase Admin 憑證，請檢查伺服器環境變數。',
    });
  }

  return res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    error: '伺服器處理預約時發生錯誤，請稍後再試。',
  });
}

/**
 * Vercel Serverless Function / Local API Endpoint:
 * 1. Validates inputs & requestId idempotency key.
 * 2. Uses Firebase Admin Firestore Transaction (named DB) to atomically:
 *    - Enforce idempotent retries & processing lease timeout recovery with processingToken
 *    - Allocate unique YYYYMMDD-XXXX reservation code without colliding with existing docs
 *    - Persist reservation document
 * 3. Triggers Purin Discord Bot notification only for newly created bookings (non-blocking).
 */
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      code: 'METHOD_NOT_ALLOWED',
      error: '僅支援 POST 請求。',
    });
  }

  try {
    const trustedIp = getTrustedClientIp(req);
    const rateKey =
      trustedIp !== 'unknown'
        ? trustedIp
        : typeof req.headers?.['x-forwarded-for'] === 'string'
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : 'unknown';

    if (isRateLimited(rateKey)) {
      throw new ApiError(
        429,
        '預約請求過於頻繁，請稍候 10 分鐘後再試。',
        'RATE_LIMIT_EXCEEDED'
      );
    }

    const body = parseJsonBody(req);
    const validated = validateAndNormalizeReservationInput(body);

    const adminDb = getAdminFirestore();
    const dbAdapter = createFirestoreReservationDbAdapter(adminDb);

    const result = await createReservationWithIdempotency(dbAdapter, validated);

    // Notify Purin Discord Bot ONLY when a brand-new reservation was created
    let notifiedPurin = false;
    let purinNote: string | undefined;

    if (!result.idempotentReplay) {
      const PURIN_ENDPOINT =
        process.env.PURIN_BOT_API_URL?.trim() ||
        'https://celadon-sunflower-6aca93.netlify.app/.netlify/functions/notify-reservation';
      const PURIN_SECRET = process.env.PURIN_NOTIFY_SECRET?.trim();

      if (!PURIN_SECRET) {
        purinNote = 'PURIN_NOTIFY_SECRET_NOT_CONFIGURED';
        console.warn(
          `[Purin Bot] PURIN_NOTIFY_SECRET is not configured; skipped notification for ${result.reservation.id}.`
        );
      } else {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const purinResponse = await fetch(PURIN_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Purin-Auth-Key': PURIN_SECRET,
            },
            body: JSON.stringify({
              source: 'yashikan-official-web',
              event: 'new_reservation',
              reservationId: result.reservation.id,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (purinResponse.ok) {
            notifiedPurin = true;
          } else {
            purinNote = `Purin Bot HTTP ${purinResponse.status}`;
            console.warn(
              `[Purin Bot] Notification failed (${purinNote}), but reservation ${result.reservation.id} was safely saved.`
            );
          }
        } catch (err: any) {
          purinNote = err?.message || 'Purin Bot endpoint unreachable';
          console.warn(
            `[Purin Bot] Notification exception (${purinNote}), but reservation ${result.reservation.id} was safely saved.`
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      reservation: result.reservation,
      idempotentReplay: result.idempotentReplay,
      recoveredFromTimeout: result.recoveredFromTimeout,
      notifiedPurin,
      ...(purinNote ? { purinNote } : {}),
    });
  } catch (err) {
    return handleReservationApiError(res, err);
  }
}
