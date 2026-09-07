import React, { useState } from 'react';
import { Player, HunterSaga, HunterSagaMilestone } from '../types';
import { sound } from '../utils/sound';

interface HunterSagasModalProps {
  player: Player;
  sagas: HunterSaga[];
  onClose: () => void;
  onActivateSaga: (sagaId: string) => void;
  onClaimMilestone: (sagaId: string, day: number) => void;
  onClaimFinalReward: (sagaId: string) => void;
}

export const HunterSagasModal: React.FC<HunterSagasModalProps> = ({
  player,
  sagas,
  onClose,
  onActivateSaga,
  onClaimMilestone,
  onClaimFinalReward,
}) => {
  const [selectedSagaId, setSelectedSagaId] = useState<string>(
    sagas.find((s) => s.active)?.id || sagas[0]?.id || ''
  );

  const currentSaga = sagas.find((s) => s.id === selectedSagaId) || sagas[0];

  const handleSelect = (id: string) => {
    sound.playBeep(600, 0.04);
    setSelectedSagaId(id);
  };

  const getRankBadgeClass = (rank: string) => {
    switch (rank) {
      case 'NATIONAL-RANK':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'S-RANK':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
      case 'A-RANK':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'C-RANK':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  // Calculate current progress based on player streak / days
  const activeDays = Math.min(currentSaga?.durationDays || 21, player.streakDays);
  const progressPct = currentSaga
    ? Math.min(100, (activeDays / currentSaga.durationDays) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl bg-surface-dark border border-border-dark rounded-3xl shadow-2xl overflow-hidden my-8 animate-modal flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-primary/20 to-purple-950/40 border-b border-border-dark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/20 border border-primary/40 rounded-xl text-primary">
              <span className="material-symbols-outlined text-2xl">auto_stories</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white text-xl font-black italic uppercase tracking-wider font-display">
                  Arcos Narrativos & Sagas de Largo Plazo
                </h3>
                <span className="px-2 py-0.5 rounded bg-accent/20 border border-accent/40 text-accent text-[10px] font-black uppercase font-mono">
                  Metas 21 / 60 / 90 Días
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                Campañas acumulativas para la reconfiguración neuronal y transformación definitiva
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Saga Tab Selector */}
        <div className="flex gap-2 p-3 bg-black/40 border-b border-white/5 overflow-x-auto">
          {sagas.map((saga) => (
            <button
              key={saga.id}
              onClick={() => handleSelect(saga.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedSagaId === saga.id
                  ? 'bg-primary text-white system-glow shadow-lg'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-base">{saga.icon}</span>
              <span>{saga.title}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-300">
                {saga.durationDays}d
              </span>
              {saga.active && (
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>
          ))}
        </div>

        {/* Content Body */}
        {currentSaga && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Banner Lore */}
            <div
              className={`p-6 rounded-2xl bg-gradient-to-br ${currentSaga.bannerColor} border border-white/10 relative overflow-hidden`}
            >
              <div className="absolute -right-6 -bottom-6 opacity-10 text-white pointer-events-none">
                <span className="material-symbols-outlined text-[160px]">{currentSaga.icon}</span>
              </div>

              <div className="relative z-10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono font-black text-primary uppercase tracking-widest">
                    {currentSaga.codeName}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded border text-[10px] font-black uppercase font-mono ${getRankBadgeClass(
                      currentSaga.rankRequirement
                    )}`}
                  >
                    Req: {currentSaga.rankRequirement}
                  </span>
                </div>

                <h4 className="text-2xl font-black text-white italic font-display uppercase tracking-wide">
                  {currentSaga.title}
                </h4>
                <p className="text-indigo-200 text-xs font-semibold">{currentSaga.subtitle}</p>

                <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
                  {currentSaga.lore}
                </p>

                {/* Progress Bar */}
                <div className="pt-2 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold">Progreso de la Campaña</span>
                    <span className="text-white font-black">
                      Día {activeDays} / {currentSaga.durationDays} ({Math.round(progressPct)}%)
                    </span>
                  </div>
                  <div className="h-3 bg-black/60 rounded-full p-0.5 border border-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-emerald-400 transition-all duration-500 shadow-sm"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Status and Action */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Estado:{' '}
                    <strong className={currentSaga.active ? 'text-emerald-400' : 'text-slate-400'}>
                      {currentSaga.active ? 'Activa actualmente' : 'Inactiva'}
                    </strong>
                  </span>
                  {!currentSaga.active && (
                    <button
                      onClick={() => onActivateSaga(currentSaga.id)}
                      className="px-4 py-2 bg-primary hover:bg-accent text-white text-xs font-black uppercase rounded-xl transition-all shadow-md system-glow"
                    >
                      Emprender esta Saga
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Milestones Timeline */}
            <div className="space-y-3">
              <h5 className="text-white text-sm font-black uppercase tracking-widest italic flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">flag</span>
                Hitos y Fases de la Campaña
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {currentSaga.milestones.map((m: HunterSagaMilestone) => {
                  const isUnlocked = player.streakDays >= m.day;
                  return (
                    <div
                      key={m.day}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                        m.claimed
                          ? 'bg-emerald-950/20 border-emerald-500/40 opacity-80'
                          : isUnlocked
                          ? 'bg-primary/10 border-primary/60 shadow-lg'
                          : 'bg-surface-card border-white/5 opacity-70'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-black/40 text-primary text-[10px] font-mono font-bold">
                            DÍA {m.day}
                          </span>
                          {m.claimed ? (
                            <span className="text-emerald-400 text-[10px] font-bold uppercase flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">verified</span>
                              Reclamado
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-accent text-[10px] font-black uppercase animate-pulse">
                              ¡Listo!
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px] font-mono">Bloqueado</span>
                          )}
                        </div>

                        <h6 className="text-white text-xs font-bold leading-tight">{m.title}</h6>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{m.description}</p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="text-[10px] font-mono text-slate-300 flex flex-wrap gap-2">
                          <span className="text-emerald-400 font-bold">+{m.reward.xp} XP</span>
                          <span className="text-amber-400 font-bold">+{m.reward.gold} G</span>
                          <span className="text-accent font-bold">+{m.reward.essenceStones} ES</span>
                          {m.reward.statPoints && (
                            <span className="text-blue-400 font-bold">
                              +{m.reward.statPoints} Stat
                            </span>
                          )}
                        </div>

                        {isUnlocked && !m.claimed && (
                          <button
                            onClick={() => onClaimMilestone(currentSaga.id, m.day)}
                            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                          >
                            Reclamar Fase {m.day}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Final Artifact Reward Box */}
            <div className="p-5 bg-gradient-to-r from-amber-950/30 via-surface-card to-purple-950/30 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
                  <span className="material-symbols-outlined text-3xl">trophy</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black uppercase text-amber-400 tracking-wider block">
                    Recompensa de Culminación de la Saga
                  </span>
                  <h5 className="text-white text-base font-bold font-display uppercase">
                    {currentSaga.finalReward.exclusiveItem.name}
                  </h5>
                  <p className="text-slate-300 text-xs">
                    Título Épico: <strong className="text-amber-300">{currentSaga.finalReward.exclusiveTitle}</strong> • +{currentSaga.finalReward.xp.toLocaleString()} XP • +{currentSaga.finalReward.gold.toLocaleString()} G
                  </p>
                </div>
              </div>

              {progressPct >= 100 && !currentSaga.completed ? (
                <button
                  onClick={() => onClaimFinalReward(currentSaga.id)}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase rounded-xl tracking-wider shadow-lg shadow-amber-500/40 transition-all active:scale-95 animate-pulse"
                >
                  ¡Reclamar Corona de la Saga!
                </button>
              ) : (
                <span className="px-4 py-2 rounded-xl bg-black/40 border border-white/5 text-slate-500 text-xs font-mono">
                  {currentSaga.completed ? 'Saga Completada' : `Requiere ${currentSaga.durationDays} días`}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HunterSagasModal;
