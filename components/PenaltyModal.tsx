import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { GameDifficulty } from '../types';

interface PenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompletePenalty: () => void;
  difficulty?: GameDifficulty;
}

type IntensityMode = 'light' | 'normal' | 'monarch';

interface ExerciseItem {
  id: string;
  name: string;
  icon: string;
  unit: string;
  stepSmall: number;
  stepLarge: number;
  current: number;
  target: number;
}

const PenaltyModal: React.FC<PenaltyModalProps> = ({
  isOpen,
  onClose,
  onCompletePenalty,
  difficulty = 'hunter',
}) => {
  // Map game difficulty to initial intensity mode
  const initialMode: IntensityMode =
    difficulty === 'casual' ? 'light' : difficulty === 'monarch' ? 'monarch' : 'normal';

  const [mode, setMode] = useState<IntensityMode>(initialMode);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(14400); // 4 hours countdown

  // Define targets based on intensity mode — cardio is significantly lightened (1.0 km - 2.5 km max instead of 10km)
  const getInitialExercises = (selectedMode: IntensityMode): ExerciseItem[] => {
    switch (selectedMode) {
      case 'light':
        return [
          { id: 'pushups', name: 'Flexiones de Brazos (Pushups)', icon: 'fitness_center', unit: 'reps', stepSmall: 5, stepLarge: 15, current: 0, target: 25 },
          { id: 'squats', name: 'Sentadillas Profundas (Squats)', icon: 'accessibility_new', unit: 'reps', stepSmall: 5, stepLarge: 15, current: 0, target: 30 },
          { id: 'situps', name: 'Abdominales Controlados (Situps)', icon: 'self_improvement', unit: 'reps', stepSmall: 5, stepLarge: 15, current: 0, target: 25 },
          { id: 'cardio', name: 'Cardio Ligero: Trote Suave o Caminata Rápida', icon: 'directions_run', unit: 'km', stepSmall: 0.5, stepLarge: 1.0, current: 0, target: 1.0 },
        ];
      case 'monarch':
        return [
          { id: 'pushups', name: 'Flexiones de Brazos Estrictas (Pushups)', icon: 'fitness_center', unit: 'reps', stepSmall: 10, stepLarge: 25, current: 0, target: 75 },
          { id: 'squats', name: 'Sentadillas Profundas (Squats)', icon: 'accessibility_new', unit: 'reps', stepSmall: 10, stepLarge: 25, current: 0, target: 75 },
          { id: 'situps', name: 'Abdominales Explosivos (Situps)', icon: 'self_improvement', unit: 'reps', stepSmall: 10, stepLarge: 25, current: 0, target: 75 },
          { id: 'cardio', name: 'Carrera Ligera Continua o Intervalos', icon: 'directions_run', unit: 'km', stepSmall: 0.5, stepLarge: 1.0, current: 0, target: 2.5 },
        ];
      case 'normal':
      default:
        return [
          { id: 'pushups', name: 'Flexiones de Brazos (Pushups)', icon: 'fitness_center', unit: 'reps', stepSmall: 10, stepLarge: 20, current: 0, target: 40 },
          { id: 'squats', name: 'Sentadillas Profundas (Squats)', icon: 'accessibility_new', unit: 'reps', stepSmall: 10, stepLarge: 20, current: 0, target: 40 },
          { id: 'situps', name: 'Abdominales de Acero (Situps)', icon: 'self_improvement', unit: 'reps', stepSmall: 10, stepLarge: 20, current: 0, target: 40 },
          { id: 'cardio', name: 'Cardio Ligero: Trote o Caminata Activa', icon: 'directions_run', unit: 'km', stepSmall: 0.5, stepLarge: 1.0, current: 0, target: 1.5 },
        ];
    }
  };

  const [exercises, setExercises] = useState<ExerciseItem[]>(() => getInitialExercises(initialMode));

  // Switch intensity mode and adapt targets
  const handleModeChange = (newMode: IntensityMode) => {
    sound.playBeep(520, 0.06);
    setMode(newMode);
    setExercises(getInitialExercises(newMode));
  };

  useEffect(() => {
    if (isOpen) {
      sound.playPenaltyAlert();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const incrementExercise = (idx: number, amount: number) => {
    sound.playBeep(480, 0.04);
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i === idx) {
          const next = Number(Math.min(ex.target, ex.current + amount).toFixed(1));
          return { ...ex, current: next };
        }
        return ex;
      })
    );
  };

  const completeExerciseDirectly = (idx: number) => {
    sound.playLevelUp();
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i === idx) {
          return { ...ex, current: ex.target };
        }
        return ex;
      })
    );
  };

  const allCompleted = exercises.every((e) => e.current >= e.target);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby="penalty-modal-title"
    >
      <div className="relative w-full max-w-xl my-auto max-h-[92dvh] sm:max-h-[90vh] flex flex-col bg-[#110505] border-2 border-red-600 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.45)] overflow-hidden animate-modal">
        {/* Header Alert (Fixed Top) */}
        <div className="flex-shrink-0 bg-gradient-to-r from-red-950 via-red-900/50 to-transparent p-4 sm:p-5 border-b border-red-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500 text-2xl sm:text-3xl animate-bounce">
              warning
            </span>
            <div>
              <h3
                id="penalty-modal-title"
                className="text-red-500 text-lg sm:text-2xl font-black italic tracking-tighter uppercase font-mono leading-none"
              >
                [ ZONA DE PENALIZACIÓN ]
              </h3>
              <p className="text-red-300/80 text-[10px] sm:text-xs font-mono tracking-widest mt-1">
                MISIÓN DE SUPERVIVENCIA Y PURIFICACIÓN DE HP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-400 hover:text-white transition-colors flex items-center justify-center touch-manipulation"
            aria-label="Cerrar ventana de penalización"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-5 touch-pan-y">
          {/* Countdown timer banner */}
          <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-3 sm:p-4 text-center">
            <span className="text-[10px] font-black uppercase text-red-400 tracking-[0.2em] block mb-1">
              TIEMPO PARA EL FIN DEL PROTOCOLO
            </span>
            <div className="text-3xl sm:text-5xl font-mono font-black text-red-500 tracking-widest animate-pulse">
              {formatTime(timeLeftSeconds)}
            </div>
            <p className="text-[11px] text-red-300/80 italic mt-1 sm:mt-2">
              «El Sistema purificará el 100% de tus Puntos de Salud (HP) y te otorgará +1 Punto de Estadística al superar esta prueba.»
            </p>
          </div>

          {/* Intensity Selector: Ligera, Estándar, Monarca */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs text-amber-400">tune</span>
              Intensidad de la Supervivencia:
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => handleModeChange('light')}
                className={`py-2 px-1.5 sm:px-2 rounded-xl text-center font-mono font-bold text-[11px] sm:text-xs transition-all border ${
                  mode === 'light'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/50'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                🌿 Ligera (1.0 km)
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('normal')}
                className={`py-2 px-1.5 sm:px-2 rounded-xl text-center font-mono font-bold text-[11px] sm:text-xs transition-all border ${
                  mode === 'normal'
                    ? 'bg-red-950/80 border-red-500 text-red-300 shadow-md shadow-red-950/50'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                ⚔️ Cazador (1.5 km)
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('monarch')}
                className={`py-2 px-1.5 sm:px-2 rounded-xl text-center font-mono font-bold text-[11px] sm:text-xs transition-all border ${
                  mode === 'monarch'
                    ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-md shadow-purple-950/50'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                👑 Monarca (2.5 km)
              </button>
            </div>
          </div>

          {/* Exercise Checklist */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-red-500 text-sm">checklist</span>
                Protocolo de Ejercicios
              </span>
              <span className="text-[11px] font-mono text-red-400">
                {exercises.filter((e) => e.current >= e.target).length} / {exercises.length} completados
              </span>
            </div>

            {exercises.map((ex, idx) => {
              const done = ex.current >= ex.target;
              const percent = Math.min(100, Math.round((ex.current / ex.target) * 100));

              return (
                <div
                  key={ex.id}
                  className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                    done
                      ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-[#150a0a] border-red-900/40 text-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`material-symbols-outlined text-lg ${
                          done ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {done ? 'check_circle' : ex.icon}
                      </span>
                      <div>
                        <span
                          className={`text-xs sm:text-sm font-bold block ${
                            done ? 'line-through text-emerald-400/80' : 'text-white'
                          }`}
                        >
                          {ex.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono font-bold text-red-400">
                            {ex.current} / {ex.target} {ex.unit}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">({percent}%)</span>
                        </div>
                      </div>
                    </div>

                    {done && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase border border-emerald-500/30 shrink-0">
                        Completado
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden mb-2.5">
                    <div
                      className={`h-full transition-all duration-300 ${
                        done ? 'bg-emerald-500' : 'bg-gradient-to-r from-red-600 to-rose-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Action buttons (Touch-friendly for mobile) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      disabled={done}
                      onClick={() => incrementExercise(idx, ex.stepSmall)}
                      className="flex-1 min-h-[40px] px-2 py-1.5 bg-red-950/60 hover:bg-red-900/80 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white rounded-lg text-xs font-mono font-bold border border-red-800/40 transition-all touch-manipulation"
                    >
                      +{ex.stepSmall} {ex.unit}
                    </button>

                    <button
                      type="button"
                      disabled={done}
                      onClick={() => incrementExercise(idx, ex.stepLarge)}
                      className="flex-1 min-h-[40px] px-2 py-1.5 bg-red-900/60 hover:bg-red-800/80 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white rounded-lg text-xs font-mono font-bold border border-red-700/50 transition-all touch-manipulation"
                    >
                      +{ex.stepLarge} {ex.unit}
                    </button>

                    <button
                      type="button"
                      disabled={done}
                      onClick={() => completeExerciseDirectly(idx)}
                      className="min-h-[40px] px-3 py-1.5 bg-red-700 hover:bg-red-600 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-white rounded-lg text-xs font-bold border border-red-500/50 transition-all touch-manipulation flex items-center justify-center gap-1"
                      title="Marcar este ejercicio como completado"
                    >
                      <span className="material-symbols-outlined text-sm">done_all</span>
                      <span>Hecho</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sticky Footer Action */}
        <div className="flex-shrink-0 p-3 sm:p-4 bg-[#140606] border-t border-red-900/50">
          <button
            onClick={() => {
              if (allCompleted) {
                onCompletePenalty();
              } else {
                onClose();
              }
            }}
            className={`w-full min-h-[48px] py-3 px-4 rounded-xl font-black uppercase text-xs sm:text-sm tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg touch-manipulation ${
              allCompleted
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/40 animate-pulse active:scale-98'
                : 'bg-red-800/80 hover:bg-red-700 text-white shadow-red-900/40 active:scale-98'
            }`}
          >
            {allCompleted ? (
              <>
                <span className="material-symbols-outlined text-lg">verified</span>
                <span>¡Reclamar Supervivencia y Restaurar HP al 100%!</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                <span>Volver y Continuar Entrenando</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PenaltyModal;
