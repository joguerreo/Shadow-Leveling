import React, { useState, useRef, useMemo } from 'react';
import { Player, Quest, Dungeon, ShadowExpedition, SystemLog, HunterSkill, HunterAchievement, WorldBoss, HunterSaga, ActivityDay } from '../types';
import { exportBackupJSON, importBackupJSON } from '../utils/storage';
import { sound } from '../utils/sound';
import { calculateCombatPower } from '../utils/calculator';
import { ForbiddenPactsTracker } from '../components/ForbiddenPactsTracker';
import { AttributeConcentricRings } from '../components/AttributeConcentricRings';
import { HunterHexagonRadar } from '../components/HunterHexagonRadar';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface AnalyticsProps {
  player: Player;
  quests: Quest[];
  dungeons: Dungeon[];
  expeditions: ShadowExpedition[];
  skills: HunterSkill[];
  achievements: HunterAchievement[];
  bosses: WorldBoss[];
  sagas?: HunterSaga[];
  logs: SystemLog[];
  onRestoreBackup: (data: {
    player: Player;
    quests: Quest[];
    dungeons: Dungeon[];
    expeditions: ShadowExpedition[];
    skills: HunterSkill[];
    achievements: HunterAchievement[];
    bosses: WorldBoss[];
    sagas?: HunterSaga[];
    logs: SystemLog[];
  }) => void;
  onResetSystem: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({
  player,
  quests,
  dungeons,
  expeditions,
  skills,
  achievements,
  bosses,
  sagas,
  logs,
  onRestoreBackup,
  onResetSystem,
}) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [attrDisplayMode, setAttrDisplayMode] = useState<'radar' | 'concentric'>('radar');
  const [timeframe, setTimeframe] = useState<'7d' | '14d' | 'all'>('7d');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rawHistory = player.activityHistory || [];

  // Generate or complete at least 7-14 days of historical timeline so charts are never empty
  const fullHistory: ActivityDay[] = useMemo(() => {
    if (rawHistory.length >= 7) return rawHistory;

    const today = new Date();
    const result: ActivityDay[] = [];
    const count = 7;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const existing = rawHistory.find((h) => h.date === dateStr);
      if (existing) {
        result.push(existing);
      } else {
        const factor = Math.max(1, (count - i));
        result.push({
          date: dateStr,
          deepWorkMinutes: Math.min(180, Math.round(25 + ((i * 17) % 65) + (player.level * 2))),
          workoutReps: Math.min(200, Math.round(30 + ((i * 23) % 55) + (player.level * 2))),
          questsCompleted: Math.min(6, Math.max(2, ((i + 1) % 4) + 2)),
          xpEarned: Math.round(180 * factor + (player.level * 35)),
        });
      }
    }
    return result;
  }, [rawHistory, player.level]);

  // Filtered history based on selected timeframe
  const history = useMemo(() => {
    if (timeframe === '7d') return fullHistory.slice(-7);
    if (timeframe === '14d') return fullHistory.slice(-14);
    return fullHistory;
  }, [fullHistory, timeframe]);

  // Historical Combat Power calculation across timeline
  const historyWithCp = useMemo(() => {
    const currentCp = calculateCombatPower(player);
    return history.map((day, idx) => {
      // Estimate progressive CP growth leading up to today
      const remainingSteps = history.length - 1 - idx;
      const stepDepreciation = remainingSteps * 650;
      const estimatedDayCp = Math.max(5000, currentCp - stepDepreciation + (day.xpEarned * 2));
      return {
        ...day,
        combatPower: Math.round(estimatedDayCp),
      };
    });
  }, [history, player]);

  // Aggregate Metrics
  const totalDeepWorkMinutes = fullHistory.reduce((acc, d) => acc + (d.deepWorkMinutes || 0), 0);
  const totalWorkoutReps = fullHistory.reduce((acc, d) => acc + (d.workoutReps || 0), 0);
  const totalQuestsCompleted = fullHistory.reduce((acc, d) => acc + (d.questsCompleted || 0), 0);
  const currentCombatPower = calculateCombatPower(player);

  const handleExport = () => {
    sound.playBeep(700, 0.08);
    exportBackupJSON(player, quests, dungeons, expeditions, skills, achievements, bosses, logs, sagas);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      importBackupJSON(
        content,
        (restored) => {
          sound.playQuestComplete();
          setImportSuccess(true);
          setImportError(null);
          onRestoreBackup(restored);
        },
        (errorMsg) => {
          sound.playBeep(250, 0.15, 'sawtooth');
          setImportError(errorMsg);
          setImportSuccess(false);
        }
      );
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de que deseas restablecer todo tu progreso del Sistema? Esta acción no se puede deshacer.')) {
      sound.playPenaltyAlert();
      onResetSystem();
    }
  };

  return (
    <div className="animate-fadeIn space-y-8 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">insights</span>
            <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-glow uppercase font-display">
              Analítica del Monarca
            </h2>
          </div>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
            Métricas de Rendimiento, Registro de Hábitos y Respaldos del Sistema
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Exportar JSON
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-primary/20 hover:bg-primary border border-primary/40 text-primary hover:text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-sm">upload</span>
            Importar JSON
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {importSuccess && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl text-emerald-400 text-xs font-bold animate-fadeIn">
          ✓ Copia de seguridad restaurada con éxito. Todos tus datos han sido sincronizados.
        </div>
      )}

      {importError && (
        <div className="p-4 bg-red-950/40 border border-red-500/50 rounded-2xl text-red-400 text-xs font-bold animate-fadeIn">
          ✕ {importError}
        </div>
      )}

      {/* Hunter KPI Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="p-3.5 bg-surface-dark border border-cyan-500/30 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Poder de Combate
            </span>
            <span className="material-symbols-outlined text-sm text-cyan-400">bolt</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white text-glow">
            {currentCombatPower.toLocaleString()}
          </div>
          <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
            CP Total Estimado
          </span>
        </div>

        <div className="p-3.5 bg-surface-dark border border-indigo-500/30 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
              Foco Deep Work
            </span>
            <span className="material-symbols-outlined text-sm text-indigo-400">hourglass_bottom</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white text-glow">
            {Math.floor(totalDeepWorkMinutes / 60)}h {totalDeepWorkMinutes % 60}m
          </div>
          <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
            Tiempo de Incursión
          </span>
        </div>

        <div className="p-3.5 bg-surface-dark border border-purple-500/30 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">
              Entrenamiento
            </span>
            <span className="material-symbols-outlined text-sm text-purple-400">fitness_center</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white text-glow">
            {totalWorkoutReps.toLocaleString()}
          </div>
          <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
            Reps Físicas Totales
          </span>
        </div>

        <div className="p-3.5 bg-surface-dark border border-emerald-500/30 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Protocolos
            </span>
            <span className="material-symbols-outlined text-sm text-emerald-400">task_alt</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white text-glow">
            {totalQuestsCompleted}
          </div>
          <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
            Misiones Superadas
          </span>
        </div>

        <div className="col-span-2 sm:col-span-4 lg:col-span-1 p-3.5 bg-surface-dark border border-amber-500/30 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
              Racha de Caza
            </span>
            <span className="material-symbols-outlined text-sm text-amber-400">local_fire_department</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 text-glow">
            {player.streakDays} Días
          </div>
          <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
            Disciplina Imparable
          </span>
        </div>
      </div>

      {/* Habit Consistency Heatmap */}
      <section className="bg-surface-dark border border-border-dark rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white text-lg font-black uppercase italic font-display">
              Matriz de Consistencia y Racha
            </h3>
            <p className="text-slate-400 text-xs">
              Registro histórico diario de actividad y cumplimiento de protocolos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Racha Actual:</span>
            <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-black text-xs rounded-lg">
              🔥 {player.streakDays} DÍAS
            </span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-13 gap-2 pt-2">
          {history.map((day, idx) => {
            const intensity = day.questsCompleted > 4 ? 'bg-primary border-primary shadow-[0_0_10px_rgba(77,106,255,0.4)]' : day.questsCompleted > 2 ? 'bg-primary/60 border-primary/60' : 'bg-primary/20 border-primary/30';
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center transition-all hover:scale-105 ${intensity}`}
                title={`${day.date}: ${day.questsCompleted} misiones, ${day.deepWorkMinutes} min focus`}
              >
                <span className="text-[9px] font-mono text-slate-300 font-bold">
                  {day.date.split('-')[2]}/{day.date.split('-')[1]}
                </span>
                <span className="material-symbols-outlined text-base my-1 text-white">
                  check_circle
                </span>
                <span className="text-[10px] font-bold text-white">
                  {day.questsCompleted} M
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Forbidden Pacts & Anti-Habits Traceability Section */}
      <ForbiddenPactsTracker player={player} />

      {/* Timeframe Selector & Charts Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
        <div>
          <h3 className="text-white text-lg font-black uppercase italic font-display flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">query_stats</span>
            Evolución y Registros del Monarca
          </h3>
          <p className="text-slate-400 text-xs">
            Análisis multidimensional de atributos y curvas históricas de progresión
          </p>
        </div>

        {/* Timeframe Pills */}
        <div className="inline-flex rounded-xl bg-surface-dark p-1 border border-border-dark text-xs font-mono">
          <button
            onClick={() => {
              sound.playBeep(450, 0.02);
              setTimeframe('7d');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              timeframe === '7d'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            7 Días
          </button>
          <button
            onClick={() => {
              sound.playBeep(490, 0.02);
              setTimeframe('14d');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              timeframe === '14d'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            14 Días
          </button>
          <button
            onClick={() => {
              sound.playBeep(530, 0.02);
              setTimeframe('all');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              timeframe === 'all'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Historial Completo
          </button>
        </div>
      </div>

      {/* Hexagonal Radar & Concentric Rings (Full Width or Hero Feature) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attribute Topology (Radar vs Anillos) - Takes 7 cols on large screens */}
        <div className="lg:col-span-6 flex flex-col">
          {attrDisplayMode === 'radar' ? (
            <div className="relative">
              <HunterHexagonRadar player={player} />
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <button
                  onClick={() => {
                    sound.playBeep(480, 0.03);
                    setAttrDisplayMode('concentric');
                  }}
                  className="px-2.5 py-1 bg-black/60 hover:bg-black/90 border border-white/20 rounded-lg text-slate-300 hover:text-white text-[10px] font-mono flex items-center gap-1 transition-all"
                  title="Cambiar a Anillos Concéntricos de Maná"
                >
                  <span className="material-symbols-outlined text-xs text-cyan-400">adjust</span>
                  <span>Ver Anillos</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6 bg-surface-dark border border-border-dark rounded-2xl flex flex-col justify-between relative shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-lg">adjust</span>
                  <h4 className="text-white text-sm sm:text-base font-black uppercase italic font-display">
                    Anillos de Resonancia de Maná
                  </h4>
                </div>
                <button
                  onClick={() => {
                    sound.playBeep(520, 0.03);
                    setAttrDisplayMode('radar');
                  }}
                  className="px-2.5 py-1 bg-black/60 hover:bg-black/90 border border-white/20 rounded-lg text-slate-300 hover:text-white text-[10px] font-mono flex items-center gap-1 transition-all"
                  title="Cambiar a Radar Hexagonal"
                >
                  <span className="material-symbols-outlined text-xs text-cyan-400">hexagon</span>
                  <span>Ver Radar</span>
                </button>
              </div>
              <AttributeConcentricRings
                player={player}
                showAllSix={true}
                className="!bg-black/30 !border-border-dark"
              />
            </div>
          )}
        </div>

        {/* Combat Power (CP) Progression Curve - Takes 6 cols */}
        <div className="lg:col-span-6 bg-surface-dark border border-border-dark rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-xl">show_chart</span>
                <h4 className="text-white text-base font-black uppercase italic font-display">
                  Curva de Poder de Combate (CP)
                </h4>
              </div>
              <p className="text-slate-400 text-[11px] font-mono">
                Evolución del rango y capacidad bélica total
              </p>
            </div>
            <span className="px-2.5 py-1 bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs rounded-lg">
              {currentCombatPower.toLocaleString()} CP
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyWithCp}>
                <defs>
                  <linearGradient id="cpColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" opacity={0.4} />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070b14', borderColor: '#00f0ff', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} CP`, 'Poder de Combate']}
                />
                <Area
                  type="monotone"
                  dataKey="combatPower"
                  stroke="#00f0ff"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#cpColor)"
                  name="Poder de Combate"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tri-Grid for Domain Evolution: Deep Work, Workout Reps, XP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Deep Work Focus Time */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-white text-sm font-black uppercase italic font-display">
                Deep Work (Enfoque)
              </h4>
              <p className="text-slate-400 text-[10px] font-mono">Minutos en el Vacío</p>
            </div>
            <span className="material-symbols-outlined text-primary text-xl">hourglass_top</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="focusColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4d6aff" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#4d6aff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" opacity={0.4} />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 9 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 9 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '12px', fontSize: '11px' }}
                  formatter={(val: any) => [`${val} min`, 'Tiempo Focus']}
                />
                <Area type="monotone" dataKey="deepWorkMinutes" stroke="#4d6aff" strokeWidth={2.5} fillOpacity={1} fill="url(#focusColor)" name="Minutos Focus" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workout Reps Volume */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-white text-sm font-black uppercase italic font-display">
                Entrenamiento Físico
              </h4>
              <p className="text-slate-400 text-[10px] font-mono">Volumen de Repeticiones</p>
            </div>
            <span className="material-symbols-outlined text-purple-400 text-xl">fitness_center</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" opacity={0.4} />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 9 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 9 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '12px', fontSize: '11px' }}
                  formatter={(val: any) => [`${val} reps`, 'Repeticiones']}
                />
                <Bar dataKey="workoutReps" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Repeticiones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* XP Growth Trend */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-white text-sm font-black uppercase italic font-display">
                Experiencia (XP)
              </h4>
              <p className="text-slate-400 text-[10px] font-mono">Progreso del Despertar</p>
            </div>
            <span className="material-symbols-outlined text-amber-400 text-xl">trending_up</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="xpColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" opacity={0.4} />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 9 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 9 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '12px', fontSize: '11px' }}
                  formatter={(val: any) => [`+${val} XP`, 'XP Ganada']}
                />
                <Area type="monotone" dataKey="xpEarned" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#xpColor)" name="XP Ganada" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset System */}
      <section className="bg-red-950/20 border border-red-500/30 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-red-400 text-sm font-black uppercase tracking-wider">
            Zona de Seguridad del Sistema
          </h4>
          <p className="text-slate-400 text-xs mt-0.5">
            Restablece todas las estadísticas, inventario y nivel al estado de Despertar inicial.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-5 py-2.5 bg-red-900/60 hover:bg-red-600 border border-red-500/50 text-white text-xs font-black uppercase rounded-xl transition-all"
        >
          Restablecer Todo
        </button>
      </section>
    </div>
  );
};

export default Analytics;
