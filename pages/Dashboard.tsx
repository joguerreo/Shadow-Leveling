import React, { useState, useEffect } from 'react';
import { Player, Quest, QuestCategory, SystemLog, Attribute, ForbiddenPact } from '../types';
import { calculateCombatPower, getEffectiveAttributes } from '../utils/calculator';
import { sound } from '../utils/sound';
import { triggerGameImpact, triggerCombatText, triggerHaptic } from '../utils/gameFx';
import OracleEvaluationModal from '../components/OracleEvaluationModal';
import { HunterAvatar } from '../components/avatars/HunterAvatar';
import { resolvePlayerAvatar } from '../utils/avatarEvolution';
import ForbiddenPactsSection from '../components/ForbiddenPactsSection';

interface DashboardProps {
  player: Player;
  quests: Quest[];
  logs: SystemLog[];
  onCompleteQuest: (id: string) => void;
  onIncrementQuestProgress: (id: string, step: number) => void;
  onResetQuestProgress?: (id: string) => void;
  onDeleteQuest: (id: string) => void;
  onAllocateStat: (attrKey: 'str' | 'int' | 'vit' | 'agi' | 'wis' | 'cha') => void;
  onOpenQuestModal: () => void;
  onOpenPenaltyModal: () => void;
  onOpenProfileModal?: () => void;
  onOpenEmergencyModal?: () => void;
  onOpenSagasModal?: () => void;
  onOpenWeeklyAuditModal?: () => void;
  onOpenFocusModal?: () => void;
  onOpenMirrorModal?: () => void;
  onOpenLicenseModal?: () => void;
  onAddRandomQuest?: () => void;
  onAddBalancedRoutine?: () => void;
  onTriggerPactInfraction?: (pactId: string) => void;
  onAddCustomPact?: (pact: Omit<ForbiddenPact, 'id' | 'cleanStreakDays' | 'lastInfractionAt' | 'totalInfractions'>) => void;
  onTogglePactActive?: (pactId: string) => void;
  onForceDailyReset?: () => void;
  onOpenTruceModal?: () => void;
}

const ATTR_METADATA_FALLBACK: Record<'str' | 'int' | 'vit' | 'agi' | 'wis' | 'cha', { name: string; code: string; icon: string; color: string; bonusText: string }> = {
  str: { name: 'Fuerza', code: 'STR', icon: 'fitness_center', color: 'text-red-500', bonusText: '+2.0% Potencia física' },
  int: { name: 'Inteligencia', code: 'INT', icon: 'psychology', color: 'text-blue-400', bonusText: '+2.0% Capacidad cognitiva' },
  vit: { name: 'Vitalidad', code: 'VIT', icon: 'favorite', color: 'text-emerald-400', bonusText: '+15 HP Máx / +1% Resistencia' },
  agi: { name: 'Agilidad', code: 'AGI', icon: 'speed', color: 'text-amber-400', bonusText: '+1.5% Velocidad de ejecución' },
  wis: { name: 'Sabiduría', code: 'WIS', icon: 'auto_awesome', color: 'text-purple-400', bonusText: '+10 MP Máx / Enfoque' },
  cha: { name: 'Carisma', code: 'CHA', icon: 'military_tech', color: 'text-yellow-400', bonusText: '+2% Autoridad y Liderazgo' },
};

const Dashboard: React.FC<DashboardProps> = ({
  player,
  quests,
  logs,
  onCompleteQuest,
  onIncrementQuestProgress,
  onResetQuestProgress,
  onDeleteQuest,
  onAllocateStat,
  onOpenQuestModal,
  onOpenPenaltyModal,
  onOpenProfileModal,
  onOpenEmergencyModal,
  onOpenSagasModal,
  onOpenWeeklyAuditModal,
  onOpenFocusModal,
  onOpenMirrorModal,
  onOpenLicenseModal,
  onAddRandomQuest,
  onAddBalancedRoutine,
  onTriggerPactInfraction,
  onAddCustomPact,
  onTogglePactActive,
  onForceDailyReset,
  onOpenTruceModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [resetTimer, setResetTimer] = useState<string>('00:00:00');
  const [showOracleModal, setShowOracleModal] = useState<boolean>(false);
  const [showAttrDetails, setShowAttrDetails] = useState<boolean>(false);

  const effectiveStats = getEffectiveAttributes(player);
  const combatPower = calculateCombatPower(player);
  const { avatarId: activeAvatarId, frameId: activeFrameId, currentStage: evolutionStage } = resolvePlayerAvatar(player);

  const currentHp = player.hp ?? 100;
  const maxHp = player.maxHp ?? 100;
  const currentMp = player.mp ?? 300;
  const maxMp = player.maxMp ?? 300;

  // Ghost HP bar (fighting game style damage chunk lag)
  const [ghostHp, setGhostHp] = useState<number>(currentHp);
  useEffect(() => {
    const timer = setTimeout(() => {
      setGhostHp(currentHp);
    }, 550);
    return () => clearTimeout(timer);
  }, [currentHp]);

  // Live countdown to midnight (00:00:00)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      setResetTimer(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter quests
  const filteredQuests = quests.filter((q) => {
    const matchesCat = selectedCategory === 'all' || q.category === selectedCategory;
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const completedDailies = quests.filter((q) => q.isDaily && q.completed).length;
  const totalDailies = quests.filter((q) => q.isDaily).length;

  const categories = [
    { id: 'all', label: 'Todas', icon: 'grid_view' },
    { id: 'fitness', label: 'Fuerza', icon: 'fitness_center' },
    { id: 'intellect', label: 'Intelecto', icon: 'psychology' },
    { id: 'discipline', label: 'Disciplina', icon: 'verified' },
    { id: 'habit', label: 'Hábitos', icon: 'repeat' },
    { id: 'mindfulness', label: 'Mente', icon: 'self_improvement' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Quick Jump Anchors for Mobile */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none sm:hidden">
        <button
          onClick={() => {
            sound.playBeep(600, 0.03);
            document.getElementById('quests-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-2.5 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary text-[11px] font-mono font-bold flex items-center gap-1 shrink-0 active:scale-95"
        >
          <span className="material-symbols-outlined text-xs">assignment</span>
          <span>🎯 Misiones ({completedDailies}/{totalDailies})</span>
        </button>

        <button
          onClick={() => {
            sound.playBeep(520, 0.03);
            document.getElementById('attributes-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-mono font-bold flex items-center gap-1 shrink-0 active:scale-95"
        >
          <span className="material-symbols-outlined text-xs">bar_chart</span>
          <span>⚔️ Atributos</span>
        </button>

        <button
          onClick={() => {
            sound.playBeep(520, 0.03);
            document.getElementById('pacts-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-[11px] font-mono font-bold flex items-center gap-1 shrink-0 active:scale-95"
        >
          <span className="material-symbols-outlined text-xs">gavel</span>
          <span>🛡️ Pactos ({(player.forbiddenPacts || []).filter(p => p.active).length})</span>
        </button>
      </div>

      {/* Truce Shield Active Banner */}
      {player.truceActive && (
        <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/50 border-2 border-amber-500/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl shadow-amber-500/10 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 animate-pulse">
              <span className="material-symbols-outlined text-2xl">shield</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-white text-xs sm:text-sm font-black uppercase tracking-wider font-display">
                  ESCUDO DE TREGUA DEL MONARCA DESPLEGADO
                </h4>
                <span className="px-2 py-0.5 bg-amber-500 text-black text-[9px] font-black rounded uppercase">
                  Protegido
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-0.5">
                {player.truceReason ? `Motivo: «${player.truceReason}» • ` : ''}Tus rachas de misiones y salud están blindadas contra penalizaciones hoy.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenTruceModal}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase transition-all whitespace-nowrap self-end sm:self-center active:scale-95"
          >
            Gestionar Escudo
          </button>
        </div>
      )}

      {/* Hunter Status Banner (Ultra-Optimized Mobile & Desktop) */}
      <section className="hud-card rounded-xl sm:rounded-2xl p-3.5 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-[130px]">military_tech</span>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 relative z-10">
          <div className="flex flex-row items-center sm:items-center gap-3 sm:gap-5 w-full lg:w-auto">
            {/* Interactive Avatar */}
            <div 
              onClick={() => {
                sound.playBeep(580, 0.04);
                onOpenProfileModal?.();
              }}
              className="cursor-pointer group/avatar relative shrink-0"
              title="Haz clic para personalizar Avatar y Evolución"
            >
              <HunterAvatar
                avatarId={activeAvatarId}
                frameId={activeFrameId}
                size="xl"
                showGlow
                animated
                className="size-16 sm:size-24 group-hover/avatar:scale-105 transition-transform"
              />
              <div className="absolute -bottom-1 -right-1 size-5 sm:size-6 bg-primary rounded-full flex items-center justify-center text-white border-2 border-surface-dark shadow-md shadow-primary/40 group-hover/avatar:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[10px] sm:text-xs">edit</span>
              </div>
            </div>

            <div className="flex flex-col space-y-1 min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
                  ESTADO
                </span>
                <span className="px-1.5 py-0.5 bg-primary/20 border border-primary/40 rounded text-[9px] font-black text-primary uppercase truncate max-w-[130px] sm:max-w-none">
                  {player.title}
                </span>
                <button
                  onClick={onOpenProfileModal}
                  className="px-1.5 py-0.5 bg-primary/15 hover:bg-primary/25 rounded text-[9px] font-mono text-primary hover:text-white border border-primary/30 transition-all flex items-center gap-0.5"
                  title="Fase de evolución del avatar"
                >
                  <span className="material-symbols-outlined text-[10px]">upgrade</span>
                  <span>Fase {evolutionStage.tier}/6</span>
                </button>
              </div>

              <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-3">
                <h2 className="text-white text-xl sm:text-3xl md:text-4xl font-black italic tracking-tighter text-glow font-display truncate max-w-[180px] sm:max-w-none">
                  {player.name}
                </h2>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-primary text-xs sm:text-lg font-black uppercase tracking-wider font-mono">
                    LVL {player.level}
                  </span>
                  <span className="text-accent text-xs sm:text-lg font-black uppercase tracking-wider font-mono">
                    [{player.rank}]
                  </span>

                  {/* Difficulty & Lifestyle Archetype Pill */}
                  <button
                    onClick={onOpenProfileModal}
                    className="px-1.5 py-0.5 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-[9px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95"
                    title="Configurar Dificultad y Arquetipo de Vida"
                  >
                    <span className="uppercase font-black">
                      {player.gameDifficulty === 'casual' ? 'Casual' : player.gameDifficulty === 'monarch' ? 'Monarca' : 'Cazador'}
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-300">
                      {player.lifestyleArchetype === 'guardian' ? '🛡️' : player.lifestyleArchetype === 'scholar' ? '🧠' : player.lifestyleArchetype === 'shadow' ? '⚡' : '👑'}
                    </span>
                  </button>

                  {/* Truce Shield Pill Button */}
                  <button
                    onClick={onOpenTruceModal}
                    className={`px-2 py-0.5 rounded border text-[9px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95 ${
                      player.truceActive
                        ? 'bg-amber-500 text-black border-amber-400 font-black shadow-sm shadow-amber-500/30 animate-pulse'
                        : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
                    }`}
                    title="Modo Tregua: Pausa de salud o viaje para proteger racha y HP"
                  >
                    <span className="material-symbols-outlined text-[11px]">shield</span>
                    <span>{player.truceActive ? '🛡️ Tregua Activa' : 'Modo Tregua'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-0.5 text-yellow-400">
                  <span className="material-symbols-outlined text-xs">local_fire_department</span>
                  Racha: <strong className="text-white font-bold">{player.streakDays}d</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-primary">
                  <span className="material-symbols-outlined text-xs">swords</span>
                  Poder: <strong className="text-primary font-bold">{combatPower.toLocaleString()} CP</strong>
                </span>
              </div>
            </div>
          </div>

          {/* XP, HP & MP Bars */}
          <div className="w-full lg:w-2/5 flex flex-col gap-1.5 sm:gap-2.5">
            {/* XP Bar */}
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                <span className="font-bold text-slate-400 uppercase tracking-wider">PROGRESO XP</span>
                <span className="text-primary font-black font-mono">
                  {player.xp} / {player.maxXp} XP ({Math.round((player.xp / player.maxXp) * 100)}%)
                </span>
              </div>
              <div className="h-2 sm:h-3 bg-slate-900 rounded-full p-0.5 border border-white/10 shadow-inner">
                <div
                  className="h-full rounded-full xp-gradient system-glow transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, (player.xp / player.maxXp) * 100)}%` }}
                />
              </div>
            </div>

            {/* HP Bar with Ghost Damage Indicator */}
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                <span className="font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px] text-red-500">favorite</span>
                  Salud (HP)
                </span>
                <span className={`font-black font-mono ${currentHp <= 25 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                  {currentHp} / {maxHp} HP
                </span>
              </div>
              <div className="h-2.5 sm:h-3 bg-slate-950 rounded-full p-0.5 border border-white/10 shadow-inner relative overflow-hidden">
                {/* Staggered trailing ghost bar */}
                <div
                  className="h-full rounded-full bg-red-800/80 ghost-bar-transition absolute left-0.5 top-0.5"
                  style={{ width: `${Math.min(100, (ghostHp / maxHp) * 100)}%` }}
                />
                {/* Active real-time bar */}
                <div
                  className={`h-full rounded-full instant-bar-transition relative z-10 ${
                    currentHp <= 25
                      ? 'bg-gradient-to-r from-red-600 via-rose-500 to-red-600 shadow-sm shadow-red-500/50 animate-pulse'
                      : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-sm shadow-emerald-500/50'
                  }`}
                  style={{ width: `${Math.min(100, (currentHp / maxHp) * 100)}%` }}
                />
              </div>
            </div>

            {/* MP Bar */}
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                <span className="font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">bolt</span>
                  Maná (MP)
                </span>
                <span className="text-indigo-400 font-black font-mono">
                  {currentMp} / {maxMp} MP
                </span>
              </div>
              <div className="h-1.5 sm:h-2 bg-slate-900 rounded-full p-0.5 border border-white/10 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 shadow-sm shadow-indigo-500/50 transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentMp / maxMp) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Resource & Reset Timer Strip */}
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-yellow-400 font-bold">
              <span className="material-symbols-outlined text-sm">monetization_on</span>
              {player.gold.toLocaleString()} G
            </span>
            <span className="flex items-center gap-1 text-accent font-bold">
              <span className="material-symbols-outlined text-sm">diamond</span>
              {player.essenceStones} ES
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-300 text-[11px]" title="Tiempo restante para el reseteo automático de medianoche">
            <span className="material-symbols-outlined text-xs text-primary animate-spin" style={{ animationDuration: '6s' }}>schedule</span>
            <span className="text-slate-400 hidden sm:inline">Reseteo Diario:</span>
            <strong className="text-white font-mono">{resetTimer}</strong>
          </div>
        </div>
      </section>

      {/* Combat Attributes (Compact 3x2 Grid on Mobile, 6 Cols on Desktop) */}
      <section id="attributes-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base sm:text-lg">bar_chart</span>
            <h3 className="text-white text-xs sm:text-sm font-black uppercase tracking-widest italic">
              Atributos de Combate
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {player.statPoints > 0 && (
              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] sm:text-xs font-black rounded-lg uppercase animate-pulse flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">stars</span>
                {player.statPoints} Puntos
              </span>
            )}
            <button
              onClick={() => setShowAttrDetails(!showAttrDetails)}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-[10px] font-mono flex items-center gap-1 transition-all"
              title="Alternar vista detallada de bonificadores"
            >
              <span className="material-symbols-outlined text-xs">{showAttrDetails ? 'unfold_less' : 'info'}</span>
              <span>{showAttrDetails ? 'Ocultar info' : 'Ver info'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {(['str', 'int', 'vit', 'agi', 'wis', 'cha'] as const).map((attrKey) => {
            const meta = ATTR_METADATA_FALLBACK[attrKey];
            const attrRaw = player.attributes?.[attrKey] || (player.attributes as any)?.[attrKey.toUpperCase()];
            const baseVal = typeof attrRaw === 'number' ? attrRaw : (Number(attrRaw?.value) || 10);
            const totalVal = effectiveStats?.[attrKey] ?? baseVal;
            const gearBonus = Math.max(0, totalVal - baseVal);
            const attrName = (typeof attrRaw === 'object' && attrRaw?.name) || meta.name;
            const attrCode = (typeof attrRaw === 'object' && attrRaw?.code) || meta.code;
            const attrIcon = (typeof attrRaw === 'object' && attrRaw?.icon) || meta.icon;
            const attrColor = (typeof attrRaw === 'object' && attrRaw?.color) || meta.color;
            const attrBonusText = (typeof attrRaw === 'object' && attrRaw?.bonusText) || meta.bonusText;

            return (
              <div
                key={attrKey}
                className="bg-[#141822] border border-[#2b3240] hover:border-primary/50 rounded-xl p-2 sm:p-3 transition-all duration-200 flex flex-col justify-between group shadow-sm relative overflow-hidden"
              >
                {/* Header: Icon + Code */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className={`material-symbols-outlined text-base sm:text-lg ${attrColor}`}>
                      {attrIcon}
                    </span>
                    <span className="text-[10px] sm:text-xs font-black font-mono text-slate-300 uppercase">
                      {attrCode}
                    </span>
                  </div>
                  {player.statPoints > 0 && (
                    <button
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        triggerGameImpact('level_up', `+1 ${attrCode.toUpperCase()}`, {
                          x: rect.left + rect.width / 2,
                          y: rect.top - 10,
                        });
                        onAllocateStat(attrKey);
                      }}
                      onMouseEnter={() => sound.playHover()}
                      className="size-5 sm:size-6 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-black flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm shadow-emerald-500/40"
                      title={`+1 a ${attrName}`}
                    >
                      <span className="material-symbols-outlined text-xs">add</span>
                    </button>
                  )}
                </div>

                {/* Stat value + gear bonus */}
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-lg sm:text-2xl font-black text-white font-mono">{totalVal}</span>
                  {gearBonus > 0 && (
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">
                      (+{gearBonus})
                    </span>
                  )}
                </div>

                {/* Attribute Bonus Description */}
                {showAttrDetails && (
                  <p className="text-slate-400 text-[9px] font-medium leading-tight mt-1 border-t border-white/5 pt-1">
                    {attrBonusText}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Compact Quick Actions Toolbar (Oráculo, Puerta Roja, Castigo, Reiniciar Día) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            onClick={() => {
              sound.playBeep(550, 0.05);
              setShowOracleModal(true);
            }}
            className="py-2 px-2.5 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 hover:from-indigo-900 hover:to-purple-900 border border-indigo-500/30 rounded-lg text-indigo-300 hover:text-white text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-sm text-indigo-400">psychology</span>
            <span>Oráculo IA</span>
          </button>

          <button
            onClick={() => {
              sound.playBeep(450, 0.08);
              onOpenEmergencyModal?.();
            }}
            className="py-2 px-2.5 bg-gradient-to-r from-red-950/60 to-rose-950/60 hover:from-red-900 hover:to-rose-900 border border-red-500/40 rounded-lg text-red-300 hover:text-white text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 animate-pulse"
          >
            <span className="material-symbols-outlined text-sm text-red-400">crisis_alert</span>
            <span>Puerta Roja</span>
          </button>

          <button
            onClick={onOpenPenaltyModal}
            className="py-2 px-2.5 bg-surface-card hover:bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:text-white text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm text-yellow-500">fitness_center</span>
            <span>Castigo</span>
          </button>

          <button
            onClick={() => {
              if (onForceDailyReset) {
                onForceDailyReset();
              }
            }}
            className="py-2 px-2.5 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 rounded-lg text-blue-300 hover:text-white text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            title="Reiniciar manualmente el ciclo de misiones diarias"
          >
            <span className="material-symbols-outlined text-sm text-blue-400">restart_alt</span>
            <span>Reiniciar Día</span>
          </button>
        </div>
      </section>

      {/* Sistema Disciplinario: Pactos Prohibidos (Anti-Hábitos) */}
      <div id="pacts-section">
        <ForbiddenPactsSection
          player={player}
          pacts={player.forbiddenPacts || []}
          onTriggerInfraction={(pactId) => {
            onTriggerPactInfraction?.(pactId);
          }}
          onAddCustomPact={onAddCustomPact}
          onTogglePactActive={onTogglePactActive}
          onOpenPenaltyModal={onOpenPenaltyModal}
        />
      </div>

      {/* Quests Section */}
      <section id="quests-section" className="space-y-4 scroll-mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">assignment</span>
            <div>
              <h3 className="text-white text-xl font-black uppercase tracking-widest italic font-display">
                Protocolo de Misiones
              </h3>
              <p className="text-slate-400 text-xs">Cumple los objetivos para acumular XP y forjar tu rango</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onAddRandomQuest && (
              <button
                type="button"
                onClick={() => {
                  sound.playBeep(620, 0.04);
                  onAddRandomQuest();
                }}
                className="px-3 py-2 bg-[#1b2234] hover:bg-[#25304a] border border-blue-500/30 hover:border-blue-400 text-blue-300 hover:text-white text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-black/40"
                title="Generar 1 misión diaria aleatoria del catálogo variado"
              >
                <span className="material-symbols-outlined text-sm text-blue-400">casino</span>
                <span>🎲 Random</span>
              </button>
            )}

            {onAddBalancedRoutine && (
              <button
                type="button"
                onClick={() => {
                  sound.playBeep(680, 0.05);
                  onAddBalancedRoutine();
                }}
                className="px-3 py-2 bg-[#211b34] hover:bg-[#30254c] border border-purple-500/30 hover:border-purple-400 text-purple-300 hover:text-white text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-black/40"
                title="Cargar una rutina balanceada de 4 misiones aleatorias variadas"
              >
                <span className="material-symbols-outlined text-sm text-purple-400">bolt</span>
                <span>⚡ Rutina 4X</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playBeep(450, 0.08);
                onOpenEmergencyModal?.();
              }}
              className="px-3.5 py-2 bg-red-950/60 hover:bg-red-900/80 border border-red-600/50 text-red-300 hover:text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-red-950/40"
            >
              <span className="material-symbols-outlined text-sm text-red-400 animate-pulse">crisis_alert</span>
              Puerta Roja
            </button>

            <button
              onClick={onOpenQuestModal}
              className="px-4 py-2 bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-primary text-white text-xs font-black uppercase tracking-wider rounded-xl system-glow flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/30"
            >
              <span className="material-symbols-outlined text-sm">auto_stories</span>
              Misiones / Catálogo
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex flex-wrap gap-1.5 bg-surface-dark p-1 rounded-xl border border-white/5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playBeep(600, 0.03);
                  setSelectedCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-white system-glow'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-xs">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Buscar misiones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 bg-surface-dark border border-border-dark rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-600 focus:border-primary focus:outline-none"
            />
            <span className="material-symbols-outlined text-slate-500 text-sm absolute left-3 top-2.5">
              search
            </span>
          </div>
        </div>

        {/* Quests List */}
        <div className="flex flex-col gap-3">
          {filteredQuests.length === 0 ? (
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-12 text-center space-y-3">
              <span className="material-symbols-outlined text-slate-600 text-5xl">task_alt</span>
              <h4 className="text-white font-bold text-sm uppercase">No hay misiones registradas</h4>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                No tienes misiones pendientes en esta categoría. Agrega una nueva misión con IA o manual para continuar subiendo de nivel.
              </p>
              <button
                onClick={onOpenQuestModal}
                className="mt-2 px-6 py-2.5 bg-primary text-white text-xs font-black uppercase rounded-xl system-glow"
              >
                Crear Misión Ahora
              </button>
            </div>
          ) : (
            filteredQuests.map((quest) => {
              const isProgressable = quest.targetCount && quest.targetCount > 1;
              const progressPct = isProgressable
                ? Math.min(100, ((quest.currentCount || 0) / quest.targetCount!) * 100)
                : quest.completed
                ? 100
                : 0;

              return (
                <div
                  key={quest.id}
                  className={`group p-5 bg-surface-dark border rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    quest.completed
                      ? 'border-slate-800/80 bg-[#12161f]/50 opacity-75'
                      : 'border-border-dark hover:border-primary/50 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-start md:items-center gap-4 flex-1">
                    {/* Checkbox Trigger with Game Combat Feedback */}
                    <button
                      onClick={(e) => {
                        if (!quest.completed) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const xpGain = quest.rewards?.xp ?? 50;
                          const goldGain = quest.rewards?.gold ?? 10;
                          triggerGameImpact('loot', `+${xpGain} XP`, {
                            x: rect.left + rect.width / 2,
                            y: rect.top - 10,
                          });
                          if (goldGain > 0) {
                            setTimeout(() => {
                              triggerCombatText(`+${goldGain} 🟡`, 'gold', {
                                x: rect.left + rect.width / 2 + 15,
                                y: rect.top - 20,
                              });
                            }, 180);
                          }
                          onCompleteQuest(quest.id);
                        }
                      }}
                      onMouseEnter={() => sound.playHover()}
                      disabled={quest.completed}
                      className={`size-11 shrink-0 border-2 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                        quest.completed
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'border-primary/40 text-primary hover:bg-primary/20 hover:border-primary system-glow'
                      }`}
                    >
                      <span className="material-symbols-outlined font-black text-xl">
                        {quest.completed ? 'done_all' : 'check'}
                      </span>
                    </button>

                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`text-sm md:text-base font-bold ${
                            quest.completed ? 'line-through text-slate-500' : 'text-white'
                          }`}
                        >
                          {quest.title}
                        </h4>
                        {quest.aiGenerated && (
                          <span className="px-1.5 py-0.5 bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 rounded text-[9px] font-black uppercase flex items-center gap-1 font-mono">
                            <span className="material-symbols-outlined text-[10px]">smart_toy</span>
                            IA Oráculo
                          </span>
                        )}
                        {quest.isDaily && (
                          <span className="px-1.5 py-0.5 bg-accent/15 border border-accent/30 text-accent rounded text-[9px] font-black uppercase">
                            Diaria
                          </span>
                        )}
                      </div>

                      <p className="text-slate-400 text-xs leading-relaxed">
                        {quest.description}
                      </p>

                      {/* Progress Bar for multi-step quests */}
                      {isProgressable && !quest.completed && (
                        <div className="pt-2 flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-300">
                            {quest.currentCount} / {quest.targetCount} {quest.unit}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => onIncrementQuestProgress(quest.id, 5)}
                              className="px-2 py-0.5 bg-primary/20 hover:bg-primary/40 border border-primary/30 rounded text-[10px] font-black text-primary"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => onIncrementQuestProgress(quest.id, 10)}
                              className="px-2 py-0.5 bg-primary/30 hover:bg-primary/50 border border-primary/40 rounded text-[10px] font-black text-primary"
                            >
                              +10
                            </button>
                            {onResetQuestProgress && (
                              <button
                                onClick={() => onResetQuestProgress(quest.id)}
                                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[10px] font-bold text-slate-400 hover:text-white"
                                title="Reiniciar contador a 0"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Rewards Badges */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[9px] font-black uppercase border border-white/5">
                          {quest.rank}
                        </span>
                        <span className="text-primary text-[10px] flex items-center gap-1 font-bold">
                          <span className="material-symbols-outlined text-[13px]">add_circle</span>
                          +{quest.rewards.xp} XP
                        </span>
                        <span className="text-yellow-400 text-[10px] flex items-center gap-1 font-bold">
                          <span className="material-symbols-outlined text-[13px]">monetization_on</span>
                          +{quest.rewards.gold} G
                        </span>
                        {quest.rewards.essenceStones && (
                          <span className="text-accent text-[10px] flex items-center gap-1 font-bold">
                            <span className="material-symbols-outlined text-[13px]">diamond</span>
                            +{quest.rewards.essenceStones} Stones
                          </span>
                        )}
                        {quest.rewards.statPoints && (
                          <span className="text-emerald-400 text-[10px] flex items-center gap-1 font-bold">
                            <span className="material-symbols-outlined text-[13px]">star</span>
                            +{quest.rewards.statPoints} Stat Pt
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Delete, Focus, Claim) */}
                  <div className="flex items-center justify-end gap-2 sm:gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                    {onOpenFocusModal && !quest.completed && (
                      <button
                        onClick={() => {
                          sound.playBeep(600, 0.04);
                          onOpenFocusModal();
                        }}
                        className="px-2.5 py-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 rounded-lg text-purple-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                        title="Iniciar Mazmorra de Enfoque Pomodoro para esta tarea"
                      >
                        <span className="material-symbols-outlined text-sm">timer</span>
                        <span className="hidden sm:inline">Enfoque</span>
                      </button>
                    )}

                    {quest.completed ? (
                      <span className="text-xs font-black text-emerald-400 uppercase italic flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Reclamada
                      </span>
                    ) : (
                      <button
                        onClick={() => onCompleteQuest(quest.id)}
                        className="px-4 py-2 bg-primary hover:bg-accent text-white text-xs font-black uppercase rounded-lg transition-all system-glow min-h-[38px] active:scale-95"
                      >
                        Completar
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteQuest(quest.id)}
                      className="text-slate-600 hover:text-red-400 p-1.5 transition-colors"
                      title="Eliminar Misión"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Oracle Evaluation Modal */}
      {showOracleModal && (
        <OracleEvaluationModal player={player} onClose={() => setShowOracleModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
