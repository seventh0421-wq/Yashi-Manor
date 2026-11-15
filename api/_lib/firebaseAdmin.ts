import 'dotenv/config';
import {
  initializeApp,
  getApps,
  cert,
  applicationDefault,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getAppCheck } from 'firebase-admin/app-check';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_PROJECT_ID = 'commission-app-484109';
const DEFAULT_DATABASE_ID = 'ai-studio-ff14-f124879a-6271-44c8-8bcd-ef8384a862a9';
const ADMIN_APP_NAME = 'yashi-manor-admin';

const DEFAULT_ADMIN_EMAILS = [
  'seventh0421@gmail.com',
  'laka7425888@gmail.com',
];

export const ALLOWED_BADGES = ['✨', '☕', '🍰', '🌸', '🐾'] as const;

export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, message: string, code = 'API_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

function readAppletConfig(): { projectId?: string; firestoreDatabaseId?: string } {
  try {
    const candidates = [
      path.resolve(process.cwd(), 'firebase-applet-config.json'),
      path.resolve(process.cwd(), '../firebase-applet-config.json'),
    ];
    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
      }
    }
  } catch {
    // Graceful fallback if filesystem config is unavailable
  }
  return {};
}

function resolveProjectAndDb(): { projectId: string; databaseId: string } {
  const fileConfig = readAppletConfig();
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    fileConfig.projectId ||
    DEFAULT_PROJECT_ID;
  const databaseId =
    process.env.FIRESTORE_DATABASE_ID ||
    fileConfig.firestoreDatabaseId ||
    DEFAULT_DATABASE_ID;
  return { projectId, databaseId };
}

function parseServiceAccountFromEnv(): ServiceAccount | null {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (rawJson) {
    try {
      const normalized =
        (rawJson.startsWith("'") && rawJson.endsWith("'")) ||
        (rawJson.startsWith('"') && rawJson.endsWith('"') && !rawJson.startsWith('{"'))
          ? rawJson.slice(1, -1)
          : rawJson;
      const parsed = JSON.parse(normalized);
      if (parsed && parsed.client_email && parsed.private_key) {
        return {
          projectId: parsed.project_id,
          clientEmail: parsed.client_email,
          privateKey: String(parsed.private_key).replace(/\\n/g, '\n'),
        };
      }
    } catch {
      throw new ApiError(
        503,
        '伺服器端 FIREBASE_SERVICE_ACCOUNT_KEY 格式無效，請確認為完整 JSON 金鑰。',
        'INVALID_SERVICE_ACCOUNT_JSON'
      );
    }
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim() || resolveProjectAndDb().projectId;

  if (clientEmail && privateKey) {
    return {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    };
  }

  return null;
}

function getOrInitAdminApp(): App {
  const existing = getApps().find((a) => a.name === ADMIN_APP_NAME);
  if (existing) return existing;

  const { projectId } = resolveProjectAndDb();
  const serviceAccount = parseServiceAccountFromEnv();

  if (serviceAccount) {
    return initializeApp(
      {
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId || projectId,
      },
      ADMIN_APP_NAME
    );
  }

  // Only attempt Application Default Credentials if GOOGLE_APPLICATION_CREDENTIALS is explicitly set
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp(
      {
        credential: applicationDefault(),
        projectId,
      },
      ADMIN_APP_NAME
    );
  }

  throw new ApiError(
    503,
    '留言系統後端尚未設定 Firebase Admin 服務帳號憑證（請於 Vercel 環境變數設定 FIREBASE_SERVICE_ACCOUNT_KEY）。',
    'FIREBASE_ADMIN_NOT_CONFIGURED'
  );
}

export function getAdminFirestore(): Firestore {
  const app = getOrInitAdminApp();
  const { databaseId } = resolveProjectAndDb();
  return getFirestore(app, databaseId);
}

export function getAdminAuth(): Auth {
  const app = getOrInitAdminApp();
  return getAuth(app);
}

export async function verifyOptionalAppCheck(req: any): Promise<void> {
  if (process.env.FIREBASE_APP_CHECK_ENFORCE !== 'true') {
    return;
  }
  const token = req.headers?.['x-firebase-appcheck'];
  if (!token || typeof token !== 'string') {
    throw new ApiError(401, '缺少 Firebase App Check 驗證權杖。', 'APP_CHECK_MISSING');
  }
  try {
    const app = getOrInitAdminApp();
    await getAppCheck(app).verifyToken(token);
  } catch {
    throw new ApiError(401, 'Firebase App Check 驗證失敗，請重新整理頁面後再試。', 'APP_CHECK_INVALID');
  }
}

/**
 * Extracts visitor IP from trusted edge/platform headers first.
 * Avoids trusting client-spoofable x-forwarded-for unless platform headers are absent in local dev.
 */
export function getTrustedClientIp(req: any): string {
  const headers = req?.headers || {};

  // 1. Vercel Edge trusted header (overwritten by Vercel edge, cannot be spoofed by client)
  const vercelForwarded = headers['x-vercel-forwarded-for'];
  if (typeof vercelForwarded === 'string' && vercelForwarded.trim()) {
    return vercelForwarded.split(',')[0].trim();
  }

  // 2. Trusted reverse-proxy single IP header
  const realIp = headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }

  // 3. Direct TCP socket IP (local dev / Node server)
  const remoteAddr = req?.socket?.remoteAddress || req?.connection?.remoteAddress;
  if (typeof remoteAddr === 'string' && remoteAddr.trim()) {
    return remoteAddr.replace(/^::ffff:/, '').trim();
  }

  return 'unknown';
}

export function hashSourceIp(ip: string): string {
  const salt =
    process.env.GUESTBOOK_IP_SALT?.trim() ||
    process.env.PURIN_NOTIFY_SECRET?.trim() ||
    DEFAULT_PROJECT_ID;
  return crypto
    .createHmac('sha256', salt)
    .update(`guestbook:${ip}`)
    .digest('hex')
    .slice(0, 32);
}

export function hashGuestbookContent(payload: {
  characterName: string;
  server: string;
  favoriteMaid: string;
  badge: string;
  message: string;
}): string {
  const normalized = [
    payload.characterName.trim().toLowerCase(),
    payload.server.trim().toLowerCase(),
    payload.favoriteMaid.trim().toLowerCase(),
    payload.badge,
    payload.message.trim().replace(/\s+/g, ' '),
  ].join('|');
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 32);
}

export function sanitizeText(input: unknown, preserveNewlines = false): string {
  if (typeof input !== 'string') return '';
  // Strip C0 control characters (keep \n when preserveNewlines is true) and zero-width characters
  const stripped = preserveNewlines
    ? input.replace(/\r\n/g, '\n').replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '')
    : input.replace(/[\u0000-\u001F\u007F]/g, '');
  return stripped.trim();
}

export function codePointLength(str: string): number {
  return Array.from(str).length;
}

export function getAuthorizedAdminEmails(): string[] {
  const envEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...envEmails]));
}

export async function verifyAdminRequest(req: any): Promise<{ uid: string; email: string }> {
  const authHeader = req?.headers?.authorization || req?.headers?.Authorization;
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, '請先登入管理員帳號。', 'UNAUTHORIZED');
  }

  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken) {
    throw new ApiError(401, '無效的登入憑證。', 'UNAUTHORIZED');
  }

  const adminAuth = getAdminAuth();
  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken, true);
  } catch {
    throw new ApiError(401, '管理員登入已過期或無效，請重新登入。', 'INVALID_TOKEN');
  }

  const email = (decoded.email || '').toLowerCase();
  const isVerifiedEmail = decoded.email_verified === true;
  const allowlist = getAuthorizedAdminEmails();

  if (isVerifiedEmail && email && allowlist.includes(email)) {
    return { uid: decoded.uid, email };
  }

  // Also check /admins/{uid} document in named Firestore database
  const db = getAdminFirestore();
  const adminDoc = await db.collection('admins').doc(decoded.uid).get();
  if (adminDoc.exists) {
    return { uid: decoded.uid, email };
  }

  throw new ApiError(403, '您的帳號沒有訪客留言管理權限。', 'FORBIDDEN');
}

export function parseJsonBody(req: any): Record<string, any> {
  if (!req?.body) return {};
  if (typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      throw new ApiError(400, '無效的 JSON 請求格式。', 'INVALID_JSON');
    }
  }
  if (typeof req.body === 'object') {
    return req.body;
  }
  return {};
}

export function handleApiError(res: any, err: unknown) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      error: err.message,
    });
  }

  const message = err instanceof Error ? err.message : String(err);
  console.error('[Guestbook API Error]', message);

  if (message.includes('FAILED_PRECONDITION') || message.includes('requires an index')) {
    return res.status(503).json({
      success: false,
      code: 'FIRESTORE_INDEX_REQUIRED',
      error: 'Firestore 尚未建立 guestbookMessages 複合索引（status + createdAt），請先於 Firebase Console 建立索引。',
    });
  }

  if (
    message.includes('Could not load the default credentials') ||
    message.includes('PERMISSION_DENIED') ||
    message.includes('UNAUTHENTICATED')
  ) {
    return res.status(503).json({
      success: false,
      code: 'FIREBASE_ADMIN_UNAUTHENTICATED',
      error: 'Firebase Admin SDK 權限不足或尚未設定服務帳號金鑰，請檢查伺服器環境變數。',
    });
  }

  return res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    error: '伺服器處理留言時發生錯誤，請稍後再試。',
  });
}
