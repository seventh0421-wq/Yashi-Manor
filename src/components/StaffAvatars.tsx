interface StaffAvatarProps {
  seed: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function StaffAvatar({ seed, avatarUrl, size = 'lg', className = '' }: StaffAvatarProps) {
  const sizeClasses = className.includes('w-') ? '' : {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }[size];

  // If a photoUrl is directly supplied, or seed is 'laiko' / 'luko' / 'kurikuri' / 'donggua' with photo
  if (avatarUrl || seed === 'laiko' || seed === 'luko' || seed === 'kurikuri' || seed === 'donggua') {
    let defaultPhoto = 'https://i.meee.com.tw/dkSZ6nR.png';
    if (seed === 'luko') defaultPhoto = 'https://i.meee.com.tw/CMH9DxK.png';
    if (seed === 'kurikuri') defaultPhoto = 'https://i.meee.com.tw/Hneru75.png';
    if (seed === 'donggua') defaultPhoto = 'https://i.meee.com.tw/EmzeSiG.png';
    const photo = avatarUrl || defaultPhoto;

    let objectPos = 'object-[center_17%]';
    let zoomScale = 'scale-[1.65]';
    let transformOrigin = 'origin-[center_18%]';

    if (seed === 'luko' || photo.includes('CMH9DxK') || photo.includes('DVxcLxG')) {
      objectPos = 'object-[center_15%]';
      zoomScale = 'scale-[1.65]';
      transformOrigin = 'origin-[center_16%]';
    } else if (seed === 'kurikuri' || photo.includes('Hneru75')) {
      objectPos = 'object-[center_13%]';
      zoomScale = 'scale-[1.6]';
      transformOrigin = 'origin-[center_14%]';
    } else if (seed === 'donggua' || photo.includes('EmzeSiG')) {
      objectPos = 'object-[center_19%]';
      zoomScale = 'scale-[1.65]';
      transformOrigin = 'origin-[center_19%]';
    } else if (seed === 'laiko' || photo.includes('dkSZ6nR')) {
      objectPos = 'object-[center_17%]';
      zoomScale = 'scale-[1.65]';
      transformOrigin = 'origin-[center_18%]';
    }

    return (
      <div className={`${sizeClasses} w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center relative ${className}`}>
        <img
          src={photo}
          alt="Staff Avatar"
          className={`w-full h-full object-cover ${zoomScale} ${transformOrigin} ${objectPos}`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Specific bespoke illustrated stylized avatars for the 4 night herbal cafe members
  switch (seed) {
    case 'laiko':
      // Fallback illustrated butler if needed
      return (
        <div className={`${sizeClasses} w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center relative ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full scale-105">
            {/* Background soft celestial circle */}
            <circle cx="50" cy="50" r="50" fill="#FFFFFF" />
            <path d="M10,95 Q50,60 90,95 L90,100 L10,100 Z" fill="#2C3E50" />
            {/* White shirt collar & navy butler vest */}
            <polygon points="50,70 38,90 62,90" fill="#FFFFFF" />
            <polygon points="45,72 50,78 55,72 50,68" fill="#4A6FA5" />
            {/* Face */}
            <ellipse cx="50" cy="48" rx="20" ry="22" fill="#FDF4ED" />
            {/* Eyes */}
            <ellipse cx="43" cy="46" rx="2.5" ry="3.5" fill="#3B536E" />
            <ellipse cx="57" cy="46" rx="2.5" ry="3.5" fill="#3B536E" />
            <circle cx="44" cy="45" r="0.8" fill="#FFFFFF" />
            <circle cx="58" cy="45" r="0.8" fill="#FFFFFF" />
            {/* Eyebrows */}
            <path d="M40,41 Q44,40 47,42" stroke="#4A5568" strokeWidth="1.2" fill="none" />
            <path d="M53,42 Q56,40 60,41" stroke="#4A5568" strokeWidth="1.2" fill="none" />
            {/* Gentle smile */}
            <path d="M47,56 Q50,59 53,56" stroke="#C57D68" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* Monocle on right eye */}
            <circle cx="57" cy="46" r="6" stroke="#D4AF37" strokeWidth="1" fill="none" />
            <path d="M63,46 Q68,52 66,65" stroke="#D4AF37" strokeWidth="0.8" fill="none" />
            {/* Elegant Hair */}
            <path d="M30,45 Q28,25 50,22 Q72,25 70,45 Q65,30 50,30 Q35,30 30,45 Z" fill="#3D5265" />
            <path d="M35,33 Q45,36 50,44 Q52,35 65,33" fill="#4B637A" />
            {/* Butler ear piercing */}
            <circle cx="29" cy="50" r="1" fill="#D4AF37" />
          </svg>
        </div>
      );

    case 'luko':
      // 璐可: Sweet anime maid, soft lavender-blue ribbons, bright eyes, cute maid headdress
      return (
        <div className={`${sizeClasses} w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center relative ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full scale-105">
            {/* Background */}
            <circle cx="50" cy="50" r="50" fill="#FFFFFF" />
            {/* Maid dress */}
            <path d="M12,95 Q50,65 88,95 L88,100 L12,100 Z" fill="#3A4A5B" />
            {/* White frill collar */}
            <path d="M35,74 Q50,88 65,74 L62,95 L38,95 Z" fill="#FFFFFF" />
            {/* Pink/Blue Ribbon */}
            <circle cx="50" cy="74" r="3" fill="#6B9AC4" />
            <path d="M47,74 Q40,78 43,84 Q48,80 50,75" fill="#88B2D8" />
            <path d="M53,74 Q60,78 57,84 Q52,80 50,75" fill="#88B2D8" />
            {/* Face */}
            <ellipse cx="50" cy="49" rx="19" ry="21" fill="#FFF5EE" />
            {/* Blush */}
            <ellipse cx="37" cy="53" rx="4" ry="2" fill="#F8B4B4" opacity="0.6" />
            <ellipse cx="63" cy="53" rx="4" ry="2" fill="#F8B4B4" opacity="0.6" />
            {/* Anime Eyes */}
            <ellipse cx="42" cy="47" rx="3.2" ry="4.5" fill="#41729F" />
            <ellipse cx="58" cy="47" rx="3.2" ry="4.5" fill="#41729F" />
            <circle cx="43" cy="45" r="1.5" fill="#FFFFFF" />
            <circle cx="59" cy="45" r="1.5" fill="#FFFFFF" />
            <circle cx="41" cy="49" r="0.8" fill="#D3E0EA" />
            <circle cx="57" cy="49" r="0.8" fill="#D3E0EA" />
            {/* Happy smiling mouth */}
            <path d="M46,57 Q50,62 54,57" stroke="#E26D7D" strokeWidth="1.4" fill="#FCE4EC" strokeLinecap="round" />
            {/* Hair */}
            <path d="M28,45 Q26,24 50,22 Q74,24 72,45 Q65,28 50,28 Q35,28 28,45 Z" fill="#B38A73" />
            <path d="M32,32 Q42,42 46,45 Q48,34 68,34" fill="#C59B84" />
            {/* Side twintails */}
            <path d="M26,45 Q16,58 22,72 Q27,62 30,50" fill="#B38A73" />
            <path d="M74,45 Q84,58 78,72 Q73,62 70,50" fill="#B38A73" />
            {/* White Frilly Maid Headband */}
            <path d="M30,28 Q50,15 70,28 Q66,22 50,20 Q34,22 30,28" fill="#FFFFFF" stroke="#DDE7EE" strokeWidth="1" />
            <circle cx="30" cy="28" r="2.5" fill="#6B9AC4" />
            <circle cx="70" cy="28" r="2.5" fill="#6B9AC4" />
          </svg>
        </div>
      );

    case 'kurikuri':
      // 栗栗皆辛苦: Energetic, diligent, cat-eared / lalafell cute vibe, sweat drop of hard work, charming sparkle
      return (
        <div className={`${sizeClasses} w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center relative ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full scale-105">
            <circle cx="50" cy="50" r="50" fill="#FFFFFF" />
            {/* Uniform */}
            <path d="M15,95 Q50,68 85,95 L85,100 L15,100 Z" fill="#475569" />
            <polygon points="50,73 42,92 58,92" fill="#FFFFFF" />
            {/* Little yellow star tie */}
            <polygon points="50,75 52,78 55,78 52,81 53,84 50,82 47,84 48,81 45,78 48,78" fill="#EAB308" />
            {/* Miqo'te cute ears */}
            <polygon points="28,32 20,12 40,24" fill="#C27D53" />
            <polygon points="27,30 23,16 36,25" fill="#FCE7DF" />
            <polygon points="72,32 80,12 60,24" fill="#C27D53" />
            <polygon points="73,30 77,16 64,25" fill="#FCE7DF" />
            {/* Face */}
            <ellipse cx="50" cy="51" rx="20" ry="21" fill="#FFF5EB" />
            {/* Rosy energetic cheeks */}
            <ellipse cx="36" cy="55" rx="3.5" ry="2" fill="#F87171" opacity="0.6" />
            <ellipse cx="64" cy="55" rx="3.5" ry="2" fill="#F87171" opacity="0.6" />
            {/* Diligent cute eyes */}
            <path d="M38,47 Q43,43 47,47" stroke="#2D3748" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M53,47 Q57,43 62,47" stroke="#2D3748" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            {/* Wide happy energetic open smile */}
            <path d="M45,56 Q50,63 55,56 Z" fill="#E11D48" />
            <path d="M47,56 Q50,58 53,56" fill="#FFFFFF" />
            {/* Hair */}
            <path d="M28,45 Q26,26 50,24 Q74,26 72,45 Q64,30 50,30 Q36,30 28,45 Z" fill="#B45309" />
            <path d="M35,32 Q46,45 50,47 Q53,35 65,34" fill="#D97706" />
            {/* Cute energetic sweat drop symbol of "辛苦" (hard work) */}
            <path d="M72,38 C72,38 75,41 75,43 C75,44.5 73.5,45.5 72,45.5 C70.5,45.5 69,44.5 69,43 C69,41 72,38 72,38 Z" fill="#38BDF8" />
          </svg>
        </div>
      );

    case 'donggua':
      // 胖冬瓜: Chubby, warm, comforting gentle chef butler, warm rosy cheeks, cozy smile
      return (
        <div className={`${sizeClasses} w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center relative ${className}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full scale-105">
            <circle cx="50" cy="50" r="50" fill="#FFFFFF" />
            {/* Cozy chef/butler attire */}
            <path d="M10,95 Q50,62 90,95 L90,100 L10,100 Z" fill="#2E4A44" />
            <polygon points="50,68 36,92 64,92" fill="#FFFFFF" />
            {/* Forest green ribbon scarf */}
            <ellipse cx="50" cy="72" rx="6" ry="3" fill="#4E7C73" />
            <path d="M47,74 L44,88 L56,88 L53,74 Z" fill="#4E7C73" />
            {/* Chubby round face */}
            <circle cx="50" cy="48" r="22" fill="#FEF3EA" />
            {/* Soft big rosy cheeks */}
            <ellipse cx="34" cy="52" rx="4.5" ry="3" fill="#FCA5A5" opacity="0.6" />
            <ellipse cx="66" cy="52" rx="4.5" ry="3" fill="#FCA5A5" opacity="0.6" />
            {/* Warm squinting happy curved eyes */}
            <path d="M37,45 Q42,40 47,45" stroke="#263833" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M53,45 Q58,40 63,45" stroke="#263833" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            {/* Friendly warm smile */}
            <path d="M44,55 Q50,61 56,55" stroke="#993333" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Hair */}
            <path d="M26,45 Q26,24 50,22 Q74,24 74,45 Q66,28 50,28 Q34,28 26,45 Z" fill="#3B4A45" />
            <path d="M32,32 Q45,36 50,42 Q55,34 68,32" fill="#506660" />
            {/* Little chef star hat on head */}
            <path d="M42,22 C42,16 46,14 50,14 C54,14 58,16 58,22 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
            <rect x="42" y="20" width="16" height="3" fill="#E2E8F0" rx="1" />
          </svg>
        </div>
      );

    default:
      return (
        <div className={`${sizeClasses} rounded-full bg-[#E2E8F0] flex items-center justify-center text-gray-500 font-bold ${className}`}>
          夜
        </div>
      );
  }
}
