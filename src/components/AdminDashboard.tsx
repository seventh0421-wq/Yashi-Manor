import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  LogIn,
  LogOut,
  Calendar,
  Clock,
  User,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock3,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  Edit3,
  Save,
  MessageSquare,
  Sparkles,
  ArrowUpDown,
  Utensils,
  MapPin,
  Building2,
  Check,
  Copy,
  Coffee,
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { db, auth, googleProvider, signInWithPopup, signOut, AUTHORIZED_ADMIN_EMAILS } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreError';
import { ReservationData, ReservationStatus } from '../types';
import { STAFF_MEMBERS } from '../data/cafeData';

export function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [sortField, setSortField] = useState<'createdAt' | 'date' | 'customerName'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selected reservation for detailed view / editing
  const [selectedReservation, setSelectedReservation] = useState<ReservationData | null>(null);
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = useMemo(() => {
    if (!currentUser?.email) return false;
    return AUTHORIZED_ADMIN_EMAILS.includes(currentUser.email);
  }, [currentUser]);

  // Listen to Firestore reservations collection in real-time
  useEffect(() => {
    if (!currentUser) {
      setReservations([]);
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    setErrorMsg(null);

    const pathForReservations = 'reservations';
    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: ReservationData[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            date: data.date || '',
            timeSlot: data.timeSlot || '',
            staffName: data.staffName || '',
            guestCount: data.guestCount || 1,
            customerName: data.customerName || '',
            worldServer: data.worldServer || '',
            contactMethod: data.contactMethod || '',
            selectedDishes: data.selectedDishes || [],
            specialRequests: data.specialRequests || '',
            status: (data.status as ReservationStatus) || 'pending',
            adminNotes: data.adminNotes || '',
            createdAt: data.createdAt || '',
            updatedAt: data.updatedAt || '',
          });
        });
        setReservations(list);
        setLoadingData(false);
      },
      (error) => {
        console.error('Firestore listener error:', error);
        setErrorMsg('無法讀取預約資料，請確認管理權限或網路連線。');
        setLoadingData(false);
        try {
          handleFirestoreError(error, OperationType.LIST, pathForReservations);
        } catch {
          // Handled and logged
        }
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Google Sign-in Handler
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setUnauthorizedDomain(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        const currentDomain = window.location.hostname;
        setUnauthorizedDomain(currentDomain);
        setErrorMsg(
          `目前網域（${currentDomain}）尚未加入 Firebase 授權網域 (Authorized Domains)。請前往 Firebase Console 將此網域新增至「Authentication > Settings > Authorized domains」即可正常登入。`
        );
      } else {
        setErrorMsg(err.message || '登入失敗，請重試。');
      }
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setSelectedReservation(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Update status
  const handleUpdateStatus = async (reservationId: string, newStatus: ReservationStatus) => {
    const pathForReservation = `reservations/${reservationId}`;
    try {
      await updateDoc(doc(db, 'reservations', reservationId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      if (selectedReservation && selectedReservation.id === reservationId) {
        setSelectedReservation({
          ...selectedReservation,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        });
      }
      showToast('預約狀態已更新');
    } catch (err) {
      console.error('Update status error:', err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, pathForReservation);
      } catch {
        // Handled
      }
    }
  };

  // Save internal notes
  const handleSaveNotes = async () => {
    if (!selectedReservation) return;
    setIsSavingNotes(true);
    const pathForReservation = `reservations/${selectedReservation.id}`;
    try {
      await updateDoc(doc(db, 'reservations', selectedReservation.id), {
        adminNotes: editingNotes.trim(),
        updatedAt: new Date().toISOString(),
      });
      setSelectedReservation({
        ...selectedReservation,
        adminNotes: editingNotes.trim(),
        updatedAt: new Date().toISOString(),
      });
      showToast('內部備註已儲存');
    } catch (err) {
      console.error('Save notes error:', err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, pathForReservation);
      } catch {
        // Handled
      }
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Delete reservation
  const handleDeleteReservation = async (reservationId: string) => {
    if (!window.confirm(`確定要刪除預約訂單【${reservationId}】嗎？此操作無法撤回。`)) {
      return;
    }
    const pathForReservation = `reservations/${reservationId}`;
    try {
      await deleteDoc(doc(db, 'reservations', reservationId));
      if (selectedReservation?.id === reservationId) {
        setSelectedReservation(null);
      }
      showToast('預約已刪除');
    } catch (err) {
      console.error('Delete error:', err);
      try {
        handleFirestoreError(err, OperationType.DELETE, pathForReservation);
      } catch {
        // Handled
      }
    }
  };

  const showToast = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleCopyCode = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredReservations.length === 0) return;
    const headers = [
      '預約編號',
      '狀態',
      '預約日期',
      '時段',
      '指名侍從',
      '主人姓名',
      '伺服器',
      '人數',
      '聯絡方式',
      '餐點清單',
      '備註需求',
      '建立時間',
    ];

    const rows = filteredReservations.map((r) => [
      `"${r.id}"`,
      `"${r.status || 'pending'}"`,
      `"${r.date}"`,
      `"${r.timeSlot}"`,
      `"${r.staffName}"`,
      `"${r.customerName.replace(/"/g, '""')}"`,
      `"${r.worldServer}"`,
      r.guestCount,
      `"${(r.contactMethod || '').replace(/"/g, '""')}"`,
      `"${(r.selectedDishes?.map((d) => `${d.name}x${d.quantity}`).join('; ') || '').replace(/"/g, '""')}"`,
      `"${(r.specialRequests || '').replace(/"/g, '""')}"`,
      `"${r.createdAt}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `夜蒔館預約名單_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered & Sorted list
  const filteredReservations = useMemo(() => {
    return reservations
      .filter((r) => {
        // Search term
        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase();
          const matchId = r.id.toLowerCase().includes(s);
          const matchName = r.customerName.toLowerCase().includes(s);
          const matchContact = (r.contactMethod || '').toLowerCase().includes(s);
          const matchStaff = r.staffName.toLowerCase().includes(s);
          if (!matchId && !matchName && !matchContact && !matchStaff) return false;
        }

        // Status
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;

        // Staff
        if (staffFilter !== 'all' && r.staffName !== staffFilter) return false;

        // Date
        if (dateFilter && !r.date.includes(dateFilter)) return false;

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'createdAt') {
          comp = (a.createdAt || '').localeCompare(b.createdAt || '');
        } else if (sortField === 'date') {
          comp = a.date.localeCompare(b.date);
        } else if (sortField === 'customerName') {
          comp = a.customerName.localeCompare(b.customerName);
        }
        return sortOrder === 'desc' ? -comp : comp;
      });
  }, [reservations, searchTerm, statusFilter, staffFilter, dateFilter, sortField, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const total = reservations.length;
    const pending = reservations.filter((r) => !r.status || r.status === 'pending').length;
    const confirmed = reservations.filter((r) => r.status === 'confirmed').length;
    const completed = reservations.filter((r) => r.status === 'completed').length;
    const totalGuests = reservations.reduce((sum, r) => sum + (r.guestCount || 1), 0);
    return { total, pending, confirmed, completed, totalGuests };
  }, [reservations]);

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center pt-24 pb-20 bg-gradient-to-b from-[#F2F7FB] via-[#FAFBFD] to-[#EEF5FB]">
        <div className="flex flex-col items-center gap-3 text-[#244A72]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#35618F]" />
          <span className="text-sm font-bold font-cinzel tracking-wider">載入管理員系統中...</span>
        </div>
      </div>
    );
  }

  // Not logged in view
  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-80px)] pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F2F7FB] via-[#FAFBFD] to-[#EEF5FB] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/95 rounded-3xl border border-[#CBDDEB] shadow-lg p-8 sm:p-10 text-center backdrop-blur-xs"
        >
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#23466B] border border-[#3A648F] flex items-center justify-center text-amber-300 shadow-md mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold font-serif-tc text-[#15324E] mb-6">
            管理後台
          </h2>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-left space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-bold text-rose-900">
                  {unauthorizedDomain ? '尚未授權此網域進行 Google 登入' : '登入發生錯誤'}
                </span>
              </div>
              <p className="text-rose-700 leading-relaxed text-[11px]">
                {errorMsg}
              </p>
              {unauthorizedDomain && (
                <div className="pt-2 border-t border-rose-200/80 space-y-2">
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-rose-200 text-[11px] font-mono">
                    <span className="truncate max-w-[200px]">{unauthorizedDomain}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(unauthorizedDomain);
                        setActionSuccess('網域已複製到剪貼簿');
                        setTimeout(() => setActionSuccess(null), 2500);
                      }}
                      className="text-rose-700 hover:text-rose-900 font-sans font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Copy className="w-3 h-3" />
                      <span>複製網域</span>
                    </button>
                  </div>
                  <a
                    href="https://console.firebase.google.com/project/commission-app-484109/authentication/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#23466B] hover:underline"
                  >
                    <span>開啟 Firebase Console 授權網域設定頁</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#23466B] hover:bg-[#183654] text-white font-bold text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>使用 Google 帳號快速登入</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] pt-20 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F2F7FB] via-[#FAFBFD] to-[#EEF5FB] text-[#223B55]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ========================================================= */}
        {/* TOP BAR / ADMIN HEADER */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 rounded-3xl border border-[#CBDDEB] p-5 sm:p-6 shadow-sm backdrop-blur-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#23466B] to-[#162F4A] flex items-center justify-center text-amber-300 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-serif-tc text-[#15324E]">
                  預約訂單管理後台
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  即時連線中
                </span>
              </div>
              <p className="text-xs text-[#527191] mt-0.5">
                直接監聽 Firebase Firestore 即時資料庫，新預約送出後此頁面秒級同步，不再依賴 DC Webhook。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            {currentUser && (
              <div className="flex items-center gap-2.5 bg-[#EAF2F8] px-3.5 py-2 rounded-2xl border border-[#CBDDEB] text-xs">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ''}
                    className="w-7 h-7 rounded-full border border-white shadow-2xs"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#23466B] text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <div className="font-bold text-[#1E3B5C] truncate max-w-[140px]">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-[#6382A0] font-mono">
                    管理員
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 hover:bg-white/80 rounded-xl text-[#3E6388] hover:text-rose-600 transition-colors cursor-pointer"
                  title="登出後台"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action toast message */}
        <AnimatePresence>
          {actionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 rounded-2xl bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{actionSuccess}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* STATS OVERVIEW CARDS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/90 p-4 rounded-3xl border border-[#CBDDEB] shadow-2xs">
            <div className="flex items-center justify-between text-xs text-[#5C7D9E] mb-1">
              <span>累積總預約</span>
              <Calendar className="w-4 h-4 text-[#35618F]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-cinzel text-[#15324E]">
              {stats.total}
              <span className="text-xs font-normal text-[#5C7D9E] ml-1">筆</span>
            </div>
          </div>

          <div className="bg-amber-50/70 p-4 rounded-3xl border border-amber-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
              <span>待確認 / 待接待</span>
              <Clock3 className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-cinzel text-amber-900">
              {stats.pending}
              <span className="text-xs font-normal text-amber-700 ml-1">筆</span>
            </div>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-3xl border border-emerald-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-emerald-800 mb-1">
              <span>已確認留位</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-cinzel text-emerald-900">
              {stats.confirmed}
              <span className="text-xs font-normal text-emerald-700 ml-1">筆</span>
            </div>
          </div>

          <div className="bg-sky-50/70 p-4 rounded-3xl border border-sky-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-sky-800 mb-1">
              <span>預計入席主人總數</span>
              <Users className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-cinzel text-sky-900">
              {stats.totalGuests}
              <span className="text-xs font-normal text-sky-700 ml-1">位</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TOOLBAR: SEARCH, FILTERS & EXPORT */}
        {/* ========================================================= */}
        <div className="bg-white/90 rounded-3xl border border-[#CBDDEB] p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6484A4]" />
              <input
                type="text"
                placeholder="搜尋預約代碼、主人尊稱、侍從或聯絡方式..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-2xl bg-[#F0F5FA] border border-[#CBDDEB] focus:border-[#23466B] focus:bg-white focus:outline-none text-[#183654] transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-2xl bg-[#23466B] hover:bg-[#183654] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              title="匯出當前篩選預約名單為 CSV 試算表"
            >
              <Download className="w-3.5 h-3.5" />
              <span>匯出 CSV 名單 ({filteredReservations.length})</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E3EDF6] text-xs">
            <span className="text-[#6484A4] font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> 篩選：
            </span>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#F0F5FA] border border-[#CBDDEB] text-[#1E3B5C] font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">所有狀態</option>
              <option value="pending">待確認 (Pending)</option>
              <option value="confirmed">已留位 (Confirmed)</option>
              <option value="completed">已接待完畢 (Completed)</option>
              <option value="cancelled">已取消 (Cancelled)</option>
            </select>

            {/* Staff Filter */}
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#F0F5FA] border border-[#CBDDEB] text-[#1E3B5C] font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">所有指定侍從</option>
              <option value="不指名">不指名 (館內安排)</option>
              {STAFF_MEMBERS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.role === 'maid' ? '女僕' : '執事'})
                </option>
              ))}
            </select>

            {/* Date Search */}
            <input
              type="text"
              placeholder="預約日期篩選 (例: 09/12)"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#F0F5FA] border border-[#CBDDEB] text-[#1E3B5C] placeholder:text-[#88A4C0] font-medium focus:outline-none max-w-[180px]"
            />

            {(searchTerm || statusFilter !== 'all' || staffFilter !== 'all' || dateFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setStaffFilter('all');
                  setDateFilter('');
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold cursor-pointer transition-colors"
              >
                重置篩選
              </button>
            )}

            <div className="ml-auto text-[#6484A4] text-xs">
              共顯示 <strong className="text-[#1E3B5C]">{filteredReservations.length}</strong> 筆預約
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN CONTENT: TABLE & DETAIL DRAWER */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Reservation List Table */}
          <div className="lg:col-span-8 bg-white/95 rounded-3xl border border-[#CBDDEB] shadow-sm overflow-hidden">
            {loadingData ? (
              <div className="p-12 text-center text-[#5C7D9E] space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#35618F]" />
                <p className="text-xs">即時同步 Firestore 預約資料中...</p>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="p-12 text-center text-[#5C7D9E] space-y-3">
                <Coffee className="w-10 h-10 mx-auto text-[#90B0D0] opacity-60" />
                <p className="text-sm font-bold font-serif-tc text-[#244A72]">目前尚無符合條件的預約訂單</p>
                <p className="text-xs text-[#708FAE]">
                  當前主人送出預約後，將即時自動出現在此列表。
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#EBF3FA] text-[#2F5278] border-b border-[#CBDDEB] font-bold">
                    <tr>
                      <th className="py-3 px-4">預約代碼</th>
                      <th className="py-3 px-4">日期 / 時段</th>
                      <th className="py-3 px-4">主人尊稱</th>
                      <th className="py-3 px-4">指定侍從</th>
                      <th className="py-3 px-4">人數</th>
                      <th className="py-3 px-4">狀態</th>
                      <th className="py-3 px-4 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6EEF5]">
                    {filteredReservations.map((res) => {
                      const isSelected = selectedReservation?.id === res.id;
                      const status = res.status || 'pending';

                      return (
                        <tr
                          key={res.id}
                          onClick={() => {
                            setSelectedReservation(res);
                            setEditingNotes(res.adminNotes || '');
                          }}
                          className={`hover:bg-[#F2F7FC] transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#E3EFFB]' : ''
                          }`}
                        >
                          {/* Code */}
                          <td className="py-3 px-4 font-mono font-bold text-[#1D3E61] whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span>{res.id}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyCode(res.id);
                                }}
                                className="p-1 hover:bg-black/5 rounded text-slate-400 hover:text-slate-700"
                                title="複製預約代碼"
                              >
                                {copiedId === res.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Date / Time */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold text-[#1E3B5C] font-serif-tc">{res.date}</div>
                            <div className="text-[11px] text-[#6080A0] font-mono">{res.timeSlot}</div>
                          </td>

                          {/* Customer */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#15324E] font-serif-tc">{res.customerName}</div>
                            <div className="text-[11px] text-[#6080A0]">{res.worldServer}</div>
                          </td>

                          {/* Staff */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-bold text-[#2A517A] bg-white/80 px-2 py-0.5 rounded-md border border-[#CBDDEB]">
                              {res.staffName}
                            </span>
                          </td>

                          {/* Guests */}
                          <td className="py-3 px-4 whitespace-nowrap font-medium text-[#1E3B5C]">
                            {res.guestCount} 位
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px]">
                                <Clock3 className="w-3 h-3 text-amber-600" />
                                待確認
                              </span>
                            )}
                            {status === 'confirmed' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                已留位
                              </span>
                            )}
                            {status === 'completed' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-bold text-[11px]">
                                <Check className="w-3 h-3 text-sky-600" />
                                已接待完畢
                              </span>
                            )}
                            {status === 'cancelled' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 font-bold text-[11px]">
                                <XCircle className="w-3 h-3 text-slate-500" />
                                已取消
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {status === 'pending' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(res.id, 'confirmed');
                                  }}
                                  className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                                  title="確認此訂單留位"
                                >
                                  確認留位
                                </button>
                              )}
                              {status === 'confirmed' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(res.id, 'completed');
                                  }}
                                  className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                                  title="標記為已接待完畢"
                                >
                                  完成接待
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteReservation(res.id);
                                }}
                                className="p-1 hover:bg-rose-100 rounded text-slate-400 hover:text-rose-600 transition-colors"
                                title="刪除預約"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Reservation Detail View Drawer */}
          <div className="lg:col-span-4 bg-white/95 rounded-3xl border border-[#CBDDEB] shadow-sm p-6 sticky top-24 space-y-5">
            {selectedReservation ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-[#E3EDF6] pb-3">
                  <div>
                    <span className="text-[10px] font-cinzel font-bold text-[#5B7D9E] tracking-wider uppercase">
                      Reservation Details
                    </span>
                    <h3 className="text-lg font-bold font-serif-tc text-[#15324E] flex items-center gap-2">
                      <span>{selectedReservation.customerName}</span>
                      <span className="text-xs font-normal text-[#5B7D9E]">
                        ({selectedReservation.guestCount} 位)
                      </span>
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedReservation(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 p-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Status Switcher */}
                <div className="p-3 rounded-2xl bg-[#F0F5FA] border border-[#CBDDEB] space-y-2">
                  <span className="text-xs font-bold text-[#2A4D70] block">預約狀態標記：</span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <button
                      onClick={() => handleUpdateStatus(selectedReservation.id, 'pending')}
                      className={`py-1.5 px-2 rounded-xl font-bold transition-all ${
                        selectedReservation.status === 'pending'
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-white hover:bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      待確認 (留位中)
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedReservation.id, 'confirmed')}
                      className={`py-1.5 px-2 rounded-xl font-bold transition-all ${
                        selectedReservation.status === 'confirmed'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      ✓ 已確認留位
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedReservation.id, 'completed')}
                      className={`py-1.5 px-2 rounded-xl font-bold transition-all ${
                        selectedReservation.status === 'completed'
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'bg-white hover:bg-sky-50 text-sky-800 border border-sky-200'
                      }`}
                    >
                      已接待完畢
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedReservation.id, 'cancelled')}
                      className={`py-1.5 px-2 rounded-xl font-bold transition-all ${
                        selectedReservation.status === 'cancelled'
                          ? 'bg-slate-600 text-white shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      已取消
                    </button>
                  </div>
                </div>

                {/* Info Fields */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-[#6484A4]">預約代碼：</span>
                    <span className="font-mono font-bold text-[#1E3B5C]">
                      {selectedReservation.id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-[#6484A4]">入席日期時段：</span>
                    <span className="font-bold text-[#1E3B5C]">
                      {selectedReservation.date}（{selectedReservation.timeSlot}）
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-[#6484A4]">指定侍從：</span>
                    <span className="font-bold text-amber-700 font-serif-tc">
                      {selectedReservation.staffName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-[#6484A4]">所屬伺服器：</span>
                    <span className="font-medium text-[#1E3B5C]">
                      {selectedReservation.worldServer}
                    </span>
                  </div>

                  <div className="py-1 border-b border-slate-100">
                    <span className="text-[#6484A4] block mb-0.5">遊戲內聯絡方式：</span>
                    <span className="font-medium text-[#1E3B5C] bg-[#F4F8FC] p-1.5 rounded-lg block break-all">
                      {selectedReservation.contactMethod || '未填寫'}
                    </span>
                  </div>

                  {/* Pre-order dishes */}
                  <div className="py-1 border-b border-slate-100">
                    <span className="text-[#6484A4] block mb-1">預選餐點清單：</span>
                    {selectedReservation.selectedDishes && selectedReservation.selectedDishes.length > 0 ? (
                      <div className="space-y-1 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                        {selectedReservation.selectedDishes.map((dish, i) => (
                          <div key={i} className="flex items-center justify-between text-[#28496D]">
                            <span>
                              • {dish.name} × {dish.quantity}
                            </span>
                            <span className="font-mono text-[11px] text-[#557697]">
                              {(dish.price * dish.quantity).toLocaleString()} Gil
                            </span>
                          </div>
                        ))}
                        <div className="pt-1.5 border-t border-amber-200/60 text-right font-bold text-amber-900 text-xs">
                          合計：{' '}
                          {selectedReservation.selectedDishes
                            .reduce((sum, d) => sum + d.price * d.quantity, 0)
                            .toLocaleString()}{' '}
                          Gil
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">無預選餐點（入席後現場點餐）</span>
                    )}
                  </div>

                  {/* Special requests */}
                  <div className="py-1 border-b border-slate-100">
                    <span className="text-[#6484A4] block mb-1">特別備註與需求：</span>
                    <div className="bg-[#F4F8FC] p-2.5 rounded-xl border border-[#CBDDEB] text-[#244A72] text-xs leading-relaxed">
                      {selectedReservation.specialRequests || '無特別備註'}
                    </div>
                  </div>

                  {/* Internal Admin Notes */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#1E3B5C] flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-[#35618F]" />
                        內部侍從備註（非公開）：
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="例如：主人喜歡香草茶、指定安排安靜靠窗位、過敏注意事項..."
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-[#CBDDEB] text-xs text-[#1E3B5C] focus:border-[#23466B] focus:outline-none"
                    />
                    <div className="flex justify-end mt-1.5">
                      <button
                        onClick={handleSaveNotes}
                        disabled={isSavingNotes}
                        className="px-3 py-1.5 rounded-xl bg-[#23466B] hover:bg-[#183654] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-3 h-3" />
                        <span>{isSavingNotes ? '儲存中...' : '儲存備註'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[#6484A4] space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-[#A5C2DE]" />
                <p className="text-xs font-bold font-serif-tc text-[#244A72]">請點擊左側列表任一筆預約</p>
                <p className="text-[11px] text-[#7896B2]">
                  可在此檢視詳細資料、變更狀態為已確認/已接待，以及填寫侍從內部備註。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
