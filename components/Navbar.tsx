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
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0b0c10]/90 backdrop-blur-xl border-b border-border-dark/80 z-50 flex items-center justify-between px-4 md:px-8">
      {/* Brand & System Logo */}
      <div 
        className="flex items-center gap-3 cursor-pointer select-none"
        onClick={() => handleNavClick('dashboard')}
      >
        <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent p-1.5 flex items-center justify-center text-white shadow-md shadow-primary/20">
          <span className="material-symbols-outlined text-lg">view_in_ar</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-white text-xs font-black tracking-[0.25em] uppercase font-mono">
              SYSTEM
            </h1>
            <span className="px-1.5 py-0.2 bg-primary/20 border border-primary/40 rounded text-[9px] font-black text-primary uppercase">
              v2.0
            </span>
          </div>
          <p className="text-slate-400 text-[10px] tracking-widest font-mono hidden sm:block">
            SHADOW LEVELING
          </p>
        </div>
      </div>

      {/* Navigation Links (Desktop) */}
      <div className="hidden md:flex items-center gap-1 bg-surface-dark/60 p-1 rounded-xl border border-white/5">
        {[
          { id: 'dashboard' as const, name: 'Estado & Misiones', icon: 'person' },
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
                  ? 'opacity-55 hover:opacity-100 text-slate-500 hover:text-slate-300'
                  : isActive
                  ? 'bg-primary text-white system-glow shadow-sm'
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

      {/* Header Resources, Tour, Auth & Stats */}
      <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 shrink-0">
        {/* Currencies Pill - Mobile compact */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-surface-dark border border-border-dark px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs">
          <div className="flex items-center gap-1" title="Gold Credits">
            <span className="material-symbols-outlined text-yellow-400 text-sm">monetization_on</span>
            <span className="text-white font-black text-[10px] sm:text-xs">{player.gold.toLocaleString()}</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1" title="Essence Stones">
            <span className="material-symbols-outlined text-accent text-sm">diamond</span>
            <span className="text-accent font-black text-[10px] sm:text-xs">{player.essenceStones}</span>
          </div>
        </div>

        {/* Guided Tour Trigger Button */}
        <button
          onClick={() => {
            sound.playBeep(540, 0.04);
            onStartTour?.();
          }}
          className="size-7 sm:size-8 rounded-lg bg-surface-dark border border-border-dark flex items-center justify-center text-primary hover:text-white transition-all hover:border-primary/50"
          title="Guía del Sistema: Aprende cómo subir de nivel"
        >
          <span className="material-symbols-outlined text-base">help_outline</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="size-7 sm:size-8 rounded-lg bg-surface-dark border border-border-dark flex items-center justify-center text-slate-400 hover:text-white transition-all hover:border-primary/50"
          title={player.soundEnabled ? 'Silenciar Efectos de Audio' : 'Activar Sonido del Sistema'}
        >
          <span className="material-symbols-outlined text-base">
            {player.soundEnabled ? 'volume_up' : 'volume_off'}
          </span>
        </button>

        {/* Supabase Cloud Sync / Auth Trigger */}
        {currentUser ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs"
            title={`Conectado a la Base de Datos (${currentUser.email}). Haz clic en el icono para forzar sincronización total.`}
          >
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1 hover:text-emerald-200 transition-colors"
              title="Sincronizar el 100% de datos con la Base de Datos ahora"
            >
              <span className={`material-symbols-outlined text-sm text-emerald-400 ${isSyncing ? 'animate-spin' : 'hover:scale-110'}`}>
                {isSyncing ? 'sync' : 'cloud_done'}
              </span>
              <span className="text-[10px] font-mono text-emerald-300 font-bold hidden sm:inline">
                {isSyncing ? 'GUARDANDO...' : 'BDD (100%)'}
              </span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="ml-1 pl-1 border-l border-emerald-500/30 text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
                title="Cerrar sesión"
              >
                <span className="material-symbols-outlined text-xs">logout</span>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => {
              sound.playBeep(580, 0.04);
              onOpenAuth?.();
            }}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-primary/20 hover:bg-primary/30 border border-primary/50 hover:border-primary rounded-xl text-xs text-primary hover:text-white transition-all shadow-sm"
            title="Conectar con Supabase (Base de datos y Login)"
          >
            <span className="material-symbols-outlined text-sm">login</span>
            <span className="text-[10px] font-bold hidden sm:inline font-mono">LOGIN</span>
          </button>
        )}

        {/* Hunter Badge / Profile Trigger with Mobile CP display */}
        <div 
          onClick={() => {
            sound.playBeep(560, 0.04);
            onOpenProfileModal?.();
          }}
          className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-white/10 cursor-pointer group select-none"
          title="Abrir Perfil del Cazador"
        >
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-black text-primary uppercase tracking-wider group-hover:text-accent transition-colors">
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

    </nav>
  );
};

export default Navbar;
