import React, { useState, useEffect } from 'react';
import { Player, Dungeon, DungeonTask } from '../types';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface DungeonListProps {
  player: Player;
  dungeons: Dungeon[];
  onCompleteDungeon: (dungeon: Dungeon) => void;
  onOpenCreateDungeonModal: () => void;
}

const DungeonList: React.FC<DungeonListProps> = ({
  player,
  dungeons,
  onCompleteDungeon,
  onOpenCreateDungeonModal,
}) => {
  const [activeDungeonId, setActiveDungeonId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [initialSeconds, setInitialSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [workoutTasks, setWorkoutTasks] = useState<Record<string, DungeonTask[]>>({});
  const [ambientMode, setAmbientMode] = useState<'off' | 'alpha' | 'rain' | 'noise'>('off');
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  // Initialize workout tasks
  useEffect(() => {
    const tasksMap: Record<string, DungeonTask[]> = {};
    dungeons.forEach((d) => {
      if (d.tasks) {
        tasksMap[d.id] = d.tasks;
      }
    });
    setWorkoutTasks(tasksMap);
  }, [dungeons]);

  // Dynamic Browser Tab Title with Countdown
  useEffect(() => {
    const activeDungeon = dungeons.find((d) => d.id === activeDungeonId);
    if (activeDungeon && isRunning) {
      const mins = Math.floor(timerSeconds / 60);
      const secs = timerSeconds % 60;
      document.title = `[${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}] ${activeDungeon.name || activeDungeon.title} - Solo Leveling`;
    } else {
      document.title = 'System: Shadow Leveling';
    }

    return () => {
      document.title = 'System: Shadow Leveling';
    };
  }, [activeDungeonId, isRunning, timerSeconds, dungeons]);

  // Request browser notification permission once
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            handleDungeonVictory();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerSeconds]);

  const startDungeonTimer = (dungeon: Dungeon, customMinutes?: number) => {
    sound.playBeep(650, 0.1, 'sawtooth');
    setActiveDungeonId(dungeon.id);
    const duration = customMinutes || dungeon.durationMinutes || 25;
    const secs = duration * 60;
    setTimerSeconds(secs);
    setInitialSeconds(secs);
    setIsRunning(true);
  };

  const toggleTimer = () => {
    sound.playBeep(isRunning ? 400 : 700, 0.05);
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    sound.playBeep(350, 0.05);
    setIsRunning(false);
    setTimerSeconds(initialSeconds);
  };

  const setAmbient = (mode: 'off' | 'alpha' | 'rain' | 'noise') => {
    setAmbientMode(mode);
    if (mode === 'off') {
      sound.stopAmbientFocus();
    } else {
      sound.startAmbientFocus(mode);
    }
  };

  const handleDungeonVictory = () => {
    sound.stopAmbientFocus();
    setAmbientMode('off');
    const dungeon = dungeons.find((d) => d.id === activeDungeonId);
    if (dungeon) {
      sound.playRaidVictory();
      sound.speakSystemVoice(`¡Mazmorra purificada! Has superado la instancia ${dungeon.name || dungeon.title}.`);

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('¡Mazmorra Purificada!', {
            body: `Has completado exitosamente la instancia: ${dungeon.name || dungeon.title}. Recompensas asignadas.`,
            icon: '/icon.png',
          });
        } catch {
          // Ignore if notification fails in iframe
        }
      }

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#4d6aff', '#8b5cf6', '#f59e0b', '#10b981'],
        });
      } catch {
        // ignore
      }
      onCompleteDungeon(dungeon);
      setActiveDungeonId(null);
    }
  };

  const incrementTask = (dungeonId: string, taskId: string, amount: number) => {
    sound.playBeep(500, 0.03);
    setWorkoutTasks((prev) => {
      const currentTasks = prev[dungeonId] || [];
      const updated = currentTasks.map((t) => {
        if (t.id === taskId) {
          const next = Math.min(t.target, t.current + amount);
          return { ...t, current: next, completed: next >= t.target };
        }
        return t;
      });

      // Check if all tasks completed
      const allDone = updated.every((t) => t.completed);
      if (allDone) {
        const dungeon = dungeons.find((d) => d.id === dungeonId);
        if (dungeon) {
          sound.playRaidVictory();
          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#4d6aff', '#8b5cf6', '#f59e0b', '#10b981'],
            });
          } catch {
            // ignore
          }
          onCompleteDungeon(dungeon);
        }
      }

      return { ...prev, [dungeonId]: updated };
    });
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeDungeon = dungeons.find((d) => d.id === activeDungeonId);

  return (
    <div className="animate-fadeIn space-y-8 pb-20 md:pb-6">
      {/* Header */}
      <section className="flex flex-wrap justify-between items-end gap-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">door_open</span>
            <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-glow uppercase font-display">
              Portales & Mazmorras
            </h2>
          </div>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
            Incursiones de Enfoque Profundo (Pomodoro) y Entrenamiento Físico para Recompensas Legendarias
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onOpenCreateDungeonModal}
            className="px-5 py-2.5 bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-wider rounded-xl system-glow flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            Invocar Mazmorra
          </button>
        </div>
      </section>

      {/* Active Raid / Focus Chamber (If active) */}
      {activeDungeon && (
        <section className="relative overflow-hidden rounded-3xl border-2 border-primary bg-gradient-to-br from-[#0b132b] via-bg-dark to-bg-dark p-6 md:p-10 shadow-[0_0_50px_rgba(77,106,255,0.4)] animate-fadeIn">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 max-w-xl text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <span className="size-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                  [ INCURSIÓN EN PROGRESO: {activeDungeon.rank} ]
                </span>
              </div>
              <h3 className="text-white text-2xl md:text-4xl font-black uppercase italic font-display">
                {activeDungeon.title || activeDungeon.name}
              </h3>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                {activeDungeon.description}
              </p>

              {/* Focus Duration Quick Selector */}
              <div className="pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                  Ajustar Duración de Sesión:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[15, 25, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        sound.playBeep(520, 0.04);
                        const s = mins * 60;
                        setTimerSeconds(s);
                        setInitialSeconds(s);
                        setIsRunning(true);
                      }}
                      className="px-2.5 py-1 bg-white/5 hover:bg-primary hover:text-white rounded-lg text-xs font-mono font-bold text-slate-300 transition-all border border-white/5"
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Ambient Focus Generator */}
              <div className="pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Sonido Ambiental de Enfoque Profundo:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'off', label: 'Silencio', icon: 'volume_off' },
                    { id: 'alpha', label: 'Alpha 432Hz', icon: 'graphic_eq' },
                    { id: 'rain', label: 'Lluvia Mental', icon: 'water_drop' },
                    { id: 'noise', label: 'Ruido Blanco', icon: 'air' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setAmbient(m.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        ambientMode === m.id
                          ? 'bg-accent text-white shadow-md shadow-purple-500/30'
                          : 'bg-white/5 hover:bg-white/10 text-slate-400'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{m.icon}</span>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Clock & Controls */}
            <div className="flex flex-col items-center gap-4 bg-surface-dark/90 border border-border-dark p-6 rounded-2xl w-full lg:w-80 shadow-2xl">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Tiempo Restante
              </span>
              <div className="text-5xl md:text-6xl font-mono font-black text-white text-glow">
                {formatTimer(timerSeconds)}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                  style={{
                    width: `${initialSeconds > 0 ? ((initialSeconds - timerSeconds) / initialSeconds) * 100 : 0}%`,
                  }}
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 w-full pt-2">
                <button
                  onClick={toggleTimer}
                  className={`flex-1 py-3 rounded-xl font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isRunning
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-primary hover:bg-accent text-white system-glow'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {isRunning ? 'pause' : 'play_arrow'}
                  </span>
                  {isRunning ? 'Pausar' : 'Reanudar'}
                </button>
                <button
                  onClick={resetTimer}
                  className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all"
                  title="Reiniciar"
                >
                  <span className="material-symbols-outlined text-base">replay</span>
                </button>
                <button
                  onClick={handleDungeonVictory}
                  className="p-3 bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-400 hover:text-white rounded-xl transition-all"
                  title="Completar Raid Ahora"
                >
                  <span className="material-symbols-outlined text-base">check</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dungeons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dungeons.map((dungeon) => {
          const isTimerType = dungeon.type === 'focus_timer' || dungeon.type === 'study_trial';
          const isFitnessType = dungeon.type === 'fitness_raid';
          const tasks = workoutTasks[dungeon.id] || dungeon.tasks || [];
          const allTasksCompleted = tasks.length > 0 && tasks.every((t) => t.completed);

          return (
            <div
              key={dungeon.id}
              className={`p-6 bg-surface-dark border rounded-2xl flex flex-col justify-between transition-all hover:border-primary/50 relative overflow-hidden group ${
                dungeon.rank === 'S-RANK'
                  ? 'border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                  : 'border-border-dark'
              }`}
            >
              {/* Rank Badge */}
              <div className="flex justify-between items-start mb-4">
                <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">
                    {isFitnessType ? 'fitness_center' : 'timer'}
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-surface-card border border-white/10 rounded-lg text-xs font-black font-mono text-accent">
                  {dungeon.rank}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 mb-6">
                <h3 className="text-white text-lg font-black uppercase italic font-display">
                  {dungeon.name || dungeon.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                  {dungeon.description}
                </p>
              </div>

              {/* Rewards Badges */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2 mb-6">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                  Recompensas por Purificación:
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-mono text-primary font-bold">
                    +{dungeon.rewards.xp} XP
                  </span>
                  <span className="text-xs font-mono text-yellow-400 font-bold">
                    +{dungeon.rewards.gold} G
                  </span>
                  {dungeon.rewards.essenceStones && (
                    <span className="text-xs font-mono text-accent font-bold">
                      +{dungeon.rewards.essenceStones} Stones
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              {isTimerType ? (
                <button
                  onClick={() => startDungeonTimer(dungeon)}
                  className="w-full py-3 bg-primary hover:bg-accent text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all system-glow flex items-center justify-center gap-2 active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">hourglass_top</span>
                  Entrar a la Mazmorra ({dungeon.durationMinutes} min)
                </button>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="p-2.5 bg-surface-card rounded-lg text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-300 font-medium">{task.title}</span>
                        <span className="font-mono text-slate-400">
                          {task.current}/{task.target}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => incrementTask(dungeon.id, task.id, 5)}
                          disabled={task.completed}
                          className="px-2 py-0.5 bg-primary/20 hover:bg-primary/40 rounded text-[10px] font-bold text-primary"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => incrementTask(dungeon.id, task.id, 10)}
                          disabled={task.completed}
                          className="px-2 py-0.5 bg-primary/30 hover:bg-primary/50 rounded text-[10px] font-bold text-primary"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  ))}
                  {allTasksCompleted && (
                    <span className="block text-center text-xs font-bold text-emerald-400 uppercase">
                      ¡Entrenamiento Completado!
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DungeonList;
