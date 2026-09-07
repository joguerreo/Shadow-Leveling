import React from 'react';
import { Player } from '../types';
import { calculateCombatPower } from '../utils/calculator';
import { sound } from '../utils/sound';
import { HunterAvatar } from './avatars/HunterAvatar';

interface NavbarProps {
  player: Player;
  onNavigate: (page: 'dashboard' | 'dungeons' | 'inventory' | 'shop' | 'shadows' | 'skills' | 'bosses' | 'analytics') => void;
  current: string;
  onToggleSound: () => void;
  onOpenProfileModal?: () => void;
  currentUser?: { displayName: string | null; email: string | null; photoURL?: string | null } | null;
  isSyncing?: boolean;
  onLoginGoogle?: () => void;
  onLogoutGoogle?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  player,
  onNavigate,
  current,
  onToggleSound,
  onOpenProfileModal,
  currentUser,
  isSyncing,
  onLoginGoogle,
  onLogoutGoogle,
}) => {
  const combatPower = calculateCombatPower(player);

  const handleNavClick = (page: 'dashboard' | 'dungeons' | 'inventory' | 'shop' | 'shadows' | 'skills' | 'bosses' | 'analytics') => {
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
        <button
          onClick={() => handleNavClick('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            current === 'dashboard'
              ? 'bg-primary text-white system-glow shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-sm">person</span>
          Estado & Misiones
        </button>
        <button
          onClick={() => handleNavClick('dungeons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            current === 'dungeons'
              ? 'bg-primary text-white system-glow shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-sm">hourglass_top</span>
          Mazmorras
        </button>
        <button
          onClick={() => handleNavClick('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            current === 'inventory'
              ? 'bg-primary text-white system-glow shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-sm">inventory_2</span>
          Inventario
        </button>
        <button
          onClick={() => handleNavClick('shop')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            current === 'shop'
              ? 'bg-primary text-white system-glow shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-sm">storefront</span>
          Mercado
        </button>
        <button
          onClick={() => handleNavClick('shadows')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            current === 'shadows'
              ? 'bg-accent text-white shadow-md shadow-purple-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-sm">groups</span>
          Sombras
        </button>
        <button
          onClick={() => handleNavClick('skills')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            current === 'skills'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-sm">psychology</span>
          Habilidades
        </button>
        <button
          onClick={() => handleNavClick('bosses')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            current === 'bosses'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-sm">swords</span>
          Jefes
        </button>
        <button
          onClick={() => handleNavClick('analytics')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            current === 'analytics'
              ? 'bg-primary text-white system-glow shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined text-sm">insights</span>
          Analítica
        </button>
      </div>

      {/* Header Resources & Stats */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Currencies Pill */}
        <div className="flex items-center gap-3 bg-surface-dark border border-border-dark px-3 py-1.5 rounded-xl text-xs">
          <div className="flex items-center gap-1.5" title="Gold Credits">
            <span className="material-symbols-outlined text-yellow-400 text-sm">monetization_on</span>
            <span className="text-white font-black">{player.gold.toLocaleString()}</span>
          </div>
          <div className="w-px h-3.5 bg-white/10" />
          <div className="flex items-center gap-1.5" title="Essence Stones">
            <span className="material-symbols-outlined text-accent text-sm">diamond</span>
            <span className="text-accent font-black">{player.essenceStones}</span>
          </div>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="size-8 rounded-lg bg-surface-dark border border-border-dark flex items-center justify-center text-slate-400 hover:text-white transition-all hover:border-primary/50"
          title={player.soundEnabled ? 'Silenciar Efectos de Audio' : 'Activar Sonido del Sistema'}
        >
          <span className="material-symbols-outlined text-base">
            {player.soundEnabled ? 'volume_up' : 'volume_off'}
          </span>
        </button>

        {/* Cloud Sync & Firebase Status */}
        {currentUser ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs"
            title={`Conectado a Firebase: ${currentUser.email}`}
          >
            <span className={`material-symbols-outlined text-sm text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`}>
              {isSyncing ? 'sync' : 'cloud_done'}
            </span>
            <span className="text-[10px] font-mono text-emerald-300 font-bold hidden sm:inline">
              NUBE
            </span>
            <button
              onClick={onLogoutGoogle}
              className="ml-1 text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
              title="Cerrar sesión de Firebase"
            >
              <span className="material-symbols-outlined text-xs">logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginGoogle}
            className="flex items-center gap-1.5 px-3 py-1 bg-primary/20 hover:bg-primary/30 border border-primary/50 hover:border-primary rounded-xl text-xs text-primary hover:text-white transition-all shadow-sm"
            title="Sincronizar progreso con Firebase (Google Login)"
          >
            <span className="material-symbols-outlined text-sm">cloud_upload</span>
            <span className="text-[11px] font-bold hidden sm:inline font-mono">CONECTAR NUBE</span>
          </button>
        )}

        {/* Hunter Badge / Profile Trigger */}
        <div 
          onClick={() => {
            sound.playBeep(560, 0.04);
            onOpenProfileModal?.();
          }}
          className="flex items-center gap-3 pl-2 border-l border-white/10 cursor-pointer group select-none"
          title="Abrir Perfil del Cazador & Catálogo de Avatares"
        >
          <div className="hidden lg:flex flex-col items-end">
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
