import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { sound } from '../utils/sound';
import { ManaFocusTimer, FocusPhase, AmbientSoundMode } from './ManaFocusTimer';

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
  const [ambientMode, setAmbientMode] = useState<AmbientSoundMode>('alpha');
  const [phase, setPhase] = useState<FocusPhase>('focus');
  
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
    if (!isActive) {
      handleStart();
      return;
    }
    sound.playBeep(450, 0.04);
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    sound.stopAmbient();
    setIsActive(false);
    setIsPaused(false);
    setSecondsRemaining(selectedDuration * 60);
  };

  const handleAdjustTime = (deltaMinutes: number) => {
    const deltaSecs = deltaMinutes * 60;
    setSecondsRemaining((prev) => Math.max(60, prev + deltaSecs));
    setSelectedDuration((prev) => Math.max(1, Math.round((prev * 60 + deltaSecs) / 60)));
  };

  const handleAmbientChange = (mode: AmbientSoundMode) => {
    setAmbientMode(mode);
    if (isActive) {
      sound.playAmbient(mode);
    }
  };

  const handlePhaseChange = (newPhase: FocusPhase) => {
    setPhase(newPhase);
    sound.stopAmbient();
    setIsActive(false);
    setIsPaused(false);
    if (newPhase === 'short_break') {
      setSelectedDuration(5);
      setSecondsRemaining(5 * 60);
    } else if (newPhase === 'long_break') {
      setSelectedDuration(15);
      setSecondsRemaining(15 * 60);
    } else {
      setSelectedDuration(25);
      setSecondsRemaining(25 * 60);
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

  const totalSeconds = selectedDuration * 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="fixed inset-0 bg-black/90 backdrop-blur-lg" onClick={isActive ? undefined : onClose}></div>

      <div className="relative w-full max-w-lg bg-surface-dark border-2 border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_80px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col h-[90dvh] sm:h-auto sm:max-h-[90vh] animate-modal">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-border-dark flex items-center justify-between gap-3 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className="material-symbols-outlined text-cyan-400 text-2xl animate-spin shrink-0">
              hourglass_bottom
            </span>
            <div className="min-w-0">
              <h3 className="text-white text-sm sm:text-base font-black italic uppercase tracking-wider font-display truncate">
                Mazmorra de Concentración
              </h3>
              <p className="text-cyan-300 text-[10px] font-mono truncate">Temporizador de Maná & Deep Work Pomodoro</p>
            </div>
          </div>

          {!isActive && (
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] text-slate-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center transition-colors shrink-0"
              aria-label="Cerrar"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 text-center overflow-y-auto overscroll-contain touch-pan-y flex-1">
          {/* Circular Mana Arc Timer with Aura */}
          <ManaFocusTimer
            totalSeconds={totalSeconds}
            secondsRemaining={secondsRemaining}
            isRunning={isActive}
            isPaused={isPaused}
            onTogglePlay={handlePauseToggle}
            onReset={handleReset}
            onAdjustTime={handleAdjustTime}
            onComplete={isActive ? handleCompleteSession : undefined}
            ambientMode={ambientMode}
            onAmbientChange={handleAmbientChange}
            phase={phase}
            onPhaseChange={handlePhaseChange}
            title={focusTask}
            subtitle={phase === 'focus' ? 'Mantén la mirada fija en el objetivo' : 'Descansa y recupera tu flujo de maná'}
          />

          {/* Task Description Input when idle */}
          {!isActive && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                Objetivo de la Incursión:
              </span>
              <input
                type="text"
                value={focusTask}
                onChange={(e) => setFocusTask(e.target.value)}
                placeholder="Escribe tu objetivo de estudio o proyecto..."
                className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-2.5 text-xs text-white text-center placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>
          )}

          {/* Duration Presets (Only when not active and in focus mode) */}
          {!isActive && phase === 'focus' && (
            <div className="pt-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-2">
                Preajustes de Canalización:
              </span>
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
                      setSecondsRemaining(preset.value * 60);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      selectedDuration === preset.value
                        ? 'bg-cyan-500 text-black font-black shadow-lg shadow-cyan-500/40 scale-105'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Abandon Button when active */}
          {isActive && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 font-mono font-bold text-xs uppercase rounded-xl transition-all"
              >
                Abandonar Mazmorra
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusDungeonModal;
