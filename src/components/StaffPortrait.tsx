import { useEffect } from 'react';
import { StaffMember } from '../types';
import { triggerTopProgress, completeTopProgress } from '../utils/progress';

interface StaffPortraitProps {
  staff: StaffMember;
}

export function StaffPortrait({ staff }: StaffPortraitProps) {
  useEffect(() => {
    if (staff.photoUrl) {
      triggerTopProgress();
    }
  }, [staff.id, staff.photoUrl]);

  // Render real photo if provided (e.g. 萊可 photo), otherwise bespoke detailed character illustration
  const renderCharacterIllustration = () => {
    if (staff.photoUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={staff.photoUrl}
            alt={staff.name}
            className="w-auto max-w-full h-auto max-h-[620px] sm:max-h-[700px] md:max-h-[760px] lg:max-h-[820px] object-contain drop-shadow-[0_20px_40px_rgba(20,40,70,0.24)] transition-transform duration-500 ease-out hover:scale-[1.02]"
            referrerPolicy="no-referrer"
            onLoad={() => completeTopProgress()}
          />
        </div>
      );
    }

    switch (staff.id) {
      case 'laiko':
        // 萊可: Elegant Butler with monocle, slate-blue hair, deep navy suit, star cravat
        return (
          <svg viewBox="0 0 400 520" className="w-auto max-w-full h-auto max-h-[620px] sm:max-h-[700px] md:max-h-[760px] lg:max-h-[820px] object-contain drop-shadow-[0_20px_40px_rgba(20,40,70,0.22)]">
            <defs>
              <linearGradient id="suit-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1E324A" />
                <stop offset="100%" stopColor="#122030" />
              </linearGradient>
              <linearGradient id="hair-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#384F66" />
                <stop offset="100%" stopColor="#253545" />
              </linearGradient>
            </defs>

            {/* Ambient Star particles */}
            <circle cx="90" cy="110" r="2.5" fill="#88B0D6" opacity="0.7" />
            <circle cx="310" cy="130" r="2" fill="#88B0D6" opacity="0.8" />
            <circle cx="70" cy="260" r="1.5" fill="#A4C7E8" opacity="0.6" />
            <circle cx="340" cy="280" r="2.5" fill="#A4C7E8" opacity="0.7" />
            <path d="M190,45 L193,55 L203,58 L193,61 L190,71 L187,61 L177,58 L187,55 Z" fill="#7FA9D0" opacity="0.75" />

            {/* Shoulders & Butler Suit */}
            <path d="M40,520 Q120,330 200,330 Q280,330 360,520 Z" fill="url(#suit-grad)" />
            {/* White Dress Shirt V */}
            <polygon points="200,330 160,450 240,450" fill="#FFFFFF" />
            {/* Silk Ascot Cravat */}
            <path d="M185,345 C185,340 215,340 215,345 L210,410 L190,410 Z" fill="#3F668E" />
            <circle cx="200" cy="355" r="5" fill="#E8C15A" stroke="#FFFFFF" strokeWidth="1" />
            {/* Vest lapels */}
            <path d="M150,340 L175,460 L140,520 L80,520 Z" fill="#294363" />
            <path d="M250,340 L225,460 L260,520 L320,520 Z" fill="#294363" />
            {/* Butler Silver Chain */}
            <path d="M155,420 Q200,450 245,420" stroke="#D4AF37" strokeWidth="2.5" fill="none" strokeDasharray="4 2" />

            {/* Neck */}
            <path d="M180,260 L180,340 L220,340 L220,260 Z" fill="#FCEFE6" />

            {/* Face */}
            <ellipse cx="200" cy="220" rx="68" ry="76" fill="#FFF4EC" />
            <path d="M145,225 Q135,270 200,296 Q265,270 255,225 Z" fill="#FFF4EC" />

            {/* Ears & Earring */}
            <ellipse cx="132" cy="225" rx="10" ry="16" fill="#FEE9DC" />
            <ellipse cx="268" cy="225" rx="10" ry="16" fill="#FEE9DC" />
            <circle cx="131" cy="233" r="3" fill="#D4AF37" />

            {/* Hair Back */}
            <path d="M130,220 C120,120 280,120 270,220 C260,250 275,270 270,290 C250,290 250,260 250,260 L150,260 C150,260 150,290 130,290 C125,270 140,250 130,220 Z" fill="url(#hair-grad)" />

            {/* Eyes */}
            {/* Left Eye */}
            <ellipse cx="172" cy="215" rx="9" ry="12" fill="#274463" />
            <circle cx="174" cy="211" r="3.5" fill="#FFFFFF" />
            <circle cx="169" cy="219" r="1.8" fill="#88B0D6" />
            {/* Right Eye */}
            <ellipse cx="228" cy="215" rx="9" ry="12" fill="#274463" />
            <circle cx="230" cy="211" r="3.5" fill="#FFFFFF" />
            <circle cx="225" cy="219" r="1.8" fill="#88B0D6" />

            {/* Eyebrows */}
            <path d="M158,195 Q174,190 186,197" stroke="#36495C" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M214,197 Q226,190 242,195" stroke="#36495C" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Refined Nose */}
            <path d="M198,218 L195,238 L202,239" stroke="#E2B79E" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Gentle Butler Smile */}
            <path d="M186,258 Q200,266 214,258" stroke="#B86F58" strokeWidth="2.8" fill="none" strokeLinecap="round" />

            {/* Monocle on Right Eye */}
            <circle cx="228" cy="215" r="22" stroke="#E5B942" strokeWidth="2.5" fill="none" />
            <path d="M248,225 C265,250 255,290 250,330" stroke="#E5B942" strokeWidth="1.8" fill="none" />
            <circle cx="250" cy="330" r="3" fill="#E5B942" />

            {/* Hair Front Styled Strands */}
            <path d="M125,200 C125,120 200,105 275,130 C270,140 250,150 240,170 C230,145 190,140 180,185 C175,150 145,160 135,210 Z" fill="url(#hair-grad)" />
            <path d="M185,145 Q210,185 205,215 Q195,175 180,155 Z" fill="#4B6580" />
            <path d="M140,165 Q165,195 160,225" stroke="#4B6580" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
        );

      case 'luko':
        // 璐可: Sweet anime maid with frilled headband, honey-brown twintails, azure eyes
        return (
          <svg viewBox="0 0 400 520" className="w-auto max-w-full h-auto max-h-[620px] sm:max-h-[700px] md:max-h-[760px] lg:max-h-[820px] object-contain drop-shadow-[0_20px_40px_rgba(20,40,70,0.22)]">
            <defs>
              <linearGradient id="luko-hair" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#BA8C73" />
                <stop offset="100%" stopColor="#9C715A" />
              </linearGradient>
              <linearGradient id="luko-dress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2F445B" />
                <stop offset="100%" stopColor="#1E2F40" />
              </linearGradient>
            </defs>

            {/* Twinkling Hearts & Stars */}
            <circle cx="80" cy="120" r="3" fill="#8DBAE2" opacity="0.8" />
            <circle cx="320" cy="140" r="2.5" fill="#8DBAE2" opacity="0.8" />
            <circle cx="65" cy="280" r="2" fill="#E8B4C0" opacity="0.7" />
            <circle cx="335" cy="270" r="3" fill="#8DBAE2" opacity="0.7" />
            <path d="M190,45 L193,55 L203,58 L193,61 L190,71 L187,61 L177,58 L187,55 Z" fill="#85B2DC" opacity="0.8" />

            {/* Twin tails back flow */}
            <path d="M110,210 C70,250 50,330 75,410 C85,350 115,290 135,260 Z" fill="url(#luko-hair)" />
            <path d="M290,210 C330,250 350,330 325,410 C315,350 285,290 265,260 Z" fill="url(#luko-hair)" />

            {/* Maid Dress Body */}
            <path d="M45,520 Q120,335 200,335 Q280,335 355,520 Z" fill="url(#luko-dress)" />
            {/* White Frilly Pinafore Apron */}
            <path d="M140,350 L260,350 L240,520 L160,520 Z" fill="#FFFFFF" />
            {/* Apron Straps with Frills */}
            <path d="M135,350 Q120,420 145,520" stroke="#F1F5F9" strokeWidth="14" fill="none" />
            <path d="M265,350 Q280,420 255,520" stroke="#F1F5F9" strokeWidth="14" fill="none" />

            {/* Neck & Pale Cyan Maid Bow */}
            <path d="M182,270 L182,340 L218,340 L218,270 Z" fill="#FFF4EC" />
            {/* White Peter Pan Collar */}
            <path d="M160,340 Q200,370 200,340 Q200,370 240,340" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            {/* Cyan Ribbon */}
            <circle cx="200" cy="355" r="7" fill="#5897CA" />
            <path d="M194,355 Q170,365 175,385 Q190,375 198,360" fill="#76ACD8" />
            <path d="M206,355 Q230,365 225,385 Q210,375 202,360" fill="#76ACD8" />

            {/* Face */}
            <ellipse cx="200" cy="225" rx="66" ry="72" fill="#FFF5EE" />
            {/* Cute Rosy Cheek Blush */}
            <ellipse cx="152" cy="242" rx="14" ry="7" fill="#F8B6BD" opacity="0.65" />
            <ellipse cx="248" cy="242" rx="14" ry="7" fill="#F8B6BD" opacity="0.65" />

            {/* Ears & Pearl studs */}
            <ellipse cx="134" cy="228" rx="8" ry="14" fill="#FEE8DF" />
            <ellipse cx="266" cy="228" rx="8" ry="14" fill="#FEE8DF" />

            {/* Big Anime Azure Eyes */}
            {/* Left Eye */}
            <ellipse cx="168" cy="216" rx="13" ry="17" fill="#2E689C" />
            <ellipse cx="168" cy="219" rx="11" ry="12" fill="#5299D3" />
            <circle cx="164" cy="210" r="5" fill="#FFFFFF" />
            <circle cx="173" cy="223" r="2.8" fill="#FFFFFF" />
            {/* Right Eye */}
            <ellipse cx="232" cy="216" rx="13" ry="17" fill="#2E689C" />
            <ellipse cx="232" cy="219" rx="11" ry="12" fill="#5299D3" />
            <circle cx="228" cy="210" r="5" fill="#FFFFFF" />
            <circle cx="237" cy="223" r="2.8" fill="#FFFFFF" />

            {/* Cute Eyebrows */}
            <path d="M154,194 Q168,188 182,195" stroke="#875E48" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M218,195 Q232,188 246,194" stroke="#875E48" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Sweet Nose */}
            <circle cx="200" cy="235" r="2" fill="#E8B096" />

            {/* Cheerful Open Maid Smile */}
            <path d="M184,254 Q200,272 216,254 Z" fill="#F48B96" stroke="#D15F6C" strokeWidth="1.5" />
            <path d="M190,256 Q200,264 210,256" fill="#FFFFFF" />

            {/* Hair Front Bangs */}
            <path d="M130,210 C130,130 270,130 270,210 C255,160 230,175 220,205 C210,170 190,170 180,205 C170,170 145,170 130,210 Z" fill="url(#luko-hair)" />

            {/* White Frilly Maid Headband (Headdress) */}
            <path d="M135,150 Q200,95 265,150 Q250,130 200,120 Q150,130 135,150 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            {/* Headband Lace Frills */}
            <path d="M130,150 Q145,130 160,145 Q175,125 190,140 Q205,120 220,140 Q235,125 250,145 Q265,130 270,150" stroke="#CBDDEB" strokeWidth="2" fill="none" />
            {/* Cyan Headband Ribbons */}
            <circle cx="132" cy="155" r="6" fill="#5897CA" />
            <circle cx="268" cy="155" r="6" fill="#5897CA" />
          </svg>
        );

      case 'kurikuri':
        // 栗栗皆辛苦: Diligent energetic maid with cheerful smile, auburn hair, cat ear charm
        return (
          <svg viewBox="0 0 400 520" className="w-auto max-w-full h-auto max-h-[620px] sm:max-h-[700px] md:max-h-[760px] lg:max-h-[820px] object-contain drop-shadow-[0_20px_40px_rgba(20,40,70,0.22)]">
            <defs>
              <linearGradient id="kuri-hair" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A8583B" />
                <stop offset="100%" stopColor="#823E28" />
              </linearGradient>
            </defs>

            {/* Energetic Sparkles */}
            <circle cx="85" cy="130" r="3" fill="#D9822B" opacity="0.7" />
            <circle cx="315" cy="120" r="2.5" fill="#D9822B" opacity="0.8" />
            <circle cx="70" cy="270" r="2" fill="#88B0D6" opacity="0.7" />
            <circle cx="330" cy="290" r="2.5" fill="#D9822B" opacity="0.7" />
            <path d="M190,45 L193,55 L203,58 L193,61 L190,71 L187,61 L177,58 L187,55 Z" fill="#E6A15C" opacity="0.8" />

            {/* Cute Cat Ears (Miqo'te vibe) */}
            <polygon points="120,180 100,100 160,135" fill="#823E28" />
            <polygon points="122,175 110,115 150,140" fill="#F8C4B4" />
            <polygon points="280,180 300,100 240,135" fill="#823E28" />
            <polygon points="278,175 290,115 250,140" fill="#F8C4B4" />

            {/* Maid Uniform */}
            <path d="M45,520 Q120,335 200,335 Q280,335 355,520 Z" fill="#2B3E50" />
            {/* White Pinafore with Strawberry/Flower brooch */}
            <path d="M145,350 L255,350 L235,520 L165,520 Z" fill="#FFFFFF" />
            <circle cx="165" cy="380" r="6" fill="#DE5868" />
            <path d="M165,374 L165,371" stroke="#488550" strokeWidth="2" />

            {/* Neck & Orange Ribbon */}
            <path d="M182,270 L182,340 L218,340 L218,270 Z" fill="#FFF4EC" />
            <circle cx="200" cy="350" r="6" fill="#E67E33" />
            <path d="M194,350 L175,375 L190,370" fill="#E67E33" />
            <path d="M206,350 L225,375 L210,370" fill="#E67E33" />

            {/* Face */}
            <ellipse cx="200" cy="225" rx="66" ry="70" fill="#FFF5EE" />
            {/* Happy Blush */}
            <ellipse cx="150" cy="244" rx="14" ry="7" fill="#F8AFA6" opacity="0.75" />
            <ellipse cx="250" cy="244" rx="14" ry="7" fill="#F8AFA6" opacity="0.75" />

            {/* Diligent Sweat Droplet of Enthusiasm */}
            <path d="M138,205 C134,200 134,195 138,190 C142,195 142,200 138,205 Z" fill="#6EAAD9" />

            {/* Sparkling Amber Eyes */}
            {/* Left Eye winking or sparkling */}
            <ellipse cx="168" cy="216" rx="12" ry="16" fill="#8C4411" />
            <ellipse cx="168" cy="219" rx="10" ry="11" fill="#D97A29" />
            <circle cx="164" cy="210" r="4.5" fill="#FFFFFF" />
            <circle cx="172" cy="222" r="2.5" fill="#FFFFFF" />
            {/* Right Eye */}
            <ellipse cx="232" cy="216" rx="12" ry="16" fill="#8C4411" />
            <ellipse cx="232" cy="219" rx="10" ry="11" fill="#D97A29" />
            <circle cx="228" cy="210" r="4.5" fill="#FFFFFF" />
            <circle cx="236" cy="222" r="2.5" fill="#FFFFFF" />

            {/* Eyebrows */}
            <path d="M152,192 Q168,185 182,194" stroke="#7A361E" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            <path d="M218,194 Q232,185 248,192" stroke="#7A361E" strokeWidth="3.2" fill="none" strokeLinecap="round" />

            {/* Nose */}
            <circle cx="200" cy="235" r="2.2" fill="#D99B82" />

            {/* Huge energetic grin */}
            <path d="M182,252 Q200,276 218,252 Z" fill="#DE5868" stroke="#B83A48" strokeWidth="1.5" />
            <path d="M187,253 Q200,262 213,253" fill="#FFFFFF" />

            {/* Auburn Hair Short & Sprightly */}
            <path d="M130,205 C130,135 270,135 270,205 C255,165 240,175 225,200 C215,165 195,165 185,200 C175,165 145,165 130,205 Z" fill="url(#kuri-hair)" />

            {/* Diligent Maid Cap */}
            <path d="M145,145 Q200,105 255,145 Q245,130 200,125 Q155,130 145,145 Z" fill="#FFFFFF" stroke="#D1DCE5" strokeWidth="2" />
          </svg>
        );

      case 'donggua':
        // 胖冬瓜: Kind-hearted chef butler, gentle warm eyes, handsome sturdy presence, chef vest
        return (
          <svg viewBox="0 0 400 520" className="w-auto max-w-full h-auto max-h-[620px] sm:max-h-[700px] md:max-h-[760px] lg:max-h-[820px] object-contain drop-shadow-[0_20px_40px_rgba(20,40,70,0.22)]">
            <defs>
              <linearGradient id="dong-vest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3C4B54" />
                <stop offset="100%" stopColor="#253138" />
              </linearGradient>
            </defs>

            {/* Cozy Warm Sparkles */}
            <circle cx="80" cy="110" r="3" fill="#6B93A8" opacity="0.7" />
            <circle cx="320" cy="130" r="2.5" fill="#6B93A8" opacity="0.8" />
            <circle cx="70" cy="260" r="2" fill="#E8A663" opacity="0.6" />
            <circle cx="330" cy="280" r="3" fill="#E8A663" opacity="0.7" />
            <path d="M190,45 L193,55 L203,58 L193,61 L190,71 L187,61 L177,58 L187,55 Z" fill="#628C9F" opacity="0.7" />

            {/* Sturdy Broad Shoulders */}
            <path d="M30,520 Q110,320 200,320 Q290,320 370,520 Z" fill="url(#dong-vest)" />
            {/* Chef Apron & Shirt */}
            <polygon points="200,320 150,460 250,460" fill="#FFFFFF" />
            {/* White Neck Cravat */}
            <path d="M185,335 C185,330 215,330 215,335 L210,405 L190,405 Z" fill="#4B6A78" />
            <circle cx="200" cy="345" r="5" fill="#D4AF37" />

            {/* Neck */}
            <path d="M175,250 L175,330 L225,330 L225,250 Z" fill="#F7E6D7" />

            {/* Broad Reassuring Face */}
            <ellipse cx="200" cy="215" rx="74" ry="78" fill="#FFF1E4" />

            {/* Ears */}
            <ellipse cx="124" cy="220" rx="10" ry="16" fill="#F5DDCA" />
            <ellipse cx="276" cy="220" rx="10" ry="16" fill="#F5DDCA" />

            {/* Kind Crinkled Smiling Eyes */}
            <path d="M160,210 Q175,200 190,212" stroke="#253744" strokeWidth="3.8" fill="none" strokeLinecap="round" />
            <path d="M210,212 Q225,200 240,210" stroke="#253744" strokeWidth="3.8" fill="none" strokeLinecap="round" />
            {/* Eye smile crinkles */}
            <path d="M154,212 Q158,216 156,220" stroke="#C7A58E" strokeWidth="1.8" fill="none" />
            <path d="M246,212 Q242,216 244,220" stroke="#C7A58E" strokeWidth="1.8" fill="none" />

            {/* Eyebrows */}
            <path d="M156,192 Q174,182 188,193" stroke="#3A4D59" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M212,193 Q226,182 244,192" stroke="#3A4D59" strokeWidth="3.5" fill="none" strokeLinecap="round" />

            {/* Gentle Warm Nose */}
            <path d="M197,212 L193,234 L207,235" stroke="#DCAE94" strokeWidth="2.8" fill="none" strokeLinecap="round" />

            {/* Big Warm Reassuring Smile */}
            <path d="M175,252 Q200,276 225,252" stroke="#A85742" strokeWidth="3.2" fill="none" strokeLinecap="round" />

            {/* Handsome Short Charcoal Hair */}
            <path d="M125,205 C120,115 280,115 275,205 C265,150 245,145 220,155 C210,135 180,135 170,160 C155,145 135,160 125,205 Z" fill="#2E3F47" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full flex items-center justify-center select-none group">
      {/* Character Illustration / Photo - Background Free & Scaled to Fit */}
      <div className="w-full flex items-center justify-center transition-transform duration-500 ease-out">
        {renderCharacterIllustration()}
      </div>
    </div>
  );
}
