import { useState, useEffect, useCallback, FormEvent } from 'react';
import {
  MessageSquare,
  Send,
  RefreshCw,
  AlertCircle,
  Loader2,
  ChevronDown,
  Check,
} from 'lucide-react';
import { STAFF_MEMBERS } from '../data/cafeData';
import { GuestbookEntry } from '../types';
import { playChime } from '../utils/audio';

const GUESTBOOK_BADGES = ['✨', '☕', '🍰', '🌸', '🐾'] as const;
const PAGE_SIZE = 10;
const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // Auto-refresh every 5 minutes when tab is visible

function formatTaipeiDate(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString.slice(0, 10);
    return new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return isoString.slice(0, 10);
  }
}

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `gb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function GuestbookSection() {
  // Guestbook persisted real state (Firebase via Serverless API)
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form states
  const [charName, setCharName] = useState('');
  const [serverName, setServerName] = useState('利維坦');
  const [guestMessage, setGuestMessage] = useState('');
  const [favStaff, setFavStaff] = useState('萊可');
  const [selectedStamp, setSelectedStamp] = useState<string>('✨');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch initial latest 10 published entries & total published count
  const fetchGuestbook = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') {
      setIsLoadingList(true);
    } else {
      setIsRefreshing(true);
    }
    setLoadError(null);

    try {
      const [listRes, countRes] = await Promise.all([
        fetch(`/api/guestbook?limit=${PAGE_SIZE}`, { cache: 'no-store' }),
        fetch('/api/guestbook/count', { cache: 'no-store' }),
      ]);

      const listData = await listRes.json().catch(() => ({}));
      if (!listRes.ok || !listData.success) {
        throw new Error(listData.error || '無法載入訪客留言，請稍後重試。');
      }

      const incomingItems: GuestbookEntry[] = Array.isArray(listData.items) ? listData.items : [];

      if (mode === 'refresh') {
        // Merge latest page cleanly while preserving any older loaded items if user paginated
        setEntries((prev) => {
          if (prev.length <= PAGE_SIZE) {
            setHasMore(Boolean(listData.hasMore));
            setNextCursor(listData.nextCursor || null);
            return incomingItems;
          }
          const incomingIds = new Set(incomingItems.map((it) => it.id));
          const olderItems = prev.slice(PAGE_SIZE).filter((it) => !incomingIds.has(it.id));
          return [...incomingItems, ...olderItems];
        });
      } else {
        setEntries(incomingItems);
        setHasMore(Boolean(listData.hasMore));
        setNextCursor(listData.nextCursor || null);
      }

      if (countRes.ok) {
        const countData = await countRes.json().catch(() => ({}));
        if (countData.success && typeof countData.count === 'number') {
          setTotalCount(countData.count);
        }
      }
    } catch (err: any) {
      setLoadError(err?.message || '讀取留言時發生錯誤，請點擊重試。');
    } finally {
      setIsLoadingList(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGuestbook('initial');
  }, [fetchGuestbook]);

  // Low-cost periodic refresh every 60s ONLY when browser tab is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchGuestbook('refresh');
      }
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchGuestbook]);

  // Load more cursor pagination
  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadError(null);

    try {
      const res = await fetch(
        `/api/guestbook?limit=${PAGE_SIZE}&cursor=${encodeURIComponent(nextCursor)}`,
        { cache: 'no-store' }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || '載入更多留言失敗，請重試。');
      }

      const moreItems: GuestbookEntry[] = Array.isArray(data.items) ? data.items : [];
      setEntries((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNew = moreItems.filter((item) => !existingIds.has(item.id));
        return [...prev, ...uniqueNew];
      });
      setHasMore(Boolean(data.hasMore));
      setNextCursor(data.nextCursor || null);
    } catch (err: any) {
      setLoadError(err?.message || '載入更多留言失敗，請稍後再試。');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleAddGuestbook = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);
    setSubmitSuccess(null);

    const trimmedName = charName.trim();
    const trimmedServer = serverName.trim();
    const trimmedMessage = guestMessage.trim();

    const nameLen = Array.from(trimmedName).length;
    if (nameLen < 2 || nameLen > 40) {
      setSubmitError('請輸入 2 至 40 字元的角色名稱 (ID)。');
      return;
    }

    const serverLen = Array.from(trimmedServer).length;
    if (serverLen < 1 || serverLen > 32) {
      setSubmitError('請填寫所屬伺服器（1 至 32 字元）。');
      return;
    }

    const msgLen = Array.from(trimmedMessage).length;
    if (msgLen < 1 || msgLen > 300) {
      setSubmitError('留言內容不可為空白，且需在 1 至 300 字元內。');
      return;
    }

    setIsSubmitting(true);
    const requestId = createRequestId();

    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: trimmedName,
          server: trimmedServer,
          favoriteMaid: favStaff.trim(),
          badge: selectedStamp,
          message: trimmedMessage,
          requestId,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success || !data.item) {
        throw new Error(data.error || '留言送出失敗，請稍後再試。');
      }

      const savedItem: GuestbookEntry = data.item;
      setEntries((prev) => [savedItem, ...prev.filter((item) => item.id !== savedItem.id)]);
      setTotalCount((prev) => (prev !== null ? prev + 1 : 1));

      // Clear only message content; keep character/server/maid/badge preferences
      setGuestMessage('');
      setSubmitSuccess('旅人的心意已經送達！');
      playChime(1.2);

      setTimeout(() => setSubmitSuccess(null), 5000);
    } catch (err: any) {
      // Preserve unsent form fields on failure
      setSubmitError(err?.message || '留言送出失敗，請確認網路連線後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const trimmedMessageLen = Array.from(guestMessage.trim()).length;

  return (
    <section
      id="guestbook"
      className="pt-4 sm:pt-6 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F0F5FA] via-[#F7FAFD] to-white"
    >
      {/* Interactive Guestbook (冒險者來訪留言本) */}
      <div className="max-w-4xl mx-auto bg-[#FAFBFD] rounded-3xl border border-[#DCE7F0] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-5 gap-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#4A729A]" />
            <h4 className="font-bold text-base sm:text-lg text-[#1E344A] font-serif-tc">
              夜蒔訪客留言本
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#637D97]">
              {totalCount !== null
                ? `已收錄 ${totalCount} 則溫馨手札`
                : isLoadingList
                ? '載入留言數中…'
                : '公開手札'}
            </span>
            <button
              type="button"
              onClick={() => fetchGuestbook('refresh')}
              disabled={isRefreshing || isLoadingList}
              className="p-1.5 rounded-lg text-[#637D97] hover:text-[#2B4B6E] hover:bg-[#EAF2F8] transition-colors cursor-pointer disabled:opacity-50"
              title="重新整理最新留言"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Leave message form */}
        <form onSubmit={handleAddGuestbook} className="space-y-3 mb-6 p-4 rounded-xl bg-white border border-[#E2EAF2]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#48637E] mb-1">
                角色名稱 (ID) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={40}
                value={charName}
                onChange={(e) => setCharName(e.target.value)}
                placeholder="例如：Miqo'te Star（2~40字元）"
                className="w-full px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs focus:outline-none focus:ring-1 focus:ring-[#4A729A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#48637E] mb-1">
                伺服器 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={32}
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="利維坦 / 其他"
                className="w-full px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs focus:outline-none focus:ring-1 focus:ring-[#4A729A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#48637E] mb-1">
                最喜愛的女僕（選填）
              </label>
              <select
                value={favStaff}
                onChange={(e) => setFavStaff(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#1E293B]"
              >
                <option value="">不特別指定</option>
                {STAFF_MEMBERS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#48637E] mb-1">
                留念小徽章
              </label>
              <div className="flex gap-2">
                {GUESTBOOK_BADGES.map((stamp) => (
                  <button
                    key={stamp}
                    type="button"
                    onClick={() => setSelectedStamp(stamp)}
                    className={`w-7 h-7 rounded-md text-xs flex items-center justify-center transition-all cursor-pointer ${
                      selectedStamp === stamp
                        ? 'bg-[#E1ECF7] border border-[#8BB2D8] scale-110'
                        : 'bg-[#F1F5F9] border border-transparent'
                    }`}
                  >
                    {stamp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-[#48637E]">
                寫下對夜蒔館的期待或到訪心情 <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-[#7D95AD] font-mono">
                {trimmedMessageLen}/300
              </span>
            </div>
            <textarea
              required
              rows={2}
              maxLength={300}
              value={guestMessage}
              onChange={(e) => setGuestMessage(e.target.value)}
              placeholder="留下您的溫暖話語，讓女僕與執事們看到..."
              className="w-full px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs focus:outline-none focus:ring-1 focus:ring-[#4A729A]"
            />
          </div>

          {submitError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            {submitSuccess && (
              <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" /> {submitSuccess}
              </span>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="ml-auto px-4 py-1.5 rounded-lg bg-[#2B4B6E] hover:bg-[#203A56] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? '正在蓋章……' : '蓋章留言'}</span>
            </button>
          </div>
        </form>

        {/* List of real guestbook entries */}
        {isLoadingList ? (
          <div className="py-10 text-center text-xs text-[#637D97] flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#4A729A]" />
            <span>正在翻閱夜蒔館旅人手札...</span>
          </div>
        ) : loadError && entries.length === 0 ? (
          <div className="p-6 rounded-xl bg-white border border-rose-200 text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loadError}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchGuestbook('initial')}
              className="px-4 py-1.5 rounded-lg bg-[#2B4B6E] hover:bg-[#203A56] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>重新嘗試</span>
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 rounded-xl bg-white border border-[#E3EAF2] text-center space-y-1.5">
            <p className="text-xs font-semibold text-[#2A4C70]">
              目前還沒有旅人留下公開手札
            </p>
            <p className="text-[11px] text-[#647D96]">
              歡迎填寫上方表單蓋章，成為第一位留下溫暖足跡的冒險者！
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {loadError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between gap-2">
                <span>{loadError}</span>
                <button
                  type="button"
                  onClick={() => fetchGuestbook('refresh')}
                  className="underline font-semibold shrink-0 cursor-pointer"
                >
                  重試
                </button>
              </div>
            )}

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-xl bg-white border border-[#E3EAF2] text-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#1F364E] min-w-0 flex-wrap">
                      <span>{entry.badge}</span>
                      <span className="truncate">{entry.characterName}</span>
                      <span className="text-[10px] font-normal text-[#64748B]">
                        @{entry.server}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#869BB0] shrink-0">
                      {entry.favoriteMaid ? `致【${entry.favoriteMaid}】・` : ''}
                      {formatTaipeiDate(entry.createdAt)}
                    </div>
                  </div>
                  <p className="text-[#476077] leading-relaxed font-serif-tc whitespace-pre-wrap break-words">
                    {entry.message}
                  </p>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-4 py-1.5 rounded-lg bg-white hover:bg-[#EEF5FB] text-[#2B4B6E] border border-[#CBDDEB] text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isLoadingMore ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  <span>{isLoadingMore ? '載入中...' : '查看更多留言'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
