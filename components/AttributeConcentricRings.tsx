import React, { useState } from 'react';
import { Player } from '../types';
import { sound } from '../utils/sound';
import { triggerHaptic, triggerGameImpact } from '../utils/gameFx';

interface AttributeConcentricRingsProps {
  player: Player;
  effectiveStats?: Record<string, number>;
  onAllocateStat?: (attrKey: string) => void;
  compact?: boolean;
  className?: string;
  showAllSix?: boolean;
}

interface RingAttrConfig {
  key: 'str' | 'int' | 'vit' | 'agi' | 'wis' | 'cha';
  name: string;
  code: string;
  color: string;
  glowColor: string;
  icon: string;
  bonusText: string;
}

const ALL_ATTR_CONFIGS: RingAttrConfig[] = [
  {
    key: 'str',
    name: 'Fuerza',
    code: 'STR',
    color: '#ff4757',
    glowColor: 'rgba(255, 71, 87, 0.6)',
    icon: 'fitness_center',
    bonusText: '+Dmg físico, poder de acarreo y quiebre de guardia',
  },
  {
    key: 'int',
    name: 'Intelecto',
    code: 'INT',
    color: '#00f0ff',
    glowColor: 'rgba(0, 240, 255, 0.6)',
    icon: 'psychology',
    bonusText: '+Reserva de maná, daño de hechizos e intuición de sombras',
  },
  {
    key: 'vit',
    name: 'Vitalidad',
    code: 'VIT',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    icon: 'favorite',
    bonusText: '+Salud máxima, regeneración celular y resistencia a penalizaciones',
  },
  {
    key: 'agi',
    name: 'Agilidad',
    code: 'AGI',
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.6)',
    icon: 'bolt',
    bonusText: '+Velocidad de reacción, evasión y reflejos de combate',
  },
  {
    key: 'wis',
    name: 'Enfoque (Sab)',
    code: 'WIS',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    icon: 'visibility',
    bonusText: '+Percepción extrasensorial, detección de puertas y concentración',
  },
  {
    key: 'cha',
    name: 'Carisma',
    code: 'CHA',
    color: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.6)',
    icon: 'military_tech',
    bonusText: '+Comando del ejército de sombras y lealtad de invocaciones',
  },
];

export const AttributeConcentricRings: React.FC<AttributeConcentricRingsProps> = ({
  player,
  effectiveStats,
  onAllocateStat,
  compact = false,
  className = '',
  showAllSix = true,
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'four' | 'six'>(showAllSix ? 'six' : 'four');

  // Filter attributes based on view mode
  const activeConfigs = viewMode === 'six' 
    ? ALL_ATTR_CONFIGS 
    : ALL_ATTR_CONFIGS.filter(c => ['str', 'int', 'vit', 'wis'].includes(c.key));

  const totalRings = activeConfigs.length;

  // Concentric circle geometry math (SVG center at 110, 110)
  const center = 110;
  const strokeWidth = totalRings === 6 ? 7 : 8.5;
  const maxRadius = totalRings === 6 ? 94 : 92;
  const minRadius = totalRings === 6 ? 28 : 34;
  const radiusStep = (maxRadius - minRadius) / (totalRings - 1);

  // Compute ring data with normalization (0 to 100)
  const ringsData = activeConfigs.map((cfg, index) => {
    const attrRaw = (player.attributes as any)?.[cfg.key] || (player.attributes as any)?.[cfg.key.toUpperCase()];
    const baseVal = typeof attrRaw === 'number' ? attrRaw : (Number(attrRaw?.value) || 10);
    const totalVal = effectiveStats?.[cfg.key] ?? baseVal;
    const gearBonus = Math.max(0, totalVal - baseVal);

    // Max scale ceiling dynamically adjusted based on player stats
    const maxScale = Math.max(100, Math.ceil(totalVal / 50) * 50);
    const pct = Math.min(Math.max((totalVal / maxScale), 0.05), 1);

    const radius = maxRadius - (index * radiusStep);
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - pct);

    return {
      ...cfg,
      baseVal,
      totalVal,
      gearBonus,
      pct,
      radius,
      circumference,
      strokeDashoffset,
    };
  });

  const activeSelectedAttr = ringsData.find(r => r.key === selectedKey) || null;

  return (
    <div className={`relative bg-[#0c1222]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 ${className}`}>
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-950/10 pointer-events-none rounded-2xl" />

      {/* LEFT: Concentric Rings SVG Canvas with Center Core */}
      <div className="relative shrink-0 flex items-center justify-center select-none">
        <div className="relative" style={{ width: 220, height: 220 }}>
          {/* Radial Ambient Glow */}
          <div 
            className="absolute inset-0 rounded-full blur-2xl transition-all duration-300 pointer-events-none"
            style={{
              backgroundColor: activeSelectedAttr ? activeSelectedAttr.glowColor : 'rgba(0, 240, 255, 0.15)',
            }}
          />

          <svg 
            className="w-full h-full -rotate-90 relative z-10 overflow-visible" 
            viewBox="0 0 220 220"
          >
            <defs>
              {ringsData.map(r => (
                <filter key={`glow-${r.key}`} id={`glow-${r.key}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            {/* Render Track & Fill Circles for each concentric attribute */}
            {ringsData.map((ring) => {
              const isHighlighted = selectedKey === ring.key;
              const isMuted = selectedKey !== null && !isHighlighted;

              return (
                <g 
                  key={ring.key}
                  className="cursor-pointer transition-opacity duration-200"
                  style={{ opacity: isMuted ? 0.35 : 1 }}
                  onMouseEnter={() => {
                    sound.playBeep(480, 0.02);
                    setSelectedKey(ring.key);
                  }}
                  onMouseLeave={() => setSelectedKey(null)}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedKey(selectedKey === ring.key ? null : ring.key);
                  }}
                >
                  {/* Background Track Ring */}
                  <circle
                    cx={center}
                    cy={center}
                    r={ring.radius}
                    fill="none"
                    stroke="#1a2234"
                    strokeWidth={strokeWidth}
                  />

                  {/* Dynamic Laser Progress Arc */}
                  <circle
                    cx={center}
                    cy={center}
                    r={ring.radius}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth={isHighlighted ? strokeWidth + 2 : strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={ring.circumference}
                    strokeDashoffset={ring.strokeDashoffset}
                    filter={isHighlighted ? `url(#glow-${ring.key})` : undefined}
                    className="transition-all duration-500 ease-out"
                  />
                </g>
              );
            })}
          </svg>

          {/* Center Core Display (Hunter Crest & Focus Stats) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none text-center">
            {activeSelectedAttr ? (
              <div className="animate-fadeIn space-y-0.5">
                <span className="material-symbols-outlined text-lg" style={{ color: activeSelectedAttr.color }}>
                  {activeSelectedAttr.icon}
                </span>
                <span className="font-mono text-xl font-black text-white leading-none block">
                  {activeSelectedAttr.totalVal}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-300 font-bold block">
                  {activeSelectedAttr.code}
                </span>
              </div>
            ) : (
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                  {player.rank}
                </span>
                <span className="font-mono text-xl font-black text-white leading-none block">
                  LVL {player.level}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block">
                  NÚCLEO
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Attributes Legend & Allocation Panel */}
      <div className="flex-1 w-full space-y-3">
        {/* Header with Mode Toggle & Stat Points badge */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">radial</span>
            <h4 className="text-white text-xs sm:text-sm font-black uppercase tracking-wider font-display">
              Anillos de Resonancia de Maná
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: 4 vs 6 Rings */}
            <div className="inline-flex rounded-lg bg-black/40 p-0.5 border border-white/10 text-[10px] font-mono">
              <button
                onClick={() => {
                  sound.playBeep(450, 0.03);
                  setViewMode('four');
                }}
                className={`px-2 py-0.5 rounded transition-all ${
                  viewMode === 'four' ? 'bg-primary text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                4 Core
              </button>
              <button
                onClick={() => {
                  sound.playBeep(520, 0.03);
                  setViewMode('six');
                }}
                className={`px-2 py-0.5 rounded transition-all ${
                  viewMode === 'six' ? 'bg-primary text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                6 Total
              </button>
            </div>

            {player.statPoints > 0 && (
              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-mono font-black rounded uppercase animate-pulse flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">stars</span>
                {player.statPoints}
              </span>
            )}
          </div>
        </div>

        {/* Legend Grid with interactive highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ringsData.map((ring) => {
            const isSelected = selectedKey === ring.key;

            return (
              <div
                key={ring.key}
                onMouseEnter={() => setSelectedKey(ring.key)}
                onMouseLeave={() => setSelectedKey(null)}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedKey(selectedKey === ring.key ? null : ring.key);
                }}
                className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-white/10 border-white/40 shadow-md scale-102'
                    : 'bg-black/30 hover:bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Color Orb with Ring Stroke Preview */}
                  <span
                    className="size-3 rounded-full shrink-0 shadow-sm"
                    style={{
                      backgroundColor: ring.color,
                      boxShadow: `0 0 8px ${ring.color}`,
                    }}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-black font-mono text-white tracking-wider truncate">
                        {ring.name}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 block">
                      {ring.code} · <strong className="text-white">{ring.totalVal}</strong>
                      {ring.gearBonus > 0 && (
                        <span className="text-emerald-400 ml-1">(+{ring.gearBonus})</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Allocation button if statPoints > 0 */}
                {player.statPoints > 0 && onAllocateStat && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      triggerGameImpact('level_up', `+1 ${ring.code}`, {
                        x: rect.left + rect.width / 2,
                        y: rect.top - 10,
                      });
                      triggerHaptic('impact');
                      sound.playBeep(720, 0.05);
                      onAllocateStat(ring.key);
                    }}
                    className="size-5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-black flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
                    title={`Asignar +1 a ${ring.name}`}
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Dynamic Detail Card of selected attribute */}
        <div className="min-h-[38px] p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
          {activeSelectedAttr ? (
            <div className="flex items-center gap-2 text-slate-300">
              <span className="material-symbols-outlined text-sm" style={{ color: activeSelectedAttr.color }}>
                {activeSelectedAttr.icon}
              </span>
              <span className="text-[11px] font-mono leading-tight">
                <strong className="text-white">{activeSelectedAttr.name}:</strong> {activeSelectedAttr.bonusText}
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs">touch_app</span>
              Toca o pasa el cursor sobre los anillos para inspeccionar las propiedades de resonancia
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttributeConcentricRings;
