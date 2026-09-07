import React, { useState, useRef } from 'react';
import { Player, Quest, Dungeon, ShadowExpedition, SystemLog, HunterSkill, HunterAchievement, WorldBoss } from '../types';
import { exportBackupJSON, importBackupJSON } from '../utils/storage';
import { sound } from '../utils/sound';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
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
  logs: SystemLog[];
  onRestoreBackup: (data: {
    player: Player;
    quests: Quest[];
    dungeons: Dungeon[];
    expeditions: ShadowExpedition[];
    skills: HunterSkill[];
    achievements: HunterAchievement[];
    bosses: WorldBoss[];
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
  logs,
  onRestoreBackup,
  onResetSystem,
}) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const history = player.activityHistory || [];

  // Data for Radar Chart (Attributes)
  const radarData = [
    { subject: 'Fuerza (STR)', value: player.attributes.str.value, fullMark: 100 },
    { subject: 'Inteligencia (INT)', value: player.attributes.int.value, fullMark: 100 },
    { subject: 'Vitalidad (VIT)', value: player.attributes.vit.value, fullMark: 100 },
    { subject: 'Agilidad (AGI)', value: player.attributes.agi.value, fullMark: 100 },
    { subject: 'Sabiduría (WIS)', value: player.attributes.wis.value, fullMark: 100 },
    { subject: 'Carisma (CHA)', value: player.attributes.cha.value, fullMark: 100 },
  ];

  const handleExport = () => {
    sound.playBeep(700, 0.08);
    exportBackupJSON(player, quests, dungeons, expeditions, skills, achievements, bosses, logs);
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deep Work Focus Time */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-white text-base font-black uppercase italic font-display">
              Minutos de Deep Work (Enfoque)
            </h4>
            <span className="material-symbols-outlined text-primary text-xl">schedule</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="focusColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4d6aff" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#4d6aff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" opacity={0.4} />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="deepWorkMinutes" stroke="#4d6aff" strokeWidth={3} fillOpacity={1} fill="url(#focusColor)" name="Minutos Focus" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workout Reps Volume */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-white text-base font-black uppercase italic font-display">
              Repeticiones de Entrenamiento Físico
            </h4>
            <span className="material-symbols-outlined text-accent text-xl">fitness_center</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" opacity={0.4} />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="workoutReps" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Repeticiones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attribute Hexagon / Radar */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-white text-base font-black uppercase italic font-display">
              Polígono de Atributos del Cazador
            </h4>
            <span className="material-symbols-outlined text-emerald-400 text-xl">hexagon</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#30363d" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis stroke="#4b5563" tick={{ fontSize: 8 }} />
                <Radar name="Atributos" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* XP Growth Trend */}
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-white text-base font-black uppercase italic font-display">
              Experiencia Acumulada (XP)
            </h4>
            <span className="material-symbols-outlined text-yellow-400 text-xl">trending_up</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="xpColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" opacity={0.4} />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="xpEarned" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#xpColor)" name="XP Ganada" />
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
