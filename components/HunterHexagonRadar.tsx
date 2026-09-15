import React, { useState } from 'react';
import { Player } from '../types';
import { getEffectiveAttributes } from '../utils/calculator';
import { sound } from '../utils/sound';
import { triggerHaptic } from '../utils/gameFx';

interface HunterHexagonRadarProps {
  player: Player;
  className?: string;
  showBenchmark?: boolean;
}

interface StatDefinition {
  key: 'str' | 'int' | 'wis' | 'cha' | 'vit' | 'agi';
  label: string;
  code: string;
  icon: string;
  color: string;
  angleDeg: number; // -90 for top, etc.
}

const STAT_DEFINITIONS: StatDefinition[] = [
  { key: 'str', label: 'Fuerza', code: 'STR', icon: 'fitness_center', color: '#ff4757', angleDeg: -90 },
  { key: 'int', label: 'Intelecto', code: 'INT', icon: 'psychology', color: '#00f0ff', angleDeg: -30 },
  { key: 'wis', label: 'Percepción', code: 'WIS', icon: 'visibility', color: '#a855f7', angleDeg: 30 },
  { key: 'cha', label: 'Carisma', code: 'CHA', icon: 'groups', color: '#f43f5e', angleDeg: 90 },
  { key: 'vit', label: 'Vitalidad', code: 'VIT', icon: 'favorite', color: '#10b981', angleDeg: 150 },
  { key: 'agi', label: 'Agilidad', code: 'AGI', icon: 'bolt', color: '#fbbf24', angleDeg: 210 },
];

export const HunterHexagonRadar: React.FC<HunterHexagonRadarProps> = ({
  player,
  className = '',
  showBenchmark: initialShowBenchmark = false,
}) => {
  const [selectedStat, setSelectedStat] = useState<string>('str');
  const [showBenchmark, setShowBenchmark] = useState<boolean>(initialShowBenchmark);
  const [showBaseOverlay, setShowBaseOverlay] = useState<boolean>(true);

  const baseAttrs = {
    str: player.attributes?.str?.value ?? 10,
    int: player.attributes?.int?.value ?? 10,
    vit: player.attributes?.vit?.value ?? 10,
    agi: player.attributes?.agi?.value ?? 10,
    wis: player.attributes?.wis?.value ?? 10,
    cha: player.attributes?.cha?.value ?? 10,
  };

  const effectiveAttrs = getEffectiveAttributes(player);

  // Determine dynamic max capacity for scaling the polygon
  const maxStatVal = Math.max(
    50,
    ...Object.values(effectiveAttrs),
    ...Object.values(baseAttrs)
  );
  // Round up to nearest 10 or 25 for nice round scale
  const scaleMax = Math.ceil(maxStatVal / 10) * 10;

  // Geometry calculations
  const center = 175;
  const maxRadius = 115;

  const getCoordinates = (angleDeg: number, ratio: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const r = Math.min(Math.max(ratio, 0.05), 1.05) * maxRadius;
    const x = center + r * Math.cos(angleRad);
    const y = center + r * Math.sin(angleRad);
    return { x, y };
  };

  // Build SVG polygon points string
  const basePoints = STAT_DEFINITIONS.map((stat) => {
    const val = baseAttrs[stat.key];
    const ratio = val / scaleMax;
    const { x, y } = getCoordinates(stat.angleDeg, ratio);
    return `${x},${y}`;
  }).join(' ');

  const effectivePoints = STAT_DEFINITIONS.map((stat) => {
    const val = effectiveAttrs[stat.key];
    const ratio = val / scaleMax;
    const { x, y } = getCoordinates(stat.angleDeg, ratio);
    return `${x},${y}`;
  }).join(' ');

  // S-Rank Hunter benchmark points (~75% of scaleMax)
  const benchmarkRatio = 0.75;
  const benchmarkPoints = STAT_DEFINITIONS.map((stat) => {
    const { x, y } = getCoordinates(stat.angleDeg, benchmarkRatio);
    return `${x},${y}`;
  }).join(' ');

  // Determine Hunter Archetype based on stat predominance
  const getHunterArchetype = () => {
    const sorted = [...STAT_DEFINITIONS].sort(
      (a, b) => effectiveAttrs[b.key] - effectiveAttrs[a.key]
    );
    const top1 = sorted[0];
    const top2 = sorted[1];

    if ((top1.key === 'int' && top2.key === 'wis') || (top1.key === 'wis' && top2.key === 'int')) {
      return { title: 'Mago Nigromante de Sombras', desc: 'Canalización de maná y control dimensional de almas.' };
    }
    if ((top1.key === 'str' && top2.key === 'vit') || (top1.key === 'vit' && top2.key === 'str')) {
      return { title: 'Berserker Colosal de Vanguardia', desc: 'Fuerza de choque imparable y resistencia sobrehumana.' };
    }
    if ((top1.key === 'agi' && top2.key === 'str') || (top1.key === 'str' && top2.key === 'agi')) {
      return { title: 'Asesino de Rango Nacional', desc: 'Velocidad supersónica con letalidad quirúrgica.' };
    }
    if (top1.key === 'cha') {
      return { title: 'Soberano de la Legión', desc: 'Mando absoluto sobre el ejército de sombras.' };
    }
    if (top1.key === 'int') {
      return { title: 'Archimago del Vacío', desc: 'Alta concentración y maestría cognitiva.' };
    }
    return { title: 'Maestría de Evolución Total', desc: 'Equilibrio armonioso en todos los pilares de disciplina.' };
  };

  const archetype = getHunterArchetype();
  const currentStatInfo = STAT_DEFINITIONS.find((s) => s.key === selectedStat) || STAT_DEFINITIONS[0];
  const currentBase = baseAttrs[currentStatInfo.key];
  const currentEffective = effectiveAttrs[currentStatInfo.key];
  const currentGearBonus = currentEffective - currentBase;

  return (
    <div className={`p-4 sm:p-6 bg-surface-dark border border-border-dark rounded-2xl flex flex-col items-center select-none shadow-xl ${className}`}>
      {/* Header & Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-lg">hexagon</span>
            <h4 className="text-white text-sm sm:text-base font-black uppercase italic font-display tracking-wider">
              Radar Hexagonal de Disciplina
            </h4>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Topología de competencias y equilibrio personal en 6 dimensiones
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playBeep(450, 0.02);
              setShowBaseOverlay(!showBaseOverlay);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all flex items-center gap-1 ${
              showBaseOverlay
                ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Alternar visibilidad del polígono base sin equipo"
          >
            <span className="size-2 rounded-full bg-indigo-400" />
            <span>Base vs Equipo</span>
          </button>

          <button
            onClick={() => {
              sound.playBeep(520, 0.02);
              setShowBenchmark(!showBenchmark);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all flex items-center gap-1 ${
              showBenchmark
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Alternar punto de referencia de Rango S"
          >
            <span className="size-2 rounded-full bg-amber-400" />
            <span>Benchmark S</span>
          </button>
        </div>
      </div>

      {/* SVG Hexagonal Radar Canvas */}
      <div className="relative w-full max-w-[350px] aspect-square flex items-center justify-center">
        <svg
          viewBox="0 0 350 350"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Glowing filters */}
            <filter id="radarCyanGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="effectiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.45" />
            </linearGradient>

            <linearGradient id="baseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4338ca" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* 1. Concentric Hexagonal Grid Lines (20%, 40%, 60%, 80%, 100%) */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((levelRatio, idx) => {
            const levelPoints = STAT_DEFINITIONS.map((s) => {
              const { x, y } = getCoordinates(s.angleDeg, levelRatio);
              return `${x},${y}`;
            }).join(' ');
            const isOuter = idx === 4;

            return (
              <polygon
                key={`grid-level-${idx}`}
                points={levelPoints}
                fill="none"
                stroke={isOuter ? '#334155' : '#1e293b'}
                strokeWidth={isOuter ? '1.5' : '1'}
                strokeDasharray={isOuter ? undefined : '3, 4'}
              />
            );
          })}

          {/* Scale Rank Markers on top axis */}
          {[
            { label: 'E', ratio: 0.2 },
            { label: 'C', ratio: 0.4 },
            { label: 'B', ratio: 0.6 },
            { label: 'A', ratio: 0.8 },
            { label: 'S', ratio: 1.0 },
          ].map((mk) => {
            const yPos = center - mk.ratio * maxRadius;
            return (
              <text
                key={mk.label}
                x={center + 6}
                y={yPos + 3}
                fill="#64748b"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {mk.label}
              </text>
            );
          })}

          {/* 2. Radial Axis Lines from center to each vertex */}
          {STAT_DEFINITIONS.map((stat) => {
            const { x, y } = getCoordinates(stat.angleDeg, 1.0);
            return (
              <line
                key={`axis-${stat.key}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#334155"
                strokeWidth="1"
              />
            );
          })}

          {/* 3. S-Rank Benchmark Polygon (If toggled) */}
          {showBenchmark && (
            <polygon
              points={benchmarkPoints}
              fill="rgba(251, 191, 36, 0.05)"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeDasharray="4, 4"
              className="opacity-70 animate-pulse"
            />
          )}

          {/* 4. Base Attributes Polygon (If toggled) */}
          {showBaseOverlay && (
            <polygon
              points={basePoints}
              fill="url(#baseGrad)"
              stroke="#818cf8"
              strokeWidth="1.5"
              strokeDasharray="4, 3"
              className="transition-all duration-700 ease-out"
            />
          )}

          {/* 5. Effective Attributes Polygon (Primary glowing mana shape) */}
          <polygon
            points={effectivePoints}
            fill="url(#effectiveGrad)"
            stroke="#00f0ff"
            strokeWidth="2.5"
            filter="url(#radarCyanGlow)"
            className="transition-all duration-700 ease-out"
          />

          {/* 6. Interactive Vertex Nodes */}
          {STAT_DEFINITIONS.map((stat) => {
            const val = effectiveAttrs[stat.key];
            const ratio = val / scaleMax;
            const { x, y } = getCoordinates(stat.angleDeg, ratio);
            const isSelected = selectedStat === stat.key;

            return (
              <g
                key={`node-${stat.key}`}
                className="cursor-pointer transition-transform duration-300"
                onClick={() => {
                  triggerHaptic('light');
                  sound.playBeep(600, 0.03);
                  setSelectedStat(stat.key);
                }}
              >
                {/* Outer Glow on Selected */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="10"
                    fill={stat.color}
                    className="opacity-40 animate-ping"
                  />
                )}
                {/* Node Ring */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? '6' : '4.5'}
                  fill="#0c1222"
                  stroke={stat.color}
                  strokeWidth={isSelected ? '2.5' : '2'}
                  filter="url(#radarCyanGlow)"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#ffffff"
                />
              </g>
            );
          })}

          {/* 7. Vertex Badges / Labels outside the outer perimeter */}
          {STAT_DEFINITIONS.map((stat) => {
            const { x, y } = getCoordinates(stat.angleDeg, 1.22);
            const isSelected = selectedStat === stat.key;
            const effVal = effectiveAttrs[stat.key];
            const bonus = effVal - baseAttrs[stat.key];

            return (
              <g
                key={`label-${stat.key}`}
                className="cursor-pointer"
                onClick={() => {
                  triggerHaptic('light');
                  sound.playBeep(600, 0.03);
                  setSelectedStat(stat.key);
                }}
              >
                <rect
                  x={x - 24}
                  y={y - 12}
                  width="48"
                  height="24"
                  rx="6"
                  fill={isSelected ? '#0c1222' : '#070b14'}
                  stroke={isSelected ? stat.color : '#1e293b'}
                  strokeWidth={isSelected ? '1.5' : '1'}
                />
                <text
                  x={x}
                  y={y - 1}
                  textAnchor="middle"
                  fill={stat.color}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="900"
                >
                  {stat.code}
                </text>
                <text
                  x={x}
                  y={y + 8}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {effVal}
                  {bonus > 0 && (
                    <tspan fill="#00f0ff" fontSize="7"> +{bonus}</tspan>
                  )}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Attribute Detail Card */}
      <div className="w-full mt-2 p-3 bg-black/50 border border-white/10 rounded-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="size-9 rounded-xl flex items-center justify-center shadow-md border"
            style={{
              backgroundColor: `${currentStatInfo.color}15`,
              borderColor: `${currentStatInfo.color}40`,
            }}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ color: currentStatInfo.color }}
            >
              {currentStatInfo.icon}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white text-xs font-black font-display uppercase tracking-wider">
                {currentStatInfo.label} ({currentStatInfo.code})
              </span>
              {currentGearBonus > 0 && (
                <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/30">
                  +{currentGearBonus} Equipo
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Base: {currentBase} • Total Efectivo: {currentEffective}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">
            Potencial
          </span>
          <span
            className="text-xs font-black font-mono"
            style={{ color: currentStatInfo.color }}
          >
            {Math.round((currentEffective / scaleMax) * 100)}% de Escala
          </span>
        </div>
      </div>

      {/* Hunter Archetype Banner */}
      <div className="w-full mt-3 p-3 bg-gradient-to-r from-indigo-950/40 via-cyan-950/30 to-purple-950/40 border border-cyan-500/30 rounded-xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-cyan-400 text-lg">military_tech</span>
          <div>
            <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase block tracking-wider">
              Diagnóstico de Arquetipo:
            </span>
            <span className="text-xs font-black text-white uppercase italic font-display">
              {archetype.title}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400 text-right hidden sm:block max-w-xs truncate">
          {archetype.desc}
        </span>
      </div>
    </div>
  );
};

export default HunterHexagonRadar;
