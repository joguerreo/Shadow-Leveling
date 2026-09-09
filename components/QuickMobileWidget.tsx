import React, { useState } from 'react';
import { Player, Quest } from '../types';
import { HunterAvatar } from './avatars/HunterAvatar';
import { resolvePlayerAvatar } from '../utils/avatarEvolution';
import { sound } from '../utils/sound';

interface QuickMobileWidgetProps {
  player: Player;
  quests: Quest[];
  onCompleteQuest: (questId: string) => void;
  onIncrementQuestProgress?: (questId: string) => void;
  onOpenQuestModal?: () => void;
  onOpenProfileModal?: () => void;
  onAllocateStat?: (stat: keyof Player['attributes']) => void;
}

export const QuickMobileWidget: React.FC<QuickMobileWidgetProps> = ({
  player,
  quests,
  onCompleteQuest,
  onIncrementQuestProgress,
  onOpenQuestModal,
  onOpenProfileModal,
  onAllocateStat,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  const { avatarId, frameId, currentStage } = resolvePlayerAvatar(player);

  const pendingQuests = quests.filter((q) => !q.completed);
  const completedQuests = quests.filter((q) => q.completed);

  const displayedQuests =
    activeFilter === 'all'
      ? quests
      : activeFilter === 'pending'
      ? pendingQuests
      : completedQuests;

  const handleToggle = () => {
    sound.playBeep(isOpen ? 380 : 540, 0.04);
    setIsOpen(!isOpen);
  };

  const handleComplete = (questId: string) => {
    sound.playLevelUp();
    onCompleteQuest(questId);
  };

  const handleIncrement = (questId: string) => {
    sound.playBeep(620, 0.03);
    if (onIncrementQuestProgress) {
      onIncrementQuestProgress(questId);
    } else {
      onCompleteQuest(questId);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button on Mobile (visible only on md:hidden) */}
      <div className="md:hidden fixed bottom-20 right-3.5 z-40">
        <button
          onClick={handleToggle}
          aria-label="Abrir Widget Rápido"
          className="size-13 rounded-2xl bg-gradient-to-tr from-primary via-indigo-600 to-purple-600 text-white shadow-[0_0_20px_rgba(77,106,255,0.6)] border-2 border-white/20 flex items-center justify-center relative active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-2xl">
            {isOpen ? 'close' : 'widgets'}
          </span>
          {!isOpen && pendingQuests.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 size-5 bg-rose-500 border-2 border-[#0b0c10] text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
              {pendingQuests.length}
            </span>
          )}
        </button>
      </div>

      {/* Expanded Quick Widget Sheet */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm animate-fadeIn">
          {/* Backdrop dismiss */}
          <div className="flex-1" onClick={handleToggle} />

          <div className="w-full bg-[#0b0f19] border-t-2 border-primary/50 rounded-t-3xl shadow-2xl p-4 max-h-[85vh] flex flex-col animate-slideUp overflow-hidden">
            {/* Grab handle */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3 shrink-0" />

            {/* Widget Top Bar / Mini Hunter Card */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10 shrink-0">
              <div
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => {
                  onOpenProfileModal?.();
                  setIsOpen(false);
                }}
              >
                <div className="relative">
                  <HunterAvatar
                    avatarId={avatarId}
                    frameId={frameId}
                    size="sm"
                    showGlow={false}
                  />
                  <span className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-primary text-[8px] font-black font-mono rounded text-white border border-black">
                    Nv.{player.level}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-white text-sm font-black italic uppercase font-display truncate">
                      {player.name}
                    </h4>
                    <span className="text-[9px] font-mono font-bold text-accent px-1.5 py-0.5 bg-accent/10 rounded border border-accent/30">
                      {player.rank}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span className="flex items-center text-amber-400">
                      <span className="material-symbols-outlined text-xs">local_fire_department</span>
                      {player.streakDays}d
                    </span>
                    <span>•</span>
                    <span className="text-primary font-bold">
                      {currentStage.title.split(':')[0]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {onOpenQuestModal && (
                  <button
                    onClick={() => {
                      onOpenQuestModal();
                      setIsOpen(false);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 flex items-center justify-center border border-white/10"
                    title="Nueva Misión"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                  </button>
                )}
                <button
                  onClick={handleToggle}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            </div>

            {/* Quick Progress Bars */}
            <div className="py-2.5 space-y-1.5 border-b border-white/5 shrink-0">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-400">PROGRESO DE XP</span>
                <span className="text-primary font-bold">
                  {player.xp}/{player.maxXp} XP ({Math.round((player.xp / player.maxXp) * 100)}%)
                </span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                  style={{ width: `${Math.min(100, (player.xp / player.maxXp) * 100)}%` }}
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 py-2 shrink-0">
              <button
                onClick={() => setActiveFilter('pending')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  activeFilter === 'pending'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white/5 text-slate-400'
                }`}
              >
                Pendientes ({pendingQuests.length})
              </button>
              <button
                onClick={() => setActiveFilter('completed')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  activeFilter === 'completed'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white/5 text-slate-400'
                }`}
              >
                Completadas ({completedQuests.length})
              </button>
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  activeFilter === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-slate-400'
                }`}
              >
                Todas
              </button>
            </div>

            {/* Quests Quick List */}
            <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 overscroll-contain touch-pan-y">
              {displayedQuests.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-mono space-y-1">
                  <span className="material-symbols-outlined text-2xl text-slate-600">done_all</span>
                  <p>No hay misiones en esta sección</p>
                </div>
              ) : (
                displayedQuests.map((quest) => {
                  const hasTarget = (quest.targetCount ?? 0) > 1;
                  const currentCount = quest.currentCount ?? 0;
                  const targetCount = quest.targetCount ?? 1;

                  return (
                    <div
                      key={quest.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        quest.completed
                          ? 'bg-emerald-950/20 border-emerald-500/20 opacity-75'
                          : 'bg-surface-card border-white/5 hover:border-primary/40'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                              quest.rank === 'S-RANK'
                                ? 'bg-purple-500/20 text-purple-400'
                                : quest.rank === 'A-RANK'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-primary/20 text-primary'
                            }`}
                          >
                            {quest.rank}
                          </span>
                          <h5
                            className={`text-xs font-bold truncate ${
                              quest.completed ? 'line-through text-slate-400' : 'text-white'
                            }`}
                          >
                            {quest.title}
                          </h5>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-1">
                          <span className="text-primary font-bold">+{quest.rewards.xp} XP</span>
                          <span>•</span>
                          <span className="text-yellow-400 font-bold">+{quest.rewards.gold} G</span>
                          {hasTarget && (
                            <>
                              <span>•</span>
                              <span className="text-slate-300">
                                {currentCount}/{targetCount} {quest.unit || ''}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {hasTarget && !quest.completed && (
                          <button
                            onClick={() => handleIncrement(quest.id)}
                            className="min-h-[38px] px-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-mono font-bold text-white transition-all flex items-center gap-1"
                            title="Avanzar progreso"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                            <span>+1</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleComplete(quest.id)}
                          disabled={quest.completed}
                          className={`min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center transition-all ${
                            quest.completed
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                              : 'bg-primary hover:bg-primary/90 text-white shadow-md active:scale-95'
                          }`}
                          title={quest.completed ? 'Completada' : 'Marcar como completada'}
                        >
                          <span className="material-symbols-outlined text-base">
                            {quest.completed ? 'check' : 'radio_button_unchecked'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Stat Points Notice if available */}
            {player.statPoints > 0 && (
              <div className="mt-2 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-sm animate-pulse">
                    stars
                  </span>
                  <span className="text-xs font-mono text-emerald-300 font-bold">
                    {player.statPoints} Puntos de Atributo disponibles
                  </span>
                </div>
                {onAllocateStat && (
                  <button
                    onClick={() => {
                      onAllocateStat('str');
                      sound.playBeep(700, 0.04);
                    }}
                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-black text-[10px] uppercase font-mono rounded-lg transition-all"
                  >
                    +1 Fuerza
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default QuickMobileWidget;
