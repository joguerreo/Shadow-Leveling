import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sound } from '../utils/sound';
import { triggerHaptic, triggerScreenShake } from '../utils/gameFx';

export interface HoldToCompleteButtonProps {
  onComplete: (e?: React.MouseEvent | React.TouchEvent | PointerEvent) => void;
  isCompleted?: boolean;
  disabled?: boolean;
  holdDurationMs?: number;
  label?: string;
  subLabel?: string;
  completedLabel?: string;
  colorVariant?: 'cyan' | 'gold' | 'crimson' | 'purple';
  variant?: 'icon' | 'button' | 'seal';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  completedIcon?: string;
  className?: string;
  title?: string;
}

export const HoldToCompleteButton: React.FC<HoldToCompleteButtonProps> = ({
  onComplete,
  isCompleted = false,
  disabled = false,
  holdDurationMs = 800,
  label = 'Completar',
  subLabel,
  completedLabel = 'Reclamada',
  colorVariant = 'cyan',
  variant = 'icon',
  size = 'md',
  icon = 'check',
  completedIcon = 'done_all',
  className = '',
  title = 'Mantén presionado para sellar y completar',
}) => {
  const [progress, setProgress] = useState(0); // 0 to 1
  const [isHolding, setIsHolding] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);
  const [hasCompletedJustNow, setHasCompletedJustNow] = useState(false);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const halfwayNotifiedRef = useRef<boolean>(false);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // SVG dimensions according to size/variant
  const getDimensions = () => {
    if (variant === 'seal') return { sizePx: 120, stroke: 6, radius: 52 };
    if (variant === 'icon') {
      if (size === 'sm') return { sizePx: 38, stroke: 3, radius: 15 };
      if (size === 'lg') return { sizePx: 52, stroke: 4, radius: 21 };
      return { sizePx: 44, stroke: 3.5, radius: 17.5 }; // md
    }
    // 'button'
    return { sizePx: 36, stroke: 3, radius: 14 };
  };

  const { sizePx, stroke, radius } = getDimensions();
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const colors = {
    cyan: {
      primary: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.5)',
      activeBg: 'bg-cyan-500/20',
      border: 'border-cyan-500/40',
      text: 'text-cyan-400',
    },
    gold: {
      primary: '#ffcf6b',
      glow: 'rgba(255, 207, 107, 0.5)',
      activeBg: 'bg-amber-500/20',
      border: 'border-amber-500/40',
      text: 'text-amber-400',
    },
    crimson: {
      primary: '#ff4757',
      glow: 'rgba(255, 71, 87, 0.5)',
      activeBg: 'bg-red-500/20',
      border: 'border-red-500/40',
      text: 'text-red-400',
    },
    purple: {
      primary: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.5)',
      activeBg: 'bg-purple-500/20',
      border: 'border-purple-500/40',
      text: 'text-purple-400',
    },
  }[colorVariant];

  const handleHoldComplete = useCallback(() => {
    setIsHolding(false);
    setProgress(1);
    setHasCompletedJustNow(true);

    // Physical & audio sensations
    triggerHaptic('impact');
    sound.playQuestComplete();
    triggerScreenShake('light');

    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    setShowTapHint(false);

    // Trigger parent complete
    onComplete();

    setTimeout(() => {
      setProgress(0);
      setHasCompletedJustNow(false);
    }, 600);
  }, [onComplete]);

  const cancelHold = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // If hold was released very quickly (brief tap < 250ms), guide the user
    if (startTimeRef.current && !isCompleted && !disabled) {
      const elapsed = performance.now() - startTimeRef.current;
      if (elapsed < 300 && progress < 0.4) {
        triggerHaptic('tap');
        sound.playBeep(420, 0.04);
        setShowTapHint(true);
        if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
        hintTimeoutRef.current = setTimeout(() => {
          setShowTapHint(false);
        }, 1800);
      }
    }

    startTimeRef.current = null;
    halfwayNotifiedRef.current = false;
    setIsHolding(false);
    setProgress(0);
  }, [isCompleted, disabled, progress]);

  const startHold = (e: React.PointerEvent) => {
    if (isCompleted || disabled) return;
    // Only primary mouse button or touch
    if (e.button !== undefined && e.button !== 0) return;

    // Prevent context menu or scroll cancellation on the trigger
    e.currentTarget.setPointerCapture?.(e.pointerId);

    setIsHolding(true);
    setProgress(0);
    halfwayNotifiedRef.current = false;
    startTimeRef.current = performance.now();

    // Initial subtle click sensation
    triggerHaptic('light');
    sound.playBeep(480, 0.04);

    const step = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const pct = Math.min(elapsed / holdDurationMs, 1);
      setProgress(pct);

      // Halfway vibration feedback
      if (pct >= 0.5 && !halfwayNotifiedRef.current) {
        halfwayNotifiedRef.current = true;
        triggerHaptic('tap');
        sound.playBeep(640, 0.03);
      }

      if (pct >= 1) {
        handleHoldComplete();
      } else {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, []);

  // 1. SEAL VARIANT (Dungeon Claim / Boss Seal / Heroic Action)
  if (variant === 'seal') {
    return (
      <div
        ref={containerRef}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        className={`relative select-none flex flex-col items-center justify-center cursor-pointer touch-none ${className}`}
        title={title}
      >
        <div
          className={`relative flex items-center justify-center transition-transform duration-150 ${
            isHolding ? 'scale-95' : 'hover:scale-105'
          }`}
          style={{ width: sizePx, height: sizePx }}
        >
          {/* Ambient Glow */}
          <div
            className={`absolute inset-0 rounded-full blur-md transition-opacity duration-300 ${
              isHolding ? 'opacity-90' : 'opacity-40'
            }`}
            style={{ backgroundColor: colors.glow }}
          />

          {/* SVG Progress Ring */}
          <svg
            className="w-full h-full -rotate-90 relative z-10"
            viewBox={`0 0 ${sizePx} ${sizePx}`}
          >
            <circle
              cx={sizePx / 2}
              cy={sizePx / 2}
              r={radius}
              fill="none"
              stroke="rgba(12, 19, 34, 0.9)"
              strokeWidth={stroke}
            />
            <circle
              cx={sizePx / 2}
              cy={sizePx / 2}
              r={radius}
              fill="none"
              stroke={isCompleted ? '#10b981' : colors.primary}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={isCompleted ? 0 : strokeDashoffset}
              className="transition-all duration-75 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px ${isCompleted ? '#10b981' : colors.glow})`,
              }}
            />
          </svg>

          {/* Center Seal Core */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none text-center px-2">
            <span
              className={`material-symbols-outlined text-2xl sm:text-3xl ${
                isCompleted ? 'text-emerald-400' : colors.text
              }`}
            >
              {isCompleted ? completedIcon : isHolding ? 'lock_open' : icon}
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider text-white mt-1 leading-tight">
              {isCompleted ? completedLabel : isHolding ? 'Sujeta...' : label}
            </span>
          </div>
        </div>

        {subLabel && (
          <span className="text-[10px] text-slate-400 font-mono mt-2 tracking-wider uppercase">
            {subLabel}
          </span>
        )}

        {/* Micro-hint tooltip when clicked without holding */}
        {showTapHint && (
          <div className="absolute -top-9 z-30 px-2.5 py-1 bg-cyan-950 border border-cyan-400 text-cyan-300 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap animate-bounce shadow-lg">
            ¡Mantén presionado para sellar!
          </div>
        )}
      </div>
    );
  }

  // 2. ICON VARIANT (Compact Checkmark Button on Quest Card)
  if (variant === 'icon') {
    return (
      <div
        ref={containerRef}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        className={`relative select-none flex items-center justify-center shrink-0 cursor-pointer touch-none group ${className}`}
        title={isCompleted ? completedLabel : title}
      >
        <div
          className={`relative rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90 ${
            isCompleted
              ? 'bg-emerald-950/40 border-2 border-emerald-500 text-emerald-400'
              : isHolding
              ? `${colors.activeBg} border-2 border-cyan-400 scale-95 shadow-md`
              : 'bg-[#0c1322] border-2 border-slate-700/80 hover:border-cyan-400/80 text-slate-300 hover:text-white shadow-sm'
          }`}
          style={{ width: sizePx, height: sizePx }}
        >
          {/* SVG Progress Ring Wrapping the Button */}
          {!isCompleted && (
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-10"
              viewBox={`0 0 ${sizePx} ${sizePx}`}
            >
              {isHolding && (
                <circle
                  cx={sizePx / 2}
                  cy={sizePx / 2}
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth={stroke}
                />
              )}
              <circle
                cx={sizePx / 2}
                cy={sizePx / 2}
                r={radius}
                fill="none"
                stroke={colors.primary}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-75 ease-out"
                style={{
                  filter: isHolding ? `drop-shadow(0 0 6px ${colors.glow})` : 'none',
                }}
              />
            </svg>
          )}

          {/* Center Checkmark or Completed Icon */}
          <span
            className={`material-symbols-outlined font-black text-xl relative z-20 pointer-events-none transition-transform ${
              isCompleted
                ? 'text-emerald-400 scale-100'
                : isHolding
                ? `${colors.text} scale-110`
                : 'text-slate-300 group-hover:text-cyan-400'
            }`}
          >
            {isCompleted ? completedIcon : icon}
          </span>
        </div>

        {/* Micro-hint tooltip when tapped briefly */}
        {showTapHint && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-40 px-2 py-0.5 bg-slate-900 border border-cyan-400/80 text-cyan-300 rounded-md text-[9px] font-mono font-bold whitespace-nowrap animate-bounce shadow-xl pointer-events-none">
            Sujeta 1s
          </div>
        )}
      </div>
    );
  }

  // 3. BUTTON VARIANT (Pill Button with text)
  return (
    <div
      ref={containerRef}
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      className={`relative select-none inline-flex items-center justify-center cursor-pointer touch-none ${className}`}
      title={isCompleted ? completedLabel : title}
    >
      <div
        className={`relative overflow-hidden rounded-xl px-3 sm:px-4 py-2 flex items-center gap-2 border transition-all duration-150 ${
          isCompleted
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
            : isHolding
            ? `${colors.activeBg} border-cyan-400 shadow-md scale-95`
            : 'bg-primary/20 hover:bg-primary/30 border-primary/50 text-white shadow-sm'
        }`}
      >
        {/* Progress Background Bar Filling Up horizontally during hold */}
        {!isCompleted && isHolding && (
          <div
            className="absolute inset-y-0 left-0 bg-cyan-500/40 pointer-events-none transition-all duration-75"
            style={{ width: `${progress * 100}%` }}
          />
        )}

        {/* Mini Radial Ring */}
        <div className="relative size-5 shrink-0 pointer-events-none flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="2.5"
            />
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke={isCompleted ? '#10b981' : colors.primary}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 9}
              strokeDashoffset={
                isCompleted ? 0 : 2 * Math.PI * 9 * (1 - progress)
              }
            />
          </svg>
          <span className="material-symbols-outlined text-xs absolute inset-0 flex items-center justify-center">
            {isCompleted ? completedIcon : icon}
          </span>
        </div>

        {/* Text */}
        <span className="text-xs font-black font-mono uppercase tracking-wider relative z-10 pointer-events-none">
          {isCompleted ? completedLabel : isHolding ? 'Sujeta...' : label}
        </span>
      </div>

      {/* Tap Hint */}
      {showTapHint && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-40 px-2 py-0.5 bg-slate-900 border border-cyan-400/80 text-cyan-300 rounded-md text-[9px] font-mono font-bold whitespace-nowrap animate-bounce shadow-xl pointer-events-none">
          Mantén presionado
        </div>
      )}
    </div>
  );
};
