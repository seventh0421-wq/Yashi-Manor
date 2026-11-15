import { useState, useEffect, useCallback, useMemo } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react';
import { GuestbookEntry, GuestbookStatus } from '../types';

interface AdminGuestbookPanelProps {
  currentUser: FirebaseUser;
  onShowToast: (msg: string) => void;
}

function formatTaipeiDateTime(isoString: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat('zh-TW', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return isoString;
  }
}

export function AdminGuestbookPanel({ currentUser, onShowToast }: AdminGuestbookPanelProps) {
  const [messages, setMessages] = useState<GuestbookEntry[]>([]);
  const [stats, setStats] = useState<{ total: number; published: number; hidden: number }>({
    total: 0,
    published: 0,
    hidden: 0,
  });
  const [statusFilter, setStatusFilter] = useState<'all' | GuestbookStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Two-step in-UI confirmation modal state for deletion
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<GuestbookEntry | null>(null);

  const fetchAdminMessages = useCallback(
    async (cursor?: string | null) => {
      const isLoadMore = Boolean(cursor);
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setErrorMsg(null);

      try {
        const token = await currentUser.getIdToken();
        const params = new URLSearchParams({
          status: statusFilter,
          limit: '30',
        });
        if (cursor) {
          params.set('cursor', cursor);
        }

        const res = await fetch(`/api/guestbook/admin?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          throw new Error(data.error || '無法載入訪客留言管理清單。');
        }

        const incoming: GuestbookEntry[] = Array.isArray(data.items) ? data.items : [];
        if (isLoadMore) {
          setMessages((prev) => {
            const seen = new Set(prev.map((m) => m.id));
            return [...prev, ...incoming.filter((m) => !seen.has(m.id))];
          });
        } else {
          setMessages(incoming);
        }

        if (data.stats) {
          setStats({
            total: Number(data.stats.total || 0),
            published: Number(data.stats.published || 0),
            hidden: Number(data.stats.hidden || 0),
          });
        }

        setHasMore(Boolean(data.hasMore));
        setNextCursor(data.nextCursor || null);
      } catch (err: any) {
        setErrorMsg(err?.message || '讀取留言管理資料失敗，請稍後再試。');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [currentUser, statusFilter]
  );

  useEffect(() => {
    fetchAdminMessages();
  }, [fetchAdminMessages]);

  const handleToggleStatus = async (entry: GuestbookEntry) => {
    if (busyId) return;
    const nextStatus: GuestbookStatus = entry.status === 'published' ? 'hidden' : 'published';
    setBusyId(entry.id);
    setErrorMsg(null);

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/guestbook/admin', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: entry.id,
          status: nextStatus,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || '更新留言狀態失敗。');
      }

      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === entry.id ? { ...m, status: nextStatus, updatedAt: data.updatedAt } : m
        );
        return statusFilter === 'all'
          ? updated
          : updated.filter((m) => m.status === statusFilter);
      });

      setStats((prev) => {
        if (nextStatus === 'hidden') {
          return {
            ...prev,
            published: Math.max(0, prev.published - 1),
            hidden: prev.hidden + 1,
          };
        }
        return {
          ...prev,
          published: prev.published + 1,
          hidden: Math.max(0, prev.hidden - 1),
        };
      });

      onShowToast(nextStatus === 'hidden' ? '已隱藏該則訪客留言' : '已恢復公開該則留言');
    } catch (err: any) {
      setErrorMsg(err?.message || '更新留言狀態失敗，請重試。');
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteTarget || busyId) return;
    const target = confirmDeleteTarget;
    setBusyId(target.id);
    setErrorMsg(null);

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/guestbook/admin', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: target.id }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || '刪除留言失敗。');
      }

      setMessages((prev) => prev.filter((m) => m.id !== target.id));
      setStats((prev) => ({
        total: Math.max(0, prev.total - 1),
        published: target.status === 'published' ? Math.max(0, prev.published - 1) : prev.published,
        hidden: target.status === 'hidden' ? Math.max(0, prev.hidden - 1) : prev.hidden,
      }));
      setConfirmDeleteTarget(null);
      onShowToast('已永久刪除該則訪客留言');
    } catch (err: any) {
      setErrorMsg(err?.message || '刪除留言失敗，請稍後再試。');
    } finally {
      setBusyId(null);
    }
  };

  const filteredMessages = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        m.characterName.toLowerCase().includes(q) ||
        m.server.toLowerCase().includes(q) ||
        m.favoriteMaid.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
    );
  }, [messages, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white/90 p-4 rounded-3xl border border-[#CBDDEB] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#5C7D9E] mb-1">
            <span>留言總數</span>
            <MessageSquare className="w-4 h-4 text-[#35618F]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-cinzel text-[#15324E]">
            {stats.total}
            <span className="text-xs font-normal text-[#5C7D9E] ml-1">則</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-3xl border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-emerald-800 mb-1">
            <span>公開顯示中 (published)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-cinzel text-emerald-900">
            {stats.published}
            <span className="text-xs font-normal text-emerald-700 ml-1">則</span>
          </div>
        </div>

        <div className="bg-slate-100/80 p-4 rounded-3xl border border-slate-300/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
            <span>已隱藏 (hidden)</span>
            <EyeOff className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-cinzel text-slate-800">
            {stats.hidden}
            <span className="text-xs font-normal text-slate-600 ml-1">則</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white/90 rounded-3xl border border-[#CBDDEB] p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6484A4]" />
          <input
            type="text"
            placeholder="搜尋角色名稱、伺服器、喜愛侍從或留言內容..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-2xl bg-[#F0F5FA] border border-[#CBDDEB] focus:border-[#23466B] focus:bg-white focus:outline-none text-[#183654]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | GuestbookStatus)}
            className="px-3 py-2 rounded-2xl bg-[#F0F5FA] border border-[#CBDDEB] text-xs font-bold text-[#1E3B5C] cursor-pointer focus:outline-none"
          >
            <option value="all">全部狀態</option>
            <option value="published">僅顯示公開中 (published)</option>
            <option value="hidden">僅顯示已隱藏 (hidden)</option>
          </select>

          <button
            type="button"
            onClick={() => fetchAdminMessages()}
            disabled={isLoading}
            className="px-4 py-2 rounded-2xl bg-[#23466B] hover:bg-[#183654] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>重新整理</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <span className="font-bold block mb-0.5">讀取或操作時發生錯誤</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="bg-white/95 rounded-3xl border border-[#CBDDEB] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[#5C7D9E] space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#35618F]" />
            <p className="text-xs">正在透過安全管理介面讀取訪客留言...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-12 text-center text-[#5C7D9E] space-y-2">
            <MessageSquare className="w-9 h-9 mx-auto text-[#90B0D0] opacity-60" />
            <p className="text-sm font-bold font-serif-tc text-[#244A72]">
              目前沒有符合條件的訪客留言
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E6EEF5]">
            {filteredMessages.map((entry) => {
              const isHidden = entry.status === 'hidden';
              const isBusy = busyId === entry.id;

              return (
                <div
                  key={entry.id}
                  className={`p-4 sm:p-5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isHidden ? 'bg-slate-50/90' : 'bg-white hover:bg-[#F7FAFD]'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-base">{entry.badge}</span>
                      <span className="font-bold text-sm text-[#15324E] font-serif-tc">
                        {entry.characterName}
                      </span>
                      <span className="text-xs text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md">
                        @{entry.server}
                      </span>
                      {entry.favoriteMaid && (
                        <span className="text-[11px] font-semibold text-[#2B4B6E] bg-[#EEF5FB] px-2 py-0.5 rounded-md border border-[#CBDDEB]">
                          喜愛：{entry.favoriteMaid}
                        </span>
                      )}
                      {isHidden ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                          <EyeOff className="w-3 h-3" />
                          <span>已隱藏 (hidden)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Eye className="w-3 h-3" />
                          <span>公開中 (published)</span>
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-xs sm:text-sm leading-relaxed font-serif-tc whitespace-pre-wrap break-words ${
                        isHidden ? 'text-slate-500 line-through decoration-slate-300' : 'text-[#314A63]'
                      }`}
                    >
                      {entry.message}
                    </p>

                    <div className="flex items-center flex-wrap gap-3 text-[11px] text-[#7892AC] font-mono">
                      <span>留言時間：{formatTaipeiDateTime(entry.createdAt)}</span>
                      <span>ID：{entry.id}</span>
                      {entry.moderatedBy && (
                        <span>最後調整：{entry.moderatedBy}</span>
                      )}
                    </div>
                  </div>

                  {/* Moderation Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleToggleStatus(entry)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border shadow-2xs transition-colors cursor-pointer disabled:opacity-50 ${
                        isHidden
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {isBusy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isHidden ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                      <span>{isHidden ? '恢復公開' : '隱藏留言'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => setConfirmDeleteTarget(entry)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>刪除</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasMore && !isLoading && (
          <div className="p-4 border-t border-[#E6EEF5] text-center bg-[#FAFBFD]">
            <button
              type="button"
              disabled={isLoadingMore}
              onClick={() => fetchAdminMessages(nextCursor)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#EEF5FB] text-[#23466B] border border-[#CBDDEB] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isLoadingMore ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              <span>{isLoadingMore ? '載入中...' : '載入更多留言'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Two-Step Delete Confirmation Modal (Safe in iFrame, avoids window.confirm) */}
      {confirmDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 shadow-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#15324E] font-serif-tc">
                  確定要永久刪除這則留言嗎？
                </h3>
                <p className="text-xs text-[#526D88] mt-1">
                  此操作將直接從 Firestore 資料庫刪除資料且無法復原。若僅需暫時下架，建議改用「隱藏留言」。
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2EAF2] text-xs space-y-1">
              <div className="font-bold text-[#1E3B5C]">
                {confirmDeleteTarget.badge} {confirmDeleteTarget.characterName} (@
                {confirmDeleteTarget.server})
              </div>
              <p className="text-[#476077] line-clamp-3 whitespace-pre-wrap break-words">
                {confirmDeleteTarget.message}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={busyId === confirmDeleteTarget.id}
                onClick={() => setConfirmDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                disabled={busyId === confirmDeleteTarget.id}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {busyId === confirmDeleteTarget.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>確認永久刪除</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
