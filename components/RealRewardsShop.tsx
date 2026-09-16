import React, { useState } from 'react';
import { Player, RealLifeReward, RewardCategory } from '../types';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface RealRewardsShopProps {
  player: Player;
  onBackToHub: () => void;
  onClaimReward: (reward: RealLifeReward) => void;
  onAddReward: (reward: Omit<RealLifeReward, 'id' | 'timesClaimed' | 'lastClaimedAt'>) => void;
  onDeleteReward: (rewardId: string) => void;
}

const CATEGORIES: { id: RewardCategory; label: string; icon: string; desc: string; color: string }[] = [
  {
    id: 'leisure',
    label: 'Ocio & Gaming',
    icon: 'sports_esports',
    desc: 'Videojuegos, series, películas y tiempo libre sin culpa.',
    color: '#38bdf8',
  },
  {
    id: 'food',
    label: 'Gastronomía & Antojos',
    icon: 'restaurant',
    desc: 'Cafés de especialidad, cenas gourmet, delivery y postres.',
    color: '#fbbf24',
  },
  {
    id: 'wellness',
    label: 'Bienestar & Descanso',
    icon: 'spa',
    desc: 'Siestas reparadoras, masajes, baños termales y relajación.',
    color: '#34d399',
  },
  {
    id: 'growth',
    label: 'Crecimiento & Equipo',
    icon: 'menu_book',
    desc: 'Libros nuevos, ropa deportiva, tecnología y herramientas.',
    color: '#c084fc',
  },
  {
    id: 'experience',
    label: 'Experiencias & Desconexión',
    icon: 'terrain',
    desc: 'Paseos, museos, naturaleza, conciertos y escapadas.',
    color: '#f472b6',
  },
];

const AVAILABLE_ICONS = [
  { icon: 'sports_esports', label: 'Videojuegos' },
  { icon: 'movie', label: 'Cine / Serie' },
  { icon: 'tv', label: 'Streaming' },
  { icon: 'local_cafe', label: 'Café' },
  { icon: 'restaurant', label: 'Comida' },
  { icon: 'delivery_dining', label: 'Delivery' },
  { icon: 'bed', label: 'Siesta' },
  { icon: 'spa', label: 'Relajación' },
  { icon: 'self_improvement', label: 'Masaje' },
  { icon: 'menu_book', label: 'Libro' },
  { icon: 'devices', label: 'Gadget' },
  { icon: 'checkroom', label: 'Ropa' },
  { icon: 'nature_people', label: 'Naturaleza' },
  { icon: 'explore', label: 'Explorar' },
  { icon: 'terrain', label: 'Aventura' },
  { icon: 'celebration', label: 'Fiesta' },
];

export const RealRewardsShop: React.FC<RealRewardsShopProps> = ({
  player,
  onBackToHub,
  onClaimReward,
  onAddReward,
  onDeleteReward,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  // AI Modal States
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiCategory, setAiCategory] = useState<RewardCategory>('leisure');
  const [aiBudget, setAiBudget] = useState<'low' | 'medium' | 'high'>('medium');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<{
    title: string;
    description: string;
    costGold: number;
    icon: string;
    category: RewardCategory;
    systemQuote?: string;
  } | null>(null);

  // Manual Modal States
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualDesc, setManualDesc] = useState<string>('');
  const [manualCost, setManualCost] = useState<number>(600);
  const [manualIcon, setManualIcon] = useState<string>('sports_esports');
  const [manualCategory, setManualCategory] = useState<RewardCategory>('leisure');

  const rewards = player.customRewards || [];

  // Filter rewards by category
  const filteredRewards = rewards.filter((r) => {
    if (categoryFilter === 'all') return true;
    return r.category === categoryFilter;
  });

  const handleClaim = (reward: RealLifeReward) => {
    if (player.gold < reward.costGold) {
      sound.playBeep(220, 0.15, 'sawtooth');
      return;
    }

    sound.playLevelUp();
    try {
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#38bdf8', '#34d399', '#f472b6'],
      });
    } catch {
      // ignore
    }

    onClaimReward(reward);
    setClaimedNotice(`¡Canjeado: [${reward.title}]! Disfruta tu recompensa sin culpa.`);
    setTimeout(() => {
      setClaimedNotice(null);
    }, 4500);
  };

  const handleGenerateAi = async () => {
    sound.playBeep(580, 0.04);
    setIsGeneratingAi(true);
    setAiResult(null);

    try {
      const res = await fetch('/api/ai/generate-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hunterName: player.name,
          category: aiCategory,
          preferencePrompt: aiPrompt.trim(),
          budgetLevel: aiBudget,
          currentGold: player.gold,
        }),
      });

      const data = await res.json();
      if (data?.success && data.reward) {
        setAiResult({
          title: data.reward.title,
          description: data.reward.description,
          costGold: Number(data.reward.costGold) || 800,
          icon: data.reward.icon || 'card_giftcard',
          category: (data.reward.category as RewardCategory) || aiCategory,
          systemQuote: data.reward.systemQuote,
        });
        sound.playBeep(740, 0.06);
      } else {
        throw new Error('Fallback trigger');
      }
    } catch (err) {
      console.warn('Using client-side fallback reward generation:', err);
      // Client-side instant creative generator
      const templates: Record<RewardCategory, { titles: string[]; descs: string[]; costs: number[]; icons: string[] }> = {
        leisure: {
          titles: [
            '1 Hora de Videojuegos / Streaming sin Culpa',
            'Noche de Película de Estreno con Snacks',
            'Tarde de Anime / Lectura de Cómics sin Prisa',
          ],
          descs: [
            'Tiempo de ocio puro ganado con tu esfuerzo y disciplina.',
            'Disfruta de una buena película o serie con tus snacks preferidos.',
            'Pausa sin pantallas de trabajo para sumergirte en tus historias favoritas.',
          ],
          costs: [450, 900, 750],
          icons: ['sports_esports', 'movie', 'tv'],
        },
        food: {
          titles: [
            'Café de Especialidad + Pastelería Fina',
            'Cena Favorita en Restaurante Elegido',
            'Delivery Gourmet a Domicilio sin Cocinar',
          ],
          descs: [
            'Un café de origen bien preparado junto a tu dulce predilecto.',
            'Comida libre en tu restaurante de confianza celebrando tus logros.',
            'Una noche tranquila en casa con cena de calidad traída a tu puerta.',
          ],
          costs: [380, 1600, 1100],
          icons: ['local_cafe', 'restaurant', 'delivery_dining'],
        },
        wellness: {
          titles: [
            'Siesta Reparadora de 45 min sin Alarma',
            'Ducha Termal Relajante con Aceites Aromáticos',
            'Sesión de Masaje Terapéutico Descontracturante',
          ],
          descs: [
            'Descanso profundo para regenerar la energía del sistema nervioso.',
            'Desconectar el estrés con agua caliente, velas y música ambiental.',
            'Alivio de tensiones musculares y cuidado de tu cuerpo de cazador.',
          ],
          costs: [400, 650, 2200],
          icons: ['bed', 'spa', 'self_improvement'],
        },
        growth: {
          titles: [
            'Comprar Libro de Crecimiento o Novela Pendiente',
            'Accesorio Ergonómico para tu Escritorio',
            'Prenda de Ropa Deportiva de Alto Rendimiento',
          ],
          descs: [
            'Inversión directa en tu mente y conocimiento.',
            'Un gadget o soporte que haga más agradable tu espacio de trabajo.',
            'Ropa cómoda o calzado para entrenar con motivación renovada.',
          ],
          costs: [1100, 2500, 2100],
          icons: ['menu_book', 'devices', 'checkroom'],
        },
        experience: {
          titles: [
            'Tarde de Senderismo y Desconexión en la Naturaleza',
            'Paseo Cultural / Entrada a Museo o Exposición',
            'Escapada de Fin de Semana fuera de la Ciudad',
          ],
          descs: [
            'Caminar al aire libre respirando aire puro y dejando el móvil guardado.',
            'Explorar arte, historia o arquitectura en tu ciudad.',
            'Aventura corta para renovar la mente y celebrar una racha victoriosa.',
          ],
          costs: [700, 1300, 4200],
          icons: ['nature_people', 'explore', 'terrain'],
        },
      };

      const group = templates[aiCategory] || templates.leisure;
      const idx = Math.floor(Math.random() * group.titles.length);
      const budgetMult = aiBudget === 'high' ? 2.0 : aiBudget === 'low' ? 0.6 : 1.0;

      setAiResult({
        title: aiPrompt ? `${group.titles[idx]}: ${aiPrompt.slice(0, 30)}` : group.titles[idx],
        description: group.descs[idx],
        costGold: Math.round(group.costs[idx] * budgetMult),
        icon: group.icons[idx],
        category: aiCategory,
        systemQuote: 'El Sistema certifica que el descanso ganado fortalece la voluntad.',
      });
      sound.playBeep(700, 0.05);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveAiResult = () => {
    if (!aiResult) return;
    onAddReward({
      title: aiResult.title,
      description: aiResult.description,
      costGold: aiResult.costGold,
      icon: aiResult.icon,
      category: aiResult.category,
    });
    sound.playBeep(680, 0.05);
    setCategoryFilter(aiResult.category);
    setIsAiModalOpen(false);
    setAiResult(null);
    setAiPrompt('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    onAddReward({
      title: manualTitle.trim(),
      description: manualDesc.trim() || 'Recompensa real de disciplina.',
      costGold: Math.max(50, manualCost),
      icon: manualIcon,
      category: manualCategory,
    });

    sound.playBeep(640, 0.06);
    setCategoryFilter(manualCategory);
    setManualTitle('');
    setManualDesc('');
    setManualCost(600);
    setIsManualModalOpen(false);
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in pb-24 sm:pb-28">
      {/* 1. Header with Back Button and Hunter Gold Counter */}
      <div className="w-full flex items-center justify-between gap-3 mb-4 px-1">
        <button
          type="button"
          onClick={() => {
            sound.playBeep(480, 0.03);
            onBackToHub();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c1322]/90 border border-[#1c2a45] text-xs font-mono text-cyan-300 hover:text-white hover:border-cyan-500/50 transition-all active:scale-95 shadow-md"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Objetivos</span>
        </button>

        {/* Available Gold Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-950/40 via-[#18130d] to-[#0c1322] border border-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
          <span className="material-symbols-outlined text-amber-400 text-lg animate-pulse">monetization_on</span>
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block leading-tight">ORO DISPONIBLE</span>
            <span className="text-amber-400 font-mono font-bold text-sm leading-none">
              {player.gold.toLocaleString()} G
            </span>
          </div>
        </div>
      </div>

      {/* 2. Banner: Life Gamification Philosophy */}
      <div className="w-full rounded-2xl bg-gradient-to-br from-[#121622] via-[#0c1322] to-[#080d16] border border-amber-500/30 p-4 sm:p-5 mb-4 shadow-xl text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                SISTEMA DE PREMIOS REALES
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Canjea tu Esfuerzo sin Culpa</span>
              <span className="material-symbols-outlined text-amber-400 text-lg">redeem</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed mt-1">
              Sin espadas ni pociones de fantasía: invierte el oro de tus hábitos en ocio, descansos, buena comida, libros o experiencias que te motiven de verdad.
            </p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={() => {
                sound.playBeep(520, 0.03);
                setIsAiModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>Sugerir con IA</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playBeep(520, 0.03);
                setIsManualModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-[#0c1322] hover:bg-[#142035] border border-[#1c2a45] text-slate-200 font-mono text-xs uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Manual</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notice Toast */}
      {claimedNotice && (
        <div className="w-full px-4 py-2.5 mb-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-2 shadow-lg animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
          <span className="flex-1">{claimedNotice}</span>
        </div>
      )}

      {/* 3. Category Filter Tabs */}
      <div className="w-full flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        <button
          type="button"
          onClick={() => {
            sound.playBeep(480, 0.02);
            setCategoryFilter('all');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            categoryFilter === 'all'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
              : 'bg-[#0c1322]/80 border border-[#1c2a45] text-slate-400 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-sm">apps</span>
          <span>Todas ({rewards.length})</span>
        </button>

        {CATEGORIES.map((cat) => {
          const count = rewards.filter((r) => r.category === cat.id).length;
          const isActive = categoryFilter === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                sound.playBeep(480, 0.02);
                setCategoryFilter(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-white/10 text-white border border-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                  : 'bg-[#0c1322]/80 border border-[#1c2a45] text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm" style={{ color: cat.color }}>
                {cat.icon}
              </span>
              <span>{cat.label}</span>
              <span className="text-[10px] text-slate-500 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* 4. Rewards Cards Grid */}
      {filteredRewards.length === 0 ? (
        <div className="w-full py-12 px-4 rounded-2xl bg-[#0c1322]/60 border border-[#1c2a45] text-center flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">storefront</span>
          <p className="text-slate-300 text-sm font-mono mb-1">No hay recompensas en esta categoría</p>
          <p className="text-slate-500 text-xs max-w-sm mb-4">
            Genera una recompensa personalizada con la IA o crea una manualmente según tus gustos.
          </p>
          <button
            type="button"
            onClick={() => {
              if (categoryFilter !== 'all') {
                setAiCategory(categoryFilter as RewardCategory);
              }
              setIsAiModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-md"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span>Generar Recompensa con IA</span>
          </button>
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredRewards.map((reward) => {
            const canAfford = player.gold >= reward.costGold;
            const catInfo = CATEGORIES.find((c) => c.id === reward.category) || CATEGORIES[0];

            return (
              <div
                key={reward.id}
                className="rounded-2xl bg-[#0c1322]/90 border border-[#1c2a45] hover:border-amber-500/40 p-4 flex flex-col justify-between transition-all group backdrop-blur-sm shadow-md hover:shadow-[0_0_15px_rgba(251,191,36,0.1)] text-left relative overflow-hidden"
              >
                <div>
                  {/* Top line: Icon, Category & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner shrink-0 group-hover:scale-105 transition-transform"
                      style={{
                        backgroundColor: `${catInfo.color}15`,
                        borderColor: `${catInfo.color}40`,
                        color: catInfo.color,
                      }}
                    >
                      <span className="material-symbols-outlined text-2xl">{reward.icon || catInfo.icon}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-slate-300">
                        {catInfo.label.split(' ')[0]}
                      </span>
                      {reward.timesClaimed > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold">
                          {reward.timesClaimed}x canjeado
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playBeep(320, 0.04);
                          onDeleteReward(reward.id);
                        }}
                        className="p-1 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Eliminar recompensa"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-white text-sm tracking-tight mb-1 group-hover:text-amber-300 transition-colors">
                    {reward.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-3 font-sans">
                    {reward.description}
                  </p>
                </div>

                {/* Footer: Gold Cost and Canjear Button */}
                <div className="pt-2.5 border-t border-[#1c2a45]/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-amber-400 text-base">monetization_on</span>
                    <span className="text-amber-400 font-mono font-bold text-sm">
                      {reward.costGold.toLocaleString()} G
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handleClaim(reward)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                        : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                    }`}
                    title={canAfford ? 'Canjear recompensa con tu oro' : 'Oro insuficiente para este premio'}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {canAfford ? 'verified' : 'lock'}
                    </span>
                    <span>{canAfford ? 'Canjear' : 'Falta Oro'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================================================================= */}
      {/* 5. MODAL: AI Reward Generator with Category & Custom Preference   */}
      {/* ================================================================= */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-[#0c1322] border border-[#1c2a45] rounded-3xl p-5 sm:p-6 shadow-2xl animate-scale-up max-h-[92vh] overflow-y-auto text-left">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2a45] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <span className="material-symbols-outlined text-xl">auto_awesome</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Generar Recompensa con IA</h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Propuestas de la vida real sin temática fantástica
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAiModalOpen(false);
                  setAiResult(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5 mb-4">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                1. Selecciona la Categoría
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = aiCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        sound.playBeep(480, 0.02);
                        setAiCategory(cat.id);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
                          : 'border-[#1c2a45] bg-[#060a12]/80 hover:border-slate-500'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl shrink-0 mt-0.5" style={{ color: cat.color }}>
                        {cat.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{cat.label}</div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                          {cat.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget / Magnitude Selector */}
            <div className="space-y-1.5 mb-4">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                2. Nivel de Presupuesto en Oro
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'low', label: 'Capricho Rápido', cost: '~350 - 600 G' },
                  { id: 'medium', label: 'Premio Moderado', cost: '~700 - 1500 G' },
                  { id: 'high', label: 'Gran Conquista', cost: '~1600 - 4500 G' },
                ].map((b) => {
                  const isSelected = aiBudget === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        sound.playBeep(480, 0.02);
                        setAiBudget(b.id as any);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/15 text-white'
                          : 'border-[#1c2a45] bg-[#060a12] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{b.label}</div>
                      <div className="text-[10px] font-mono text-amber-400 mt-0.5">{b.cost}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Personal Preference Prompt */}
            <div className="space-y-1.5 mb-4">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                3. Idea o Preferencia (Opcional)
              </label>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ej: Me encanta el café de Etiopía, o quiero salir a ver la nueva película..."
                className="w-full px-3 py-2 rounded-xl bg-[#060a12] border border-[#1c2a45] text-white text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              disabled={isGeneratingAi}
              onClick={handleGenerateAi}
              className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                isGeneratingAi
                  ? 'bg-amber-500/40 text-amber-200 cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20 active:scale-98'
              }`}
            >
              <span className={`material-symbols-outlined text-sm ${isGeneratingAi ? 'animate-spin' : ''}`}>
                {isGeneratingAi ? 'refresh' : 'psychology'}
              </span>
              <span>{isGeneratingAi ? 'El Sistema está evaluando recompensas...' : 'Generar Recompensa con IA'}</span>
            </button>

            {/* AI Generated Result Preview Card */}
            {aiResult && (
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-[#161c2b] to-[#0d1424] border border-amber-400/50 shadow-xl animate-fade-in">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <span className="material-symbols-outlined text-2xl">{aiResult.icon}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block">COSTO EN ORO</span>
                    <span className="text-amber-400 font-mono font-bold text-sm">
                      {aiResult.costGold.toLocaleString()} G
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-white text-sm mb-1">{aiResult.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{aiResult.description}</p>

                {aiResult.systemQuote && (
                  <div className="p-2 rounded-lg bg-[#060a12]/80 border border-white/5 text-[10px] font-mono text-cyan-300 mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs">terminal</span>
                    <span className="italic">"{aiResult.systemQuote}"</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveAiResult}
                    className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    <span>Añadir a mi Tienda</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateAi}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono flex items-center gap-1"
                    title="Regenerar otra opción"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    <span>Otra</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 6. MODAL: Manual Reward Creator                                   */}
      {/* ================================================================= */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <form
            onSubmit={handleManualSubmit}
            className="w-full max-w-md bg-[#0c1322] border border-[#1c2a45] rounded-3xl p-5 sm:p-6 shadow-2xl animate-scale-up max-h-[92vh] overflow-y-auto text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2a45] mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-xl">add_circle</span>
                <span>Crear Recompensa Manual</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Category */}
            <div className="space-y-1 mb-3">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">Categoría</label>
              <select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value as RewardCategory)}
                className="w-full px-3 py-2 rounded-xl bg-[#060a12] border border-[#1c2a45] text-white text-xs font-mono focus:outline-none focus:border-amber-400"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-1 mb-3">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">Nombre de la Recompensa</label>
              <input
                type="text"
                required
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Ej: Salida a comer pizza artesanal"
                className="w-full px-3 py-2 rounded-xl bg-[#060a12] border border-[#1c2a45] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Description */}
            <div className="space-y-1 mb-3">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">Descripción / Condiciones</label>
              <textarea
                rows={2}
                value={manualDesc}
                onChange={(e) => setManualDesc(e.target.value)}
                placeholder="Ej: Premio merecido tras completar la racha de entrenamientos..."
                className="w-full px-3 py-2 rounded-xl bg-[#060a12] border border-[#1c2a45] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            {/* Cost in Gold */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                <span className="uppercase">Costo en Oro</span>
                <span className="text-amber-400 font-bold">{manualCost.toLocaleString()} G</span>
              </div>
              <input
                type="range"
                min={100}
                max={5000}
                step={50}
                value={manualCost}
                onChange={(e) => setManualCost(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>100 G</span>
                <span>2,500 G</span>
                <span>5,000 G</span>
              </div>
            </div>

            {/* Icon Picker */}
            <div className="space-y-1 mb-5">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase">Icono Representativo</label>
              <div className="grid grid-cols-8 gap-1.5 p-2 rounded-xl bg-[#060a12] border border-[#1c2a45] max-h-32 overflow-y-auto">
                {AVAILABLE_ICONS.map((ic) => (
                  <button
                    key={ic.icon}
                    type="button"
                    onClick={() => {
                      sound.playBeep(480, 0.02);
                      setManualIcon(ic.icon);
                    }}
                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                      manualIcon === ic.icon
                        ? 'bg-amber-500 text-black scale-110 shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    title={ic.label}
                  >
                    <span className="material-symbols-outlined text-lg">{ic.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              Guardar Recompensa
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
