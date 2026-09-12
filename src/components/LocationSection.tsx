import { useState, useEffect, FormEvent } from 'react';
import { MapPin, Navigation, Copy, Check, Compass, MessageSquare, Send, Sparkles, Home, Clock } from 'lucide-react';
import { SHOP_INFO, STAFF_MEMBERS } from '../data/cafeData';
import { GuestbookEntry } from '../types';
import { playChime } from '../utils/audio';

export function LocationSection() {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedTell, setCopiedTell] = useState(false);

  // Guestbook state with default charming FF14 adventurer messages
  const [entries, setEntries] = useState<GuestbookEntry[]>(() => {
    const saved = localStorage.getItem('nocturne_guestbook');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: '1',
        characterName: 'Luna Starlight',
        server: '利維坦',
        message: '上週五和冒險者夥伴一起來，璐可畫的莫古力蛋包飯太可愛了！執事萊可手沖的大吉嶺茶香氣很棒～',
        favoriteStaff: '璐可',
        date: '2026-09-02',
        stamp: '✨',
      },
      {
        id: '2',
        characterName: 'Klaus Silverberg',
        server: '利維坦',
        message: '剛打完絕本整個人都虛脫了，吃到胖冬瓜的厚切炙烤牛排簡直原地復活！感謝各位女僕執事！',
        favoriteStaff: '胖冬瓜',
        date: '2026-09-04',
        stamp: '🥩',
      },
      {
        id: '3',
        characterName: 'Mimi Cotton',
        server: '利維坦',
        message: '栗栗皆辛苦超有活力！薰衣草苗圃46號的庭園星光夜景超級好拍，Gpose拍了整整兩個小時！',
        favoriteStaff: '栗栗皆辛苦',
        date: '2026-09-06',
        stamp: '🌸',
      },
    ];
  });

  const [charName, setCharName] = useState('');
  const [serverName, setServerName] = useState('利維坦');
  const [guestMessage, setGuestMessage] = useState('');
  const [favStaff, setFavStaff] = useState('萊可');
  const [selectedStamp, setSelectedStamp] = useState('✨');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Taiwan Time (GMT+8)
  const taipeiDate = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Asia/Taipei' }));
  const dayOfWeek = taipeiDate.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  const hours = taipeiDate.getHours();
  const minutes = taipeiDate.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // Business hours: Friday (5) and Saturday (6) from 20:30 to 24:00 (GMT+8)
  const isOpen = (dayOfWeek === 5 || dayOfWeek === 6) && totalMinutes >= 20 * 60 + 30 && totalMinutes < 24 * 60;

  const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  const currentDayName = dayNames[dayOfWeek];
  const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(taipeiDate.getSeconds()).padStart(2, '0')}`;

  let nextOpenText = '本週五 20:30 開館';
  if (dayOfWeek === 5) {
    if (totalMinutes < 20 * 60 + 30) {
      nextOpenText = '今日 (週五) 20:30 準時開館';
    } else {
      nextOpenText = '明日 (週六) 20:30 開館';
    }
  } else if (dayOfWeek === 6) {
    if (totalMinutes < 20 * 60 + 30) {
      nextOpenText = '今日 (週六) 20:30 準時開館';
    } else {
      nextOpenText = '下週五 20:30 開館';
    }
  } else {
    nextOpenText = '本週五 20:30 開館';
  }

  useEffect(() => {
    localStorage.setItem('nocturne_guestbook', JSON.stringify(entries));
  }, [entries]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(SHOP_INFO.fullLocation);
    setCopiedAddress(true);
    playChime();
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyTell = () => {
    const tellText = `/tell Laiko Nocturne@Leviathan 您好，我想預約/詢問夜蒔館的入座！`;
    navigator.clipboard.writeText(tellText);
    setCopiedTell(true);
    playChime();
    setTimeout(() => setCopiedTell(false), 2000);
  };

  const handleAddGuestbook = (e: FormEvent) => {
    e.preventDefault();
    if (!charName.trim() || !guestMessage.trim()) return;

    const newEntry: GuestbookEntry = {
      id: Date.now().toString(),
      characterName: charName.trim(),
      server: serverName.trim() || '利維坦',
      message: guestMessage.trim(),
      favoriteStaff: favStaff,
      date: new Date().toISOString().split('T')[0],
      stamp: selectedStamp,
    };

    setEntries([newEntry, ...entries]);
    setCharName('');
    setGuestMessage('');
    setHasSubmitted(true);
    playChime(1.2);
    setTimeout(() => setHasSubmitted(false), 3000);
  };

  const steps = [
    {
      step: '01',
      title: '前往格里達尼亞',
      desc: '使用以太之光傳送至「格里達尼亞新街」，前往都市傳送網或青翠水路乘船處。',
    },
    {
      step: '02',
      title: '進入薰衣草苗圃 12區',
      desc: '選擇居住區住宅區「薰衣草苗圃 (The Lavender Beds)」，點選進入第 12 分區。',
    },
    {
      step: '03',
      title: '搭乘都市內小水晶',
      desc: '在苗圃入口點擊以太之光，轉移至「樹陰小區（東南）[Shaded Bower]」。',
    },
    {
      step: '04',
      title: '南行抵達 46號門牌',
      desc: '往正南方漫步約 30 秒，即可看見點亮星光路燈與紫藤花花拱的「夜蒔館」大門！',
    },
  ];

  return (
    <section id="location" className="pt-24 sm:pt-28 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF2F8] text-[#28496C] text-xs font-semibold tracking-wider uppercase mb-3 border border-[#D5E3EF]">
            <Compass className="w-3.5 h-3.5 text-[#4A729A]" />
            <span>Access &amp; Location</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1B3047] font-cinzel">
            夜蒔館・地址與交通指南
          </h2>
          <div className="w-12 h-0.5 bg-[#8FB3D5] mx-auto mt-4 mb-4 rounded-full" />
          <p className="text-[#516C85] text-sm sm:text-base leading-relaxed">
            位於黑衣森林懷抱中的薰衣草苗圃，循著星光與茶香前來。
          </p>
        </div>

        {/* Current Business Hours Display Area (目前營業時間) */}
        <div
          id="current-business-hours-area"
          className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-white via-[#F8FBFE] to-[#EFF6FC] border border-[#CBDDEB] shadow-2xs text-left"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4.5">
              {/* Clock Icon container with glowing outline */}
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs transition-colors ${
                  isOpen
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-600 shadow-[0_0_16px_rgba(16,185,129,0.25)]'
                    : 'bg-[#EBF3FA] border-[#CADDEC] text-[#30537A]'
                }`}
                title="目前營業時段"
              >
                <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <div>
                <div className="flex items-center flex-wrap gap-2.5 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4A6E94] font-cinzel">
                    Business Hours
                  </span>

                  {/* Status Indicator: 營業中 vs 休息中 */}
                  {isOpen ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500 text-white shadow-xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                      </span>
                      <span>營業中・OPEN</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#E2EBF5] text-[#335375] border border-[#C5D9EB]">
                      <span className="h-2 w-2 rounded-full bg-[#6484A4]" />
                      <span>休息中・CLOSED</span>
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#17304B] font-serif-tc flex flex-wrap items-baseline gap-2">
                  <span>目前營業時間：</span>
                  <span className="text-sm sm:text-base font-semibold text-[#2D5076]">
                    {SHOP_INFO.businessHours}
                  </span>
                </h3>

                <p className="text-xs sm:text-sm text-[#57728D] mt-1">
                  {isOpen
                    ? '門扉已為您敞開，女僕與執事恭候主人光臨！隨時歡迎入座。'
                    : `目前為閉館休養時段，${nextOpenText}，期待為您卸下一整天的疲憊。`}
                </p>
              </div>
            </div>

            {/* Current Real-time Clock display */}
            <div className="w-full md:w-auto shrink-0 flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-[#E2ECF5] pt-3 md:pt-0">
              <span className="text-[11px] font-semibold text-[#6684A2] tracking-wider uppercase">
                當前台灣時間 (GMT+8)
              </span>
              <div className="font-mono text-base sm:text-lg font-bold text-[#1C3A5A] tracking-wider bg-white/90 px-3.5 py-1 rounded-xl border border-[#D5E3EE] shadow-2xs">
                {currentDayName} {timeString}
              </div>
            </div>
          </div>
        </div>

        {/* Big Address Highlight Hero Box */}
        <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#EEF4FA] via-[#F8FAFC] to-[#E8F1F9] border border-[#CBDDEB] shadow-xs">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5 text-left">
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#CADDEC] flex items-center justify-center text-[#2A4C70] shrink-0 shadow-2xs">
                <MapPin className="w-7 h-7 text-[#3B628A]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#DCE8F5] text-[#244569] border border-[#CADAE8]">
                    {SHOP_INFO.server}
                  </span>
                  <span className="text-xs text-[#5D7A96] flex items-center gap-1">
                    <Home className="w-3.5 h-3.5" />
                    <span>{SHOP_INFO.houseSize}</span>
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#19324B] tracking-wide font-cinzel">
                  {SHOP_INFO.fullLocation}
                </h3>
                <p className="text-xs sm:text-sm text-[#4E6A85] mt-1">
                  利維坦（Leviathan）伺服器・薰衣草苗圃第12分區46號
                </p>
              </div>
            </div>

            {/* Copy Address Button */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleCopyAddress}
                className="px-5 py-3 rounded-xl bg-[#2C4E73] hover:bg-[#203C5A] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {copiedAddress ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>已複製完整地址！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>一鍵複製門牌地址</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyTell}
                className="px-4 py-3 rounded-xl bg-white hover:bg-[#F3F7FA] text-[#2D4D6F] border border-[#CBDDEB] text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-2xs"
                title="複製遊戲內 /tell 詢問指令"
              >
                {copiedTell ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>已複製 /tell 宏！</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 text-[#4A729A]" />
                    <span>複製遊戲內 /tell 宏</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Step-by-Step Navigation Map Cards */}
        <div className="mb-16">
          <h3 className="text-xl font-bold text-[#1C334A] mb-6 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#4A729A]" />
            <span>遊戲內前往導航路線</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#FAFBFD] border border-[#DCE7F0] hover:border-[#B5CEE3] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-[#3B5F86] bg-[#EAF2F9] px-2.5 py-1 rounded-lg">
                      STEP {item.step}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#87A8C8]" />
                  </div>
                  <h4 className="font-bold text-[#1E354C] text-sm mb-2 font-serif-tc">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#526B82] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visit & Atmosphere Guide + Guestbook */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Exterior & Highlights */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-[#FAFBFD] border border-[#DCE7F0]">
              <h4 className="font-bold text-base text-[#1E344A] mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4A729A]" />
                <span>庭園與建築特色地標</span>
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#4D6780]">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6B96C0] mt-1.5 shrink-0" />
                  <span><strong>星光庭園噴泉：</strong>入夜後會泛起微光的精靈族古風噴泉，水波流動時極為優雅。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6B96C0] mt-1.5 shrink-0" />
                  <span><strong>紫藤花夜蒔拱門：</strong>大門入口垂掛盛開的淡藍紫藤，兩側點綴柔和燭台。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6B96C0] mt-1.5 shrink-0" />
                  <span><strong>一樓主廳與二樓茶座：</strong>寬敞英式沙發長桌、鋼琴演奏席與私密景觀雅座。</span>
                </li>
              </ul>

              <div className="mt-5 p-3 rounded-xl bg-[#EFF5FA] border border-[#D5E4F2] text-xs text-[#355474] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#4A729A] shrink-0" />
                <span>每週五、六 20:30~24:00，門扉常開，隨時恭迎主人歸來！</span>
              </div>
            </div>
          </div>

          {/* Right: Interactive Guestbook (冒險者來訪留言本) */}
          <div className="lg:col-span-7 bg-[#FAFBFD] rounded-2xl border border-[#DCE7F0] p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#4A729A]" />
                <h4 className="font-bold text-base text-[#1E344A] font-serif-tc">
                  夜蒔訪客留言本
                </h4>
              </div>
              <span className="text-xs text-[#637D97]">已收錄 {entries.length} 則溫馨手札</span>
            </div>

            {/* Leave message form */}
            <form onSubmit={handleAddGuestbook} className="space-y-3 mb-6 p-4 rounded-xl bg-white border border-[#E2EAF2]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#48637E] mb-1">
                    角色名稱 (ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={charName}
                    onChange={(e) => setCharName(e.target.value)}
                    placeholder="例如：Miqo'te Star"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs focus:outline-none focus:ring-1 focus:ring-[#4A729A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#48637E] mb-1">
                    伺服器
                  </label>
                  <input
                    type="text"
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
                    最喜愛的女僕
                  </label>
                  <select
                    value={favStaff}
                    onChange={(e) => setFavStaff(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#1E293B]"
                  >
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
                    {['✨', '☕', '🍰', '🌸', '🐾'].map((stamp) => (
                      <button
                        key={stamp}
                        type="button"
                        onClick={() => setSelectedStamp(stamp)}
                        className={`w-7 h-7 rounded-md text-xs flex items-center justify-center transition-all ${
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
                <label className="block text-[11px] font-semibold text-[#48637E] mb-1">
                  寫下對夜蒔館的期待或到訪心情
                </label>
                <textarea
                  required
                  rows={2}
                  value={guestMessage}
                  onChange={(e) => setGuestMessage(e.target.value)}
                  placeholder="留下您的溫暖話語，讓女僕與執事們看到..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs focus:outline-none focus:ring-1 focus:ring-[#4A729A]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {hasSubmitted && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" /> 留言已寫入手札！
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-4 py-1.5 rounded-lg bg-[#2B4B6E] hover:bg-[#203A56] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>蓋章留言</span>
                </button>
              </div>
            </form>

            {/* List of recent guestbook entries */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-xl bg-white border border-[#E3EAF2] text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#1F364E]">
                      <span>{entry.stamp}</span>
                      <span>{entry.characterName}</span>
                      <span className="text-[10px] font-normal text-[#64748B]">
                        @{entry.server}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#869BB0]">
                      致【{entry.favoriteStaff}】・{entry.date}
                    </div>
                  </div>
                  <p className="text-[#476077] leading-relaxed font-serif-tc">
                    {entry.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
