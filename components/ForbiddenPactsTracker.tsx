import React, { useState } from 'react';
import { Player, ForbiddenPact, PactCategory } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface ForbiddenPactsTrackerProps {
  player: Player;
}

export const ForbiddenPactsTracker: React.FC<ForbiddenPactsTrackerProps> = ({ player }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const pacts = player.forbiddenPacts || [];

  // Filtered pacts
  const filteredPacts = pacts.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    return true;
  });

  // Calculate Key Metrics
  const totalCleanDays = pacts.reduce((acc, p) => acc + (p.cleanStreakDays || 0), 0);
  const totalInfractions = pacts.reduce((acc, p) => acc + (p.totalInfractions || 0), 0);
  const flawlessPactsCount = pacts.filter((p) => (p.totalInfractions || 0) === 0).length;
  const bestPact = pacts.reduce<ForbiddenPact | null>((best, current) => {
    if (!best || (current.cleanStreakDays || 0) > (best.cleanStreakDays || 0)) return current;
    return best;
  }, null);

  const mostVulnerablePact = pacts.reduce<ForbiddenPact | null>((worst, current) => {
    if ((current.totalInfractions || 0) === 0) return worst;
    if (!worst || (current.totalInfractions || 0) > (worst.totalInfractions || 0)) return current;
    return worst;
  }, null);

  const controlRate = pacts.length > 0 
    ? Math.round((flawlessPactsCount / pacts.length) * 100) 
    : 100;

  // Chart data: Clean days per pact
  const chartData = pacts.map((p) => ({
    name: p.title.length > 16 ? `${p.title.slice(0, 15)}...` : p.title,
    fullName: p.title,
    cleanDays: p.cleanStreakDays || 0,
    infractions: p.totalInfractions || 0,
    category: p.category,
  }));

  const getCategoryColor = (cat: PactCategory) => {
    switch (cat) {
      case 'nutrition': return '#ffcf6b';
      case 'health': return '#35d488';
      case 'discipline': return '#4da6ff';
      case 'mind': return '#c88bff';
      default: return '#00f0ff';
    }
  };

  const formatLastInfraction = (isoString?: string | null) => {
    if (!isoString) return 'Impecable (Sin faltas)';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
      if (diffHours > 0) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      return 'Hoy';
    } catch {
      return 'Registrado';
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#0e1424] to-[#080b14] border border-cyan-500/25 rounded-2xl p-4 sm:p-6 space-y-6 shadow-xl relative overflow-hidden">
      {/* Background Tech Watermark */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <span className="material-symbols-outlined text-[140px]">shield</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-2xl sm:text-3xl">
              gavel
            </span>
            <h3 className="text-white text-lg sm:text-xl font-black uppercase italic font-display tracking-tight text-glow">
              Trazador de Pactos Prohibidos & Anti-Hábitos
            </h3>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            Métricas de autodominio, días limpios consecutivos y control de impulsos negativos
          </p>
        </div>

        {/* Global Control Rate Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-950/60 border border-cyan-400/40 rounded-xl">
          <span className="text-[10px] font-bold text-slate-300 uppercase">Tasa de Dominio:</span>
          <span className="text-sm font-black font-mono text-cyan-300">
            {controlRate}%
          </span>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
        <div className="p-3.5 bg-[#121829] border border-white/10 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase font-bold">
            <span>Días Limpios Totales</span>
            <span className="text-amber-400 material-symbols-outlined text-sm">local_fire_department</span>
          </div>
          <p className="text-xl sm:text-2xl font-black font-mono text-white">
            {totalCleanDays} <span className="text-xs text-amber-400 font-bold">días</span>
          </p>
          <p className="text-[10px] text-slate-400">Sumatoria de rachas puras</p>
        </div>

        <div className="p-3.5 bg-[#121829] border border-white/10 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase font-bold">
            <span>Pactos Impecables</span>
            <span className="text-emerald-400 material-symbols-outlined text-sm">verified_user</span>
          </div>
          <p className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
            {flawlessPactsCount} <span className="text-xs text-slate-400 font-bold">/ {pacts.length}</span>
          </p>
          <p className="text-[10px] text-slate-400">Sin faltas registradas</p>
        </div>

        <div className="p-3.5 bg-[#121829] border border-white/10 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase font-bold">
            <span>Faltas Acumuladas</span>
            <span className="text-red-400 material-symbols-outlined text-sm">warning</span>
          </div>
          <p className="text-xl sm:text-2xl font-black font-mono text-red-400">
            {totalInfractions} <span className="text-xs text-slate-400 font-bold">infracciones</span>
          </p>
          <p className="text-[10px] text-slate-400">Tropiezos totales en el historial</p>
        </div>

        <div className="p-3.5 bg-[#121829] border border-white/10 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase font-bold">
            <span>Mayor Fortaleza</span>
            <span className="text-cyan-400 material-symbols-outlined text-sm">trophy</span>
          </div>
          <p className="text-sm font-bold text-cyan-300 truncate" title={bestPact?.title || 'Ninguno'}>
            {bestPact ? bestPact.title : 'En desarrollo'}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            {bestPact ? `${bestPact.cleanStreakDays || 0} días limpios` : 'Registra tus días'}
          </p>
        </div>
      </div>

      {/* Comparison Bar Chart: Días Limpios por Pacto */}
      {pacts.length > 0 && (
        <div className="p-4 bg-[#0a0f1d] border border-white/5 rounded-xl space-y-3 relative z-10">
          <div className="flex justify-between items-center">
            <h4 className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-cyan-400 text-base">bar_chart</span>
              <span>Comparativa de Resistencia (Días Consecutivos sin Caer)</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Días Limpios</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232f48" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  stroke="#8b9bb4" 
                  tick={{ fontSize: 10 }} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#8b9bb4" tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#101728] border border-cyan-500/40 rounded-xl p-3 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-white font-display">{data.fullName}</p>
                          <p className="text-amber-400 font-mono font-bold">
                            🔥 {data.cleanDays} días limpio
                          </p>
                          <p className="text-red-400 font-mono text-[11px]">
                            ⚠️ {data.infractions} falta{data.infractions === 1 ? '' : 's'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="cleanDays" radius={[6, 6, 0, 0]} name="Días Limpios">
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.cleanDays > 14 ? '#ffcf6b' : entry.cleanDays > 5 ? '#35d488' : '#4da6ff'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 relative z-10">
        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 mr-1">Filtrar:</span>
        {[
          { id: 'all', label: 'Todos' },
          { id: 'nutrition', label: 'Nutrición' },
          { id: 'health', label: 'Salud' },
          { id: 'discipline', label: 'Disciplina' },
          { id: 'mind', label: 'Mente' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              selectedCategory === tab.id
                ? 'bg-cyan-500 text-black shadow-sm shadow-cyan-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pact Detail Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
        {filteredPacts.map((pact) => {
          const categoryColor = getCategoryColor(pact.category);
          const hasInfractions = (pact.totalInfractions || 0) > 0;

          return (
            <div
              key={pact.id}
              className="p-3.5 bg-[#0d1322] border border-white/10 hover:border-cyan-500/40 rounded-xl space-y-3 transition-all group"
            >
              {/* Header with icon, category & clean days badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="size-9 rounded-lg flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${categoryColor}15`,
                      borderColor: `${categoryColor}35`,
                      color: categoryColor,
                    }}
                  >
                    <span className="material-symbols-outlined text-lg">{pact.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-white text-xs sm:text-sm font-bold font-display group-hover:text-cyan-300 transition-colors truncate">
                      {pact.title}
                    </h5>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <span className="capitalize">{pact.category}</span>
                      <span>•</span>
                      <span className="uppercase text-[9px] text-slate-400">{pact.severity}</span>
                    </div>
                  </div>
                </div>

                {/* Clean Streak Badge */}
                <div className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 rounded-lg text-right shrink-0">
                  <div className="text-xs font-black font-mono text-amber-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">local_fire_department</span>
                    <span>{pact.cleanStreakDays || 0}d</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">limpio</div>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-300 text-xs leading-relaxed break-words bg-black/20 p-2 rounded-lg border border-white/5">
                {pact.description}
              </p>

              {/* Traceability Metrics Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 text-[10.5px] font-mono">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-0.5 ${hasInfractions ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}`}>
                    <span className="material-symbols-outlined text-xs">
                      {hasInfractions ? 'report' : 'check_circle'}
                    </span>
                    <span>{pact.totalInfractions || 0} falta{pact.totalInfractions === 1 ? '' : 's'}</span>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400">
                    Última: {formatLastInfraction(pact.lastInfractionAt)}
                  </span>
                </div>

                <div className="text-slate-400 text-[10px]">
                  Pérdida: <strong className="text-red-400 font-bold">-{pact.hpDamage} HP</strong>
                  {pact.goldPenalty > 0 && (
                    <span className="text-amber-400 ml-1">· -{pact.goldPenalty} G</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Oracle Guidance / Insight Footer */}
      {mostVulnerablePact && (
        <div className="p-3.5 bg-red-950/30 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-200">
          <span className="material-symbols-outlined text-red-400 text-lg shrink-0 mt-0.5">warning</span>
          <div className="space-y-0.5">
            <p className="font-bold text-red-300">Punto de Fuga de Vitalidad Detectado</p>
            <p className="text-slate-300 text-[11px] leading-normal">
              El anti-hábito que más compromete tu salud es «<strong>{mostVulnerablePact.title}</strong>» con {mostVulnerablePact.totalInfractions} falta(s). Activa el Escudo de Tregua si atraviesas situaciones de reposo justificadas para no desestabilizar tu barra vital.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
