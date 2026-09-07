import React, { useState } from 'react';
import { Player, Rank } from '../types';
import { AVATAR_CATALOG, FRAME_CATALOG, AvatarMeta, FrameMeta } from './avatars/avatarCatalog';
import { HunterAvatar } from './avatars/HunterAvatar';
import { calculateCombatPower } from '../utils/calculator';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface HunterProfileModalProps {
  player: Player;
  onClose: () => void;
  onUpdateProfile: (updates: Partial<Player>) => void;
}

export const HunterProfileModal: React.FC<HunterProfileModalProps> = ({
  player,
  onClose,
  onUpdateProfile,
}) => {
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(player.avatarId || 'monarch-shadow');
  const [selectedFrameId, setSelectedFrameId] = useState<string>(player.avatarFrame || 'frame-e');
  const [hunterName, setHunterName] = useState<string>(player.name);
  const [activeTitle, setActiveTitle] = useState<string>(player.equippedTitle || player.title);
  const [selectedTab, setSelectedTab] = useState<'catalog' | 'license' | 'frames'>('catalog');
  const [classFilter, setClassFilter] = useState<string>('all');

  const combatPower = calculateCombatPower(player);

  const handleSave = () => {
    sound.playBeep(650, 0.08, 'sawtooth');
    onUpdateProfile({
      name: hunterName.trim() || player.name,
      avatarId: selectedAvatarId,
      avatarFrame: selectedFrameId,
      equippedTitle: activeTitle,
      title: activeTitle,
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#4d6aff', '#8b5cf6', '#38bdf8'],
      });
    } catch {
      // ignore
    }

    onClose();
  };

  const filteredAvatars = classFilter === 'all'
    ? AVATAR_CATALOG
    : AVATAR_CATALOG.filter((a) => a.hunterClass.toLowerCase() === classFilter.toLowerCase());

  const currentAvatarMeta = AVATAR_CATALOG.find((a) => a.id === selectedAvatarId) || AVATAR_CATALOG[0];
  const currentFrameMeta = FRAME_CATALOG.find((f) => f.id === selectedFrameId) || FRAME_CATALOG[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0c101d] border-2 border-primary/40 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-[0_0_60px_rgba(77,106,255,0.3)] text-white">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-primary/20 via-surface-dark to-accent/20">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">badge</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase font-display text-white">
                  Identificación & Avatar del Cazador
                </h2>
                <span className="px-2 py-0.5 bg-primary/20 border border-primary/40 rounded text-[9px] font-mono font-bold text-primary">
                  SISTEMA OFICIAL
                </span>
              </div>
              <p className="text-slate-400 text-xs font-mono">
                Personaliza tu aspecto SVG, marco de rango de aura y credenciales de la Asociación.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playBeep(400, 0.04);
              onClose();
            }}
            className="size-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-white/5"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-6 bg-surface-dark/50 gap-2 pt-2">
          <button
            onClick={() => {
              sound.playBeep(520, 0.03);
              setSelectedTab('catalog');
            }}
            className={`px-4 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              selectedTab === 'catalog'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">palette</span>
            Catálogo de Avatares SVG ({AVATAR_CATALOG.length})
          </button>

          <button
            onClick={() => {
              sound.playBeep(520, 0.03);
              setSelectedTab('frames');
            }}
            className={`px-4 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              selectedTab === 'frames'
                ? 'border-accent text-accent'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Marcos de Rango & Aura ({FRAME_CATALOG.length})
          </button>

          <button
            onClick={() => {
              sound.playBeep(520, 0.03);
              setSelectedTab('license');
            }}
            className={`px-4 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              selectedTab === 'license'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">id_card</span>
            Licencia Holográfica
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Preview Strip */}
          <div className="p-4 bg-surface-card rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <HunterAvatar
                avatarId={selectedAvatarId}
                frameId={selectedFrameId}
                size="xl"
                animated
              />
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-primary/20 text-primary border border-primary/30">
                    {currentAvatarMeta.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    Clase: {currentAvatarMeta.hunterClass}
                  </span>
                </div>
                <h3 className="text-xl font-black uppercase text-white font-display">
                  {hunterName || 'Cazador Desconocido'}
                </h3>
                <p className="text-xs text-accent font-bold italic">
                  « {activeTitle} »
                </p>
                <p className="text-xs text-slate-400 max-w-md">
                  {currentAvatarMeta.name} — {currentAvatarMeta.description}
                </p>
              </div>
            </div>

            {/* Quick Name & Title Edits */}
            <div className="flex flex-col gap-2 w-full md:w-64">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                  Nombre del Cazador
                </label>
                <input
                  type="text"
                  value={hunterName}
                  onChange={(e) => setHunterName(e.target.value)}
                  maxLength={25}
                  className="w-full bg-surface-dark border border-border-dark px-3 py-1.5 rounded-xl text-xs text-white focus:outline-none focus:border-primary font-mono"
                  placeholder="Sung Jin-Woo"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                  Título Activo
                </label>
                <select
                  value={activeTitle}
                  onChange={(e) => setActiveTitle(e.target.value)}
                  className="w-full bg-surface-dark border border-border-dark px-3 py-1.5 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value={player.title}>{player.title} (Actual)</option>
                  {(player.titlesUnlocked || [
                    'El Que Superó la Muerte',
                    'Asesino de Lobos',
                    'Cazador de Rango S',
                    'Soberano de las Sombras',
                    'Monarca de la Devoción',
                    'Conquistador de Mazmorras',
                  ]).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tab Content: Avatar Catalog */}
          {selectedTab === 'catalog' && (
            <div className="space-y-4">
              {/* Class Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">
                  Filtrar por Clase:
                </span>
                {['all', 'Monarca', 'Sombra', 'Asesino', 'Mago', 'Caballero', 'Bestia', 'Sanador'].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      sound.playBeep(480, 0.02);
                      setClassFilter(c);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                      classFilter.toLowerCase() === c.toLowerCase()
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    {c === 'all' ? 'Todos' : c}
                  </button>
                ))}
              </div>

              {/* Grid of Avatars */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredAvatars.map((avatar) => {
                  const isSelected = selectedAvatarId === avatar.id;
                  return (
                    <div
                      key={avatar.id}
                      onClick={() => {
                        sound.playBeep(580, 0.04);
                        setSelectedAvatarId(avatar.id);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col items-center text-center relative group ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(77,106,255,0.3)] scale-[1.02]'
                          : 'border-white/5 bg-surface-dark/70 hover:border-white/20 hover:bg-surface-dark'
                      }`}
                    >
                      {/* Class Badge */}
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-white/5 text-slate-400 border border-white/5">
                        {avatar.hunterClass}
                      </span>

                      {/* SVG Avatar */}
                      <div className="my-2">
                        <HunterAvatar
                          avatarId={avatar.id}
                          frameId={selectedFrameId}
                          size="lg"
                          showGlow={isSelected}
                          animated
                        />
                      </div>

                      <h4 className="text-xs font-black uppercase text-white tracking-wider mt-1 line-clamp-1">
                        {avatar.name}
                      </h4>
                      <p className="text-[10px] text-accent font-medium line-clamp-1">
                        {avatar.subTitle}
                      </p>

                      <span className="mt-2 text-[9px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/5">
                        {avatar.badge}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Content: Frame Catalog */}
          {selectedTab === 'frames' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Selecciona el marco de maná y aura que rodea tu avatar. Los marcos reflejan tu Rango actual de Cazador.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {FRAME_CATALOG.map((frame) => {
                  const isSelected = selectedFrameId === frame.id;
                  return (
                    <div
                      key={frame.id}
                      onClick={() => {
                        sound.playBeep(550, 0.04);
                        setSelectedFrameId(frame.id);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                        isSelected
                          ? 'border-accent bg-accent/10 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                          : 'border-white/5 bg-surface-dark/70 hover:border-white/20'
                      }`}
                    >
                      <HunterAvatar
                        avatarId={selectedAvatarId}
                        frameId={frame.id}
                        size="md"
                        showGlow={isSelected}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-white">{frame.name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {frame.description}
                        </p>
                        <span className="inline-block text-[9px] font-mono font-bold text-accent">
                          Req: {frame.rankReq}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Content: Hunter Holographic License Card */}
          {selectedTab === 'license' && (
            <div className="flex flex-col items-center justify-center p-4">
              <div className="relative w-full max-w-lg rounded-3xl p-6 bg-gradient-to-br from-[#0c1222] via-[#090d16] to-[#17102b] border-2 border-primary shadow-[0_0_40px_rgba(77,106,255,0.4)] overflow-hidden">
                {/* Background Holographic Lines */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4d6aff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top Association Bar */}
                <div className="flex justify-between items-center pb-4 border-b border-white/10 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">shield</span>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary block">
                        KOREAN HUNTERS ASSOCIATION
                      </span>
                      <span className="text-[8px] font-mono text-slate-400">
                        OFFICIAL HUNTER LICENSE • ID #{player.level}99-SL
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-surface-dark border border-accent/40 rounded-xl text-xs font-black font-mono text-accent">
                    {player.rank}
                  </span>
                </div>

                {/* Center ID Body */}
                <div className="flex flex-col sm:flex-row items-center gap-6 py-6 relative z-10">
                  <HunterAvatar
                    avatarId={selectedAvatarId}
                    frameId={selectedFrameId}
                    size="2xl"
                    showGlow
                  />

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block">
                        Nombre Registrado
                      </span>
                      <h3 className="text-2xl font-black uppercase italic text-white font-display">
                        {hunterName || player.name}
                      </h3>
                      <p className="text-xs text-primary font-bold">
                        « {activeTitle} »
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 font-mono text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block">Nivel Actual</span>
                        <span className="font-bold text-white">LVL {player.level}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block">Poder Combate</span>
                        <span className="font-bold text-yellow-400">{combatPower.toLocaleString()} CP</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block">Racha Activa</span>
                        <span className="font-bold text-emerald-400">{player.streakDays} Días</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block">Moneda de Oro</span>
                        <span className="font-bold text-amber-300">{player.gold.toLocaleString()} G</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[8px] font-mono text-slate-400 relative z-10">
                  <span>AUTORIZADO PARA INCURSIONES EN MAZMORRAS</span>
                  <span className="text-primary font-bold">SHADOW MONARCH SYSTEM</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-surface-dark/80 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-slate-300 transition-all"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-accent text-xs font-black uppercase tracking-wider text-white system-glow flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/30"
          >
            <span className="material-symbols-outlined text-base">save</span>
            Guardar Aspecto del Cazador
          </button>
        </div>
      </div>
    </div>
  );
};

export default HunterProfileModal;
