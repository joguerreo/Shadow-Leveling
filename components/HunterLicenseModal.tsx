import React, { useRef, useState } from 'react';
import { Player, Attribute } from '../types';
import { calculateCombatPower } from '../utils/calculator';
import { HunterAvatar } from './avatars/HunterAvatar';
import { sound } from '../utils/sound';

interface HunterLicenseModalProps {
  player: Player;
  onClose: () => void;
}

export const HunterLicenseModal: React.FC<HunterLicenseModalProps> = ({ player, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const combatPower = calculateCombatPower(player);

  const hunterLicenseId = `KHA-8891-${player.level.toString().padStart(3, '0')}-${player.rank.substring(0, 1)}`;

  const handleCopyStats = () => {
    sound.playBeep(700, 0.04);
    const summary = `🛡️ LICENCIA OFICIAL DE CAZADOR
👤 Cazador: ${player.name}
🎖️ Rango: ${player.rank} (Nvl ${player.level})
🔥 Poder de Combate: ${combatPower.toLocaleString()} CP
⚡ Racha: ${player.streakDays} Días
🏛️ Licencia Nº: ${hunterLicenseId}
⚔️ Asociación de Cazadores de las Sombras`;
    
    navigator.clipboard?.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getRankTheme = (rank: string) => {
    switch (rank) {
      case 'NATIONAL-RANK':
        return {
          border: 'border-amber-500/70',
          gradient: 'from-amber-950/40 via-slate-900 to-amber-950/30',
          glow: 'shadow-[0_0_60px_rgba(245,158,11,0.25)]',
          badge: 'bg-amber-500 text-black',
        };
      case 'S-RANK':
        return {
          border: 'border-rose-500/70',
          gradient: 'from-rose-950/40 via-slate-900 to-rose-950/30',
          glow: 'shadow-[0_0_60px_rgba(244,63,94,0.25)]',
          badge: 'bg-rose-500 text-white',
        };
      case 'A-RANK':
        return {
          border: 'border-purple-500/70',
          gradient: 'from-purple-950/40 via-slate-900 to-purple-950/30',
          glow: 'shadow-[0_0_60px_rgba(168,85,247,0.25)]',
          badge: 'bg-purple-500 text-white',
        };
      default:
        return {
          border: 'border-blue-500/70',
          gradient: 'from-blue-950/40 via-slate-900 to-blue-950/30',
          glow: 'shadow-[0_0_60px_rgba(59,130,246,0.25)]',
          badge: 'bg-blue-500 text-white',
        };
    }
  };

  const theme = getRankTheme(player.rank);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain touch-pan-y">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative w-full max-w-xl my-auto sm:my-6 animate-modal flex flex-col items-center">
        {/* The Card */}
        <div
          ref={cardRef}
          className={`w-full bg-slate-950 border-2 ${theme.border} rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden ${theme.glow} bg-gradient-to-br ${theme.gradient} space-y-5 sm:space-y-6 shadow-2xl`}
        >
          {/* Holographic Watermark effect */}
          <div className="absolute -right-12 -top-12 opacity-5 text-white pointer-events-none select-none">
            <span className="material-symbols-outlined text-[240px]">shield</span>
          </div>

          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-xl">badge</span>
              </div>
              <div>
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">
                  KOREA HUNTER ASSOCIATION
                </span>
                <h4 className="text-white text-base font-black uppercase font-display tracking-wider">
                  Licencia Oficial de Cazador
                </h4>
              </div>
            </div>

            <div className={`px-3 py-1 rounded-xl text-xs font-black uppercase font-mono ${theme.badge} shadow-md`}>
              {player.rank}
            </div>
          </div>

          {/* Main Body */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center relative z-10">
            {/* Avatar Photo Section */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 bg-black/60 border border-white/10 rounded-2xl shadow-inner">
                <HunterAvatar
                  avatarId={player.avatarId || 'monarch-shadow'}
                  frameId={player.avatarFrame || 'frame-s'}
                  size="lg"
                  showGlow
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                ID: {hunterLicenseId}
              </span>
            </div>

            {/* Hunter Info & Stats */}
            <div className="sm:col-span-2 space-y-3">
              <div>
                <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">
                  Cazador Registrado
                </span>
                <h3 className="text-white text-2xl font-black font-display uppercase tracking-wide truncate">
                  {player.name}
                </h3>
                <p className="text-slate-300 text-xs font-semibold">{player.title}</p>
              </div>

              {/* Combat Power & Level */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">
                    Poder de Combate
                  </span>
                  <span className="text-primary font-mono text-sm font-black">
                    {combatPower.toLocaleString()} CP
                  </span>
                </div>
                <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">
                    Nivel del Sistema
                  </span>
                  <span className="text-white font-mono text-sm font-black">
                    Nvl {player.level}
                  </span>
                </div>
              </div>

              {/* Attributes Mini-Bar */}
              <div className="grid grid-cols-6 gap-1 pt-1 text-center font-mono">
                {(['str', 'int', 'vit', 'agi', 'wis', 'cha'] as const).map((key) => {
                  const rawAttr = player.attributes?.[key] || (player.attributes as any)?.[key.toUpperCase()];
                  const val = typeof rawAttr === 'number' ? rawAttr : (Number(rawAttr?.value) || 10);
                  return (
                    <div key={key} className="p-1.5 bg-[#161b22] rounded-lg border border-white/10">
                      <span className="text-[8px] text-slate-400 block font-bold uppercase">{key}</span>
                      <span className="text-[11px] font-black text-white">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card Footer with QR & Stamp */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4 relative z-10">
            <div className="flex items-center gap-2">
              {/* Decorative QR code matrix */}
              <div className="size-10 bg-white p-1 rounded-lg flex items-center justify-center">
                <div className="w-full h-full bg-black rounded-sm flex items-center justify-center text-white text-[8px] font-mono font-black">
                  KHA
                </div>
              </div>
              <div className="text-[9px] font-mono text-slate-400 space-y-0.5">
                <p>CERTIFICADO AUTORIZADO</p>
                <p className="text-slate-500">Racha: {player.streakDays} Días Consecutivos</p>
              </div>
            </div>

            <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Activo & Vigente
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-4 flex gap-3 w-full max-w-sm">
          <button
            onClick={handleCopyStats}
            className="min-h-[44px] flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? '¡Copiado!' : 'Copiar Credencial'}
          </button>
          <button
            onClick={onClose}
            className="min-h-[44px] px-6 py-3 bg-primary hover:bg-accent text-white font-black text-xs uppercase rounded-xl transition-all system-glow active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HunterLicenseModal;
