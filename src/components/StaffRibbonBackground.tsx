import { useId, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface StaffRibbonBackgroundProps {
  cheerColor: string;
  staffName: string;
}

export function StaffRibbonBackground({ cheerColor, staffName }: StaffRibbonBackgroundProps) {
  const uniqueId = useId().replace(/:/g, '-');

  // Compute a soft ambient wash color based on cheerColor, focused on the left and fading right
  const ambientWash = useMemo(() => {
    return `radial-gradient(ellipse 65% 65% at 28% 35%, ${cheerColor}24 0%, ${cheerColor}0C 50%, transparent 80%)`;
  }, [cheerColor]);

  // Adjust pattern opacity for visual balance (left side is prominent, darker colors slightly tuned)
  const patternOpacity = useMemo(() => {
    const hex = cheerColor.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 90 ? 0.85 : 0.95;
    }
    return 0.9;
  }, [cheerColor]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      {/* 1. Dynamic Ambient Tint Layer */}
      <motion.div
        key={`ambient-${staffName}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute inset-0 transition-colors duration-700 pointer-events-none"
        style={{ background: ambientWash }}
      />

      {/* 2. Seamless Ribbon Bow + Dotted Diamond Trellis Wallpaper Pattern */}
      {/* Pattern fades smoothly from left to right (越左邊越明顯，右側漸層融入背景以保護文字閱讀) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`ribbon-pattern-${staffName}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: patternOpacity }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none"
          style={{
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 68%, rgba(0,0,0,0.3) 86%, rgba(0,0,0,0) 98%)',
            maskImage:
              'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 68%, rgba(0,0,0,0.3) 86%, rgba(0,0,0,0) 98%)',
          }}
        >
          {/* Horizontal Gradient Mask: 100% visible on left, fading gracefully into the right background */}
          <div
            className="w-full h-full"
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.96) 24%, rgba(0,0,0,0.65) 42%, rgba(0,0,0,0.22) 58%, rgba(0,0,0,0.04) 70%, rgba(0,0,0,0) 80%)',
              maskImage:
                'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.96) 24%, rgba(0,0,0,0.65) 42%, rgba(0,0,0,0.22) 58%, rgba(0,0,0,0.04) 70%, rgba(0,0,0,0) 80%)',
            }}
          >
            <svg
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            >
              <defs>
                {/* Individual Ribbon Bow (蝴蝶結) Vector Symbol */}
                <g id={`ribbon-bow-${uniqueId}`}>
                  {/* Ribbon Tails (Streamers hanging down from behind knot) */}
                  {/* Left Tail */}
                  <path
                    d="M -1.2,1.6 C -3,4.5 -5.4,7.8 -8.2,10 L -5.8,11.2 C -3.6,8.6 -1.6,5.2 -0.2,2.4 Z"
                    fill="#FFFFFF"
                    stroke={cheerColor}
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                  {/* Right Tail */}
                  <path
                    d="M 1.2,1.6 C 3,4.5 5.4,7.8 8.2,10 L 5.8,11.2 C 3.6,8.6 1.6,5.2 0.2,2.4 Z"
                    fill="#FFFFFF"
                    stroke={cheerColor}
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />

                  {/* Left Loop */}
                  <path
                    d="M -2,-0.4 C -5,-3.8 -9.8,-4.2 -12.4,-1.8 C -14.2,0.2 -13.2,2.6 -10.2,3.2 C -7,3.8 -4,1.8 -1.8,0.8 Z"
                    fill="#FFFFFF"
                    stroke={cheerColor}
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  {/* Left inner fold crease */}
                  <path
                    d="M -2.4,0 C -5,-1.2 -8.2,-1.2 -9.8,-0.1"
                    fill="none"
                    stroke={cheerColor}
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.65"
                  />

                  {/* Right Loop */}
                  <path
                    d="M 2,-0.4 C 5,-3.8 9.8,-4.2 12.4,-1.8 C 14.2,0.2 13.2,2.6 10.2,3.2 C 7,3.8 4,1.8 1.8,0.8 Z"
                    fill="#FFFFFF"
                    stroke={cheerColor}
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  {/* Right inner fold crease */}
                  <path
                    d="M 2.4,0 C 5,-1.2 8.2,-1.2 9.8,-0.1"
                    fill="none"
                    stroke={cheerColor}
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.65"
                  />

                  {/* Center Knot */}
                  <rect
                    x="-3.2"
                    y="-2.5"
                    width="6.4"
                    height="5"
                    rx="2.4"
                    fill="#FFFFFF"
                    stroke={cheerColor}
                    strokeWidth="1.45"
                  />
                  {/* Center knot crease lines */}
                  <path
                    d="M -0.9,-1.8 L -0.9,1.8 M 0.9,-1.8 L 0.9,1.8"
                    stroke={cheerColor}
                    strokeWidth="0.85"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </g>

                {/* Repeating 96x96 Tile with 45-degree Dotted Diagonals and Bow Intersections */}
                <pattern
                  id={`staff-bow-trellis-${uniqueId}`}
                  width="96"
                  height="96"
                  patternUnits="userSpaceOnUse"
                >
                  {/* 1. Diagonal Dotted Grid Lines (45 degrees) */}
                  <line
                    x1="0"
                    y1="0"
                    x2="96"
                    y2="96"
                    stroke={cheerColor}
                    strokeWidth="1.6"
                    strokeDasharray="1.5 5.28"
                    strokeLinecap="round"
                  />
                  <line
                    x1="0"
                    y1="96"
                    x2="96"
                    y2="0"
                    stroke={cheerColor}
                    strokeWidth="1.6"
                    strokeDasharray="1.5 5.28"
                    strokeLinecap="round"
                  />

                  {/* 2. Bowknots at grid intersections */}
                  {/* Center Intersection */}
                  <g transform="translate(48, 48)">
                    <use href={`#ribbon-bow-${uniqueId}`} xlinkHref={`#ribbon-bow-${uniqueId}`} />
                  </g>
                  {/* Four Corner Intersections (ensures continuous tiling across seams) */}
                  <g transform="translate(0, 0)">
                    <use href={`#ribbon-bow-${uniqueId}`} xlinkHref={`#ribbon-bow-${uniqueId}`} />
                  </g>
                  <g transform="translate(96, 0)">
                    <use href={`#ribbon-bow-${uniqueId}`} xlinkHref={`#ribbon-bow-${uniqueId}`} />
                  </g>
                  <g transform="translate(0, 96)">
                    <use href={`#ribbon-bow-${uniqueId}`} xlinkHref={`#ribbon-bow-${uniqueId}`} />
                  </g>
                  <g transform="translate(96, 96)">
                    <use href={`#ribbon-bow-${uniqueId}`} xlinkHref={`#ribbon-bow-${uniqueId}`} />
                  </g>
                </pattern>
              </defs>

              {/* Render Seamless Pattern Rectangle across entire section */}
              <rect
                width="100%"
                height="100%"
                fill={`url(#staff-bow-trellis-${uniqueId})`}
              />
            </svg>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 3. Soft center-left radial backlight to highlight the Maid Portrait */}
      <div className="absolute top-16 sm:top-20 left-1/2 lg:left-[42%] -translate-x-1/2 w-[380px] sm:w-[500px] lg:w-[620px] h-[450px] sm:h-[550px] bg-radial from-white/70 via-white/30 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* 4. Subtle Magical Starlight Accents */}
      <div className="absolute top-28 left-[12%] w-2 h-2 rounded-full bg-white animate-ping opacity-60 pointer-events-none" />
      <div className="absolute top-44 right-[18%] w-1.5 h-1.5 rounded-full bg-white animate-pulse opacity-70 pointer-events-none" />
      <div className="absolute top-72 left-[24%] w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse opacity-50 pointer-events-none" />
    </div>
  );
}
