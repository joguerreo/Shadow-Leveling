import React from 'react';
import { Player } from '../types';
import { calculateCombatPower } from '../utils/calculator';
import { sound } from '../utils/sound';
import { HunterAvatar } from './avatars/HunterAvatar';
import { isFeatureUnlocked, getFeatureUnlockRule } from '../utils/featureUnlocks';

interface NavbarProps {
  player: Player;
  onNavigate: (page: 'dashboard' | 'dungeons' | 'inventory' | 'shop' | 'shadows' | 'skills' | 'bosses' | 'analytics') => void;
  current: string;
  onToggleSound: () => void;
  onOpenProfileModal?: () => void;
  onOpenAuth?: () => void;
  onStartTour?: () => void;
  currentUser?: { displayName?: string | null; email?: string | null; id?: string } | null;
  isSyncing?: boolean;
  onLogout?: () => void;
  onManualSync?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  player,
  onNavigate,
  current,
  onToggleSound,
  onOpenProfileModal,
  onOpenAuth,
  onStartTour,
  currentUser,
  isSyncing,
  onLogout,
  onManualSync,
}) => {
  const combatPower = calculateCombatPower(player);

  const handleNavClick = (page: 'dashboard' | 'dungeons' | 'inventory' | 'shop' | 'shadows' | 'skills' | 'bosses' | 'analytics') => {
    const unlocked = isFeatureUnlocked(page, player.level);
    if (!unlocked) {
      const rule = getFeatureUnlockRule(page);
      sound.playBeep(220, 0.15, 'sawtooth');
      alert(`[ ACCESO RESTRINGIDO POR EL SISTEMA ]\n\nRequiere alcanzar el Nivel ${rule?.minLevel || '?'} para acceder a «${rule?.name || page}».\nActualmente tu nivel es ${player.level}. ¡Completa tus misiones diarias para desbloquear esta dimensión!`);
      return;
    }
    sound.playBeep(520, 0.05);
    onNavigate(page);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#080a11]/95 backdrop-blur-2xl border-b border-cyan-500/20 z-50 flex items-center justify-between px-3 md:px-8 select-none shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
      {/* Brand / Mobile Hunter Profile Plate */}
      <div className="flex items-center gap-2.5">
        {/* On Mobile: Hunter Avatar Quick Plate */}
        <div
          onClick={() => {
            sound.playBeep(560, 0.04);
            onOpenProfileModal?.();
          }}
          className="md:hidden flex items-center gap-2 bg-gradient-to-r from-cyan-950/40 to-[#0e1322] border border-cyan-500/30 rounded-xl px-2 py-1 cursor-pointer active:scale-95 transition-transform"
          title="Tocar para ver Perfil y Atributos del Cazador"
        >
          <div className="relative">
            <HunterAvatar
              avatarId={player.avatarId || 'monarch-shadow'}
              frameId={player.avatarFrame || 'frame-e'}
              size="sm"
              showGlow
              animated
              className="size-8"
            />
            <span className="absolute -bottom-1 -right-1 px-1 bg-cyan-500 text-black text-[8px] font-mono font-black rounded shadow">
              {player.rank}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-white text-[11px] font-black tracking-tight leading-none font-display">
              LV.{player.level}
            </span>
            <span className="text-cyan-400 text-[8.5px] font-mono font-bold leading-none mt-0.5">
              {combatPower.toLocaleString()} CP
            </span>
          </div>
        </div>

        {/* Desktop Brand Logo */}
        <div 
          className="hidden md:flex items-center gap-3 cursor-pointer select-none"
          onClick={() => handleNavClick('dashboard')}
        >
          <div className="size-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 p-1.5 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
            <span className="material-symbols-outlined text-lg">view_in_ar</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white text-xs font-black tracking-[0.25em] uppercase font-mono">
                SYSTEM
              </h1>
              <span className="px-1.5 py-0.2 bg-cyan-500/20 border border-cyan-400/40 rounded text-[9px] font-black text-cyan-300 uppercase font-mono">
                SOLO
              </span>
            </div>
            <p className="text-slate-400 text-[10px] tracking-widest font-mono">
              SHADOW LEVELING
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links (Desktop) */}
      <div className="hidden md:flex items-center gap-1 bg-[#101422]/80 p-1 rounded-xl border border-cyan-500/20">
        {[
          { id: 'dashboard' as const, name: 'Estado', icon: 'person' },
          { id: 'dungeons' as const, name: 'Mazmorras', icon: 'hourglass_top' },
          { id: 'inventory' as const, name: 'Inventario', icon: 'inventory_2' },
          { id: 'shop' as const, name: 'Mercado', icon: 'storefront' },
          { id: 'shadows' as const, name: 'Sombras', icon: 'groups' },
          { id: 'skills' as const, name: 'Habilidades', icon: 'psychology' },
          { id: 'bosses' as const, name: 'Jefes', icon: 'swords' },
          { id: 'analytics' as const, name: 'Analítica', icon: 'insights' },
        ].map((item) => {
          const isActive = current === item.id;
          const unlocked = isFeatureUnlocked(item.id, player.level);
          const rule = getFeatureUnlockRule(item.id);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all relative ${
                !unlocked
                  ? 'opacity-40 text-slate-500'
                  : isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={!unlocked ? `Bloqueado hasta Nivel ${rule?.minLevel}` : undefined}
            >
              <span className="material-symbols-outlined text-sm">
                {!unlocked ? 'lock' : item.icon}
              </span>
              <span>{item.name}</span>
              {!unlocked && rule && (
                <span className="text-[8px] font-mono font-black px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Lv.{rule.minLevel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Header Resources & Controls (Mobile Game Currency Bar) */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Gold Capsule */}
        <button
          onClick={() => handleNavClick('shop')}
          className="flex items-center gap-1 bg-[#121624] hover:bg-[#191f33] border border-amber-500/30 px-2 py-1 rounded-lg text-xs transition-transform active:scale-95 touch-manipulation"
          title="Oro acumulado. Toca para ir a la tienda."
        >
          <span className="material-symbols-outlined text-amber-400 text-sm">monetization_on</span>
          <span className="text-amber-200 font-mono font-black text-[11px] sm:text-xs">
            {player.gold.toLocaleString()}
          </span>
          <span className="text-[10px] text-amber-500 font-bold leading-none">+</span>
        </button>

        {/* Essence Stones Capsule */}
        <button
          onClick={() => handleNavClick('shop')}
          className="flex items-center gap-1 bg-[#121624] hover:bg-[#191f33] border border-cyan-500/30 px-2 py-1 rounded-lg text-xs transition-transform active:scale-95 touch-manipulation"
          title="Piedras de Esencia. Toca para recargar o canjear."
        >
          <span className="material-symbols-outlined text-cyan-400 text-sm">diamond</span>
          <span className="text-cyan-200 font-mono font-black text-[11px] sm:text-xs">
            {player.essenceStones}
          </span>
          <span className="text-[10px] text-cyan-500 font-bold leading-none">+</span>
        </button>

        {/* Sound FX Toggle */}
        <button
          onClick={onToggleSound}
          className="size-7 sm:size-8 rounded-lg bg-[#121624] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
          title={player.soundEnabled ? 'Silenciar Efectos de Audio' : 'Activar Sonido'}
        >
          <span className="material-symbols-outlined text-sm sm:text-base">
            {player.soundEnabled ? 'volume_up' : 'volume_off'}
          </span>
        </button>

        {/* Guided Tour Trigger Button */}
        <button
          onClick={() => {
            sound.playBeep(540, 0.04);
            onStartTour?.();
          }}
          className="hidden sm:flex size-8 rounded-lg bg-[#121624] border border-white/10 items-center justify-center text-cyan-400 hover:text-white transition-all"
          title="Guía del Sistema: Aprende cómo subir de nivel"
        >
          <span className="material-symbols-outlined text-base">help_outline</span>
        </button>

        {/* Desktop Hunter Profile Capsule */}
        <div 
          onClick={() => {
            sound.playBeep(560, 0.04);
            onOpenProfileModal?.();
          }}
          className="hidden md:flex items-center gap-2 pl-2 border-l border-white/10 cursor-pointer group select-none"
          title="Abrir Perfil del Cazador"
        >
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider group-hover:text-cyan-300 transition-colors">
              {player.rank} • LVL {player.level}
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              CP: {combatPower.toLocaleString()}
            </span>
          </div>
          <HunterAvatar
            avatarId={player.avatarId || 'monarch-shadow'}
            frameId={player.avatarFrame || 'frame-e'}
            size="sm"
            showGlow
            animated
            className="group-hover:scale-110 transition-transform"
          />
        </div>
      </div>

      {/* Holographic Cyan Bottom Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
    </nav>
  );
};

export default Navbar;
