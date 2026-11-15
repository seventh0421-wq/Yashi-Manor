import { getAdminFirestore, handleApiError } from '../_lib/firebaseAdmin.js';

const COLLECTION_MESSAGES = 'guestbookMessages';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }

  try {
    const db = getAdminFirestore();
    const countSnapshot = await db
      .collection(COLLECTION_MESSAGES)
      .where('status', '==', 'published')
      .count()
      .get();

    return res.status(200).json({
      success: true,
      count: countSnapshot.data().count,
    });
  } catch (err) {
    return handleApiError(res, err);
  }
}
