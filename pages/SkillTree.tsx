import React, { useState } from 'react';
import { Player, HunterSkill } from '../types';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface SkillTreeProps {
  player: Player;
  skills: HunterSkill[];
  onUpgradeSkill: (skillId: string) => void;
  onUnlockSkill: (skillId: string) => void;
  onEquipTitle: (title: string) => void;
}

const SkillTree: React.FC<SkillTreeProps> = ({
  player,
  skills,
  onUpgradeSkill,
  onUnlockSkill,
  onEquipTitle,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<HunterSkill | null>(skills[0] || null);

  const titles = player.titlesUnlocked || ['Awakened Novice'];
  const currentEquippedTitle = player.equippedTitle || player.title;

  const handleUpgrade = (skill: HunterSkill) => {
    sound.playLevelUp();
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#4d6aff', '#8b5cf6', '#38bdf8'],
      });
    } catch {
      // ignore
    }
    onUpgradeSkill(skill.id);
  };

  const handleUnlock = (skill: HunterSkill) => {
    sound.playAwakening();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#4d6aff', '#eab308'],
      });
    } catch {
      // ignore
    }
    onUnlockSkill(skill.id);
  };

  const handleSelectTitle = (title: string) => {
    sound.playBeep(650, 0.08);
    onEquipTitle(title);
  };

  return (
    <div className="animate-fadeIn space-y-8 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl animate-pulse">psychology</span>
            <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-glow uppercase font-display">
              Árbol de Habilidades & Títulos
            </h2>
          </div>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
            Canaliza el Maná del Sistema, Forja Runas Activas y Equipa Títulos del Monarca
          </p>
        </div>

        <div className="flex items-center gap-4 bg-surface-dark border border-white/5 px-4 py-2 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
              Piedras de Esencia
            </span>
            <span className="text-lg font-mono font-black text-accent flex items-center justify-end gap-1">
              <span className="material-symbols-outlined text-sm">diamond</span>
              {player.essenceStones.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Skills Roster & Selected Skill details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Skills Node List */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-black uppercase tracking-widest text-slate-300">
              Runas y Habilidades de Autoridad
            </span>
            <span className="text-[10px] font-mono text-primary font-bold">
              {skills.filter((s) => s.unlocked).length} / {skills.length} Despertadas
            </span>
          </div>

          <div className="space-y-3">
            {skills.map((skill) => {
              const isSelected = selectedSkill?.id === skill.id;
              const isMaxLevel = skill.level >= skill.maxLevel;
              const upgradeCost = skill.costEssence * skill.level;
              const canAfford = player.essenceStones >= upgradeCost;
              const canUnlock = player.level >= skill.unlockLevel && player.essenceStones >= skill.costEssence;

              return (
                <div
                  key={skill.id}
                  onClick={() => {
                    sound.playBeep(520, 0.04);
                    setSelectedSkill(skill);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-surface-dark border-primary system-glow shadow-lg'
                      : skill.unlocked
                      ? 'bg-surface-dark/80 border-border-dark hover:border-slate-600'
                      : 'bg-surface-dark/30 border-dashed border-white/10 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`size-13 rounded-2xl border-2 flex items-center justify-center ${
                          skill.unlocked
                            ? 'border-primary/60 bg-primary/20 text-primary shadow-[0_0_15px_rgba(77,106,255,0.25)]'
                            : 'border-white/10 bg-white/5 text-slate-500'
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl">
                          {skill.icon}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white text-base font-black italic uppercase font-display">
                            {skill.name}
                          </h4>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                              skill.type === 'active'
                                ? 'text-primary border-primary/40 bg-primary/10'
                                : skill.type === 'buff'
                                ? 'text-amber-400 border-amber-500/40 bg-amber-950/30'
                                : 'text-purple-400 border-purple-500/40 bg-purple-950/30'
                            }`}
                          >
                            {skill.type}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs font-medium">
                          {skill.title}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {skill.unlocked ? (
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Rango</span>
                          <span className="text-sm font-black text-primary font-mono">
                            Nv. {skill.level} / {skill.maxLevel}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Requisito</span>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            Nivel {skill.unlockLevel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Effect brief */}
                  <div className="mt-3 p-2 bg-white/5 rounded-xl text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">bolt</span>
                    <span className="text-slate-300 font-medium text-[11px]">
                      {skill.effect}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right: Selected Skill Detail & Upgrade Console */}
        <section className="lg:col-span-5 space-y-6">
          {selectedSkill ? (
            <div className="bg-surface-dark border-2 border-primary/40 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl bg-primary/20 border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_20px_rgba(77,106,255,0.4)]">
                  <span className="material-symbols-outlined text-3xl">{selectedSkill.icon}</span>
                </div>
                <div>
                  <h3 className="text-white text-lg font-black uppercase italic font-display">
                    {selectedSkill.name}
                  </h3>
                  <span className="text-primary text-xs font-bold uppercase tracking-wider block">
                    {selectedSkill.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Tipo: {selectedSkill.type.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Descripción del Manuscrito:
                </span>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                  {selectedSkill.description}
                </p>
              </div>

              {/* Passive & Active Effect */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Efecto en Combate y Concentración:
                </span>
                <div className="p-3.5 bg-primary/10 border border-primary/30 rounded-xl flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">auto_fix_high</span>
                  <span className="text-white text-xs font-bold">{selectedSkill.effect}</span>
                </div>
              </div>

              {/* Upgrade / Unlock CTA */}
              <div className="pt-2">
                {selectedSkill.unlocked ? (
                  selectedSkill.level >= selectedSkill.maxLevel ? (
                    <div className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-center text-xs font-black uppercase text-slate-400">
                      ★ Nivel Máximo Alcanzado ★
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-400 font-bold px-1">
                        <span>Costo de Ascensión:</span>
                        <span className="text-accent flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">diamond</span>
                          {selectedSkill.costEssence * selectedSkill.level} Essence Stones
                        </span>
                      </div>
                      <button
                        onClick={() => handleUpgrade(selectedSkill)}
                        disabled={player.essenceStones < selectedSkill.costEssence * selectedSkill.level}
                        className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                          player.essenceStones >= selectedSkill.costEssence * selectedSkill.level
                            ? 'bg-primary hover:bg-accent text-white system-glow shadow-lg shadow-primary/30 active:scale-95'
                            : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">upgrade</span>
                        Ascender a Nivel {selectedSkill.level + 1}
                      </button>
                    </div>
                  )
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400 font-bold px-1">
                      <span>Requiere: Nv. {selectedSkill.unlockLevel}</span>
                      <span className="text-accent flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">diamond</span>
                        {selectedSkill.costEssence} Stones
                      </span>
                    </div>
                    <button
                      onClick={() => handleUnlock(selectedSkill)}
                      disabled={player.level < selectedSkill.unlockLevel || player.essenceStones < selectedSkill.costEssence}
                      className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        player.level >= selectedSkill.unlockLevel && player.essenceStones >= selectedSkill.costEssence
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/40 active:scale-95'
                          : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">lock_open</span>
                      Despertar Habilidad
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {/* Titles Collection Section */}
      <section className="bg-surface-dark border border-border-dark rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-white/5">
          <div>
            <h3 className="text-white text-lg font-black uppercase italic font-display flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400">workspace_premium</span>
              Títulos Honoríficos del Cazador
            </h3>
            <p className="text-slate-400 text-xs">
              Equipa títulos conquistados para infundir respeto e intimidación en el Sistema.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-bold">
            Equipado actualmente:{' '}
            <span className="text-yellow-400 font-mono font-black uppercase px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/30 rounded">
              {currentEquippedTitle}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {titles.map((title, idx) => {
            const isEquipped = currentEquippedTitle === title;
            return (
              <div
                key={idx}
                onClick={() => handleSelectTitle(title)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isEquipped
                    ? 'bg-yellow-400/10 border-yellow-400 text-yellow-300 shadow-md shadow-yellow-500/20'
                    : 'bg-white/5 border-white/10 hover:border-slate-500 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-yellow-400">
                    {isEquipped ? 'check_circle' : 'military_tech'}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider font-display">
                    {title}
                  </span>
                </div>
                {isEquipped && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-yellow-400 text-black rounded font-mono">
                    ACTIVO
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SkillTree;
