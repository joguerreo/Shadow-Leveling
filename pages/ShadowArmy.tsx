import React, { useState, useEffect } from 'react';
import { Player, ShadowSoldier, ShadowExpedition, Rank } from '../types';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface ShadowArmyProps {
  player: Player;
  expeditions: ShadowExpedition[];
  onUpgradeShadow: (shadowId: string) => void;
  onUnlockShadow: (shadowId: string) => void;
  onStartExpedition: (expeditionId: string, shadowId: string) => void;
  onClaimExpedition: (expeditionId: string) => void;
}

const ShadowArmy: React.FC<ShadowArmyProps> = ({
  player,
  expeditions,
  onUpgradeShadow,
  onUnlockShadow,
  onStartExpedition,
  onClaimExpedition,
}) => {
  const [selectedShadow, setSelectedShadow] = useState<ShadowSoldier | null>(null);
  const [selectedExpedition, setSelectedExpedition] = useState<ShadowExpedition | null>(null);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [now, setNow] = useState<number>(Date.now());

  // Tick clock every second for active expedition timers
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const shadowArmy = player.shadowArmy || [];

  const getRankColor = (rank: Rank) => {
    switch (rank) {
      case Rank.NATIONAL: return 'text-red-500 border-red-500/50 bg-red-950/40';
      case Rank.S: return 'text-purple-400 border-purple-500/50 bg-purple-950/40';
      case Rank.A: return 'text-blue-400 border-blue-500/50 bg-blue-950/40';
      default: return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40';
    }
  };

  const getRemainingTimeSecs = (expedition: ShadowExpedition): number => {
    if (expedition.status !== 'in_progress' || !expedition.startedAt) return 0;
    const start = new Date(expedition.startedAt).getTime();
    const durationMs = expedition.durationMinutes * 60 * 1000;
    const elapsed = now - start;
    const remaining = Math.max(0, Math.floor((durationMs - elapsed) / 1000));
    return remaining;
  };

  const formatRemaining = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleArise = (shadow: ShadowSoldier) => {
    sound.playAwakening();
    sound.speakSystemVoice(`¡Surge! El soldado sombra ${shadow.name} ha despertado.`);
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#4d6aff', '#ef4444'],
      });
    } catch {
      // ignore
    }
    onUnlockShadow(shadow.id);
  };

  return (
    <div className="animate-fadeIn space-y-8 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent text-3xl animate-pulse">groups</span>
            <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-glow uppercase font-display">
              Ejército de Sombras
            </h2>
          </div>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
            Comanda a los Guerreros Extraídos y Envíalos a Incursiones Automáticas
          </p>
        </div>

        <div className="flex items-center gap-4 bg-surface-dark border border-white/5 px-4 py-2 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
              Tropas Desbloqueadas
            </span>
            <span className="text-lg font-mono font-black text-accent">
              {shadowArmy.filter((s) => s.unlocked).length} / {shadowArmy.length}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Shadow Soldiers on Left, Expeditions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Shadow Soldiers Roster */}
        <section className="lg:col-span-6 space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-black uppercase tracking-widest text-slate-300">
              Legión de Guerreros
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Comando del Monarca
            </span>
          </div>

          <div className="space-y-3">
            {shadowArmy.map((shadow) => {
              const upgradeGoldCost = shadow.level * 2500;
              const upgradeEssenceCost = shadow.level * 15;
              const canAffordUpgrade = player.gold >= upgradeGoldCost && player.essenceStones >= upgradeEssenceCost;

              return (
                <div
                  key={shadow.id}
                  className={`p-5 rounded-2xl border transition-all relative overflow-hidden group ${
                    shadow.unlocked
                      ? 'bg-surface-dark border-border-dark hover:border-accent/60 shadow-lg'
                      : 'bg-surface-dark/40 border-dashed border-white/10 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`size-14 rounded-2xl border-2 flex items-center justify-center ${getRankColor(shadow.rank)} shadow-[0_0_15px_rgba(139,92,246,0.2)]`}>
                        <span className="material-symbols-outlined text-3xl">
                          {shadow.icon}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white text-base font-black italic uppercase font-display">
                            {shadow.name}
                          </h4>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getRankColor(shadow.rank)}`}>
                            {shadow.rank}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs font-medium">
                          {shadow.title}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Nivel</span>
                      <span className="text-lg font-black text-accent font-mono">
                        Nv. {shadow.level}
                      </span>
                    </div>
                  </div>

                  {/* Bonus effect */}
                  <div className="mt-3 p-2.5 bg-accent/10 border border-accent/20 rounded-xl text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent text-sm">bolt</span>
                    <span className="text-slate-200 font-semibold text-[11px]">
                      {shadow.bonusDescription}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                    {shadow.unlocked ? (
                      <>
                        <div className="text-xs">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">
                            Poder de Sombra
                          </span>
                          <span className="font-mono font-black text-white text-sm">
                            {(shadow.combatPower * shadow.level).toLocaleString()} CP
                          </span>
                        </div>

                        <button
                          onClick={() => onUpgradeShadow(shadow.id)}
                          disabled={!canAffordUpgrade}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
                            canAffordUpgrade
                              ? 'bg-accent hover:bg-purple-500 text-white shadow-md shadow-purple-500/25'
                              : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">upgrade</span>
                          Mejorar ({upgradeGoldCost} G | {upgradeEssenceCost} Stones)
                        </button>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 italic">
                          Condición: {shadow.unlockCondition}
                        </span>
                        <button
                          onClick={() => handleArise(shadow)}
                          className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all hover:scale-105 active:scale-95"
                        >
                          ¡ARISE! (Despertar)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Shadow Expeditions / Auto Raids */}
        <section className="lg:col-span-6 space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-black uppercase tracking-widest text-slate-300">
              Expediciones de Puerta Automáticas
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              Farm Pasivo
            </span>
          </div>

          <div className="space-y-4">
            {expeditions.map((exp) => {
              const remainingSecs = getRemainingTimeSecs(exp);
              const isCompleted = exp.status === 'in_progress' && remainingSecs <= 0;
              const assignedShadow = shadowArmy.find((s) => s.id === exp.assignedShadowId);

              return (
                <div
                  key={exp.id}
                  className="p-5 bg-surface-dark border border-border-dark rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all hover:border-primary/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getRankColor(exp.gateRank)}`}>
                          {exp.gateRank}
                        </span>
                        <span className="text-slate-400 text-xs font-mono font-bold">
                          {exp.durationMinutes} Minutos
                        </span>
                      </div>
                      <h4 className="text-white text-base font-black italic uppercase font-display">
                        {exp.title}
                      </h4>
                    </div>

                    <div className="text-right">
                      {exp.status === 'in_progress' && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            {isCompleted ? '¡Completada!' : 'Tiempo Restante'}
                          </span>
                          <span className={`text-lg font-mono font-black ${isCompleted ? 'text-emerald-400 animate-pulse' : 'text-primary'}`}>
                            {isCompleted ? 'LISTO' : formatRemaining(remainingSecs)}
                          </span>
                        </div>
                      )}
                      {exp.status === 'idle' && (
                        <span className="text-[10px] font-bold text-slate-500 uppercase px-2.5 py-1 bg-white/5 rounded-lg">
                          Disponible
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rewards Preview */}
                  <div className="my-3 py-2 border-y border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">
                      Recompensa Estimada:
                    </span>
                    <div className="flex gap-2.5 font-bold">
                      <span className="text-primary">+{exp.rewards.xp} XP</span>
                      <span className="text-yellow-400">+{exp.rewards.gold} G</span>
                      <span className="text-accent">+{exp.rewards.essenceStones} Stones</span>
                    </div>
                  </div>

                  {/* Bottom Action Area */}
                  <div>
                    {exp.status === 'idle' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedExpedition(exp);
                            setIsAssigning(true);
                          }}
                          className="w-full py-2.5 bg-primary hover:bg-accent text-white font-black uppercase text-xs rounded-xl system-glow transition-all flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">send</span>
                          Asignar Soldado de Sombra
                        </button>
                      </div>
                    )}

                    {exp.status === 'in_progress' && !isCompleted && (
                      <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-accent text-base">person</span>
                          <span className="text-xs text-slate-300 font-bold">
                            Asignado: {assignedShadow?.name || 'Guerrero de Sombra'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 italic">En incursión...</span>
                      </div>
                    )}

                    {exp.status === 'in_progress' && isCompleted && (
                      <button
                        onClick={() => {
                          sound.playQuestComplete();
                          try {
                            confetti({
                              particleCount: 80,
                              spread: 60,
                              origin: { y: 0.6 },
                            });
                          } catch {
                            // ignore
                          }
                          onClaimExpedition(exp.id);
                        }}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black uppercase text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 animate-bounce"
                      >
                        <span className="material-symbols-outlined text-base">redeem</span>
                        Reclamar Botín de Incursión
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Shadow Assignment Modal */}
      {isAssigning && selectedExpedition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-surface-dark border-2 border-accent/40 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-lg font-black uppercase italic font-display">
                  Asignar Comandante
                </h3>
                <p className="text-slate-400 text-xs">
                  {selectedExpedition.title} ({selectedExpedition.durationMinutes} min)
                </p>
              </div>
              <button
                onClick={() => setIsAssigning(false)}
                className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {shadowArmy
                .filter((s) => s.unlocked)
                .map((shadow) => (
                  <div
                    key={shadow.id}
                    onClick={() => {
                      sound.playBeep(600, 0.05);
                      onStartExpedition(selectedExpedition.id, shadow.id);
                      setIsAssigning(false);
                    }}
                    className="p-3 bg-white/5 hover:bg-accent/20 border border-white/5 hover:border-accent rounded-xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-accent">
                        <span className="material-symbols-outlined text-xl">{shadow.icon}</span>
                      </div>
                      <div>
                        <h5 className="text-white text-xs font-bold">{shadow.name}</h5>
                        <span className="text-[10px] text-slate-400">Nv. {shadow.level}</span>
                      </div>
                    </div>
                    <span className="text-accent text-xs font-black uppercase tracking-wider">
                      Desplegar
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShadowArmy;
