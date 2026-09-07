import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { sound } from '../utils/sound';

interface FocusDungeonModalProps {
  player: Player;
  onClose: () => void;
  onSessionComplete: (durationMinutes: number, xpReward: number, goldReward: number) => void;
}

export const FocusDungeonModal: React.FC<FocusDungeonModalProps> = ({
  player,
  onClose,
  onSessionComplete,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [focusTask, setFocusTask] = useState<string>('Estudio profundo / Trabajo de Maná');
  const [ambientMode, setAmbientMode] = useState<'alpha' | 'rain' | 'noise' | 'off'>('alpha');
  
  // Timer states
  const [isActive, setIsActive] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(selectedDuration * 60);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Sync timer when changing preset if not active
  useEffect(() => {
    if (!isActive) {
      setSecondsRemaining(selectedDuration * 60);
    }
  }, [selectedDuration, isActive]);

  // Main countdown loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !isPaused && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isActive && secondsRemaining === 0) {
      // Completed!
      handleCompleteSession();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, secondsRemaining]);

  const handleStart = () => {
    sound.playAwakening();
    sound.speakSystemVoice(`Iniciando Mazmorra de Concentración de ${selectedDuration} minutos. Concentra tu maná.`);
    setIsActive(true);
    setIsPaused(false);
    if (ambientMode !== 'off') {
      sound.playAmbient(ambientMode);
    }
  };

  const handlePauseToggle = () => {
    sound.playBeep(450, 0.04);
    setIsPaused(!isPaused);
  };

  const handleCancel = () => {
    sound.stopAmbient();
    setIsActive(false);
    setIsPaused(false);
    setSecondsRemaining(selectedDuration * 60);
  };

  const handleAmbientChange = (mode: 'alpha' | 'rain' | 'noise' | 'off') => {
    setAmbientMode(mode);
    sound.playBeep(600, 0.03);
    if (isActive) {
      sound.playAmbient(mode);
    }
  };

  const handleCompleteSession = () => {
    sound.stopAmbient();
    sound.playRaidVictory();
    sound.speakSystemVoice('¡Mazmorra de Concentración Conquistada! Recompensas de maná transferidas.');

    const xpEarned = selectedDuration * 40;
    const goldEarned = selectedDuration * 80;

    onSessionComplete(selectedDuration, xpEarned, goldEarned);
    onClose();
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalSeconds = selectedDuration * 60;
  const progressPct = ((totalSeconds - secondsRemaining) / totalSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/90 backdrop-blur-lg" onClick={isActive ? undefined : onClose}></div>

      <div className="relative w-full max-w-lg bg-surface-dark border-2 border-indigo-500/50 rounded-3xl shadow-[0_0_80px_rgba(99,102,241,0.25)] overflow-hidden my-8 animate-modal flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-border-dark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-indigo-400 text-2xl animate-spin">
              hourglass_bottom
            </span>
            <div>
              <h3 className="text-white text-base font-black italic uppercase tracking-wider font-display">
                Mazmorra de Concentración
              </h3>
              <p className="text-indigo-300 text-[10px] font-mono">Modo Enfoque & Escudo de Maná</p>
            </div>
          </div>

          {!isActive && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-center">
          {/* Main Countdown Visual Ring */}
          <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="96"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-900"
                fill="transparent"
              />
              <circle
                cx="112"
                cy="112"
                r="96"
                stroke="currentColor"
                strokeWidth="10"
                className="text-indigo-500 transition-all duration-1000 ease-linear shadow-lg"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 96}
                strokeDashoffset={2 * Math.PI * 96 * (1 - progressPct / 100)}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
              <span className="text-4xl md:text-5xl font-black font-mono text-white text-glow tracking-tighter">
                {formatTime(secondsRemaining)}
              </span>
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                {isActive ? (isPaused ? 'Pausado' : 'Canalizando Maná') : 'Listo'}
              </span>
            </div>
          </div>

          {/* Task Description */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
              Objetivo de la Incursión:
            </span>
            {isActive ? (
              <p className="text-white text-sm font-bold truncate max-w-sm mx-auto">{focusTask}</p>
            ) : (
              <input
                type="text"
                value={focusTask}
                onChange={(e) => setFocusTask(e.target.value)}
                placeholder="Escribe tu tarea de estudio o trabajo..."
                className="w-full bg-surface-card border border-border-dark rounded-xl px-4 py-2.5 text-xs text-white text-center placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            )}
          </div>

          {/* Presets (Only when not active) */}
          {!isActive && (
            <div className="space-y-3">
              <div className="flex justify-center gap-2">
                {[
                  { label: 'Pomodoro (25m)', value: 25 },
                  { label: 'Foco Profundo (50m)', value: 50 },
                  { label: 'Raid Supremo (90m)', value: 90 },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      sound.playBeep(550, 0.03);
                      setSelectedDuration(preset.value);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedDuration === preset.value
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 scale-105'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Ambient Audio Selection */}
              <div className="p-3 bg-black/40 rounded-2xl border border-white/5 space-y-2">
                <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase block">
                  Paisaje Sonoro de Maná (Audio Sintetizado):
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'alpha', label: 'Ondas Alfa', icon: 'graphic_eq' },
                    { id: 'rain', label: 'Lluvia', icon: 'water_drop' },
                    { id: 'noise', label: 'Ruido Cósmico', icon: 'blur_on' },
                    { id: 'off', label: 'Silencio', icon: 'volume_off' },
                  ].map((amb) => (
                    <button
                      key={amb.id}
                      onClick={() => handleAmbientChange(amb.id as any)}
                      className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                        ambientMode === amb.id
                          ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">{amb.icon}</span>
                      <span className="text-[10px] truncate">{amb.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            {!isActive ? (
              <button
                onClick={handleStart}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-primary to-accent hover:from-indigo-500 hover:to-accent text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-600/40 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">play_arrow</span>
                Entrar a la Mazmorra ({selectedDuration} Min)
              </button>
            ) : (
              <>
                <button
                  onClick={handlePauseToggle}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl transition-all"
                >
                  {isPaused ? 'Reanudar' : 'Pausar'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 font-bold text-xs uppercase rounded-xl transition-all"
                >
                  Abandonar Mazmorra
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusDungeonModal;
