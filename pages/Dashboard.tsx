import React, { useState, useEffect } from 'react';
import { Player, Quest, QuestCategory, SystemLog, Attribute } from '../types';
import { calculateCombatPower, getEffectiveAttributes } from '../utils/calculator';
import { sound } from '../utils/sound';
import OracleEvaluationModal from '../components/OracleEvaluationModal';
import { HunterAvatar } from '../components/avatars/HunterAvatar';

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
}

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
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [resetTimer, setResetTimer] = useState<string>('00:00:00');
  const [showOracleModal, setShowOracleModal] = useState<boolean>(false);

  const effectiveStats = getEffectiveAttributes(player);
  const combatPower = calculateCombatPower(player);

  const currentMp = player.mp ?? 300;
  const maxMp = player.maxMp ?? 300;

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
      {/* Hunter Status Banner */}
      <section className="bg-surface-dark border border-border-dark rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-[130px]">military_tech</span>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Interactive Avatar */}
            <div 
              onClick={() => {
                sound.playBeep(580, 0.04);
                onOpenProfileModal?.();
              }}
              className="cursor-pointer group/avatar relative"
              title="Haz clic para personalizar Avatar y Marco"
            >
              <HunterAvatar
                avatarId={player.avatarId || 'monarch-shadow'}
                frameId={player.avatarFrame || 'frame-e'}
                size="xl"
                showGlow
                animated
                className="group-hover/avatar:scale-105 transition-transform"
              />
              <div className="absolute -bottom-1 -right-1 size-6 bg-primary rounded-full flex items-center justify-center text-white border-2 border-surface-dark shadow-md shadow-primary/40 group-hover/avatar:scale-110 transition-transform">
                <span className="material-symbols-outlined text-xs">edit</span>
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                  ESTADO DEL CAZADOR
                </span>
                <span className="px-2 py-0.5 bg-primary/20 border border-primary/40 rounded text-[9px] font-black text-primary uppercase">
                  {player.title}
                </span>
                <button
                  onClick={onOpenProfileModal}
                  className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-[9px] font-mono text-slate-300 hover:text-white border border-white/5 transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[11px]">palette</span>
                  Cambiar Aspecto
                </button>
              </div>

              <div className="flex flex-wrap items-baseline gap-4 pt-1">
                <h2 className="text-white text-4xl md:text-5xl font-black italic tracking-tighter text-glow font-display">
                  {player.name}
                </h2>
                <span className="text-primary text-xl font-black uppercase tracking-widest font-mono">
                  LVL {player.level}
                </span>
                <span className="text-accent text-xl font-black uppercase tracking-widest font-mono">
                  {player.rank}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-yellow-500 text-sm">local_fire_department</span>
                  Racha: <strong className="text-white">{player.streakDays} días</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-sm">swords</span>
                  Poder: <strong className="text-primary">{combatPower.toLocaleString()}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* XP & MP Bars */}
          <div className="w-full lg:w-2/5 flex flex-col gap-3">
            {/* XP Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  PROGRESO DE XP
                </span>
                <span className="text-primary text-xs font-black font-mono italic">
                  {player.xp} / {player.maxXp} XP ({Math.round((player.xp / player.maxXp) * 100)}%)
                </span>
              </div>
              <div className="h-3.5 bg-slate-900 rounded-full p-0.5 border border-white/10 shadow-inner">
                <div
                  className="h-full rounded-full xp-gradient system-glow transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, (player.xp / player.maxXp) * 100)}%` }}
                />
              </div>
            </div>

            {/* MP Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">bolt</span>
                  Puntos de Maná (MP)
                </span>
                <span className="text-indigo-400 text-xs font-black font-mono">
                  {currentMp} / {maxMp} MP
                </span>
              </div>
              <div className="h-2.5 bg-slate-900 rounded-full p-0.5 border border-white/10 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 shadow-sm shadow-indigo-500/50 transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentMp / maxMp) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Attributes & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attributes Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-base font-black uppercase tracking-widest italic flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">bar_chart</span>
              Atributos de Combate
            </h3>
            {player.statPoints > 0 && (
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-black rounded-lg uppercase animate-pulse flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">stars</span>
                {player.statPoints} Puntos Disponibles
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.keys(player.attributes) as Array<keyof typeof player.attributes>).map((attrKey) => {
              const attr = player.attributes[attrKey];
              const totalVal = effectiveStats[attrKey];
              const gearBonus = totalVal - attr.value;

              return (
                <div
                  key={attrKey}
                  className="bg-surface-dark border border-border-dark hover:border-primary/40 rounded-xl p-4 transition-all duration-300 flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-xl ${attr.color}`}>
                        {attr.icon}
                      </span>
                      <span className="text-xs font-black tracking-wider text-slate-300 uppercase">
                        {attr.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-primary transition-colors">
                      [{attr.code}]
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-2xl font-black text-white">{totalVal}</span>
                      {gearBonus > 0 && (
                        <span className="text-[11px] font-bold text-emerald-400">
                          (+{gearBonus})
                        </span>
                      )}
                    </div>

                    {player.statPoints > 0 && (
                      <button
                        onClick={() => onAllocateStat(attrKey)}
                        className="size-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md shadow-emerald-500/30"
                        title={`Asignar 1 punto a ${attr.name}`}
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    )}
                  </div>

                  <p className="text-slate-400 text-[10px] font-medium leading-tight">
                    {attr.bonusText}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Currencies & Daily Routine Reset */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-white text-base font-black uppercase tracking-widest italic flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-500">account_balance_wallet</span>
            Recursos & Sistema
          </h3>

          <div className="bg-surface-dark border border-border-dark rounded-xl p-5 space-y-4">
            {/* Gold */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-yellow-500">monetization_on</span>
                <span className="text-xs font-semibold text-slate-300">Gold Credits</span>
              </div>
              <span className="text-white font-black font-mono">{player.gold.toLocaleString()}</span>
            </div>

            {/* Essence Stones */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-accent">diamond</span>
                <span className="text-xs font-semibold text-slate-300">Essence Stones</span>
              </div>
              <span className="text-accent font-black font-mono">{player.essenceStones}</span>
            </div>

            {/* AI Oracle Advice Trigger Button */}
            <button
              onClick={() => {
                sound.playBeep(550, 0.05);
                setShowOracleModal(true);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-900/60 to-purple-900/60 hover:from-indigo-800 hover:to-purple-800 border border-indigo-500/40 rounded-lg text-indigo-200 hover:text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-sm text-indigo-400">psychology</span>
              Oráculo del Sistema (IA)
            </button>

            {/* Daily Reset Countdown */}
            <div className="p-3.5 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black uppercase text-slate-400">
                  Reseteo Diario
                </span>
                <span className="text-[10px] font-black uppercase text-primary">
                  {completedDailies}/{totalDailies} Misiones
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-white text-glow text-center py-1">
                {resetTimer}
              </div>
              <p className="text-slate-400 text-[10px] text-center italic mt-1">
                Completa tus misiones antes del reseteo para mantener tu racha activa.
              </p>
            </div>

            {/* Red Gate Emergency Raid Button */}
            <button
              onClick={() => {
                sound.playBeep(450, 0.08);
                onOpenEmergencyModal?.();
              }}
              className="w-full py-2.5 bg-gradient-to-r from-red-950/80 to-rose-950/80 hover:from-red-900 hover:to-rose-900 border border-red-500/50 rounded-lg text-red-300 hover:text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-red-950/50 active:scale-95 animate-pulse"
            >
              <span className="material-symbols-outlined text-sm text-red-400">emergency</span>
              Puerta Roja (Misión de Emergencia)
            </button>

            {/* Emergency Penalty Zone Trigger Button */}
            <button
              onClick={onOpenPenaltyModal}
              className="w-full py-2.5 bg-surface-card hover:bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-sm text-yellow-500">fitness_center</span>
              Zona de Castigo (Entrenamiento)
            </button>
          </div>
        </div>
      </div>

      {/* Elite Ascension Modules Hub */}
      <section className="bg-gradient-to-r from-surface-dark via-slate-900 to-surface-dark border border-border-dark rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-xl">hotel_class</span>
            <div>
              <h3 className="text-white text-sm font-black uppercase tracking-wider italic font-display">
                Módulos de Ascensión y Hábitos de Largo Plazo
              </h3>
              <p className="text-slate-400 text-xs">Herramientas avanzadas para la reconfiguración neuronal y disciplina</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40 text-[10px] font-mono font-black uppercase">
            Protocolos de Élite
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Sagas 21/60/90 Days */}
          <button
            onClick={() => {
              sound.playBeep(580, 0.04);
              onOpenSagasModal?.();
            }}
            className="p-3.5 bg-gradient-to-br from-blue-950/40 to-surface-card hover:from-blue-900/60 hover:to-indigo-950/60 border border-blue-500/30 hover:border-blue-400 rounded-xl flex flex-col items-center text-center gap-2 transition-all hover:scale-[1.02] active:scale-95 group shadow-sm"
          >
            <div className="size-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">auto_stories</span>
            </div>
            <div>
              <span className="text-white font-bold text-xs block group-hover:text-blue-300 transition-colors">
                Arcos & Sagas
              </span>
              <span className="text-[10px] font-mono text-slate-400">21 / 60 / 90 Días</span>
            </div>
          </button>

          {/* Weekly Audit by IA */}
          <button
            onClick={() => {
              sound.playBeep(580, 0.04);
              onOpenWeeklyAuditModal?.();
            }}
            className="p-3.5 bg-gradient-to-br from-indigo-950/40 to-surface-card hover:from-indigo-900/60 hover:to-purple-950/60 border border-indigo-500/30 hover:border-indigo-400 rounded-xl flex flex-col items-center text-center gap-2 transition-all hover:scale-[1.02] active:scale-95 group shadow-sm"
          >
            <div className="size-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">verified_user</span>
            </div>
            <div>
              <span className="text-white font-bold text-xs block group-hover:text-indigo-300 transition-colors">
                Auditoría IA
              </span>
              <span className="text-[10px] font-mono text-indigo-300">Asociación Oficial</span>
            </div>
          </button>

          {/* Focus Pomodoro Dungeon */}
          <button
            onClick={() => {
              sound.playBeep(580, 0.04);
              onOpenFocusModal?.();
            }}
            className="p-3.5 bg-gradient-to-br from-purple-950/40 to-surface-card hover:from-purple-900/60 hover:to-fuchsia-950/60 border border-purple-500/30 hover:border-purple-400 rounded-xl flex flex-col items-center text-center gap-2 transition-all hover:scale-[1.02] active:scale-95 group shadow-sm"
          >
            <div className="size-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">hourglass_bottom</span>
            </div>
            <div>
              <span className="text-white font-bold text-xs block group-hover:text-purple-300 transition-colors">
                Modo Enfoque
              </span>
              <span className="text-[10px] font-mono text-slate-400">Timer Pomodoro MP</span>
            </div>
          </button>

          {/* Mirror Shadow Duel */}
          <button
            onClick={() => {
              sound.playBeep(580, 0.04);
              onOpenMirrorModal?.();
            }}
            className="p-3.5 bg-gradient-to-br from-rose-950/40 to-surface-card hover:from-rose-900/60 hover:to-red-950/60 border border-rose-500/30 hover:border-rose-400 rounded-xl flex flex-col items-center text-center gap-2 transition-all hover:scale-[1.02] active:scale-95 group shadow-sm"
          >
            <div className="size-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">theater_comedy</span>
            </div>
            <div>
              <span className="text-white font-bold text-xs block group-hover:text-rose-300 transition-colors">
                Sombra Reflejo
              </span>
              <span className="text-[10px] font-mono text-rose-400">Duelo Vs Ayer</span>
            </div>
          </button>

          {/* Hunter License Card */}
          <button
            onClick={() => {
              sound.playBeep(580, 0.04);
              onOpenLicenseModal?.();
            }}
            className="col-span-2 sm:col-span-1 p-3.5 bg-gradient-to-br from-amber-950/40 to-surface-card hover:from-amber-900/60 hover:to-yellow-950/60 border border-amber-500/30 hover:border-amber-400 rounded-xl flex flex-col items-center text-center gap-2 transition-all hover:scale-[1.02] active:scale-95 group shadow-sm"
          >
            <div className="size-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">badge</span>
            </div>
            <div>
              <span className="text-white font-bold text-xs block group-hover:text-amber-300 transition-colors">
                Credencial
              </span>
              <span className="text-[10px] font-mono text-amber-400">Licencia de Cazador</span>
            </div>
          </button>
        </div>
      </section>

      {/* Quests Section */}
      <section className="space-y-4">
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
            <button
              onClick={() => {
                sound.playBeep(450, 0.08);
                onOpenEmergencyModal?.();
              }}
              className="px-4 py-2.5 bg-red-950/60 hover:bg-red-900/80 border border-red-600/50 text-red-300 hover:text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-red-950/40"
            >
              <span className="material-symbols-outlined text-sm text-red-400 animate-pulse">crisis_alert</span>
              Puerta Roja IA
            </button>
            <button
              onClick={onOpenQuestModal}
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-primary text-white text-xs font-black uppercase tracking-wider rounded-xl system-glow flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/30"
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              Crear Misión con IA
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
                    {/* Checkbox Trigger */}
                    <button
                      onClick={() => !quest.completed && onCompleteQuest(quest.id)}
                      disabled={quest.completed}
                      className={`size-11 shrink-0 border-2 rounded-xl flex items-center justify-center transition-all ${
                        quest.completed
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'border-primary/40 text-primary hover:bg-primary/20 hover:border-primary'
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

                  {/* Actions (Delete, Claim) */}
                  <div className="flex items-center justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                    {quest.completed ? (
                      <span className="text-xs font-black text-emerald-400 uppercase italic flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Reclamada
                      </span>
                    ) : (
                      <button
                        onClick={() => onCompleteQuest(quest.id)}
                        className="px-4 py-2 bg-primary hover:bg-accent text-white text-xs font-black uppercase rounded-lg transition-all system-glow"
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
