import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';

interface PenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompletePenalty: () => void;
}

const PenaltyModal: React.FC<PenaltyModalProps> = ({ isOpen, onClose, onCompletePenalty }) => {
  const [exercises, setExercises] = useState([
    { name: '100 Flexiones de Brazos (Pushups)', current: 0, target: 100 },
    { name: '100 Sentadillas Profundas (Squats)', current: 0, target: 100 },
    { name: '100 Abdominales (Situps)', current: 0, target: 100 },
    { name: 'Carrera / Cardio de Emergencia (10km / 30m)', current: 0, target: 1 },
  ]);

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(14400); // 4 hours countdown

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
    sound.playBeep(440, 0.04);
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i === idx) {
          const next = Math.min(ex.target, ex.current + amount);
          return { ...ex, current: next };
        }
        return ex;
      })
    );
  };

  const allCompleted = exercises.every((e) => e.current >= e.target);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
      <div className="relative w-full max-w-xl bg-[#110505] border-2 border-red-600 rounded-2xl shadow-[0_0_60px_rgba(239,68,68,0.5)] overflow-hidden animate-modal">
        {/* Header Alert */}
        <div className="bg-gradient-to-r from-red-950 via-red-900/40 to-transparent p-6 border-b border-red-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500 text-3xl animate-bounce">warning</span>
            <div>
              <h3 className="text-red-500 text-2xl font-black italic tracking-tighter uppercase font-mono">
                [ ZONA DE PENALIZACIÓN ]
              </h3>
              <p className="text-red-300/80 text-xs font-mono tracking-widest">
                MISIÓN DE SUPERVIVENCIA DE EMERGENCIA
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-red-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="bg-red-950/40 border border-red-800/40 rounded-xl p-4 text-center">
            <span className="text-[10px] font-black uppercase text-red-400 tracking-[0.2em] block mb-1">
              TIEMPO PARA EL FIN DEL PROTOCOLO
            </span>
            <div className="text-4xl md:text-5xl font-mono font-black text-red-500 tracking-widest animate-pulse">
              {formatTime(timeLeftSeconds)}
            </div>
            <p className="text-[11px] text-red-300/70 italic mt-2">
              "El fallo en completar los ejercicios exigidos resultará en la invocación de Ciempiés Gigantes de la Zona de Arena."
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-sm">checklist</span>
              Registro de Supervivencia
            </span>

            {exercises.map((ex, idx) => {
              const done = ex.current >= ex.target;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    done ? 'bg-red-950/20 border-red-500/50 opacity-80' : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div>
                    <span className={`text-xs font-bold ${done ? 'line-through text-red-400' : 'text-white'}`}>
                      {ex.name}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-32 h-1.5 bg-black rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 transition-all duration-300"
                          style={{ width: `${(ex.current / ex.target) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-red-400">
                        {ex.current} / {ex.target}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    {ex.target > 1 ? (
                      <>
                        <button
                          onClick={() => incrementExercise(idx, 10)}
                          className="px-2.5 py-1 bg-red-900/60 hover:bg-red-800 text-white rounded text-xs font-black"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => incrementExercise(idx, 25)}
                          className="px-2.5 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-xs font-black"
                        >
                          +25
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => incrementExercise(idx, 1)}
                        className={`px-3 py-1 rounded text-xs font-black ${
                          done ? 'bg-red-800 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
                        }`}
                      >
                        {done ? 'Completado' : 'Hecho'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                if (allCompleted) {
                  onCompletePenalty();
                } else {
                  onClose();
                }
              }}
              className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
                allCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                  : 'bg-red-700/60 hover:bg-red-700 text-white'
              }`}
            >
              {allCompleted ? 'Reclamar Supervivencia y Salir de la Zona' : 'Volver y Seguir Entrenando'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PenaltyModal;
