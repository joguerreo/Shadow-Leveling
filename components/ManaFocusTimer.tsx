import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { triggerHaptic } from '../utils/gameFx';
import { HoldToCompleteButton } from './HoldToCompleteButton';

export type FocusPhase = 'focus' | 'short_break' | 'long_break';
export type AmbientSoundMode = 'alpha' | 'rain' | 'noise' | 'off';

interface ManaFocusTimerProps {
  totalSeconds: number;
  secondsRemaining: number;
  isRunning: boolean;
  isPaused?: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onAdjustTime?: (deltaMinutes: number) => void;
  onComplete?: () => void;
  title?: string;
  subtitle?: string;
  ambientMode?: AmbientSoundMode;
  onAmbientChange?: (mode: AmbientSoundMode) => void;
  phase?: FocusPhase;
  onPhaseChange?: (phase: FocusPhase) => void;
  compact?: boolean;
  showAuraEffects?: boolean;
  className?: string;
}

export const ManaFocusTimer: React.FC<ManaFocusTimerProps> = ({
  totalSeconds,
  secondsRemaining,
  isRunning,
  isPaused = false,
  onTogglePlay,
  onReset,
  onAdjustTime,
  onComplete,
  title,
  subtitle,
  ambientMode = 'alpha',
  onAmbientChange,
  phase = 'focus',
  onPhaseChange,
  compact = false,
  showAuraEffects = true,
  className = '',
}) => {
  const [breathePhase, setBreathePhase] = useState<'inhale' | 'exhale'>('inhale');

  // Gentle 4s / 4s breathing rhythm cycle for active focus concentration
  useEffect(() => {
    if (!isRunning || isPaused) return;
    const interval = setInterval(() => {
      setBreathePhase((prev) => (prev === 'inhale' ? 'exhale' : 'inhale'));
    }, 4000);
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  // Format MM:SS with leading zeroes
  const formatTime = (secs: number) => {
    const m = Math.floor(Math.max(0, secs) / 60);
    const s = Math.max(0, secs) % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Safe percentage calculation (0 to 100)
  const validTotal = Math.max(1, totalSeconds);
  const elapsed = validTotal - Math.max(0, secondsRemaining);
  const progressRatio = Math.min(Math.max(elapsed / validTotal, 0), 1);
  const progressPct = progressRatio * 100;
  const isCritical = isRunning && secondsRemaining > 0 && secondsRemaining <= 60;

  // Geometry for SVG dial (viewBox: 240 x 240, center at 120, 120)
  const size = compact ? 200 : 250;
  const center = 120;
  const radius = compact ? 88 : 96;
  const strokeWidth = compact ? 9 : 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Position of leading glowing particle bead on the circle arc
  const currentAngleRad = -Math.PI / 2 + 2 * Math.PI * progressRatio;
  const beadX = center + radius * Math.cos(currentAngleRad);
  const beadY = center + radius * Math.sin(currentAngleRad);

  // Dynamic Theme Colors based on phase and urgency
  const getPhaseStyles = () => {
    if (isCritical) {
      return {
        primary: '#ef4444',
        secondary: '#f87171',
        glow: 'rgba(239, 68, 68, 0.45)',
        badgeBg: 'bg-red-500/20 border-red-500/50 text-red-400',
        label: '¡Maná Crítico!',
      };
    }
    if (phase === 'short_break') {
      return {
        primary: '#10b981',
        secondary: '#34d399',
        glow: 'rgba(16, 185, 129, 0.35)',
        badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
        label: 'Descanso Breve (Recuperación)',
      };
    }
    if (phase === 'long_break') {
      return {
        primary: '#fbbf24',
        secondary: '#f59e0b',
        glow: 'rgba(251, 191, 36, 0.35)',
        badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
        label: 'Descanso Extendido (Reposo)',
      };
    }
    return {
      primary: '#00f0ff',
      secondary: '#6366f1',
      glow: 'rgba(0, 240, 255, 0.35)',
      badgeBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
      label: 'Canalización de Enfoque Profundo',
    };
  };

  const currentTheme = getPhaseStyles();

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Ambient Mana Aura Glow Backdrop */}
      {showAuraEffects && (
        <div
          className={`absolute inset-0 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
            isRunning && !isPaused
              ? breathePhase === 'inhale'
                ? 'scale-110 opacity-70'
                : 'scale-95 opacity-40'
              : 'opacity-20'
          }`}
          style={{
            background: `radial-gradient(circle at center, ${currentTheme.glow} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Phase Selector Tabs (Focus / Short Break / Long Break) */}
      {onPhaseChange && (
        <div className="inline-flex rounded-xl bg-black/60 p-1 border border-white/10 text-xs font-mono mb-4 z-10 shadow-lg">
          <button
            onClick={() => {
              sound.playBeep(480, 0.03);
              onPhaseChange('focus');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              phase === 'focus'
                ? 'bg-cyan-500/20 border border-cyan-500/60 text-cyan-300 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">psychology</span>
            <span>Enfoque</span>
          </button>
          <button
            onClick={() => {
              sound.playBeep(520, 0.03);
              onPhaseChange('short_break');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              phase === 'short_break'
                ? 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">spa</span>
            <span>Descanso (5m)</span>
          </button>
          <button
            onClick={() => {
              sound.playBeep(560, 0.03);
              onPhaseChange('long_break');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              phase === 'long_break'
                ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">bedtime</span>
            <span>Pausa (15m)</span>
          </button>
        </div>
      )}

      {/* The Circular Mana Arc Canvas */}
      <div className="relative flex items-center justify-center z-10" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full overflow-visible"
          style={{ filter: `drop-shadow(0 0 16px ${currentTheme.glow})` }}
        >
          <defs>
            {/* Mana Arc Gradient */}
            <linearGradient id="manaArcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentTheme.primary} />
              <stop offset="100%" stopColor={currentTheme.secondary} />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="manaGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Outer Rune Dial & Cardinal Ticks */}
          <circle
            cx={center}
            cy={center}
            r={radius + 12}
            fill="none"
            stroke="#1e293b"
            strokeWidth="1"
            strokeDasharray="2, 6"
            className="opacity-60"
          />

          {/* 12 Cardinal Ticks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const innerR = radius + 8;
            const outerR = radius + 15;
            const x1 = center + innerR * Math.cos(angle);
            const y1 = center + innerR * Math.sin(angle);
            const x2 = center + outerR * Math.cos(angle);
            const y2 = center + outerR * Math.sin(angle);
            const isQuarter = i % 3 === 0;

            return (
              <line
                key={`tick-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isQuarter ? currentTheme.primary : '#475569'}
                strokeWidth={isQuarter ? 2 : 1}
                className="transition-colors duration-300"
              />
            );
          })}

          {/* 2. Background Track Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#0f172a"
            strokeWidth={strokeWidth}
            className="opacity-90"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth - 4}
            className="opacity-40"
          />

          {/* 3. Foreground Progress Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#manaArcGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#manaGlow)"
            className="transition-all duration-1000 ease-linear transform -rotate-90 origin-center"
          />

          {/* 4. Active Leading Particle Bead on Ring */}
          {progressRatio > 0.01 && progressRatio < 0.99 && (
            <g filter="url(#manaGlow)">
              <circle
                cx={beadX}
                cy={beadY}
                r={strokeWidth / 1.7}
                fill="#ffffff"
                className="animate-pulse"
              />
              <circle
                cx={beadX}
                cy={beadY}
                r={strokeWidth}
                fill={currentTheme.primary}
                className="opacity-50"
              />
            </g>
          )}

          {/* 5. Audio Visualizer Equalizer Simulation Ring inside when active & audio on */}
          {isRunning && !isPaused && ambientMode !== 'off' && (
            <g className="opacity-40">
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 15 * Math.PI) / 180;
                const waveHeight = (Math.sin(i + Date.now() / 300) + 1) * 3 + 2;
                const innerR = radius - 14;
                const outerR = innerR - waveHeight;
                const x1 = center + innerR * Math.cos(angle);
                const y1 = center + innerR * Math.sin(angle);
                const x2 = center + outerR * Math.cos(angle);
                const y2 = center + outerR * Math.sin(angle);

                return (
                  <line
                    key={`wave-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={currentTheme.primary}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* Center Content: Digital Monospace Timer & Phase Status */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
          {/* Phase Badge */}
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest border mb-1 transition-all ${
              currentTheme.badgeBg
            }`}
          >
            {isPaused ? 'Pausado' : isRunning ? (breathePhase === 'inhale' ? 'Inhala' : 'Exhala') : 'Listo'}
          </span>

          {/* Big Monospace Countdown Display */}
          <span
            className={`font-mono font-black text-white tracking-tight leading-none drop-shadow-md ${
              compact ? 'text-4xl' : 'text-5xl sm:text-6xl'
            }`}
          >
            {formatTime(secondsRemaining)}
          </span>

          {/* Subtle Progress percent or label */}
          <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
            {Math.round(progressPct)}% Purificado
          </span>
        </div>
      </div>

      {/* Title / Objective */}
      {(title || subtitle) && (
        <div className="text-center mt-3 mb-1 max-w-sm px-2">
          {title && (
            <h4 className="text-white text-sm sm:text-base font-black uppercase tracking-wider italic font-display truncate">
              {title}
            </h4>
          )}
          {subtitle && (
            <p className="text-slate-400 text-xs line-clamp-1 font-mono">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Main Interactive Controls Bar */}
      <div className="flex items-center justify-center gap-3 mt-4 w-full max-w-sm z-10">
        {/* Time Adjustments (-5 min) */}
        {onAdjustTime && (
          <button
            onClick={() => {
              triggerHaptic('light');
              sound.playBeep(420, 0.03);
              onAdjustTime(-5);
            }}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-all active:scale-95 text-xs font-mono font-bold"
            title="Restar 5 minutos"
          >
            -5m
          </button>
        )}

        {/* Primary Play / Pause Toggle Button */}
        <button
          onClick={() => {
            triggerHaptic('impact');
            sound.playBeep(isRunning ? 480 : 640, 0.04);
            onTogglePlay();
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
              : 'bg-gradient-to-r from-primary via-cyan-500 to-indigo-600 hover:brightness-110 text-white shadow-cyan-500/30'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {isRunning ? (isPaused ? 'play_arrow' : 'pause') : 'play_arrow'}
          </span>
          <span>{isRunning ? (isPaused ? 'Reanudar' : 'Pausar') : 'Iniciar Incursión'}</span>
        </button>

        {/* Reset Button */}
        <button
          onClick={() => {
            triggerHaptic('light');
            sound.playBeep(380, 0.03);
            onReset();
          }}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-all active:scale-95"
          title="Reiniciar temporizador"
        >
          <span className="material-symbols-outlined text-base">replay</span>
        </button>

        {/* Time Adjustments (+5 min) */}
        {onAdjustTime && (
          <button
            onClick={() => {
              triggerHaptic('light');
              sound.playBeep(580, 0.03);
              onAdjustTime(5);
            }}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-all active:scale-95 text-xs font-mono font-bold"
            title="Sumar 5 minutos"
          >
            +5m
          </button>
        )}

        {/* Victory Sello Táctil (Claim/Complete session) */}
        {onComplete && (
          <HoldToCompleteButton
            variant="icon"
            size="md"
            onComplete={onComplete}
            colorVariant="gold"
            icon="military_tech"
            title="Mantén presionado para sellar y reclamar la recompensa"
          />
        )}
      </div>

      {/* Ambient Audio Soundscape Selector */}
      {onAmbientChange && (
        <div className="w-full max-w-sm mt-4 p-2.5 bg-black/40 rounded-2xl border border-white/5 space-y-2 z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs text-primary">graphic_eq</span>
              Resonancia Sonora:
            </span>
            {ambientMode !== 'off' && isRunning && (
              <span className="text-[9px] font-mono text-cyan-400 animate-pulse flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-cyan-400" />
                Audio Activo
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'off', label: 'Silencio', icon: 'volume_off' },
              { id: 'alpha', label: 'Alfa 432Hz', icon: 'graphic_eq' },
              { id: 'rain', label: 'Lluvia', icon: 'water_drop' },
              { id: 'noise', label: 'Cósmico', icon: 'air' },
            ].map((amb) => (
              <button
                key={amb.id}
                onClick={() => {
                  triggerHaptic('light');
                  sound.playBeep(520, 0.02);
                  onAmbientChange(amb.id as AmbientSoundMode);
                }}
                className={`p-2 rounded-xl text-[10px] font-mono font-bold flex flex-col items-center gap-1 transition-all ${
                  ambientMode === amb.id
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{amb.icon}</span>
                <span className="truncate">{amb.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManaFocusTimer;
