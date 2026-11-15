import {
  ApiError,
  getAdminFirestore,
  handleApiError,
  parseJsonBody,
  verifyAdminRequest,
} from '../_lib/firebaseAdmin';

const COLLECTION_MESSAGES = 'guestbookMessages';
const DEFAULT_ADMIN_LIMIT = 30;
const MAX_ADMIN_LIMIT = 50;

function toAdminEntry(docSnap: FirebaseFirestore.DocumentSnapshot) {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    characterName: String(data.characterName || ''),
    server: String(data.server || ''),
    favoriteMaid: String(data.favoriteMaid || ''),
    badge: String(data.badge || '✨'),
    message: String(data.message || ''),
    createdAt: String(data.createdAt || ''),
    updatedAt: data.updatedAt ? String(data.updatedAt) : '',
    status: data.status === 'hidden' ? ('hidden' as const) : ('published' as const),
    moderatedBy: data.moderatedBy ? String(data.moderatedBy) : '',
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  try {
    // Strictly verify Firebase ID token & admin role on every request
    const admin = await verifyAdminRequest(req);
    const db = getAdminFirestore();
    const colRef = db.collection(COLLECTION_MESSAGES);

    if (req.method === 'GET') {
      const statusParam = typeof req.query?.status === 'string' ? req.query.status : 'all';
      const rawLimit = Number(req.query?.limit ?? DEFAULT_ADMIN_LIMIT);
      const pageSize =
        Number.isFinite(rawLimit) && rawLimit >= 1
          ? Math.min(Math.floor(rawLimit), MAX_ADMIN_LIMIT)
          : DEFAULT_ADMIN_LIMIT;
      const rawCursor = typeof req.query?.cursor === 'string' ? req.query.cursor.trim() : '';

      let queryRef: FirebaseFirestore.Query = colRef;
      if (statusParam === 'published' || statusParam === 'hidden') {
        queryRef = queryRef.where('status', '==', statusParam);
      }
      queryRef = queryRef.orderBy('createdAt', 'desc');

      if (rawCursor) {
        if (!/^[a-zA-Z0-9_-]{1,64}$/.test(rawCursor)) {
          throw new ApiError(400, '無效的分頁游標。', 'INVALID_CURSOR');
        }
        const cursorSnap = await colRef.doc(rawCursor).get();
        if (cursorSnap.exists) {
          queryRef = queryRef.startAfter(cursorSnap);
        }
      }

      const [snapshot, pubCountSnap, hiddenCountSnap] = await Promise.all([
        queryRef.limit(pageSize + 1).get(),
        colRef.where('status', '==', 'published').count().get(),
        colRef.where('status', '==', 'hidden').count().get(),
      ]);

      const hasMore = snapshot.docs.length > pageSize;
      const pageDocs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;
      const items = pageDocs.map(toAdminEntry);
      const nextCursor = hasMore && pageDocs.length > 0 ? pageDocs[pageDocs.length - 1].id : null;

      const published = pubCountSnap.data().count;
      const hidden = hiddenCountSnap.data().count;

      return res.status(200).json({
        success: true,
        items,
        hasMore,
        nextCursor,
        stats: {
          total: published + hidden,
          published,
          hidden,
        },
      });
    }

    if (req.method === 'PATCH') {
      const body = parseJsonBody(req);
      const id = typeof body.id === 'string' ? body.id.trim() : '';
      const status = body.status;

      if (!id || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
        throw new ApiError(400, '無效的留言編號。', 'INVALID_ID');
      }
      if (status !== 'published' && status !== 'hidden') {
        throw new ApiError(400, '無效的留言狀態（僅允許 published 或 hidden）。', 'INVALID_STATUS');
      }

      const docRef = colRef.doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        throw new ApiError(404, '找不到指定的訪客留言。', 'NOT_FOUND');
      }

      const updatedAt = new Date().toISOString();
      await docRef.update({
        status,
        updatedAt,
        moderatedBy: admin.email || admin.uid,
      });

      return res.status(200).json({
        success: true,
        id,
        status,
        updatedAt,
      });
    }

    if (req.method === 'DELETE') {
      const body = req.body ? parseJsonBody(req) : {};
      const idFromQuery = typeof req.query?.id === 'string' ? req.query.id.trim() : '';
      const idFromBody = typeof body.id === 'string' ? body.id.trim() : '';
      const id = idFromBody || idFromQuery;

      if (!id || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
        throw new ApiError(400, '無效的留言編號。', 'INVALID_ID');
      }

      const docRef = colRef.doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        throw new ApiError(404, '找不到指定的訪客留言（可能已被刪除）。', 'NOT_FOUND');
      }

      await docRef.delete();

      return res.status(200).json({
        success: true,
        id,
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  } catch (err) {
    return handleApiError(res, err);
  }
}
