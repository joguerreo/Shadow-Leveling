import React, { useState } from 'react';
import { Player, ShopItem, Item, RealLifeReward } from '../types';
import { SHOP_CATALOG, INITIAL_REAL_LIFE_REWARDS } from '../constants';
import { sound } from '../utils/sound';
import { triggerGameImpact, triggerHaptic } from '../utils/gameFx';
import confetti from 'canvas-confetti';

interface ShopProps {
  player: Player;
  onBuyItem: (item: ShopItem, currency: 'gold' | 'essence') => void;
  onMysteryChest: (item: Item) => void;
  onClaimRealReward?: (reward: RealLifeReward) => void;
  onAddRealReward?: (reward: Omit<RealLifeReward, 'id' | 'timesClaimed' | 'lastClaimedAt'>) => void;
  onDeleteRealReward?: (rewardId: string) => void;
}

const AVAILABLE_ICONS = [
  { icon: 'sports_esports', label: 'Juegos' },
  { icon: 'movie', label: 'Cine' },
  { icon: 'restaurant', label: 'Comida' },
  { icon: 'local_cafe', label: 'Café / Salida' },
  { icon: 'menu_book', label: 'Lectura' },
  { icon: 'shopping_bag', label: 'Compras' },
  { icon: 'fitness_center', label: 'Deporte' },
  { icon: 'hotel', label: 'Descanso' },
  { icon: 'flight', label: 'Viaje' },
  { icon: 'celebration', label: 'Fiesta' },
];

const Shop: React.FC<ShopProps> = ({
  player,
  onBuyItem,
  onMysteryChest,
  onClaimRealReward,
  onAddRealReward,
  onDeleteRealReward,
}) => {
  const [activeTab, setActiveTab] = useState<'real_rewards' | 'market' | 'gacha'>('real_rewards');
  const [isOpeningGacha, setIsOpeningGacha] = useState<boolean>(false);
  const [gachaResult, setGachaResult] = useState<Item | null>(null);

  // Real-Life Rewards State
  const [isCreateRewardOpen, setIsCreateRewardOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newCostGold, setNewCostGold] = useState<number>(800);
  const [newIcon, setNewIcon] = useState<string>('sports_esports');

  const realRewards: RealLifeReward[] = player.customRewards || INITIAL_REAL_LIFE_REWARDS;

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'Mythic': return 'border-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.3)]';
      case 'Legendary': return 'border-orange-500/70 shadow-[0_0_20px_rgba(249,115,22,0.3)]';
      case 'Epic': return 'border-purple-500/70 shadow-[0_0_15px_rgba(168,85,247,0.25)]';
      case 'Rare': return 'border-blue-500/70 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
      default: return 'border-slate-700';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Mythic': return 'text-red-500';
      case 'Legendary': return 'text-orange-400';
      case 'Epic': return 'text-purple-400';
      case 'Rare': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const handleOpenGacha = () => {
    if (player.essenceStones < 25) {
      sound.playBeep(220, 0.2, 'sawtooth');
      alert('Necesitas al menos 25 Essence Stones para invocar la Extracción de Sombras.');
      return;
    }

    setIsOpeningGacha(true);
    setGachaResult(null);
    sound.playChestRattle();
    triggerHaptic([30, 40, 30, 40]);

    setTimeout(() => {
      sound.playChestRattle();
      triggerHaptic([50, 70]);
    }, 900);

    setTimeout(() => {
      const roll = Math.random();
      let drawnItem: Item;

      if (roll > 0.92) {
        drawnItem = {
          id: `gacha_${Date.now()}`,
          name: 'Crown of the Shadow Monarch',
          description: 'The supreme regal artifact. Mana overflows endlessly.',
          rarity: 'Mythic',
          slot: 'head',
          icon: 'military_tech',
          priceGold: 25000,
          stats: { STR: 20, INT: 20, VIT: 20, AGI: 20, WIS: 20, CHA: 20 },
          effect: '+50% All Stats',
        };
      } else if (roll > 0.65) {
        drawnItem = {
          id: `gacha_${Date.now()}`,
          name: 'Baran’s Lightning Greatsword',
          description: 'Heavy blade pulsating with high voltage demon mana.',
          rarity: 'Legendary',
          slot: 'weapon',
          icon: 'swords',
          priceGold: 18000,
          stats: { STR: 35, AGI: 15 },
        };
      } else {
        drawnItem = {
          id: `gacha_${Date.now()}`,
          name: 'Shadow Commander Plate',
          description: 'Forged in abyssal depths. Hardens the wearer against lethal blows.',
          rarity: 'Epic',
          slot: 'chest',
          icon: 'shield',
          priceGold: 9000,
          stats: { VIT: 25, STR: 10 },
        };
      }

      setGachaResult(drawnItem);
      setIsOpeningGacha(false);
      onMysteryChest(drawnItem);
      triggerGameImpact('loot', `¡${drawnItem.name}!`);
      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.55 },
          colors: ['#a855f7', '#4d6aff', '#fbbf24', '#ec4899'],
        });
      } catch {}
    }, 2200);
  };

  const handleCreateRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (onAddRealReward) {
      onAddRealReward({
        title: newTitle.trim(),
        description: newDescription.trim() || 'Premio de disciplina conquistado.',
        costGold: Math.max(50, newCostGold),
        icon: newIcon,
      });
    }

    setNewTitle('');
    setNewDescription('');
    setNewCostGold(800);
    setIsCreateRewardOpen(false);
    sound.playBeep(640, 0.08);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-dark pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">storefront</span>
            <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-glow uppercase font-display">
              Mercado & Recompensas
            </h2>
          </div>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mt-1">
            Canjea tu Oro por Premios de la Vida Real o Artefactos del Sistema
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1.5 p-1 bg-surface-dark border border-white/5 rounded-xl flex-wrap">
          <button
            onClick={() => {
              sound.playBeep(520, 0.03);
              setActiveTab('real_rewards');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
              activeTab === 'real_rewards'
                ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">card_giftcard</span>
            Premios Reales
          </button>

          <button
            onClick={() => {
              sound.playBeep(520, 0.03);
              setActiveTab('market');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
              activeTab === 'market'
                ? 'bg-primary text-white system-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">shopping_bag</span>
            Equipo Virtual
          </button>

          <button
            onClick={() => {
              sound.playBeep(520, 0.03);
              setActiveTab('gacha');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
              activeTab === 'gacha'
                ? 'bg-accent text-white shadow-lg shadow-purple-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Extracción Gacha
          </button>
        </div>
      </div>

      {/* TAB 1: Real Life Rewards */}
      {activeTab === 'real_rewards' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Hero Banner explaining real-life reward psychology */}
          <div className="bg-gradient-to-r from-amber-950/40 via-[#18130d] to-surface-dark border border-amber-500/30 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-black uppercase">
                EL VALOR REAL DE TU ORO
              </span>
              <h3 className="text-white text-lg sm:text-xl font-black uppercase tracking-tight">
                Recompensas de la Vida Real (Sin Culpa)
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                El oro ganado con tus hábitos reales te da derecho a disfrutar de tus gustos, ocio y descansos sin remordimiento. Cuando canjeas un premio, el Sistema convalida tu disciplina.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateRewardOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>+ Crear Mi Premio</span>
            </button>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {realRewards.map((reward) => {
              const canAfford = player.gold >= reward.costGold;

              return (
                <div
                  key={reward.id}
                  className="bg-[#121620] border border-white/10 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-md hover:shadow-amber-500/10 relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="size-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-2xl">{reward.icon}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {reward.timesClaimed > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                            {reward.timesClaimed}x canjeado
                          </span>
                        )}
                        {onDeleteRealReward && (
                          <button
                            onClick={() => onDeleteRealReward(reward.id)}
                            className="size-7 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 flex items-center justify-center transition-colors"
                            title="Eliminar este premio personalizado"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="text-white text-base font-black tracking-tight mb-1">
                      {reward.title}
                    </h4>
                    <p className="text-slate-400 text-xs leading-relaxed mb-4">
                      {reward.description}
                    </p>
                  </div>

                  {/* Redeem Button */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 text-amber-400 font-mono font-black text-sm">
                      <span className="material-symbols-outlined text-base">monetization_on</span>
                      <span>{reward.costGold.toLocaleString()} G</span>
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => {
                        if (onClaimRealReward) {
                          onClaimRealReward(reward);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl font-black uppercase text-xs tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                          : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">verified</span>
                      <span>Canjear</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Virtual Gear Catalog */}
      {activeTab === 'market' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {SHOP_CATALOG.map((item) => {
            const canAffordGold = player.gold >= item.priceGold;
            const canAffordEssence = item.priceEssence && player.essenceStones >= item.priceEssence;

            return (
              <div
                key={item.id}
                className={`p-6 bg-surface-dark border rounded-2xl flex flex-col justify-between transition-all hover:border-primary/50 relative overflow-hidden group ${
                  item.featured ? 'border-primary/40 bg-gradient-to-br from-primary/5 to-surface-dark' : 'border-border-dark'
                }`}
              >
                {item.featured && (
                  <div className="absolute top-0 right-0 bg-primary px-3 py-0.5 text-[9px] font-black uppercase text-white rounded-bl-lg">
                    DESTACADO
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`size-14 rounded-xl border-2 bg-slate-900 flex items-center justify-center ${getRarityBorder(item.rarity)}`}>
                      <span className={`material-symbols-outlined text-3xl ${getRarityColor(item.rarity)}`}>
                        {item.icon}
                      </span>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${getRarityColor(item.rarity)} ${getRarityBorder(item.rarity)}`}>
                      {item.rarity}
                    </span>
                  </div>

                  <h4 className="text-white text-lg font-black uppercase italic tracking-tight font-display mb-1">
                    {item.name}
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Stats list */}
                  {item.stats && Object.keys(item.stats).length > 0 && (
                    <div className="grid grid-cols-2 gap-1.5 mb-4">
                      {Object.entries(item.stats).map(([stat, val]) => (
                        <div key={stat} className="p-1.5 bg-white/5 rounded border border-white/5 flex justify-between text-[11px]">
                          <span className="text-slate-400 font-bold">{stat}</span>
                          <span className="text-emerald-400 font-black">+{val}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.effect && (
                    <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg text-[10px] text-primary font-bold mb-4">
                      {item.effect}
                    </div>
                  )}
                </div>

                {/* Buy Options */}
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onBuyItem(item, 'gold')}
                      disabled={!canAffordGold}
                      className={`flex-1 py-2.5 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-1.5 transition-all ${
                        canAffordGold
                          ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-md shadow-yellow-500/20'
                          : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">monetization_on</span>
                      {item.priceGold.toLocaleString()} G
                    </button>

                    {item.priceEssence && (
                      <button
                        onClick={() => onBuyItem(item, 'essence')}
                        disabled={!canAffordEssence}
                        className={`flex-1 py-2.5 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-1.5 transition-all ${
                          canAffordEssence
                            ? 'bg-accent hover:bg-purple-500 text-white shadow-md shadow-purple-500/20'
                            : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">diamond</span>
                        {item.priceEssence} Stones
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: Gacha / Shadow Extraction View */}
      {activeTab === 'gacha' && (
        <section className="bg-surface-dark border-2 border-accent/40 rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto space-y-8 shadow-[0_0_50px_rgba(139,92,246,0.25)] relative overflow-hidden animate-fadeIn">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-accent/20 border border-accent/40 text-accent text-xs font-black uppercase tracking-[0.3em] rounded-full">
              PORTAL DEL MONARCA
            </span>
            <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight text-white text-glow font-display">
              Extracción de Sombras
            </h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              Canjea 25 Essence Stones para abrir una fisura interdimensional y extraer un artefacto legendario o mítico.
            </p>
          </div>

          <div className="relative py-8 flex flex-col items-center justify-center">
            {/* Spinning background rays when an item is revealed */}
            {gachaResult && !isOpeningGacha && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="size-96 rounded-full bg-gradient-to-r from-accent/30 via-primary/30 to-amber-500/30 animate-ray-spin blur-xl" />
              </div>
            )}

            <div className={`size-48 md:size-56 rounded-full border-4 border-dashed border-accent flex items-center justify-center transition-all duration-700 relative z-10 ${
              isOpeningGacha ? 'animate-chest-rattle scale-110 border-primary shadow-[0_0_40px_rgba(77,106,255,0.7)]' : 'hover:scale-105'
            }`}>
              <div className="size-36 md:size-44 rounded-full bg-gradient-to-br from-purple-900/60 via-primary/40 to-black flex items-center justify-center shadow-inner relative overflow-hidden">
                {isOpeningGacha && (
                  <div className="absolute inset-0 bg-primary/20 animate-pulse" />
                )}
                <span className={`material-symbols-outlined text-6xl text-accent transition-all ${
                  isOpeningGacha ? 'text-white animate-bounce' : ''
                }`}>
                  {isOpeningGacha ? 'auto_awesome' : 'lock_open'}
                </span>
              </div>
            </div>

            {gachaResult && !isOpeningGacha && (
              <div className="mt-8 p-6 bg-[#161b26] border-2 border-accent/60 rounded-3xl max-w-sm w-full animate-page-enter space-y-3 relative z-10 shadow-[0_0_35px_rgba(139,92,246,0.35)]">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded border inline-block ${getRarityColor(gachaResult.rarity)} ${getRarityBorder(gachaResult.rarity)}`}>
                    {gachaResult.rarity}
                  </span>
                  <span className="text-[10px] font-mono text-purple-300 font-bold">¡INVO-EXTRAÍDO!</span>
                </div>
                <h4 className="text-white text-xl font-black italic uppercase font-display text-glow">
                  {gachaResult.name}
                </h4>
                <p className="text-slate-300 text-xs italic leading-relaxed">
                  "{gachaResult.description}"
                </p>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    En tu Inventario
                  </span>
                  <span className="text-amber-400 font-bold">{gachaResult.priceGold} G</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={handleOpenGacha}
              disabled={isOpeningGacha || player.essenceStones < 25}
              className={`px-10 py-4 rounded-2xl font-black uppercase text-sm tracking-widest transition-all ${
                player.essenceStones >= 25 && !isOpeningGacha
                  ? 'bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-105 active:scale-95'
                  : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isOpeningGacha ? 'Extrayendo Sombra...' : 'Invocar Extracción (25 Essence Stones)'}
            </button>
          </div>
        </section>
      )}

      {/* Modal: Create Custom Real-Life Reward */}
      {isCreateRewardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#141822] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">card_giftcard</span>
                <h3 className="text-white font-black uppercase text-base tracking-tight">
                  Crear Premio de la Vida Real
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateRewardOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateRewardSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                  Título del Premio (¿Qué te vas a conceder?)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 1 hr de videojuegos, Cine el fin de semana, etc."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                  Motivo / Justificación
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Me lo gano tras completar 5 días de entrenamiento seguido."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                  Costo en Oro (G)
                </label>
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={newCostGold}
                  onChange={(e) => setNewCostGold(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1.5">
                  Ícono Representativo
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map((opt) => (
                    <button
                      key={opt.icon}
                      type="button"
                      onClick={() => setNewIcon(opt.icon)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        newIcon === opt.icon
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                      <span className="text-[9px] font-mono truncate max-w-full">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateRewardOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-xs font-bold uppercase hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
                >
                  Guardar Premio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
