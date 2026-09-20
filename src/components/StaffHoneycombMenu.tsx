import { STAFF_MEMBERS } from '../data/cafeData';
import { StaffAvatar } from './StaffAvatars';
import { playChime } from '../utils/audio';
import { triggerTopProgress } from '../utils/progress';

interface StaffHoneycombMenuProps {
  selectedIndex: number;
  onSelectStaff: (index: number) => void;
}

interface HexCellConfig {
  id: string;
  col: number; // 0, 1, 2, 3
  row: number; // 0, 1, 2, 3, 4
  staffId?: string; // If mapped to one of the 5 staff members
  accentSymbol?: string; // Subtle celestial symbol for wireframe outline cells
}

/**
 * 150px Hexagon Constellation Grid
 * Staff members:
 * - 萊可: Col 1, Row 1 (top-left apex)
 * - 璐可: Col 2, Row 1 (upper-right)
 * - 栗栗皆辛苦: Col 1, Row 2 (mid-left)
 * - 胖冬瓜: Col 2, Row 2 (mid-right)
 * - 薯泥勇者: Col 1, Row 3 (lower-left)
 *
 * Surrounded by a clean, minimal halo of outline-only wireframe cells.
 * Even columns (0, 2) staggered down by DY / 2, Odd columns (1, 3) at y = row * DY.
 */
const HONEYCOMB_CELLS: HexCellConfig[] = [
  // Top halo (above 萊可 & 璐可)
  { id: 'hex-top-laiko', col: 1, row: 0, accentSymbol: '✧' },
  { id: 'hex-top-luko', col: 2, row: 0, accentSymbol: '✦' },

  // Upper row
  { id: 'hex-left-laiko', col: 0, row: 1 },
  { id: 'staff-laiko', col: 1, row: 1, staffId: 'laiko' },
  { id: 'staff-luko', col: 2, row: 1, staffId: 'luko' },
  { id: 'hex-right-luko', col: 3, row: 1, accentSymbol: '✧' },

  // Mid row
  { id: 'hex-left-kurikuri', col: 0, row: 2, accentSymbol: '✦' },
  { id: 'staff-kurikuri', col: 1, row: 2, staffId: 'kurikuri' },
  { id: 'staff-donggua', col: 2, row: 2, staffId: 'donggua' },
  { id: 'hex-right-donggua', col: 3, row: 2 },

  // Lower row
  { id: 'staff-potatobrave', col: 1, row: 3, staffId: 'potatobrave' },
  { id: 'hex-under-donggua', col: 2, row: 3, accentSymbol: '✧' },

  // Bottom halo (below 薯泥勇者)
  { id: 'hex-bottom-potatobrave', col: 1, row: 4, accentSymbol: '✦' },
];

// Hexagon geometric constants (150px wide)
const HEX_W = 150; // Hexagon width in px (as requested: 150px)
const HEX_H = 129.9; // Hexagon height = HEX_W * sqrt(3) / 2
const GAP = 6; // Crisp geometric gap
const DX = HEX_W * 0.75 + GAP; // 118.5px
const DY = HEX_H + GAP; // 135.9px
const STAGGER_OFFSET = DY / 2; // 67.95px

// Grid container dimensions (4 columns: 0..3, 5 rows: 0..4)
const CONTAINER_WIDTH = 3 * DX + HEX_W; // ~505.5px
const CONTAINER_HEIGHT = 4 * DY + HEX_H; // ~673.5px

export function StaffHoneycombMenu({
  selectedIndex,
  onSelectStaff,
}: StaffHoneycombMenuProps) {
  const staffMap = new Map(STAFF_MEMBERS.map((s, idx) => [s.id, { staff: s, index: idx }]));

  const handleCellClick = (staffIndex?: number) => {
    if (staffIndex === undefined) return;
    if (staffIndex === selectedIndex) return;
    triggerTopProgress();
    playChime(1.15);
    onSelectStaff(staffIndex);
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-1">
      {/* Title Header */}
      <div className="flex items-center justify-center mb-3 w-full px-2">
        <div className="text-base sm:text-lg font-bold text-[#15324E] font-serif-tc tracking-wide whitespace-nowrap drop-shadow-2xs">
          <span>❤️選擇你的女僕/執事❤️</span>
        </div>
      </div>

      {/* Honeycomb Cluster Stage (Scaled responsively to fit various screen sizes) */}
      <div className="w-full flex justify-center overflow-visible">
        <div
          className="relative origin-top transition-transform duration-300 scale-[0.68] sm:scale-[0.8] md:scale-[0.88] lg:scale-[0.92] xl:scale-100"
          style={{
            width: `${CONTAINER_WIDTH}px`,
            height: `${CONTAINER_HEIGHT}px`,
            marginBottom: '4px',
          }}
        >
          {HONEYCOMB_CELLS.map((cell) => {
            // Even columns (0, 2) are staggered down by STAGGER_OFFSET
            const isStaggeredCol = cell.col % 2 === 0;
            const x = cell.col * DX;
            const y = cell.row * DY + (isStaggeredCol ? STAGGER_OFFSET : 0);

            const staffData = cell.staffId ? staffMap.get(cell.staffId) : undefined;
            const isStaff = Boolean(staffData);
            const isSelected = isStaff && staffData?.index === selectedIndex;

            if (isStaff && staffData) {
              const { staff, index } = staffData;

              return (
                <button
                  key={cell.id}
                  id={`honeycomb-staff-${staff.id}`}
                  type="button"
                  onClick={() => handleCellClick(index)}
                  style={{
                    position: 'absolute',
                    left: `${x}px`,
                    top: `${y}px`,
                    width: `${HEX_W}px`,
                    height: `${HEX_H}px`,
                  }}
                  className={`group cursor-pointer focus:outline-none transition-all duration-300 ${
                    isSelected ? 'z-30 scale-105' : 'z-10 hover:scale-105 hover:z-20'
                  }`}
                  title={`${staff.name}（${staff.role === 'butler' ? '執事' : '女僕'}）- 點選指名`}
                >
                  {/* Hexagonal Clipped Avatar Background */}
                  <div
                    className="w-full h-full overflow-hidden bg-white shadow-sm transition-transform duration-300 relative"
                    style={{
                      clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                    }}
                  >
                    <div className={`w-full h-full transition-transform duration-300 ${staff.id === 'kurikuri' ? '-translate-y-2' : ''}`}>
                      <StaffAvatar
                        seed={staff.avatarSeed}
                        avatarUrl={staff.photoUrl}
                        size="xl"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Active Theme Color Tint Veil */}
                    {isSelected && (
                      <div
                        className="absolute inset-0 pointer-events-none opacity-20"
                        style={{ backgroundColor: staff.themeColor }}
                      />
                    )}

                    {/* Frosted Glass Overlay & Floating Staff Name on Hover/Select (毛玻璃效果 + 店員名字浮現) */}
                    <div
                      className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-2 transition-all duration-300 ease-out z-10 ${
                        isSelected
                          ? 'opacity-100 bg-gradient-to-b from-[#081827]/45 via-[#0C2238]/60 to-[#081827]/75 backdrop-blur-[3px]'
                          : 'opacity-0 group-hover:opacity-100 bg-gradient-to-b from-[#081827]/40 via-[#0C2238]/55 to-[#081827]/70 backdrop-blur-[3px]'
                      }`}
                    >
                      <span className="text-white text-base sm:text-lg font-black font-serif-tc tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] transition-transform duration-300 translate-y-1.5 group-hover:translate-y-0 text-center leading-tight">
                        {staff.name}
                      </span>
                      <span className="text-xs font-semibold text-[#CDE5F8] tracking-widest drop-shadow-xs transition-transform duration-300 translate-y-1 group-hover:translate-y-0 mt-1 opacity-90">
                        {staff.role === 'butler' ? '執事' : '女僕'}
                      </span>
                    </div>
                  </div>

                  {/* SVG Hexagon Crisp Border & Glow Filter */}
                  <svg
                    viewBox="0 0 100 86.6"
                    className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                  >
                    <defs>
                      <filter id={`hex-glow-${staff.id}`} x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow
                          dx="0"
                          dy="0"
                          stdDeviation="4"
                          floodColor={staff.themeColor}
                          floodOpacity="0.95"
                        />
                      </filter>
                    </defs>
                    <polygon
                      points="25,1 75,1 99,43.3 75,85.6 25,85.6 1,43.3"
                      fill="none"
                      stroke={isSelected ? staff.themeColor : '#25507A'}
                      strokeWidth={isSelected ? 4 : 2.4}
                      filter={isSelected ? `url(#hex-glow-${staff.id})` : undefined}
                      className="transition-all duration-300"
                    />
                  </svg>
                </button>
              );
            }

            // Outline-Only Blank Hexagon (包圍在店員旁邊的純框線蜂巢格子)
            return (
              <div
                key={cell.id}
                id={`honeycomb-empty-${cell.id}`}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${HEX_W}px`,
                  height: `${HEX_H}px`,
                }}
                className="z-0 pointer-events-none group"
              >
                {/* Pure Outline SVG Hexagon with crisp night-sky stroke */}
                <svg
                  viewBox="0 0 100 86.6"
                  className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                >
                  <polygon
                    points="25,1 75,1 99,43.3 75,85.6 25,85.6 1,43.3"
                    fill="none"
                    stroke="#507FAD"
                    strokeWidth="1.8"
                    className="opacity-55 transition-opacity duration-300"
                  />
                </svg>

                {/* Subtle Central Celestial Accent (✦ / ✧) */}
                {cell.accentSymbol && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[#5B89B6]/45 text-sm font-serif select-none">
                      {cell.accentSymbol}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
