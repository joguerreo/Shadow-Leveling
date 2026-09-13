import React from 'react';
import { Player } from '../types';
import { HunterAvatar } from './avatars/HunterAvatar';
import { triggerHaptic } from '../utils/gameFx';

interface HunterLevelCoreProps {
  player: Player;
  onOpenProfile?: () => void;
  size?: 'md' | 'lg' | 'xl';
}

export const HunterLevelCore: React.FC<HunterLevelCoreProps> = ({
  player,
  onOpenProfile,
  size = 'lg',
}) => {
  const currentXp = player.xp || 0;
  const maxXp = player.maxXp || 1000;
  const progressPct = Math.min(1, Math.max(0, currentXp / maxXp));

  // Circular calculations
  const dimension = size === 'xl' ? 128 : size === 'lg' ? 104 : 84;
  const strokeWidth = size === 'xl' ? 7 : 5;
  const radius = (dimension - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressPct);

  const isMaxOrReady = progressPct >= 0.95;

  return (
    <div
      onClick={() => {
        triggerHaptic('light');
        onOpenProfile?.();
      }}
      className="relative flex items-center justify-center cursor-pointer group/core shrink-0 select-none touch-manipulation"
      title="Núcleo del Cazador: Toca para ver tu Hoja de Perfil"
      style={{ width: dimension, height: dimension }}
    >
      {/* Outer Breathing Glow Halo */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 animate-hunter-breathe ${
          isMaxOrReady
            ? 'bg-amber-500/20 blur-md shadow-[0_0_20px_rgba(255,207,107,0.4)]'
            : 'bg-cyan-500/15 blur-md shadow-[0_0_18px_rgba(0,240,255,0.35)]'
        }`}
      />

      {/* SVG Circular Progress Ring */}
      <svg
        className="w-full h-full -rotate-90 relative z-10"
        viewBox={`0 0 ${dimension} ${dimension}`}
      >
        {/* Track Background */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="rgba(12, 19, 34, 0.95)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
        />

        {/* Dynamic Progress Fill */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke={isMaxOrReady ? '#ffcf6b' : '#00f0ff'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
          style={{
            filter: isMaxOrReady
              ? 'drop-shadow(0 0 8px rgba(255, 207, 107, 0.8))'
              : 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.7))',
          }}
        />
      </svg>

      {/* Avatar / Core Center */}
      <div className="absolute inset-0 flex items-center justify-center z-20 group-hover/core:scale-105 transition-transform duration-300">
        <div className="relative">
          <HunterAvatar
            avatarId={player.avatarId || 'monarch-shadow'}
            frameId={player.avatarFrame || 'frame-e'}
            size={size === 'xl' ? 'xl' : 'lg'}
            showGlow={false}
            animated
            className={size === 'xl' ? 'size-20' : size === 'lg' ? 'size-16' : 'size-14'}
          />

          {/* Level Pill floating at the bottom */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#090d16] border border-cyan-400/50 rounded-full shadow-lg shadow-black/80 flex items-center gap-1 z-30">
            <span className="text-[9px] font-black font-mono text-cyan-300 tracking-wider">
              LVL {player.level}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Evolution or Edit Marker */}
      <div className="absolute top-0 right-0 z-30 size-5 bg-cyan-500 rounded-full flex items-center justify-center text-black font-black text-[10px] shadow-sm shadow-cyan-500/50 group-hover/core:scale-110 transition-transform">
        <span className="material-symbols-outlined text-[11px]">bolt</span>
      </div>
    </div>
  );
};
