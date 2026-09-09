import React, { useState } from 'react';
import { Player, MirrorShadow } from '../types';
import { calculateCombatPower } from '../utils/calculator';
import { sound } from '../utils/sound';
import { HunterAvatar } from './avatars/HunterAvatar';

interface MirrorShadowModalProps {
  player: Player;
  onClose: () => void;
  onClaimMirrorReward: (rewards: { xp: number; gold: number; essenceStones: number; statPoints: number }) => void;
}

export const MirrorShadowModal: React.FC<MirrorShadowModalProps> = ({
  player,
  onClose,
  onClaimMirrorReward,
}) => {
  const combatPower = calculateCombatPower(player);
  const totalMissionsCompletedToday = player.activityHistory?.[0]?.questsCompleted || 3;
  
  // Mirror shadow calculations based on past level / streak
  const shadowLevel = Math.max(1, player.level - 1);
  const shadowPower = Math.round(combatPower * 0.92);
  const maxShadowHp = 1000 + shadowLevel * 250;
  
  // Current shadow HP is reduced by today's missions
  const damageDealtToday = Math.min(maxShadowHp, totalMissionsCompletedToday * 350 + player.streakDays * 50);
  const currentShadowHp = Math.max(0, maxShadowHp - damageDealtToday);
  const isDefeated = currentShadowHp <= 0;

  const [claimed, setClaimed] = useState<boolean>(false);

  const handleClaim = () => {
    sound.playLevelUp();
    sound.speakSystemVoice('¡Has superado a tu sombra del pasado! Victoria absoluta.');
    setClaimed(true);
    onClaimMirrorReward({
      xp: 3500,
      gold: 7000,
      essenceStones: 45,
      statPoints: 2,
    });
  };

  const hpPct = Math.round((currentShadowHp / maxShadowHp) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain touch-pan-y">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-surface-dark border-2 border-purple-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(168,85,247,0.25)] overflow-hidden my-auto sm:my-6 animate-modal flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-slate-900 via-purple-950/60 to-slate-900 border-b border-border-dark flex items-center justify-between gap-3 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className="material-symbols-outlined text-purple-400 text-2xl shrink-0">
              theater_comedy
            </span>
            <div className="min-w-0">
              <h3 className="text-white text-sm sm:text-base font-black italic uppercase tracking-wider font-display truncate">
                Duelo de la Sombra Reflejo
              </h3>
              <p className="text-purple-300 text-[10px] font-mono truncate">Enfrentamiento contra tu "Yo" de Ayer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] text-slate-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto overscroll-contain touch-pan-y flex-1">
          {/* Visual VS Arena */}
          <div className="flex items-center justify-between gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
            {/* Player */}
            <div className="flex flex-col items-center space-y-2 text-center flex-1">
              <HunterAvatar
                avatarId={player.avatarId || 'monarch-shadow'}
                frameId={player.avatarFrame || 'frame-s'}
                size="md"
                showGlow
              />
              <div>
                <span className="text-white font-bold text-xs block truncate">{player.name} (Hoy)</span>
                <span className="text-primary font-mono text-[10px] font-black">
                  CP {combatPower.toLocaleString()}
                </span>
              </div>
            </div>

            {/* VS Badge */}
            <div className="size-10 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-black font-display text-sm shrink-0">
              VS
            </div>

            {/* Mirror Shadow */}
            <div className="flex flex-col items-center space-y-2 text-center flex-1 opacity-80">
              <div className="filter grayscale contrast-125">
                <HunterAvatar
                  avatarId={player.avatarId || 'monarch-shadow'}
                  frameId="frame-e"
                  size="md"
                />
              </div>
              <div>
                <span className="text-slate-400 font-bold text-xs block truncate">Sombra del Pasado</span>
                <span className="text-purple-400 font-mono text-[10px] font-black">
                  CP {shadowPower.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Shadow HP Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                Vitalidad de la Sombra Reflejo
              </span>
              <span className="text-purple-400 font-mono text-xs font-black">
                {currentShadowHp} / {maxShadowHp} HP ({hpPct}%)
              </span>
            </div>
            <div className="h-4 bg-slate-900 rounded-full p-0.5 border border-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 transition-all duration-500"
                style={{ width: `${hpPct}%` }}
              />
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Cada misión y hábito que completas en el día asesta un golpe crítico a tu sombra del pasado.
            </p>
          </div>

          {/* Damage summary */}
          <div className="p-3 bg-surface-card rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Daño infligido hoy:</span>
            <span className="text-emerald-400 font-bold">-{damageDealtToday} HP</span>
          </div>

          {/* Action / Claim */}
          <div className="pt-2">
            {isDefeated ? (
              claimed ? (
                <div className="w-full py-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center text-emerald-400 text-xs font-bold font-mono">
                  ✓ Recompensa de superación reclamada por hoy
                </div>
              ) : (
                <button
                  onClick={handleClaim}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-600/40 transition-all active:scale-95 animate-pulse"
                >
                  ¡Reclamar Triunfo sobre el Pasado (+3500 XP)!
                </button>
              )
            ) : (
              <div className="p-3 bg-white/5 rounded-xl text-center text-slate-400 text-xs font-mono">
                Completa más misiones diarias para vencer a tu sombra reflejo.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MirrorShadowModal;
