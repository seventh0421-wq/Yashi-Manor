import { useMemo } from 'react';
import { motion } from 'motion/react';

interface StaffHeartBackgroundProps {
  cheerColor: string;
  staffName: string;
}

export function StaffHeartBackground({ cheerColor, staffName }: StaffHeartBackgroundProps) {
  // Unique safe identifier for masks, filters, gradients
  const safeId = useMemo(
    () => staffName.replace(/[^a-zA-Z0-9]/g, '') || 'staff',
    [staffName]
  );

  // Single continuous calligraphic stroke path of a super-large heart (一筆畫超大愛心)
  // Starts at the bottom, arcs up left lobe, loops gracefully through cleft, sweeps wide over right lobe,
  // cascades down, and finishes with a tapered calligraphic flourish.
  const mainStrokePath =
    'M 490 830 C 350 810, 160 685, 95 510 C 35 345, 115 160, 290 120 C 425 90, 505 210, 525 315 C 545 205, 630 90, 785 115 C 960 145, 1090 330, 1035 510 C 980 685, 785 810, 545 865 C 495 875, 435 845, 410 785 C 390 740, 405 690, 445 660';

  // Inner core dense pigment path (split bristle density inside wet stroke)
  const bristleStreakPath =
    'M 482 822 C 344 802, 168 680, 106 514 C 48 354, 122 172, 294 130 C 422 100, 498 218, 524 310 C 548 214, 626 100, 776 122 C 948 150, 1076 332, 1024 506 C 972 676, 786 798, 552 856 C 504 866, 446 836, 420 780 C 404 740, 416 695, 452 668';

  // Inner soft bloom pool shape
  const innerWashPath =
    'M 525 320 C 500 230, 430 140, 310 160 C 170 190, 110 340, 150 490 C 200 630, 370 740, 490 810 C 550 770, 780 660, 840 500 C 890 360, 840 210, 720 160 C 600 130, 550 230, 525 320 Z';

  // Color tuning: preserves authentic cheerColor hex codes while deriving realistic watercolor wash & pigment levels
  const watercolorTheme = useMemo(() => {
    const isLuko = staffName.includes('璐可') || cheerColor.toUpperCase() === '#322C3B';
    const isDonggua = staffName.includes('胖冬瓜') || cheerColor.toUpperCase() === '#234172';
    const isKurikuri = staffName.includes('栗栗') || cheerColor.toUpperCase() === '#96BDB9';

    if (isLuko) {
      // 璐可: Tuned from uploaded swatch (#322C3B) - luminous plum/violet watercolor
      return {
        strokeMain: '#5A466A',
        strokeCore: '#322C3B',
        strokeLight: '#8A709E',
        strokeWash: 'rgba(128, 102, 152, 0.28)',
        ambientWash: `
          radial-gradient(ellipse at 30% 45%, rgba(138, 112, 162, 0.25) 0%, rgba(138, 112, 162, 0.08) 50%, transparent 75%),
          linear-gradient(135deg, rgba(120, 95, 145, 0.16) 0%, transparent 60%)
        `,
        splatterColor: '#6B547E',
        glowColor: 'rgba(90, 70, 106, 0.35)',
      };
    }

    if (isDonggua) {
      // 胖冬瓜: Deep celestial sapphire / indigo watercolor (#234172)
      return {
        strokeMain: '#315488',
        strokeCore: '#234172',
        strokeLight: '#5C82BC',
        strokeWash: 'rgba(49, 84, 136, 0.24)',
        ambientWash: `
          radial-gradient(ellipse at 30% 45%, rgba(49, 84, 136, 0.24) 0%, rgba(49, 84, 136, 0.07) 50%, transparent 75%),
          linear-gradient(135deg, rgba(35, 65, 114, 0.15) 0%, transparent 60%)
        `,
        splatterColor: '#3A639E',
        glowColor: 'rgba(35, 65, 114, 0.35)',
      };
    }

    if (isKurikuri) {
      // 栗栗皆辛苦: Celadon mint / seafoam tea watercolor (#96BDB9)
      return {
        strokeMain: '#619B96',
        strokeCore: '#467B76',
        strokeLight: '#96BDB9',
        strokeWash: 'rgba(150, 189, 185, 0.32)',
        ambientWash: `
          radial-gradient(ellipse at 30% 45%, rgba(150, 189, 185, 0.32) 0%, rgba(150, 189, 185, 0.10) 50%, transparent 75%),
          linear-gradient(135deg, rgba(130, 175, 170, 0.18) 0%, transparent 60%)
        `,
        splatterColor: '#538A85',
        glowColor: 'rgba(97, 155, 150, 0.35)',
      };
    }

    // 萊可 / Default: Misty pastel slate-sky watercolor (#B2C4CE)
    return {
      strokeMain: '#7697AB',
      strokeCore: '#597B90',
      strokeLight: '#B2C4CE',
      strokeWash: 'rgba(178, 196, 206, 0.35)',
      ambientWash: `
        radial-gradient(ellipse at 30% 45%, rgba(178, 196, 206, 0.32) 0%, rgba(178, 196, 206, 0.10) 50%, transparent 75%),
        linear-gradient(135deg, rgba(150, 175, 190, 0.20) 0%, transparent 60%)
      `,
      splatterColor: '#6E90A3',
      glowColor: 'rgba(118, 151, 171, 0.35)',
    };
  }, [cheerColor, staffName]);

  // Handcrafted watercolor splatters and pigment droplets distributed naturally around the brush path
  const splatters = useMemo(() => [
    { id: 'sp-1', cx: 160, cy: 220, r: 18, opacity: 0.35, blur: 3 },
    { id: 'sp-2', cx: 110, cy: 290, r: 8, opacity: 0.55, blur: 1 },
    { id: 'sp-3', cx: 80, cy: 380, r: 24, opacity: 0.3, blur: 4 },
    { id: 'sp-4', cx: 135, cy: 150, r: 6, opacity: 0.6, blur: 0.5 },
    { id: 'sp-5', cx: 210, cy: 110, r: 14, opacity: 0.45, blur: 2 },
    { id: 'sp-6', cx: 520, cy: 280, r: 22, opacity: 0.4, blur: 3.5 },
    { id: 'sp-7', cx: 485, cy: 240, r: 9, opacity: 0.5, blur: 1.2 },
    { id: 'sp-8', cx: 555, cy: 230, r: 11, opacity: 0.45, blur: 1.5 },
    { id: 'sp-9', cx: 880, cy: 180, r: 16, opacity: 0.35, blur: 2.5 },
    { id: 'sp-10', cx: 990, cy: 310, r: 20, opacity: 0.28, blur: 3 },
    { id: 'sp-11', cx: 1040, cy: 450, r: 12, opacity: 0.4, blur: 1.5 },
    { id: 'sp-12', cx: 920, cy: 620, r: 15, opacity: 0.35, blur: 2 },
    { id: 'sp-13', cx: 440, cy: 790, r: 26, opacity: 0.38, blur: 4 },
    { id: 'sp-14', cx: 385, cy: 720, r: 10, opacity: 0.5, blur: 1.2 },
    { id: 'sp-15', cx: 370, cy: 820, r: 7, opacity: 0.55, blur: 0.8 },
    { id: 'sp-16', cx: 580, cy: 840, r: 14, opacity: 0.4, blur: 2 },
  ], []);

  // Data URI for CSS mask-image: SVG noise + radial fade-out mask creating natural watercolor paper absorption
  const cssWatercolorMaskDataUri = useMemo(() => {
    const maskSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs>
          <filter id="m-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feColorMatrix type="matrix" values="
              0.4 0.4 0.4 0 0
              0.4 0.4 0.4 0 0
              0.4 0.4 0.4 0 0
              0.8 0.8 0.8 0 0.2" result="grain" />
          </filter>
          <radialGradient id="m-fade" cx="42%" cy="50%" r="58%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
            <stop offset="50%" stop-color="#ffffff" stop-opacity="0.95" />
            <stop offset="78%" stop-color="#ffffff" stop-opacity="0.65" />
            <stop offset="92%" stop-color="#ffffff" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </radialGradient>
        </defs>
        <!-- Base gradient fade -->
        <rect width="800" height="600" fill="url(#m-fade)" />
        <!-- Watercolor paper grain texture multiplication -->
        <rect width="800" height="600" fill="#ffffff" filter="url(#m-grain)" style="mix-blend-mode: multiply;" />
      </svg>
    `.replace(/\s+/g, ' ').trim();

    return `url("data:image/svg+xml;utf8,${encodeURIComponent(maskSvg)}")`;
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      {/* 1. Dynamic Watercolor Ambient Paper Wash */}
      <div
        className="absolute inset-0 transition-colors duration-700 ease-out pointer-events-none"
        style={{
          background: watercolorTheme.ambientWash,
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 60%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0) 92%)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 60%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0) 92%)',
        }}
      />

      {/* 2. Single-Stroke Watercolor Heart Container */}
      {/* Strictly bounded to the upper section: height terminates above the rotating arc carousel */}
      <motion.div
        key={staffName}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute inset-x-0 top-2 sm:top-6 bottom-[260px] sm:bottom-[290px] md:bottom-[320px] flex items-center justify-center pointer-events-none px-4"
        style={{
          WebkitMaskImage: `${cssWatercolorMaskDataUri}, radial-gradient(ellipse at 46% 48%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 60%, rgba(0,0,0,0.6) 82%, rgba(0,0,0,0) 100%)`,
          maskImage: `${cssWatercolorMaskDataUri}, radial-gradient(ellipse at 46% 48%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 60%, rgba(0,0,0,0.6) 82%, rgba(0,0,0,0) 100%)`,
          WebkitMaskComposite: 'source-over',
          maskComposite: 'add',
        }}
      >
        <svg
          viewBox="0 0 1150 920"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full max-w-[1050px] max-h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* SVG Filter 1: Watercolor Paper Bleed & Rough Bristle Edge (水彩邊緣暈染與毛絮筆觸) */}
            <filter
              id={`watercolor-bleed-${safeId}`}
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
              filterUnits="userSpaceOnUse"
            >
              {/* Paper fiber grain & water absorption noise */}
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.028"
                numOctaves="4"
                result="noise"
              />
              {/* Natural watercolor dispersion at pigment perimeter */}
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="18"
                xChannelSelector="R"
                yChannelSelector="G"
                result="displaced"
              />
              {/* Soft feathering to eliminate harsh pixelated boundaries */}
              <feGaussianBlur
                in="displaced"
                stdDeviation="2.2"
                result="feathered"
              />
              {/* Crisp pigment center overlay on top of feathered wet diffusion */}
              <feMerge>
                <feMergeNode in="feathered" opacity="0.9" />
                <feMergeNode in="displaced" opacity="0.85" />
              </feMerge>
            </filter>

            {/* SVG Filter 2: Heavy Watercolor Water Wash (底層水暈擴散) */}
            <filter
              id={`watercolor-wash-${safeId}`}
              x="-40%"
              y="-40%"
              width="180%"
              height="180%"
              filterUnits="userSpaceOnUse"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.018"
                numOctaves="3"
                result="washNoise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="washNoise"
                scale="32"
                xChannelSelector="R"
                yChannelSelector="G"
                result="wideDisplaced"
              />
              <feGaussianBlur
                in="wideDisplaced"
                stdDeviation="16"
                result="blurredWash"
              />
            </filter>

            {/* SVG MASK: Internal vector mask on the brush stroke using organic turbulence noise */}
            {/* Creates micro-vacuums, paper grain transparency variations, and dry-brush streaks inside the stroke */}
            <mask id={`stroke-paper-mask-${safeId}`} maskUnits="userSpaceOnUse">
              <rect width="1150" height="950" fill="#ffffff" />
              {/* Organic texture mask cutouts simulating paper tooth and dry brush areas */}
              <path
                d={mainStrokePath}
                fill="none"
                stroke="#000000"
                strokeWidth="14"
                strokeDasharray="18 26 8 40 32 15 4 60"
                strokeLinecap="round"
                opacity="0.38"
                filter={`url(#watercolor-bleed-${safeId})`}
              />
              {/* Secondary dry-brush bristle skip on the top sweeping lobe */}
              <path
                d="M 680 105 C 800 120, 960 220, 1020 380"
                fill="none"
                stroke="#000000"
                strokeWidth="8"
                strokeDasharray="12 18 6 30"
                strokeLinecap="round"
                opacity="0.45"
              />
              <path
                d="M 180 200 C 240 140, 360 110, 480 180"
                fill="none"
                stroke="#000000"
                strokeWidth="6"
                strokeDasharray="10 24 14 16"
                strokeLinecap="round"
                opacity="0.4"
              />
            </mask>

            {/* Gradient along the watercolor heart stroke: rich saturated pigment and luminous watery wash */}
            <linearGradient
              id={`stroke-grad-${safeId}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={watercolorTheme.strokeLight} stopOpacity="0.75" />
              <stop offset="26%" stopColor={watercolorTheme.strokeMain} stopOpacity="0.88" />
              <stop offset="55%" stopColor={watercolorTheme.strokeCore} stopOpacity="0.94" />
              <stop offset="82%" stopColor={watercolorTheme.strokeMain} stopOpacity="0.82" />
              <stop offset="100%" stopColor={watercolorTheme.strokeLight} stopOpacity="0.70" />
            </linearGradient>

            {/* Radial gradient for soft interior water bloom */}
            <radialGradient
              id={`inner-wash-grad-${safeId}`}
              cx="45%"
              cy="45%"
              r="55%"
            >
              <stop offset="0%" stopColor={watercolorTheme.strokeLight} stopOpacity="0.22" />
              <stop offset="50%" stopColor={watercolorTheme.strokeMain} stopOpacity="0.12" />
              <stop offset="85%" stopColor={watercolorTheme.strokeCore} stopOpacity="0.05" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ======================================================== */}
          {/* LAYER 1: SOFT INNER WATERCOLOR BLOOM (內部通透水彩渲染) */}
          {/* ======================================================== */}
          <path
            d={innerWashPath}
            fill={`url(#inner-wash-grad-${safeId})`}
            filter={`url(#watercolor-wash-${safeId})`}
            className="transition-all duration-700"
          />

          {/* ======================================================== */}
          {/* LAYER 2: WET-ON-WET DIFFUSED UNDERWASH (底層水分散染，寬筆觸) */}
          {/* ======================================================== */}
          <path
            d={mainStrokePath}
            fill="none"
            stroke={watercolorTheme.strokeWash}
            strokeWidth="88"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#watercolor-wash-${safeId})`}
            style={{ transition: 'stroke 0.7s ease' }}
          />

          {/* ======================================================== */}
          {/* LAYER 3: MAIN WATERCOLOR BRUSH STROKE (主筆觸：一筆畫超大愛心) */}
          {/* Masked with internal paper grain mask + bleeding edges to eliminate harsh vector boundaries */}
          {/* ======================================================== */}
          <g mask={`url(#stroke-paper-mask-${safeId})`}>
            {/* Feathery edge wet perimeter */}
            <path
              d={mainStrokePath}
              fill="none"
              stroke={`url(#stroke-grad-${safeId})`}
              strokeWidth="56"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#watercolor-bleed-${safeId})`}
              style={{
                transition: 'stroke 0.7s ease',
                filter: `url(#watercolor-bleed-${safeId}) drop-shadow(0 4px 18px ${watercolorTheme.glowColor})`,
              }}
            />

            {/* Core pigment body */}
            <path
              d={mainStrokePath}
              fill="none"
              stroke={`url(#stroke-grad-${safeId})`}
              strokeWidth="42"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#watercolor-bleed-${safeId})`}
              style={{
                transition: 'stroke 0.7s ease',
              }}
            />
          </g>

          {/* ======================================================== */}
          {/* LAYER 4: PIGMENT CORE & BRISTLE TEXTURE (濃縮筆芯與微乾刷紋理) */}
          {/* ======================================================== */}
          <path
            d={bristleStreakPath}
            fill="none"
            stroke={watercolorTheme.strokeCore}
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.65"
            style={{
              transition: 'stroke 0.7s ease',
              filter: `url(#watercolor-bleed-${safeId})`,
            }}
          />

          {/* Fine dry-brush hair accents at top lobes with soft edge feathering */}
          <path
            d="M 230 145 C 310 120, 440 135, 510 270"
            fill="none"
            stroke={watercolorTheme.strokeLight}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="60 30 90 20"
            strokeOpacity="0.45"
            style={{ filter: 'blur(0.5px)' }}
          />
          <path
            d="M 550 250 C 620 130, 770 125, 870 170"
            fill="none"
            stroke={watercolorTheme.strokeLight}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="50 25 80 30"
            strokeOpacity="0.4"
            style={{ filter: 'blur(0.5px)' }}
          />

          {/* Calligraphic Flourish Tail Accent (底端一筆收尾的飛白點綴) */}
          <path
            d="M 445 660 C 465 640, 490 635, 505 648"
            fill="none"
            stroke={watercolorTheme.strokeMain}
            strokeWidth="6"
            strokeLinecap="round"
            strokeOpacity="0.45"
            style={{ filter: 'blur(0.4px)' }}
          />

          {/* ======================================================== */}
          {/* LAYER 5: ORGANIC WATERCOLOR SPLATTERS & WATER DROPLETS (水彩飛濺與暈染水滴) */}
          {/* ======================================================== */}
          <g className="transition-all duration-700">
            {splatters.map((s) => (
              <g key={`${safeId}-${s.id}`}>
                {/* Soft diffused water halo */}
                <circle
                  cx={s.cx}
                  cy={s.cy}
                  r={s.r * 1.5}
                  fill={watercolorTheme.strokeLight}
                  fillOpacity={s.opacity * 0.35}
                  style={{ filter: `blur(${s.blur + 2}px)` }}
                />
                {/* Main pigment droplet with soft feathered perimeter */}
                <circle
                  cx={s.cx}
                  cy={s.cy}
                  r={s.r}
                  fill={watercolorTheme.splatterColor}
                  fillOpacity={s.opacity * 0.85}
                  style={{ filter: `blur(${s.blur}px)` }}
                />
                {/* Tiny dark pigment center */}
                <circle
                  cx={s.cx + s.r * 0.15}
                  cy={s.cy + s.r * 0.15}
                  r={Math.max(2, s.r * 0.35)}
                  fill={watercolorTheme.strokeCore}
                  fillOpacity={s.opacity * 0.7}
                />
              </g>
            ))}
          </g>
        </svg>
      </motion.div>

      {/* 3. Subtle floating stardust/spec of light for magical anime maid cafe mood */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white/75 animate-ping opacity-60 pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse opacity-70 pointer-events-none" />
      <div className="absolute top-1/2 left-1/5 w-2 h-2 rounded-full bg-white/60 animate-pulse opacity-50 pointer-events-none" />
    </div>
  );
}
