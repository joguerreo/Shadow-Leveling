import React, { useState } from 'react';
import { Player, Item, ItemSlot } from '../types';
import { calculateCombatPower, getEffectiveAttributes } from '../utils/calculator';
import { sound } from '../utils/sound';

interface InventoryProps {
  player: Player;
  onEquipItem: (item: Item) => void;
  onUnequipSlot: (slot: keyof Player['equipped']) => void;
  onUseConsumable: (item: Item) => void;
  onSellItem: (item: Item) => void;
}

const Inventory: React.FC<InventoryProps> = ({
  player,
  onEquipItem,
  onUnequipSlot,
  onUseConsumable,
  onSellItem,
}) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const combatPower = calculateCombatPower(player);
  const effectiveStats = getEffectiveAttributes(player);

  const filterItems = (filter: string) => {
    sound.playBeep(550, 0.03);
    setActiveFilter(filter);
  };

  const filteredInventory = player.inventory.filter((item) => {
    if (activeFilter === 'weapons') return item.slot === 'weapon';
    if (activeFilter === 'armor') return ['head', 'chest', 'pants', 'feet', 'gloves'].includes(item.slot);
    if (activeFilter === 'accessories') return item.slot === 'accessory';
    if (activeFilter === 'consumables') return item.slot === 'consumable';
    return true;
  });

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

  return (
    <div className="animate-fadeIn space-y-8 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">shield</span>
            <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-glow uppercase font-display">
              Cámara de Equipamiento
            </h2>
          </div>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
            Gestión de Artefactos, Armas y Reliquias del Monarca
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Capacidad: {player.inventory.length}/50
            </span>
            <div className="w-36 h-1.5 bg-slate-900 mt-1 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${(player.inventory.length / 50) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Paperdoll / Character Visual & Equipped Gear */}
        <section className="lg:col-span-5 bg-surface-dark border border-border-dark rounded-2xl p-6 md:p-8 flex flex-col items-center justify-between relative min-h-[520px] shadow-2xl">
          {/* Subtle background monarch silhouette */}
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
            <span className="material-symbols-outlined text-[340px]">person</span>
          </div>

          <div className="w-full flex justify-between items-center z-10 border-b border-white/5 pb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              EQUIPO ACTIVO
            </span>
            <span className="text-[10px] font-mono text-primary font-bold">
              RANURAS 7/7
            </span>
          </div>

          {/* Slots Grid */}
          <div className="grid grid-cols-3 gap-6 my-6 relative z-10 w-full max-w-sm">
            {/* Left Column: Head, Weapon, Gloves */}
            <div className="flex flex-col gap-6 items-center">
              <EquipmentSlot
                slotKey="head"
                icon="visibility"
                label="CASCO"
                item={player.equipped.head}
                onSelect={() => setSelectedItem(player.equipped.head)}
                onUnequip={() => onUnequipSlot('head')}
                getRarityBorder={getRarityBorder}
                getRarityColor={getRarityColor}
              />
              <EquipmentSlot
                slotKey="weapon"
                icon="swords"
                label="ARMA"
                item={player.equipped.weapon}
                onSelect={() => setSelectedItem(player.equipped.weapon)}
                onUnequip={() => onUnequipSlot('weapon')}
                getRarityBorder={getRarityBorder}
                getRarityColor={getRarityColor}
              />
              <EquipmentSlot
                slotKey="gloves"
                icon="back_hand"
                label="GUANTES"
                item={player.equipped.gloves}
                onSelect={() => setSelectedItem(player.equipped.gloves)}
                onUnequip={() => onUnequipSlot('gloves')}
                getRarityBorder={getRarityBorder}
                getRarityColor={getRarityColor}
              />
            </div>

            {/* Middle: Energy Conduit */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-0.5 h-64 bg-gradient-to-b from-primary/10 via-primary/50 to-primary/10 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center animate-pulse">
                  <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                </div>
              </div>
            </div>

            {/* Right Column: Chest, Pants, Feet, Accessory */}
            <div className="flex flex-col gap-6 items-center">
              <EquipmentSlot
                slotKey="chest"
                icon="shield"
                label="PECHERA"
                item={player.equipped.chest}
                onSelect={() => setSelectedItem(player.equipped.chest)}
                onUnequip={() => onUnequipSlot('chest')}
                getRarityBorder={getRarityBorder}
                getRarityColor={getRarityColor}
              />
              <EquipmentSlot
                slotKey="pants"
                icon="layers"
                label="PANTALONES"
                item={player.equipped.pants}
                onSelect={() => setSelectedItem(player.equipped.pants)}
                onUnequip={() => onUnequipSlot('pants')}
                getRarityBorder={getRarityBorder}
                getRarityColor={getRarityColor}
              />
              <EquipmentSlot
                slotKey="feet"
                icon="steps"
                label="BOTAS"
                item={player.equipped.feet}
                onSelect={() => setSelectedItem(player.equipped.feet)}
                onUnequip={() => onUnequipSlot('feet')}
                getRarityBorder={getRarityBorder}
                getRarityColor={getRarityColor}
              />
            </div>
          </div>

          {/* Accessory centered slot at bottom */}
          <div className="z-10 -mt-2 mb-4">
            <EquipmentSlot
              slotKey="accessory"
              icon="diamond"
              label="RELIQUIA / ANILLO"
              item={player.equipped.accessory}
              onSelect={() => setSelectedItem(player.equipped.accessory)}
              onUnequip={() => onUnequipSlot('accessory')}
              getRarityBorder={getRarityBorder}
              getRarityColor={getRarityColor}
            />
          </div>

          {/* Dynamic Combat Power Readout */}
          <div className="w-full text-center z-10 pt-4 border-t border-white/5">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
              PODER DE COMBATE TOTAL
            </h3>
            <p className="text-white text-4xl font-black italic text-glow font-mono">
              {combatPower.toLocaleString()}
            </p>
          </div>
        </section>

        {/* Item Grid & Details Inspector */}
        <section className="lg:col-span-7 space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-surface-dark border border-white/5 rounded-xl">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'weapons', label: 'Armas' },
              { id: 'armor', label: 'Armaduras' },
              { id: 'accessories', label: 'Reliquias' },
              { id: 'consumables', label: 'Consumibles' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => filterItems(f.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  activeFilter === f.id
                    ? 'bg-primary text-white system-glow'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Two-Column Grid: Bag on Left, Details on Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bag Inventory Grid */}
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-5 min-h-[360px]">
              <div className="grid grid-cols-4 gap-3">
                {filteredInventory.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        sound.playBeep(480, 0.04);
                        setSelectedItem(item);
                      }}
                      className={`aspect-square rounded-xl border-2 bg-slate-900/60 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 relative ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/40 bg-primary/10'
                          : getRarityBorder(item.rarity)
                      }`}
                    >
                      <span className={`material-symbols-outlined text-2xl md:text-3xl ${getRarityColor(item.rarity)}`}>
                        {item.icon}
                      </span>
                      {item.slot === 'consumable' && (
                        <span className="absolute bottom-1 right-1.5 text-[9px] font-bold text-accent">USE</span>
                      )}
                    </div>
                  );
                })}

                {/* Empty lock slots */}
                {Array.from({ length: Math.max(0, 16 - filteredInventory.length) }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl border border-dashed border-white/5 bg-white/[0.01] flex items-center justify-center opacity-30"
                  >
                    <span className="material-symbols-outlined text-slate-700 text-lg">lock</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspector Panel */}
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-6 flex flex-col justify-between">
              {selectedItem ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border inline-block ${getRarityColor(selectedItem.rarity)} ${getRarityBorder(selectedItem.rarity)}`}>
                      {selectedItem.rarity}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-slate-400">
                      Ranura: {selectedItem.slot}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-white text-xl font-black italic uppercase tracking-tight font-display">
                      {selectedItem.name}
                    </h4>
                    <p className="text-slate-400 text-xs mt-1 italic leading-relaxed">
                      "{selectedItem.description}"
                    </p>
                  </div>

                  {/* Stats list */}
                  {selectedItem.stats && Object.keys(selectedItem.stats).length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Bonificaciones de Atributo
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(selectedItem.stats).map(([stat, val]) => (
                          <div
                            key={stat}
                            className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/5"
                          >
                            <span className="text-xs font-bold text-slate-300">{stat}</span>
                            <span className="text-xs font-black text-emerald-400">+{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItem.effect && (
                    <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-lg">
                      <span className="text-[10px] font-bold text-primary block">Efecto Especial:</span>
                      <span className="text-xs text-white font-medium">{selectedItem.effect}</span>
                    </div>
                  )}

                  {/* Buttons: Equip / Unequip / Use / Sell */}
                  <div className="pt-4 space-y-2">
                    {selectedItem.slot === 'consumable' ? (
                      <button
                        onClick={() => {
                          onUseConsumable(selectedItem);
                          setSelectedItem(null);
                        }}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black uppercase text-xs rounded-xl shadow-lg transition-all"
                      >
                        Consumir Objeto
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onEquipItem(selectedItem);
                          setSelectedItem(null);
                        }}
                        className="w-full py-3 bg-primary hover:bg-accent text-white font-black uppercase text-xs rounded-xl system-glow transition-all"
                      >
                        Equipar Objeto
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onSellItem(selectedItem);
                        setSelectedItem(null);
                      }}
                      className="w-full py-2 bg-white/5 hover:bg-red-950/40 border border-white/5 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-[11px] font-bold uppercase rounded-lg transition-all"
                    >
                      Vender por {Math.floor(selectedItem.priceGold * 0.6)} Gold
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 opacity-40 space-y-3">
                  <span className="material-symbols-outlined text-5xl text-slate-600">touch_app</span>
                  <div>
                    <h5 className="text-xs font-black uppercase tracking-widest text-slate-300">
                      Examinador de Artefactos
                    </h5>
                    <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                      Selecciona cualquier objeto del inventario o de tu equipo activo para inspeccionar estadísticas y equiparlo.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

interface EquipmentSlotProps {
  slotKey: keyof Player['equipped'];
  icon: string;
  label: string;
  item: Item | null;
  onSelect: () => void;
  onUnequip: () => void;
  getRarityBorder: (rarity: string) => string;
  getRarityColor: (rarity: string) => string;
}

const EquipmentSlot: React.FC<EquipmentSlotProps> = ({
  icon,
  label,
  item,
  onSelect,
  onUnequip,
  getRarityBorder,
  getRarityColor,
}) => {
  return (
    <div className="group relative flex flex-col items-center">
      <div
        onClick={() => {
          if (item) onSelect();
        }}
        className={`size-16 md:size-20 rounded-2xl border-2 bg-slate-900/80 flex items-center justify-center cursor-pointer transition-all hover:scale-105 relative ${
          item ? getRarityBorder(item.rarity) : 'border-slate-800 opacity-40 hover:opacity-70'
        }`}
      >
        <span className={`material-symbols-outlined text-3xl md:text-4xl ${item ? getRarityColor(item.rarity) : 'text-slate-600'}`}>
          {item ? item.icon : icon}
        </span>

        {/* Unequip quick button */}
        {item && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnequip();
            }}
            className="absolute -top-1.5 -right-1.5 size-5 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Desequipar"
          >
            <span className="material-symbols-outlined text-xs">close</span>
          </button>
        )}
      </div>
      <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase mt-1.5 text-center">
        {label}
      </span>
    </div>
  );
};

export default Inventory;
