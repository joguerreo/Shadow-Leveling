import React from 'react';
import { AVATAR_CATALOG, FRAME_CATALOG } from './avatarCatalog';

interface HunterAvatarProps {
  avatarId?: string;
  frameId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'card';
  className?: string;
  showGlow?: boolean;
  animated?: boolean;
}

const sizeClasses = {
  xs: 'size-7',
  sm: 'size-9',
  md: 'size-12',
  lg: 'size-16',
  xl: 'size-24',
  '2xl': 'size-32',
  card: 'size-44',
};

export const HunterAvatar: React.FC<HunterAvatarProps> = ({
  avatarId = 'monarch-shadow',
  frameId = 'frame-e',
  size = 'md',
  className = '',
  showGlow = true,
  animated = false,
}) => {
  const currentAvatar = AVATAR_CATALOG.find((a) => a.id === avatarId) || AVATAR_CATALOG[0];
  const currentFrame = FRAME_CATALOG.find((f) => f.id === frameId) || FRAME_CATALOG[0];

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // Render SVG illustration per Avatar ID
  const renderAvatarGraphic = () => {
    switch (avatarId) {
      case 'monarch-shadow':
        // Sung Jin-Woo: Glowing cyan eyes, dark sharp hair, shadowy aura
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="jinwoo-bg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#090d16" />
                <stop offset="0.6" stopColor="#0d182e" />
                <stop offset="1" stopColor="#1e1b4b" />
              </linearGradient>
              <radialGradient id="jinwoo-eyes" cx="0.5" cy="0.5" r="0.5">
                <stop stopColor="#67e8f9" />
                <stop offset="0.7" stopColor="#38bdf8" />
                <stop offset="1" stopColor="#0284c7" stopOpacity="0" />
              </radialGradient>
              <filter id="jinwoo-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Background */}
            <rect width="120" height="120" rx="60" fill="url(#jinwoo-bg)" />
            {/* Dark Aura Wisps */}
            <path d="M20 100 C30 65 40 40 60 30 C80 40 90 65 100 100 Z" fill="#1e1b4b" opacity="0.6" />
            <path d="M15 110 C25 80 45 60 60 55 C75 60 95 80 105 110 Z" fill="#312e81" opacity="0.4" />
            {/* Shoulders & Dark Coat Collar */}
            <path d="M15 120 L35 88 L50 98 L60 85 L70 98 L85 88 L105 120 Z" fill="#030712" />
            <path d="M35 88 L60 115 L85 88" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.7" fill="none" />
            {/* Neck & Face Base */}
            <path d="M48 68 L60 82 L72 68 Z" fill="#fed7aa" />
            <path d="M40 42 C40 30 60 25 80 42 C82 58 72 72 60 78 C48 72 38 58 40 42 Z" fill="#ffedd5" />
            {/* Shadow on Face */}
            <path d="M40 42 C40 30 55 25 60 25 L60 78 C48 72 38 58 40 42 Z" fill="#0f172a" opacity="0.3" />
            {/* Shadow Hair (Sharp Anime strands) */}
            <path d="M32 45 L38 28 L50 20 L65 18 L82 22 L90 35 L86 48 L80 32 L68 24 L52 26 L42 38 L45 50 Z" fill="#030712" />
            <path d="M50 20 L58 42 L64 22 L72 40 L78 28 L66 18 Z" fill="#090d16" />
            <path d="M40 35 L48 48 L46 38 L54 50 L56 36 L62 48" stroke="#1e293b" strokeWidth="1.5" />
            {/* Eyebrows */}
            <path d="M46 48 L56 50" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
            <path d="M64 50 L74 48" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
            {/* Glowing Monarch Eyes */}
            <ellipse cx="51" cy="54" rx="4.5" ry="2" fill="#38bdf8" filter="url(#jinwoo-glow)" />
            <ellipse cx="69" cy="54" rx="4.5" ry="2" fill="#38bdf8" filter="url(#jinwoo-glow)" />
            <circle cx="51" cy="54" r="1.5" fill="#ffffff" />
            <circle cx="69" cy="54" r="1.5" fill="#ffffff" />
            {/* Electric Mana Flares */}
            <path d="M47 54 L38 52 M73 54 L82 52" stroke="#67e8f9" strokeWidth="1.2" strokeLinecap="round" filter="url(#jinwoo-glow)" />
            {/* Nose & Smirk */}
            <path d="M60 56 L59 62 L62 63" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M55 69 Q60 71 65 69" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      case 'igris-knight':
        // Igris: Red plumed helmet, black knight armor, crimson visor slits
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="igris-bg" x1="0" y1="0" x2="120" y2="120">
                <stop stopColor="#180404" />
                <stop offset="0.7" stopColor="#350808" />
                <stop offset="1" stopColor="#450a0a" />
              </linearGradient>
              <filter id="red-glow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect width="120" height="120" rx="60" fill="url(#igris-bg)" />
            {/* Flowing Crimson Plume */}
            <path d="M60 25 C65 5 85 8 95 18 C105 28 112 50 115 75 C108 60 98 42 85 35 C75 30 65 30 60 25 Z" fill="#ef4444" opacity="0.9" />
            <path d="M60 22 C68 2 90 4 102 16 C110 26 116 48 118 68 C112 52 102 38 90 30 Z" fill="#b91c1c" />
            {/* Knight Pauldrons */}
            <path d="M15 120 L30 85 L50 95 L60 90 L70 95 L90 85 L105 120 Z" fill="#0a0a0a" stroke="#7f1d1d" strokeWidth="1.5" />
            {/* Great Helm Outer */}
            <path d="M38 45 C38 28 50 20 60 20 C70 20 82 28 82 45 L80 82 L60 92 L40 82 Z" fill="#171717" stroke="#991b1b" strokeWidth="2" />
            {/* Helmet Faceplate Center Ridge */}
            <path d="M60 20 L60 92" stroke="#dc2626" strokeWidth="2" />
            {/* Visor Cutouts */}
            <path d="M44 52 L56 54 L44 56 Z" fill="#ef4444" filter="url(#red-glow)" />
            <path d="M76 52 L64 54 L76 56 Z" fill="#ef4444" filter="url(#red-glow)" />
            {/* Eye Slits Inner Glow */}
            <line x1="45" y1="54" x2="55" y2="54" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="65" y1="54" x2="75" y2="54" stroke="#ffffff" strokeWidth="1.5" />
            {/* Helm Ventilation Grids */}
            <line x1="48" y1="68" x2="54" y2="68" stroke="#7f1d1d" strokeWidth="1.5" />
            <line x1="66" y1="68" x2="72" y2="68" stroke="#7f1d1d" strokeWidth="1.5" />
            <line x1="50" y1="74" x2="54" y2="74" stroke="#7f1d1d" strokeWidth="1.5" />
            <line x1="66" y1="74" x2="70" y2="74" stroke="#7f1d1d" strokeWidth="1.5" />
          </svg>
        );

      case 'beru-ant':
        // Beru: Insectoid shadows, purple carapace, menacing purple eyes & mandibles
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="beru-bg" x1="0" y1="0" x2="120" y2="120">
                <stop stopColor="#140727" />
                <stop offset="0.7" stopColor="#2e1065" />
                <stop offset="1" stopColor="#3b0764" />
              </linearGradient>
              <filter id="purple-glow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect width="120" height="120" rx="60" fill="url(#beru-bg)" />
            {/* Long Swept Antennas */}
            <path d="M50 30 Q30 5 15 2 Q28 18 45 35" fill="#a855f7" />
            <path d="M70 30 Q90 5 105 2 Q92 18 75 35" fill="#a855f7" />
            {/* Chitinous Carapace & Torso */}
            <path d="M20 120 L35 85 L50 92 L60 88 L70 92 L85 85 L100 120 Z" fill="#0f0728" stroke="#a855f7" strokeWidth="1.5" />
            {/* Ant King Crown / Head Carapace */}
            <path d="M35 50 L45 25 L60 32 L75 25 L85 50 L75 80 L60 88 L45 80 Z" fill="#1e1035" stroke="#c084fc" strokeWidth="2" />
            {/* Mandibles */}
            <path d="M42 75 Q32 88 48 94 Q44 85 48 76" fill="#e9d5ff" stroke="#a855f7" strokeWidth="1" />
            <path d="M78 75 Q88 88 72 94 Q76 85 72 76" fill="#e9d5ff" stroke="#a855f7" strokeWidth="1" />
            {/* Compound Insect Glowing Eyes */}
            <polygon points="40,52 52,48 54,58 44,64" fill="#c084fc" filter="url(#purple-glow)" />
            <polygon points="80,52 68,48 66,58 76,64" fill="#c084fc" filter="url(#purple-glow)" />
            <ellipse cx="47" cy="54" rx="2" ry="3" fill="#ffffff" />
            <ellipse cx="73" cy="54" rx="2" ry="3" fill="#ffffff" />
          </svg>
        );

      case 'cha-assassin':
        // Cha Hae-In: Blonde hair, glowing yellow/golden eyes, sleek white/gold uniform
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cha-bg" x1="0" y1="0" x2="120" y2="120">
                <stop stopColor="#1c1917" />
                <stop offset="0.6" stopColor="#292524" />
                <stop offset="1" stopColor="#451a03" />
              </linearGradient>
            </defs>
            <rect width="120" height="120" rx="60" fill="url(#cha-bg)" />
            {/* Golden Flowing Hair Back */}
            <path d="M28 45 C28 20 50 15 60 15 C70 15 92 20 92 45 C92 75 88 95 82 105 C75 90 78 75 75 60 C45 60 48 75 38 105 C32 95 28 75 28 45 Z" fill="#facc15" />
            {/* White & Gold Hunter Uniform */}
            <path d="M22 120 L38 88 L52 95 L60 88 L68 95 L82 88 L98 120 Z" fill="#f8fafc" stroke="#eab308" strokeWidth="1.5" />
            <path d="M48 70 L60 84 L72 70 Z" fill="#fde047" />
            {/* Face */}
            <path d="M44 46 C44 34 60 30 76 46 C78 60 70 72 60 76 C50 72 42 60 44 46 Z" fill="#fef3c7" />
            {/* Bangs (Blonde sharp strands) */}
            <path d="M35 40 L45 22 L60 18 L75 22 L85 40 L78 30 L65 24 L52 24 L42 32 Z" fill="#eab308" />
            <path d="M42 30 L52 50 L56 34 L62 48 L68 32 L78 44" stroke="#ca8a04" strokeWidth="1.5" />
            {/* Golden Eyes */}
            <ellipse cx="51" cy="54" rx="4" ry="2.5" fill="#eab308" />
            <ellipse cx="69" cy="54" rx="4" ry="2.5" fill="#eab308" />
            <circle cx="51" cy="54" r="1.5" fill="#ffffff" />
            <circle cx="69" cy="54" r="1.5" fill="#ffffff" />
            {/* Sword Gleam at Shoulder */}
            <line x1="88" y1="80" x2="108" y2="100" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );

      case 'choi-pyro':
        // Choi Jong-In: Red hair, sharp glasses, flames, ember eyes
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="choi-bg" x1="0" y1="0" x2="120" y2="120">
                <stop stopColor="#180c05" />
                <stop offset="0.6" stopColor="#431407" />
                <stop offset="1" stopColor="#7c2d12" />
              </linearGradient>
            </defs>
            <rect width="120" height="120" rx="60" fill="url(#choi-bg)" />
            {/* Flames behind */}
            <path d="M25 80 Q35 40 45 50 Q55 20 65 40 Q75 15 85 45 Q95 30 100 80 Z" fill="#f97316" opacity="0.4" />
            <path d="M35 85 Q45 50 55 60 Q65 35 75 55 Q85 45 90 85 Z" fill="#ef4444" opacity="0.6" />
            {/* Suit & Tie */}
            <path d="M20 120 L35 88 L52 98 L60 88 L68 98 L85 88 L100 120 Z" fill="#1c1917" stroke="#ea580c" strokeWidth="1.5" />
            <polygon points="56,92 64,92 62,118 58,118" fill="#dc2626" />
            {/* Face */}
            <path d="M42 45 C42 32 60 28 78 45 C80 60 70 72 60 76 C50 72 40 60 42 45 Z" fill="#ffedd5" />
            {/* Red Hair */}
            <path d="M34 42 L42 22 L58 16 L74 20 L86 38 L76 26 L60 22 L44 26 Z" fill="#dc2626" />
            <path d="M40 32 L48 44 L54 30 L64 42 L72 32" stroke="#b91c1c" strokeWidth="1.5" />
            {/* Glasses */}
            <rect x="44" y="50" width="13" height="8" rx="2" fill="none" stroke="#f97316" strokeWidth="1.5" />
            <rect x="63" y="50" width="13" height="8" rx="2" fill="none" stroke="#f97316" strokeWidth="1.5" />
            <line x1="57" y1="53" x2="63" y2="53" stroke="#f97316" strokeWidth="1.5" />
            {/* Fiery Eyes behind glasses */}
            <circle cx="50" cy="54" r="2.5" fill="#f97316" />
            <circle cx="69" cy="54" r="2.5" fill="#f97316" />
          </svg>
        );

      case 'beast-monarch':
        // Baek Yoon-Ho: White beast hair, tiger stripes, fangs, feral amber eyes
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="beast-bg" x1="0" y1="0" x2="120" y2="120">
                <stop stopColor="#1c1917" />
                <stop offset="0.6" stopColor="#292524" />
                <stop offset="1" stopColor="#451a03" />
              </linearGradient>
            </defs>
            <rect width="120" height="120" rx="60" fill="url(#beast-bg)" />
            {/* Wild Silver Mane */}
            <path d="M20 50 L30 25 L45 15 L60 10 L75 15 L90 25 L100 50 L92 70 L98 90 L85 85 L88 110 L70 95 L60 100 L50 95 L32 110 L35 85 L22 90 L28 70 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
            {/* Broad Shoulders */}
            <path d="M15 120 L35 90 L60 98 L85 90 L105 120 Z" fill="#0f172a" />
            {/* Face */}
            <path d="M40 46 C40 32 60 28 80 46 C82 62 72 74 60 78 C48 74 38 62 40 46 Z" fill="#fed7aa" />
            {/* Tiger Facial Marks */}
            <path d="M38 52 L46 54 M36 58 L45 60" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            <path d="M82 52 L74 54 M84 58 L75 60" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            {/* Feral Eyes */}
            <ellipse cx="49" cy="52" rx="4.5" ry="3" fill="#f59e0b" />
            <ellipse cx="71" cy="52" rx="4.5" ry="3" fill="#f59e0b" />
            <line x1="49" y1="50" x2="49" y2="54" stroke="#000000" strokeWidth="1.5" />
            <line x1="71" y1="50" x2="71" y2="54" stroke="#000000" strokeWidth="1.5" />
            {/* Beast Snarl / Fangs */}
            <path d="M52 68 Q60 72 68 68" stroke="#000000" strokeWidth="1.5" fill="none" />
            <polygon points="53,68 55,73 57,68" fill="#ffffff" />
            <polygon points="63,68 65,73 67,68" fill="#ffffff" />
          </svg>
        );

      case 'frost-monarch':
        // Frost Monarch: Ice crown, icy blue eyes, frozen mist
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="frost-bg" x1="0" y1="0" x2="120" y2="120">
                <stop stopColor="#082f49" />
                <stop offset="0.6" stopColor="#0c4a6e" />
                <stop offset="1" stopColor="#075985" />
              </linearGradient>
            </defs>
            <rect width="120" height="120" rx="60" fill="url(#frost-bg)" />
            {/* Ice Crown Shards */}
            <polygon points="35,35 45,10 52,28" fill="#bae6fd" stroke="#38bdf8" strokeWidth="1" />
            <polygon points="50,28 60,5 70,28" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" />
            <polygon points="68,28 75,10 85,35" fill="#bae6fd" stroke="#38bdf8" strokeWidth="1" />
            {/* Shoulders */}
            <path d="M18 120 L38 90 L60 98 L82 90 L102 120 Z" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Face */}
            <path d="M42 46 C42 34 60 30 78 46 C80 62 70 74 60 78 C50 74 40 62 42 46 Z" fill="#f0f9ff" />
            {/* Icy Hair */}
            <path d="M34 42 L42 26 L60 22 L78 26 L86 42 L76 34 L60 30 L44 34 Z" fill="#bae6fd" />
            {/* Blizzard Eyes */}
            <circle cx="50" cy="54" r="4" fill="#0284c7" />
            <circle cx="70" cy="54" r="4" fill="#0284c7" />
            <circle cx="50" cy="54" r="1.5" fill="#ffffff" />
            <circle cx="70" cy="54" r="1.5" fill="#ffffff" />
            {/* Snowflake rune on forehead */}
            <path d="M60 40 L60 46 M57 43 L63 43" stroke="#0284c7" strokeWidth="1" />
          </svg>
        );

      case 'kaisel-dragon':
        // Kaisel: Skeletal Shadow Wyvern
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="kaisel-bg" x1="0" y1="0" x2="120" y2="120">
                <stop stopColor="#0b0f19" />
                <stop offset="0.6" stopColor="#1e1b4b" />
                <stop offset="1" stopColor="#312e81" />
              </linearGradient>
            </defs>
            <rect width="120" height="120" rx="60" fill="url(#kaisel-bg)" />
            {/* Dragon Horns */}
            <path d="M45 40 Q25 20 15 5 Q32 18 50 32" fill="#4338ca" stroke="#6366f1" strokeWidth="1" />
            <path d="M75 40 Q95 20 105 5 Q88 18 70 32" fill="#4338ca" stroke="#6366f1" strokeWidth="1" />
            {/* Dragon Snout & Head Base */}
            <path d="M38 50 L50 25 L70 25 L82 50 L75 85 L60 105 L45 85 Z" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
            {/* Skeletal Nasal Cavity */}
            <polygon points="56,78 64,78 60,88" fill="#090d16" />
            {/* Sharp Teeth */}
            <path d="M48 85 L52 92 L56 85 L60 92 L64 85 L68 92 L72 85" stroke="#e0e7ff" strokeWidth="1.5" fill="none" />
            {/* Glowing Spectral Eyes */}
            <polygon points="44,52 54,48 50,58" fill="#38bdf8" />
            <polygon points="76,52 66,48 70,58" fill="#38bdf8" />
            <circle cx="49" cy="53" r="1.5" fill="#ffffff" />
            <circle cx="71" cy="53" r="1.5" fill="#ffffff" />
          </svg>
        );

      case 'void-necromancer':
        // Necromancer: Dark cowl, spectral skull, blue flames
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="necro-bg" x1="0" y1="0" x2="120" y2="120">
                <stop stopColor="#050811" />
                <stop offset="0.6" stopColor="#0f172a" />
                <stop offset="1" stopColor="#172554" />
              </linearGradient>
            </defs>
            <rect width="120" height="120" rx="60" fill="url(#necro-bg)" />
            {/* Hood Outer */}
            <path d="M25 120 L35 70 C35 30 50 15 60 15 C70 15 85 30 85 70 L95 120 Z" fill="#020617" stroke="#1e3a8a" strokeWidth="2" />
            {/* Hood Cavity */}
            <path d="M38 65 C38 35 48 25 60 25 C72 25 82 35 82 65 C82 85 72 95 60 95 C48 95 38 85 38 65 Z" fill="#000000" />
            {/* Skull Face */}
            <path d="M44 55 C44 45 52 40 60 40 C68 40 76 45 76 55 C76 68 70 78 60 82 C50 78 44 68 44 55 Z" fill="#e2e8f0" />
            {/* Eye Sockets */}
            <ellipse cx="51" cy="56" rx="4.5" ry="5.5" fill="#000000" />
            <ellipse cx="69" cy="56" rx="4.5" ry="5.5" fill="#000000" />
            {/* Soul Flame in eyes */}
            <circle cx="51" cy="56" r="2" fill="#38bdf8" />
            <circle cx="69" cy="56" r="2" fill="#38bdf8" />
            {/* Skull Teeth */}
            <line x1="52" y1="72" x2="68" y2="72" stroke="#000000" strokeWidth="1" />
            <line x1="56" y1="69" x2="56" y2="75" stroke="#000000" strokeWidth="1" />
            <line x1="60" y1="69" x2="60" y2="75" stroke="#000000" strokeWidth="1" />
            <line x1="64" y1="69" x2="64" y2="75" stroke="#000000" strokeWidth="1" />
          </svg>
        );

      case 'awakened-novice':
        // The Weakest Hunter (Novice Jin-Woo with bandages)
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="novice-bg" x1="0" y1="0" x2="120" y2="120">
                <stop stopColor="#1e293b" />
                <stop offset="1" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            <rect width="120" height="120" rx="60" fill="url(#novice-bg)" />
            {/* Hoodie */}
            <path d="M18 120 L35 85 L60 95 L85 85 L102 120 Z" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            {/* Face */}
            <path d="M40 45 C40 32 60 28 80 45 C82 62 72 74 60 78 C48 74 38 62 40 45 Z" fill="#fed7aa" />
            {/* Messy Novice Hair */}
            <path d="M34 45 L40 25 L56 20 L72 22 L86 40 L78 30 L62 25 L46 28 Z" fill="#1e293b" />
            {/* Bandage across cheek */}
            <rect x="42" y="62" width="12" height="4" rx="1" transform="rotate(-15 42 62)" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            {/* Resolute human eyes */}
            <ellipse cx="50" cy="52" rx="3.5" ry="2" fill="#0f172a" />
            <ellipse cx="70" cy="52" rx="3.5" ry="2" fill="#0f172a" />
            {/* Tiny faint spark of blue awakening */}
            <circle cx="51" cy="52" r="1.2" fill="#38bdf8" />
            <circle cx="69" cy="52" r="1.2" fill="#38bdf8" />
          </svg>
        );

      case 'light-healer':
        // Min Byung-Gyu: Golden halo, holy crown, serene healer
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="healer-bg" x1="0" y1="0" x2="120" y2="120">
                <stop stopColor="#064e3b" />
                <stop offset="0.6" stopColor="#065f46" />
                <stop offset="1" stopColor="#047857" />
              </linearGradient>
            </defs>
            <rect width="120" height="120" rx="60" fill="url(#healer-bg)" />
            {/* Holy Halo Ring */}
            <circle cx="60" cy="30" r="22" stroke="#fde047" strokeWidth="2.5" fill="none" opacity="0.8" />
            {/* Robe */}
            <path d="M20 120 L38 90 L60 98 L82 90 L100 120 Z" fill="#f8fafc" stroke="#22c55e" strokeWidth="1.5" />
            {/* Face */}
            <path d="M42 46 C42 34 60 30 78 46 C80 62 70 74 60 78 C50 74 40 62 42 46 Z" fill="#ffedd5" />
            {/* Hair */}
            <path d="M38 42 L46 28 L60 24 L74 28 L82 42 L74 34 L60 30 L46 34 Z" fill="#475569" />
            {/* Kind Green Eyes */}
            <ellipse cx="50" cy="54" rx="4" ry="2.5" fill="#16a34a" />
            <ellipse cx="70" cy="54" rx="4" ry="2.5" fill="#16a34a" />
            <circle cx="50" cy="54" r="1.5" fill="#ffffff" />
            <circle cx="70" cy="54" r="1.5" fill="#ffffff" />
          </svg>
        );

      case 'tank-iron':
      default:
        // Iron: Heavy shield knight with ram horns on helmet
        return (
          <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="iron-bg" x1="0" y1="0" x2="120" y2="120">
                <stop stopColor="#0f172a" />
                <stop offset="0.7" stopColor="#1e293b" />
                <stop offset="1" stopColor="#334155" />
              </linearGradient>
            </defs>
            <rect width="120" height="120" rx="60" fill="url(#iron-bg)" />
            {/* Ram Horns */}
            <path d="M40 40 C20 30 15 50 30 60 C38 65 42 55 40 40 Z" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M80 40 C100 30 105 50 90 60 C82 65 78 55 80 40 Z" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Heavy Pauldrons */}
            <path d="M15 120 L32 85 L60 95 L88 85 L105 120 Z" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
            {/* Iron Helm */}
            <path d="M38 40 L50 22 L70 22 L82 40 L78 82 L60 92 L42 82 Z" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
            {/* Blue Eye Slit */}
            <rect x="46" y="52" width="28" height="5" rx="2" fill="#38bdf8" />
            <line x1="48" y1="54.5" x2="72" y2="54.5" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        );
    }
  };

  // Render Frame Effect
  const renderFrameOverlay = () => {
    switch (frameId) {
      case 'frame-monarch':
        return (
          <div className="absolute inset-0 rounded-full border-2 border-[#4d6aff] pointer-events-none shadow-[0_0_20px_rgba(77,106,255,0.8),inset_0_0_12px_rgba(139,92,246,0.5)]">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#38bdf8] animate-ping" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1.5 bg-indigo-400 rounded-full shadow-[0_0_6px_#818cf8]" />
          </div>
        );
      case 'frame-s':
        return (
          <div className="absolute inset-0 rounded-full border-2 border-purple-500 pointer-events-none shadow-[0_0_15px_rgba(168,85,247,0.7),inset_0_0_8px_rgba(168,85,247,0.4)]">
            <div className="absolute top-0 right-0 size-2 bg-purple-400 rounded-full animate-pulse" />
          </div>
        );
      case 'frame-a':
        return (
          <div className="absolute inset-0 rounded-full border-2 border-red-500 pointer-events-none shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
        );
      case 'frame-b':
        return (
          <div className="absolute inset-0 rounded-full border-2 border-blue-500 pointer-events-none shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        );
      case 'frame-c':
        return (
          <div className="absolute inset-0 rounded-full border-2 border-yellow-500 pointer-events-none shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
        );
      case 'frame-d':
        return (
          <div className="absolute inset-0 rounded-full border-2 border-slate-400 pointer-events-none" />
        );
      case 'frame-e':
      default:
        return (
          <div className="absolute inset-0 rounded-full border border-stone-600 pointer-events-none" />
        );
    }
  };

  return (
    <div
      className={`relative rounded-full overflow-visible shrink-0 transition-transform ${
        animated ? 'hover:scale-105 duration-200' : ''
      } ${sizeClass} ${className}`}
      style={{
        boxShadow: showGlow ? `0 0 15px ${currentFrame.glowColor}` : undefined,
      }}
    >
      {/* Inner Avatar Graphic */}
      <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center">
        {renderAvatarGraphic()}
      </div>

      {/* Frame Border & Sparkles */}
      {renderFrameOverlay()}
    </div>
  );
};

export default HunterAvatar;
