import React, { useState } from 'react';
import { ForbiddenPact, GameDifficulty, Player } from '../types';
import { sound } from '../utils/sound';

interface ForbiddenPactsSectionProps {
  player: Player;
  pacts: ForbiddenPact[];
  onTriggerInfraction: (pactId: string) => void;
  onAddCustomPact?: (pact: Omit<ForbiddenPact, 'id' | 'cleanStreakDays' | 'lastInfractionAt' | 'totalInfractions'>) => void;
  onTogglePactActive?: (pactId: string) => void;
  onOpenPenaltyModal?: () => void;
}

export const ForbiddenPactsSection: React.FC<ForbiddenPactsSectionProps> = ({
  player,
  pacts,
  onTriggerInfraction,
  onAddCustomPact,
  onTogglePactActive,
  onOpenPenaltyModal,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'nutrition' | 'health' | 'discipline'>('all');

  // New Pact Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<'nutrition' | 'health' | 'discipline' | 'mind'>('nutrition');
  const [newHpDamage, setNewHpDamage] = useState(25);
  const [newGoldPenalty, setNewGoldPenalty] = useState(50);
  const [newIcon, setNewIcon] = useState('local_drink');

  const difficultyMultiplier = player.gameDifficulty === 'casual' ? 0.5 : player.gameDifficulty === 'monarch' ? 1.5 : 1.0;

  const filteredPacts = pacts.filter((p) => {
    if (activeTab === 'all') return true;
    return p.category === activeTab;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddCustomPact?.({
      title: newTitle.trim(),
      codeName: `PACT-${Date.now().toString(36).toUpperCase()}`,
      description: newDescription.trim() || 'Pacto prohibido personalizado registrado en el Sistema.',
      category: newCategory,
      severity: newHpDamage >= 35 ? 'severe' : 'moderate',
      icon: newIcon,
      hpDamage: Math.max(10, newHpDamage),
      goldPenalty: Math.max(10, newGoldPenalty),
      active: true,
    });

    setNewTitle('');
    setNewDescription('');
    setIsCreateOpen(false);
    sound.playBeep(600, 0.08);
  };

  const currentHp = player.hp ?? 100;
  const maxHp = player.maxHp ?? 100;
  const isCriticalHp = currentHp <= 25;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-red-900/40 bg-gradient-to-br from-[#130d14] via-[#0e0f17] to-[#0b0c10] p-4 sm:p-6 shadow-2xl shadow-red-950/20">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 size-72 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400 font-mono">
              [ SISTEMA DISCIPLINARIO: PACTOS PROHIBIDOS ]
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-red-950/60 border border-red-500/30 text-red-300">
              Multa x{difficultyMultiplier}
            </span>
          </div>
          <h3 className="text-white text-lg sm:text-2xl font-black italic tracking-tight font-display mt-0.5 flex items-center gap-2">
            <span>Anti-Hábitos & Penas de Salud</span>
            <span className="material-symbols-outlined text-red-500 text-xl">gavel</span>
          </h3>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
            Cada infracción (refresco, comida chatarra, desvelo) drena tus Puntos de Salud (HP) y Oro. Mantener tus días limpios fortalece tu racha.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {isCriticalHp && (
            <button
              onClick={onOpenPenaltyModal}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-600/40 animate-bounce active:scale-95"
            >
              <span className="material-symbols-outlined text-base">emergency</span>
              <span>¡Purificar HP en Castigo!</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playBeep(520, 0.05);
              setIsCreateOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base text-red-400">add</span>
            <span>Nuevo Pacto</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 pt-3 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'Todos los Pactos', icon: 'shield' },
          { id: 'nutrition', label: 'Nutrición / Cero Azúcar', icon: 'restaurant' },
          { id: 'health', label: 'Salud & Sueño', icon: 'favorite' },
          { id: 'discipline', label: 'Disciplina Digital', icon: 'psychology' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sound.playBeep(480, 0.04);
              setActiveTab(tab.id as any);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === tab.id
                ? 'bg-red-500/20 text-red-300 border border-red-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Pacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
        {filteredPacts.map((pact) => {
          const scaledHp = Math.round(pact.hpDamage * difficultyMultiplier);
          const scaledGold = Math.round(pact.goldPenalty * difficultyMultiplier);

          return (
            <div
              key={pact.id}
              className={`relative rounded-xl border transition-all duration-300 p-4 flex flex-col justify-between gap-3 group ${
                pact.active
                  ? 'bg-[#151722]/90 border-red-900/30 hover:border-red-500/50 shadow-md'
                  : 'bg-black/30 border-white/5 opacity-60'
              }`}
            >
              {/* Pact Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-xl">{pact.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-white text-sm font-black tracking-tight uppercase">
                        {pact.title}
                      </h4>
                      {pact.cleanStreakDays > 0 && (
                        <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[11px]">local_fire_department</span>
                          {pact.cleanStreakDays}d Limpio
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                      {pact.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Penalty Tags & Infraction Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
                {/* Penalties */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-600/40 text-red-300 text-[11px] font-mono font-black flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-red-400">heart_broken</span>
                    -{scaledHp} HP
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-950/50 border border-amber-600/30 text-amber-300 text-[11px] font-mono font-black flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-yellow-400">monetization_on</span>
                    -{scaledGold} G
                  </span>
                  {pact.totalInfractions > 0 && (
                    <span className="text-[10px] font-mono text-slate-500">
                      ({pact.totalInfractions} infracciones)
                    </span>
                  )}
                </div>

                {/* The "I broke the pact" button */}
                <button
                  onClick={() => {
                    onTriggerInfraction(pact.id);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:scale-95 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-red-700/30 touch-manipulation min-h-[44px]"
                  title="Registrar que has caído en este mal hábito para aplicar la penalización del Sistema"
                >
                  <span className="material-symbols-outlined text-sm">warning</span>
                  <span>Registrar Falta</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Custom Pact */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#161b26] border border-red-500/40 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400 text-2xl">gavel</span>
                <h3 className="text-white text-lg font-black uppercase tracking-wider font-display">
                  Registrar Nuevo Pacto Prohibido
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="size-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  Nombre del Mal Hábito a Prohibir
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Fumar cigarro, Pedir delivery chatarra, Dormir tarde..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                  Descripción o Regla Específica
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe la regla clara para saber cuándo has caído."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  >
                    <option value="nutrition">Nutrición & Bebidas</option>
                    <option value="health">Salud & Descanso</option>
                    <option value="discipline">Disciplina & Redes</option>
                    <option value="mind">Enfoque Mental</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                    Ícono
                  </label>
                  <select
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  >
                    <option value="local_drink">Vaso / Refresco (local_drink)</option>
                    <option value="fastfood">Comida Rápida (fastfood)</option>
                    <option value="smartphone">Móvil / Redes (smartphone)</option>
                    <option value="bedtime">Noche / Desvelo (bedtime)</option>
                    <option value="smoking_rooms">Cigarro (smoking_rooms)</option>
                    <option value="sports_esports">Videojuegos (sports_esports)</option>
                    <option value="shopping_bag">Compras (shopping_bag)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                    Daño a HP por Infracción
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={newHpDamage}
                    onChange={(e) => setNewHpDamage(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
                    Multa de Oro (Credits)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={newGoldPenalty}
                    onChange={(e) => setNewGoldPenalty(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold uppercase transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-600/30"
                >
                  Sellar Pacto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
export default ForbiddenPactsSection;
