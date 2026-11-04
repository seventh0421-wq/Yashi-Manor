import 'dotenv/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App instance for serverless runtime
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// Connect explicitly to the designated named Firestore database
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// In-memory rate-limiter: max 5 submissions per 10 minutes per IP
const ipRateMap = new Map<string, { count: number; expiresAt: number }>();
// Deduplication tracking: reject identical reservationId within 5 minutes
const recentBookings = new Map<string, number>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipRateMap.get(ip);
  if (!record || now > record.expiresAt) {
    ipRateMap.set(ip, { count: 1, expiresAt: now + 10 * 60 * 1000 });
    return false;
  }
  if (record.count >= 5) {
    return true;
  }
  record.count += 1;
  return false;
}

function isDuplicate(reservationId: string): boolean {
  const now = Date.now();
  const lastSeen = recentBookings.get(reservationId);
  if (lastSeen && now - lastSeen < 5 * 60 * 1000) {
    return true;
  }
  recentBookings.set(reservationId, now);
  return false;
}

/**
 * Vercel Serverless Function / Local API Endpoint:
 * 1. Validates inputs and rate limits requests.
 * 2. Writes reservation to the designated named Firestore database.
 * 3. Triggers Purin Discord Bot notify-reservation endpoint (non-blocking for customer).
 */
export default async function handler(req: any, res: any) {
  // CORS & Method Check
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Only POST is accepted.' });
  }

  // Determine client IP for basic anti-spam rate limiting
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress || '127.0.0.1';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      success: false,
      error: '預約請求過於頻繁，請稍候 10 分鐘後再試。',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const {
      id,
      date,
      timeSlot,
      staffName,
      guestCount,
      customerName,
      worldServer,
      contactMethod,
      selectedDishes,
      specialRequests,
    } = body;

    // Backend Validation
    if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
      return res.status(400).json({ success: false, error: '請輸入冒險者名稱。' });
    }
    if (!worldServer || typeof worldServer !== 'string' || !worldServer.trim()) {
      return res.status(400).json({ success: false, error: '請選擇冒險者伺服器。' });
    }
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ success: false, error: '請選擇預約日期。' });
    }
    if (!timeSlot || typeof timeSlot !== 'string') {
      return res.status(400).json({ success: false, error: '請選擇預約時段。' });
    }

    const parsedCount = Number(guestCount);
    if (isNaN(parsedCount) || parsedCount < 1 || parsedCount > 20) {
      return res.status(400).json({ success: false, error: '預約人數需在 1 至 20 人之間。' });
    }

    // Format reservation document ID
    const bookingId = (typeof id === 'string' && id.trim())
      ? id.trim().slice(0, 48)
      : `YASHI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Prevent duplicate submission spamming
    if (isDuplicate(bookingId)) {
      return res.status(409).json({ success: false, error: '該預約編號已在處理中，請勿重複提交。' });
    }

    const nowIso = new Date().toISOString();
    const reservationData = {
      id: bookingId,
      date: String(date).slice(0, 32),
      timeSlot: String(timeSlot).slice(0, 32),
      staffName: String(staffName || '不指名').slice(0, 64),
      guestCount: parsedCount,
      customerName: String(customerName).trim().slice(0, 64),
      worldServer: String(worldServer).trim().slice(0, 64),
      contactMethod: String(contactMethod || '').trim().slice(0, 100),
      selectedDishes: Array.isArray(selectedDishes) ? selectedDishes.slice(0, 20) : [],
      specialRequests: String(specialRequests || '').trim().slice(0, 500),
      status: 'pending',
      adminNotes: '',
      createdAt: nowIso,
    };

    // 1. Write to named Firestore Database
    await setDoc(doc(db, 'reservations', bookingId), reservationData);

    // 2. Notify Purin Discord Bot via Netlify function (Non-blocking: failure will not revert reservation)
    let notifiedPurin = false;
    let purinError: string | null = null;

    const PURIN_ENDPOINT =
      process.env.PURIN_BOT_API_URL ||
      'https://celadon-sunflower-6aca93.netlify.app/.netlify/functions/notify-reservation';
    const PURIN_SECRET =
      process.env.PURIN_NOTIFY_SECRET ||
      'a77367736a77367736a77367736a77367736';

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
          reservationId: bookingId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (purinResponse.ok) {
        notifiedPurin = true;
      } else {
        purinError = `Purin Bot HTTP ${purinResponse.status}`;
        console.warn(`[Purin Bot] Notification failed (${purinError}), but reservation ${bookingId} was safely saved.`);
      }
    } catch (err: any) {
      purinError = err?.message || 'Purin Bot endpoint unreachable';
      console.warn(`[Purin Bot] Notification exception (${purinError}), but reservation ${bookingId} was safely saved.`);
    }

    // Return success to the client
    return res.status(200).json({
      success: true,
      reservation: reservationData,
      notifiedPurin,
      ...(purinError ? { purinNote: purinError } : {}),
    });
  } catch (error: any) {
    console.error('Failed to create reservation on server:', error);
    return res.status(500).json({
      success: false,
      error: '伺服器處理預約時發生錯誤，請稍後重試。',
    });
  }
}
