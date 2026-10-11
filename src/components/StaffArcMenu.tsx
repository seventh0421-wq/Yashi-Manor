import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { STAFF_MEMBERS } from '../data/cafeData';
import { StaffAvatar } from './StaffAvatars';
import { playChime } from '../utils/audio';
import { triggerTopProgress } from '../utils/progress';

interface StaffArcMenuProps {
  selectedIndex: number;
  onSelectStaff: (index: number) => void;
}

interface ArcNode {
  id: string;
  type: 'staff' | 'nav-prev' | 'nav-next';
  staffIndex?: number;
  x: number; // in pixels from left edge
  y: number; // in pixels from top edge
  size: number; // diameter in pixels
}

/**
 * 7 Circular Nodes along the left crescent arc, matching the user's reference drawing:
 * - Node 0 (Top): Prev / Celestial Orb (x: 18, y: 18)
 * - Node 1: 萊可 (x: 72, y: 136)
 * - Node 2: 璐可 (x: 135, y: 258)
 * - Node 3 (Peak Apex): 栗栗皆辛苦 (x: 166, y: 382)
 * - Node 4: 胖冬瓜 (x: 135, y: 506)
 * - Node 5: 薯泥勇者 (x: 72, y: 628)
 * - Node 6 (Bottom): Next / Celestial Orb (x: 18, y: 746)
 */
export function StaffArcMenu({ selectedIndex, onSelectStaff }: StaffArcMenuProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Dynamically calculate smooth crescent arc nodes for any number of staff members
  const arcNodes: ArcNode[] = React.useMemo(() => {
    const nodes: ArcNode[] = [];
    const count = STAFF_MEMBERS.length;
    const topY = 16;
    const bottomY = 770;
    const navSize = 68;
    const staffSize = count >= 7 ? 78 : count > 5 ? 84 : 88;

    // Top Prev Orb
    nodes.push({ id: 'arc-nav-prev', type: 'nav-prev', x: 18, y: topY, size: navSize });

    // Staff nodes evenly curved along the crescent
    for (let i = 0; i < count; i++) {
      const t = (i + 1) / (count + 1);
      const y = Math.round(topY + t * (bottomY - topY));
      const x = Math.round(18 + Math.sin(t * Math.PI) * 148);
      nodes.push({
        id: `arc-staff-${i}`,
        type: 'staff',
        staffIndex: i,
        x,
        y,
        size: staffSize,
      });
    }

    // Bottom Next Orb
    nodes.push({ id: 'arc-nav-next', type: 'nav-next', x: 18, y: bottomY, size: navSize });
    return nodes;
  }, []);

  const handleSelect = (idx: number) => {
    if (idx === selectedIndex) return;
    triggerTopProgress();
    playChime(1.15);
    onSelectStaff(idx);
  };

  const handlePrev = () => {
    const nextIdx = (selectedIndex - 1 + STAFF_MEMBERS.length) % STAFF_MEMBERS.length;
    handleSelect(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (selectedIndex + 1) % STAFF_MEMBERS.length;
    handleSelect(nextIdx);
  };

  // Wheel listener to scroll through staff
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 25) return;
    if (e.deltaY > 0) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  return (
    <div
      className="relative select-none"
      onWheel={handleWheel}
    >
      {/* ========================================================= */}
      {/* DESKTOP VIEW: FULL-HEIGHT SWEEPING CIRCULAR ARC (≥ lg)     */}
      {/* ========================================================= */}
      <div className="hidden lg:flex items-center justify-start">
        <div className="relative w-[280px] xl:w-[300px] h-[840px] origin-left scale-[0.82] xl:scale-[0.92] 2xl:scale-100 transition-transform duration-300">
          {/* Subtle Celestial Orbit Arc Guide Track */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0"
            viewBox="0 0 280 840"
            fill="none"
          >
            <defs>
              <linearGradient id="arcTrackGradient" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#82ADD6" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#25507A" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#82ADD6" stopOpacity="0.2" />
              </linearGradient>
              <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Glowing outer aura track */}
            <path
              d="M 53 51 Q 235 420 53 800"
              stroke="url(#arcTrackGradient)"
              strokeWidth="3.2"
              strokeDasharray="6 8"
              fill="none"
              filter="url(#arcGlow)"
              className="opacity-75"
            />

            {/* Starlight Constellation Dots along the track */}
            <circle cx="88" cy="175" r="2.5" fill="#4B7BAA" opacity="0.65" />
            <circle cx="148" cy="285" r="3" fill="#4B7BAA" opacity="0.75" />
            <circle cx="168" cy="420" r="3" fill="#4B7BAA" opacity="0.8" />
            <circle cx="148" cy="555" r="3" fill="#4B7BAA" opacity="0.75" />
            <circle cx="88" cy="665" r="2.5" fill="#4B7BAA" opacity="0.65" />
          </svg>

          {/* Circular Nodes along the arc */}
          {arcNodes.map((node) => {
            // 1. TOP NAV PREV ORB
            if (node.type === 'nav-prev') {
              return (
                <button
                  key={node.id}
                  id="staff-arc-prev-btn"
                  type="button"
                  onClick={handlePrev}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${node.size}px`,
                    height: `${node.size}px`,
                  }}
                  className="group z-10 cursor-pointer rounded-full bg-gradient-to-b from-white via-[#F2F7FC] to-[#DDE9F5] border-2 border-[#A0C2DE] hover:border-[#204970] shadow-[0_4px_16px_rgba(35,70,105,0.15)] hover:shadow-[0_6px_22px_rgba(35,70,105,0.25)] flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none"
                  title="上一位侍從 (Prev)"
                >
                  <ChevronUp className="w-5 h-5 text-[#204970] group-hover:text-[#0C243E] transition-transform duration-200 group-hover:-translate-y-0.5" />
                  <span className="text-[10px] font-black text-[#305980] font-serif-tc tracking-wider">
                    PREV
                  </span>
                </button>
              );
            }

            // 2. BOTTOM NAV NEXT ORB
            if (node.type === 'nav-next') {
              return (
                <button
                  key={node.id}
                  id="staff-arc-next-btn"
                  type="button"
                  onClick={handleNext}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${node.size}px`,
                    height: `${node.size}px`,
                  }}
                  className="group z-10 cursor-pointer rounded-full bg-gradient-to-b from-white via-[#F2F7FC] to-[#DDE9F5] border-2 border-[#A0C2DE] hover:border-[#204970] shadow-[0_4px_16px_rgba(35,70,105,0.15)] hover:shadow-[0_6px_22px_rgba(35,70,105,0.25)] flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none"
                  title="下一位侍從 (Next)"
                >
                  <span className="text-[10px] font-black text-[#305980] font-serif-tc tracking-wider">
                    NEXT
                  </span>
                  <ChevronDown className="w-5 h-5 text-[#204970] group-hover:text-[#0C243E] transition-transform duration-200 group-hover:translate-y-0.5" />
                </button>
              );
            }

            // 3. STAFF MEMBER CIRCULAR AVATARS (5 Members)
            if (node.type === 'staff' && node.staffIndex !== undefined) {
              const staff = STAFF_MEMBERS[node.staffIndex];
              const isSelected = selectedIndex === node.staffIndex;
              const isHovered = hoveredNodeId === node.id;

              return (
                <div
                  key={node.id}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                  }}
                  className={`transition-all duration-300 ${isSelected ? 'z-30' : 'z-10'}`}
                >
                  <button
                    id={`staff-arc-node-${staff.id}`}
                    type="button"
                    onClick={() => handleSelect(node.staffIndex!)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    style={{
                      width: `${isSelected ? node.size + 14 : node.size}px`,
                      height: `${isSelected ? node.size + 14 : node.size}px`,
                      transform: isSelected ? 'translate(-7px, -7px)' : 'none',
                    }}
                    className={`group relative rounded-full cursor-pointer focus:outline-none transition-all duration-300 p-1 flex items-center justify-center ${
                      isSelected
                        ? 'scale-105 shadow-[0_10px_28px_rgba(20,50,85,0.28)]'
                        : 'hover:scale-108 shadow-[0_6px_18px_rgba(30,60,95,0.16)] hover:shadow-[0_8px_24px_rgba(20,50,85,0.22)]'
                    }`}
                    title={`${staff.name}（${staff.role === 'butler' ? '執事' : '女僕'}）- 點選切換`}
                  >
                    {/* Outer Pulsing Aura Ring on Selection */}
                    {isSelected && (
                      <div
                        className="absolute -inset-1.5 rounded-full animate-pulse pointer-events-none opacity-70 blur-xs"
                        style={{ backgroundColor: staff.themeColor }}
                      />
                    )}

                    {/* Circular Avatar Container with Porcelain Border */}
                    <div
                      className={`relative w-full h-full rounded-full overflow-hidden bg-white border-2 transition-all duration-300 flex items-center justify-center ${
                        isSelected
                          ? 'border-white ring-4'
                          : 'border-[#CBDDEB] group-hover:border-[#6B9AC4]'
                      }`}
                      style={{
                        boxShadow: isSelected
                          ? `0 0 0 3px ${staff.themeColor}, 0 4px 16px rgba(0,0,0,0.18)`
                          : undefined,
                      }}
                    >
                      <StaffAvatar
                        seed={staff.avatarSeed}
                        avatarUrl={staff.avatarUrl || staff.photoUrl}
                        size="lg"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-108"
                      />

                      {/* Frosted Glass Overlay with Staff Name on Hover or Active Selection */}
                      <div
                        className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-1.5 transition-all duration-300 z-10 ${
                          isSelected
                            ? 'opacity-100 bg-gradient-to-b from-[#081827]/40 via-[#0C2238]/55 to-[#081827]/70 backdrop-blur-[2.5px]'
                            : 'opacity-0 group-hover:opacity-100 bg-gradient-to-b from-[#081827]/40 via-[#0C2238]/55 to-[#081827]/65 backdrop-blur-[2.5px]'
                        }`}
                      >
                        <span className="text-white text-xs sm:text-[13px] font-black font-serif-tc tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] text-center leading-tight">
                          {staff.name}
                        </span>
                        <span className="text-[10px] font-semibold text-[#D2E7F8] tracking-widest drop-shadow-xs mt-0.5 opacity-90">
                          {staff.role === 'butler' ? '執事' : '女僕'}
                        </span>
                      </div>
                    </div>

                    {/* Theme Color Indicator Bead */}
                    <span
                      className={`absolute bottom-0 right-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-2xs transition-transform duration-300 ${
                        isSelected ? 'scale-110' : 'opacity-80 group-hover:opacity-100'
                      }`}
                      style={{ backgroundColor: staff.themeColor }}
                      title={`應援色：${staff.themeColor}`}
                    />
                  </button>

                  {/* Floating Tooltip Label next to circular avatar when hovered / selected */}
                  {(isSelected || isHovered) && (
                    <div
                      className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 z-40 whitespace-nowrap ${
                        isSelected ? 'opacity-100 translate-x-0' : 'opacity-90 -translate-x-1'
                      }`}
                    >
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold font-serif-tc shadow-md border flex items-center gap-1.5 backdrop-blur-md ${
                          isSelected
                            ? 'bg-[#102B47] text-white border-white/40 ring-2 ring-[#102B47]/20'
                            : 'bg-white/95 text-[#102B47] border-[#CBDDEB]'
                        }`}
                      >
                        {isSelected && <Sparkles className="w-3 h-3 text-[#E8C570] shrink-0" />}
                        <span>{staff.name}</span>
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: staff.themeColor }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE / TABLET VIEW: HORIZONTAL CIRCULAR AVATARS (< lg)   */}
      {/* ========================================================= */}
      <div className="lg:hidden w-full flex flex-col items-center py-2">
        <div className="flex items-center gap-1 text-sm font-bold text-[#15324E] font-serif-tc mb-2.5">
          <span>❤️ 選擇你的女僕/執事 ❤️</span>
        </div>

        <div className="flex items-center justify-center gap-2.5 sm:gap-4 overflow-x-auto max-w-full px-2 py-1 scrollbar-none">
          {STAFF_MEMBERS.map((staff, idx) => {
            const isSelected = selectedIndex === idx;

            return (
              <button
                key={staff.id}
                id={`staff-arc-mobile-${staff.id}`}
                type="button"
                onClick={() => handleSelect(idx)}
                className={`relative shrink-0 rounded-full cursor-pointer focus:outline-none transition-all duration-200 p-1 flex flex-col items-center ${
                  isSelected ? 'scale-108 z-20' : 'hover:scale-105 opacity-85 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-white ring-3 shadow-md'
                      : 'border-[#CBDDEB]'
                  }`}
                  style={{
                    boxShadow: isSelected
                      ? `0 0 0 2.5px ${staff.themeColor}, 0 4px 12px rgba(0,0,0,0.15)`
                      : undefined,
                  }}
                >
                  <StaffAvatar
                    seed={staff.avatarSeed}
                    avatarUrl={staff.avatarUrl || staff.photoUrl}
                    size="md"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span
                  className={`mt-1 text-[11px] sm:text-xs font-bold font-serif-tc px-2 py-0.5 rounded-full whitespace-nowrap border leading-tight ${
                    isSelected
                      ? 'bg-[#102B47] text-white border-transparent shadow-xs'
                      : 'bg-white/90 text-[#204970] border-[#CBDDEB]'
                  }`}
                >
                  {staff.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

