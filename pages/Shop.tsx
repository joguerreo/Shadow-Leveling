import React, { useState } from 'react';
import { Player, ShopItem, Item } from '../types';
import { SHOP_CATALOG } from '../constants';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface ShopProps {
  player: Player;
  onBuyItem: (item: ShopItem, currency: 'gold' | 'essence') => void;
  onMysteryChest: (item: Item) => void;
}

const Shop: React.FC<ShopProps> = ({ player, onBuyItem, onMysteryChest }) => {
  const [activeTab, setActiveTab] = useState<'market' | 'gacha'>('market');
  const [isOpeningGacha, setIsOpeningGacha] = useState<boolean>(false);
  const [gachaResult, setGachaResult] = useState<Item | null>(null);

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
    sound.playAwakening();

    setTimeout(() => {
      // Generate randomized item drop
      const roll = Math.random();
      let drawnItem: Item;

      if (roll > 0.92) {
        // Mythic
        drawnItem = {
          id: `gacha_${Date.now()}`,
          name: 'Crown of the Shadow Monarch',
          description: 'The supreme regal artifact. Mana overflows endlessly.',
          rarity: 'Mythic',
          slot: 'head',
          icon: 'military_tech',
          priceGold: 25000,
          stats: { STR: 20, INT: 20, VIT: 20, AGI: 20, WIS: 20, CHA: 20 },
          effect: '+50% All Stats'
        };
      } else if (roll > 0.65) {
        // Legendary
        drawnItem = {
          id: `gacha_${Date.now()}`,
          name: 'Baran’s Lightning Greatsword',
          description: 'Heavy blade pulsating with high voltage demon mana.',
          rarity: 'Legendary',
          slot: 'weapon',
          icon: 'swords',
          priceGold: 14000,
          stats: { STR: 22, AGI: 12 },
          effect: '+35% Strike Power'
        };
      } else if (roll > 0.35) {
        // Epic
        drawnItem = {
          id: `gacha_${Date.now()}`,
          name: 'Shadow Assassin Greaves',
          description: 'Forged from darkness, steps leave no sound.',
          rarity: 'Epic',
          slot: 'pants',
          icon: 'layers',
          priceGold: 5500,
          stats: { AGI: 12, VIT: 8 }
        };
      } else {
        // Rare
        drawnItem = {
          id: `gacha_${Date.now()}`,
          name: 'Ring of Minor Focus',
          description: 'Standard enchanted ring used by B-rank assault squads.',
          rarity: 'Rare',
          slot: 'accessory',
          icon: 'diamond',
          priceGold: 2200,
          stats: { INT: 7, WIS: 5 }
        };
      }

      setGachaResult(drawnItem);
      setIsOpeningGacha(false);
      sound.playRaidVictory();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#8b5cf6', '#4d6aff', '#f59e0b'],
        });
      } catch {
        // ignore
      }
      onMysteryChest(drawnItem);
    }, 2000);
  };

  return (
    <div className="animate-fadeIn space-y-8 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">storefront</span>
            <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-glow uppercase font-display">
              Mercado del Sistema
            </h2>
          </div>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
            Adquiere Equipamiento de Élite, Elixires y Cristales de Resonancia
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 p-1 bg-surface-dark border border-white/5 rounded-xl">
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
            Catálogo
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
            Extracción de Sombras
          </button>
        </div>
      </div>

      {/* Catalog View */}
      {activeTab === 'market' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Gacha / Shadow Extraction View */}
      {activeTab === 'gacha' && (
        <section className="bg-surface-dark border-2 border-accent/40 rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto space-y-8 shadow-[0_0_50px_rgba(139,92,246,0.25)] relative overflow-hidden">
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

          {/* Animated Mystery Gate Container */}
          <div className="relative py-8 flex flex-col items-center justify-center">
            <div className={`size-48 md:size-56 rounded-full border-4 border-dashed border-accent flex items-center justify-center transition-all duration-1000 ${
              isOpeningGacha ? 'animate-spin scale-110 border-primary' : 'hover:scale-105'
            }`}>
              <div className="size-36 md:size-44 rounded-full bg-gradient-to-br from-purple-900/50 via-primary/30 to-black flex items-center justify-center shadow-inner">
                <span className={`material-symbols-outlined text-6xl text-accent transition-all ${
                  isOpeningGacha ? 'animate-pulse text-white' : ''
                }`}>
                  {isOpeningGacha ? 'auto_awesome' : 'lock_open'}
                </span>
              </div>
            </div>

            {/* Results Display */}
            {gachaResult && !isOpeningGacha && (
              <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl max-w-sm w-full animate-fadeIn space-y-3">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded border inline-block ${getRarityColor(gachaResult.rarity)} ${getRarityBorder(gachaResult.rarity)}`}>
                  {gachaResult.rarity}
                </span>
                <h4 className="text-white text-xl font-black italic uppercase font-display">
                  {gachaResult.name}
                </h4>
                <p className="text-slate-400 text-xs italic">
                  "{gachaResult.description}"
                </p>
                <div className="text-emerald-400 text-xs font-bold">
                  ¡Objeto enviado a tu Inventario!
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
    </div>
  );
};

export default Shop;
