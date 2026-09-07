import React, { useState } from 'react';
import { Player, WorldBoss, HunterAchievement, Rank } from '../types';
import { sound } from '../utils/sound';
import { calculateCombatPower } from '../utils/calculator';
import confetti from 'canvas-confetti';

interface WorldBossesProps {
  player: Player;
  bosses: WorldBoss[];
  achievements: HunterAchievement[];
  onAttackBoss: (bossId: string, damage: number) => void;
  onClaimBossReward: (bossId: string) => void;
  onClaimAchievement: (achievementId: string) => void;
}

const WorldBosses: React.FC<WorldBossesProps> = ({
  player,
  bosses,
  achievements,
  onAttackBoss,
  onClaimBossReward,
  onClaimAchievement,
}) => {
  const [selectedBoss, setSelectedBoss] = useState<WorldBoss>(bosses[0] || null);
  const [activeTab, setActiveTab] = useState<'bosses' | 'achievements'>('bosses');
  const [achievementCategory, setAchievementCategory] = useState<'all' | 'combat' | 'habits' | 'dungeons' | 'shadows'>('all');
  const [isAttacking, setIsAttacking] = useState<boolean>(false);
  const [lastDamage, setLastDamage] = useState<number | null>(null);

  const combatPower = calculateCombatPower(player);

  const getRankColor = (rank: Rank) => {
    switch (rank) {
      case Rank.NATIONAL: return 'text-red-500 border-red-500/50 bg-red-950/40';
      case Rank.S: return 'text-purple-400 border-purple-500/50 bg-purple-950/40';
      case Rank.A: return 'text-blue-400 border-blue-500/50 bg-blue-950/40';
      default: return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40';
    }
  };

  const handleStrike = (type: 'monarch' | 'mana' | 'army') => {
    if (!selectedBoss || selectedBoss.defeated) return;

    setIsAttacking(true);
    let damage = 0;

    if (type === 'monarch') {
      sound.playBeep(450, 0.12, 'sawtooth');
      damage = Math.floor((combatPower * 0.15) + (player.attributes.str.value * 250));
    } else if (type === 'mana') {
      sound.playBeep(850, 0.15, 'triangle');
      damage = Math.floor((combatPower * 0.18) + (player.attributes.int.value * 300));
    } else {
      sound.playRaidVictory();
      const armyPower = (player.shadowArmy || []).reduce((acc, s) => acc + (s.unlocked ? s.combatPower * s.level : 0), 0);
      damage = Math.floor(armyPower * 1.5 + combatPower * 0.1);
    }

    setLastDamage(damage);
    onAttackBoss(selectedBoss.id, damage);

    setTimeout(() => {
      setIsAttacking(false);
    }, 400);
  };

  const handleClaimBoss = (bossId: string) => {
    sound.playLevelUp();
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#8b5cf6', '#eab308'],
      });
    } catch {
      // ignore
    }
    onClaimBossReward(bossId);
  };

  const handleClaimAchieve = (ach: HunterAchievement) => {
    sound.playQuestComplete();
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b'],
      });
    } catch {
      // ignore
    }
    onClaimAchievement(ach.id);
  };

  const filteredAchievements = achievements.filter((a) => {
    if (achievementCategory === 'all') return true;
    return a.category === achievementCategory;
  });

  return (
    <div className="animate-fadeIn space-y-8 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 text-3xl animate-pulse">swords</span>
            <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-glow uppercase font-display">
              Asalto a Jefes & Logros
            </h2>
          </div>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
            Derrota a Entidades de Calamidad y Reclama Títulos de Rango S
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-surface-dark border border-white/10 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('bosses')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'bosses'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">swords</span>
            Jefes Mundiales
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'achievements'
                ? 'bg-primary text-white system-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">military_tech</span>
            Logros del Sistema
          </button>
        </div>
      </div>

      {activeTab === 'bosses' ? (
        <div className="space-y-8">
          {/* Boss Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bosses.map((boss) => {
              const isSelected = selectedBoss?.id === boss.id;
              const hpPercent = Math.max(0, Math.round((boss.currentHp / boss.maxHp) * 100));

              return (
                <div
                  key={boss.id}
                  onClick={() => {
                    sound.playBeep(600, 0.04);
                    setSelectedBoss(boss);
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-surface-dark border-red-500 shadow-lg shadow-red-950/40'
                      : 'bg-surface-dark/60 border-border-dark hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`size-12 rounded-xl border-2 flex items-center justify-center ${getRankColor(boss.rank)}`}>
                        <span className="material-symbols-outlined text-2xl">{boss.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white text-base font-black italic uppercase font-display">
                            {boss.name}
                          </h4>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getRankColor(boss.rank)}`}>
                            {boss.rank}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs">{boss.title}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Vida</span>
                      <span className={`text-sm font-mono font-black ${boss.defeated ? 'text-emerald-400' : 'text-red-400'}`}>
                        {boss.defeated ? 'DERROTADO' : `${hpPercent}%`}
                      </span>
                    </div>
                  </div>

                  {/* HP bar */}
                  <div className="mt-3 w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full transition-all duration-300 ${
                        boss.defeated ? 'bg-emerald-500' : 'bg-gradient-to-r from-red-600 to-amber-500'
                      }`}
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Boss Combat Arena */}
          {selectedBoss && (
            <div className={`bg-surface-dark border-2 border-red-500/50 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden ${isAttacking ? 'scale-[0.99] border-red-400' : ''}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-2xl bg-red-950/60 border-2 border-red-500 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                    <span className="material-symbols-outlined text-4xl">{selectedBoss.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white text-xl md:text-2xl font-black uppercase italic font-display">
                        {selectedBoss.name}
                      </h3>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded border ${getRankColor(selectedBoss.rank)}`}>
                        RANGO {selectedBoss.rank}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs font-medium">{selectedBoss.title} (Nv. {selectedBoss.level})</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase font-bold block">Puntos de Salud</span>
                  <span className="text-2xl font-mono font-black text-red-500">
                    {selectedBoss.currentHp.toLocaleString()} / {selectedBoss.maxHp.toLocaleString()} HP
                  </span>
                </div>
              </div>

              {/* Massive Boss HP Bar */}
              <div className="space-y-1">
                <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-red-500/30 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-red-500 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                    style={{ width: `${Math.max(0, (selectedBoss.currentHp / selectedBoss.maxHp) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0 HP</span>
                  {lastDamage && <span className="text-amber-400 font-bold animate-bounce">¡-{lastDamage.toLocaleString()} DAÑO CRÍTICO!</span>}
                  <span>{selectedBoss.maxHp.toLocaleString()} HP</span>
                </div>
              </div>

              {/* Combat Action Buttons */}
              {!selectedBoss.defeated ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <button
                    onClick={() => handleStrike('monarch')}
                    className="p-4 bg-red-950/40 hover:bg-red-900/60 border border-red-500/50 hover:border-red-400 rounded-2xl text-left transition-all active:scale-95 group shadow-md"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="material-symbols-outlined text-red-400 group-hover:scale-110 transition-transform">swords</span>
                      <span className="text-[10px] font-mono text-red-400 font-bold">FÍSICO (STR)</span>
                    </div>
                    <h5 className="text-white text-sm font-black uppercase italic font-display">Tajo del Monarca</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5">Ataque directo potenciado por tu Fuerza.</p>
                  </button>

                  <button
                    onClick={() => handleStrike('mana')}
                    className="p-4 bg-primary/20 hover:bg-primary/30 border border-primary/50 hover:border-primary rounded-2xl text-left transition-all active:scale-95 group shadow-md"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">bolt</span>
                      <span className="text-[10px] font-mono text-primary font-bold">MÁGICO (INT)</span>
                    </div>
                    <h5 className="text-white text-sm font-black uppercase italic font-display">Lanza de Maná</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5">Canalización de Inteligencia pura.</p>
                  </button>

                  <button
                    onClick={() => handleStrike('army')}
                    className="p-4 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/50 hover:border-purple-400 rounded-2xl text-left transition-all active:scale-95 group shadow-md"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="material-symbols-outlined text-accent group-hover:scale-110 transition-transform">groups</span>
                      <span className="text-[10px] font-mono text-accent font-bold">LEGION (CP)</span>
                    </div>
                    <h5 className="text-white text-sm font-black uppercase italic font-display">Asalto de Sombras</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5">Tus sombras atacan en enjambre.</p>
                  </button>
                </div>
              ) : (
                <div className="p-6 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-emerald-400">
                    <span className="material-symbols-outlined text-3xl">emoji_events</span>
                    <h4 className="text-xl font-black uppercase italic font-display">¡JEFE MUNDIAL ANIQUILADO!</h4>
                  </div>
                  <p className="text-slate-300 text-xs">
                    Has purificado la amenaza y probado la supremacía del Monarca de las Sombras.
                  </p>
                  <button
                    onClick={() => handleClaimBoss(selectedBoss.id)}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black uppercase text-xs rounded-xl shadow-lg shadow-emerald-600/40 transition-all active:scale-95"
                  >
                    Reclamar Botín Legendario (+{selectedBoss.rewards.xp} XP | +{selectedBoss.rewards.gold} G | +{selectedBoss.rewards.essenceStones} Stones)
                  </button>
                </div>
              )}

              {/* Damage Battle Log */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Registro de Asaltos en Vivo:
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedBoss.damageLog.map((log, i) => (
                    <div key={i} className="flex justify-between items-center text-xs p-2 bg-white/5 rounded-lg">
                      <span className="text-slate-300 font-bold">{log.hunter}</span>
                      <span className="text-red-400 font-mono font-bold">-{log.damage.toLocaleString()} Daño</span>
                      <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Achievements Section */
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Todos los Logros' },
              { id: 'combat', label: 'Combate & Nivel' },
              { id: 'habits', label: 'Hábitos & Racha' },
              { id: 'dungeons', label: 'Mazmorras' },
              { id: 'shadows', label: 'Ejército de Sombras' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setAchievementCategory(cat.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                  achievementCategory === cat.id
                    ? 'bg-primary text-white system-glow'
                    : 'bg-surface-dark border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map((ach) => {
              const percent = Math.min(100, Math.round((ach.progress / ach.target) * 100));

              return (
                <div
                  key={ach.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    ach.completed
                      ? ach.claimed
                        ? 'bg-surface-dark/60 border-white/10 opacity-75'
                        : 'bg-surface-dark border-emerald-500/60 shadow-lg shadow-emerald-950/30'
                      : 'bg-surface-dark border-border-dark'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`size-12 rounded-xl border-2 flex items-center justify-center ${
                          ach.completed
                            ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400'
                            : 'border-white/10 bg-white/5 text-slate-500'
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl">{ach.icon}</span>
                      </div>

                      <div>
                        <h4 className="text-white text-base font-black italic uppercase font-display">
                          {ach.title}
                        </h4>
                        <p className="text-slate-400 text-xs mt-0.5">{ach.description}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 font-bold block">
                        {ach.progress} / {ach.target}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="my-3 w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full transition-all ${
                        ach.completed ? 'bg-emerald-500' : 'bg-primary'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Rewards and Actions */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    <div className="flex gap-2 font-bold text-[11px]">
                      <span className="text-primary">+{ach.rewards.xp} XP</span>
                      <span className="text-yellow-400">+{ach.rewards.gold} G</span>
                      <span className="text-accent">+{ach.rewards.essenceStones} Stones</span>
                    </div>

                    {ach.completed && !ach.claimed && (
                      <button
                        onClick={() => handleClaimAchieve(ach)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs rounded-lg shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                      >
                        Reclamar
                      </button>
                    )}

                    {ach.claimed && (
                      <span className="text-emerald-400 font-mono font-bold text-[11px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check</span>
                        Completado
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldBosses;
