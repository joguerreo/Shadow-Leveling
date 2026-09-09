import React, { useState } from 'react';
import { Player, Rank, GameDifficulty, LifestyleArchetype } from '../types';
import { AVATAR_CATALOG, FRAME_CATALOG, AvatarMeta, FrameMeta } from './avatars/avatarCatalog';
import { HunterAvatar } from './avatars/HunterAvatar';
import { calculateCombatPower } from '../utils/calculator';
import { EVOLUTION_STAGES, getEvolutionStageForLevel } from '../utils/avatarEvolution';
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
  const currentEvolution = getEvolutionStageForLevel(player.level || 1);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(player.avatarId || currentEvolution.avatarId);
  const [selectedFrameId, setSelectedFrameId] = useState<string>(player.avatarFrame || currentEvolution.frameId);
  const [autoEvolve, setAutoEvolve] = useState<boolean>(player.autoEvolveAvatar !== false);
  const [hunterName, setHunterName] = useState<string>(player.name);
  const [activeTitle, setActiveTitle] = useState<string>(player.equippedTitle || player.title);
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>(player.gameDifficulty || 'hunter');
  const [selectedArchetype, setSelectedArchetype] = useState<LifestyleArchetype>(player.lifestyleArchetype || 'monarch');
  const [selectedTab, setSelectedTab] = useState<'evolution' | 'catalog' | 'license' | 'frames' | 'difficulty'>('evolution');
  const [classFilter, setClassFilter] = useState<string>('all');

  const combatPower = calculateCombatPower(player);

  const handleSave = () => {
    sound.playBeep(650, 0.08, 'sawtooth');
    onUpdateProfile({
      name: hunterName.trim() || player.name,
      avatarId: autoEvolve ? currentEvolution.avatarId : selectedAvatarId,
      avatarFrame: autoEvolve ? currentEvolution.frameId : selectedFrameId,
      autoEvolveAvatar: autoEvolve,
      equippedTitle: activeTitle,
      title: activeTitle,
      gameDifficulty: selectedDifficulty,
      lifestyleArchetype: selectedArchetype,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto overscroll-contain">
      <div className="bg-[#0c101d] border-2 border-primary/40 rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[92dvh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_60px_rgba(77,106,255,0.3)] text-white my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-primary/20 via-surface-dark to-accent/20 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-2xl">badge</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black italic tracking-tight uppercase font-display text-white truncate">
                  Evolución & Aspecto del Cazador
                </h2>
                <span className="px-1.5 sm:px-2 py-0.5 bg-primary/20 border border-primary/40 rounded text-[9px] font-mono font-bold text-primary shrink-0">
                  FASE {currentEvolution.tier}/6
                </span>
              </div>
              <p className="text-slate-400 text-xs font-mono truncate">
                Aspecto SVG, metamorfosis de maná y credenciales oficiales
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playBeep(400, 0.04);
              onClose();
            }}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-white/5 shrink-0"
            title="Cerrar"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-3 sm:px-6 bg-surface-dark/50 gap-1 sm:gap-2 pt-1 overflow-x-auto shrink-0 no-scrollbar">
          <button
            onClick={() => {
              sound.playBeep(520, 0.03);
              setSelectedTab('evolution');
            }}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              selectedTab === 'evolution'
                ? 'border-primary text-primary bg-primary/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">upgrade</span>
            Evolución ({currentEvolution.tier}/6)
          </button>

          <button
            onClick={() => {
              sound.playBeep(520, 0.03);
              setSelectedTab('catalog');
            }}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              selectedTab === 'catalog'
                ? 'border-primary text-primary bg-primary/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">palette</span>
            Catálogo ({AVATAR_CATALOG.length})
          </button>

          <button
            onClick={() => {
              sound.playBeep(520, 0.03);
              setSelectedTab('frames');
            }}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              selectedTab === 'frames'
                ? 'border-accent text-accent bg-accent/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Aura & Marcos ({FRAME_CATALOG.length})
          </button>

          <button
            onClick={() => {
              sound.playBeep(520, 0.03);
              setSelectedTab('license');
            }}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              selectedTab === 'license'
                ? 'border-indigo-400 text-indigo-400 bg-indigo-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">id_card</span>
            Licencia Holográfica
          </button>

          <button
            onClick={() => {
              sound.playBeep(520, 0.03);
              setSelectedTab('difficulty');
            }}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              selectedTab === 'difficulty'
                ? 'border-red-500 text-red-400 bg-red-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            Dificultad & Estilo
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain touch-pan-y">
          {/* Active Preview Strip & Auto-Evolve Toggle */}
          <div className="p-4 bg-surface-card rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <HunterAvatar
                avatarId={autoEvolve ? currentEvolution.avatarId : selectedAvatarId}
                frameId={autoEvolve ? currentEvolution.frameId : selectedFrameId}
                size="xl"
                animated
              />
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-primary/20 text-primary border border-primary/30">
                    {autoEvolve ? currentEvolution.subTitle : currentAvatarMeta.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    Nv. {player.level} • {player.rank}
                  </span>
                </div>
                <h3 className="text-xl font-black uppercase text-white font-display">
                  {hunterName || 'Cazador Desconocido'}
                </h3>
                <p className="text-xs text-accent font-bold italic">
                  « {activeTitle} »
                </p>
                <p className="text-xs text-slate-400 max-w-md">
                  {autoEvolve ? currentEvolution.description : `${currentAvatarMeta.name} — ${currentAvatarMeta.description}`}
                </p>
              </div>
            </div>

            {/* Quick Name, Title & Auto-Evolve Toggle */}
            <div className="flex flex-col gap-2.5 w-full md:w-64">
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">auto_mode</span>
                    Evolución Automática
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono block">
                    {autoEvolve ? 'Sincronizado con Nivel ' + player.level : 'Aspecto manual'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sound.playBeep(autoEvolve ? 450 : 650, 0.04);
                    setAutoEvolve(!autoEvolve);
                  }}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                    autoEvolve ? 'bg-primary justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="size-5 rounded-full bg-white shadow-md" />
                </button>
              </div>

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

          {/* Tab Content: Avatar Evolution */}
          {selectedTab === 'evolution' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">upgrade</span>
                    Senda de la Metamorfosis del Monarca
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Tu avatar evoluciona automáticamente a medida que conquistas mazmorras y aumentas tu nivel.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono font-bold text-primary bg-primary/15 border border-primary/30 px-2.5 py-1 rounded-lg">
                    Fase Actual: {currentEvolution.title.split(':')[0]}
                  </span>
                </div>
              </div>

              {/* Evolution Stages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EVOLUTION_STAGES.map((stage) => {
                  const isUnlocked = (player.level || 1) >= stage.minLevel;
                  const isCurrent = currentEvolution.tier === stage.tier;
                  const isSelected = autoEvolve ? isCurrent : selectedAvatarId === stage.avatarId;

                  return (
                    <div
                      key={stage.tier}
                      onClick={() => {
                        if (isUnlocked) {
                          sound.playBeep(560, 0.03);
                          setSelectedAvatarId(stage.avatarId);
                          setSelectedFrameId(stage.frameId);
                          setAutoEvolve(false);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(77,106,255,0.3)]'
                          : isUnlocked
                          ? 'bg-surface-card border-white/10 hover:border-white/20'
                          : 'bg-black/30 border-white/5 opacity-55'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <HunterAvatar
                          avatarId={stage.avatarId}
                          frameId={stage.frameId}
                          size="md"
                          showGlow={isSelected}
                        />
                        {isCurrent && (
                          <span className="absolute -top-1 -right-1 size-3 bg-emerald-400 rounded-full animate-ping" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-black uppercase text-primary">
                            {stage.title.split(':')[0]}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                              isUnlocked
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-white/5 text-slate-500'
                            }`}
                          >
                            {isUnlocked ? 'DESBLOQUEADO' : `REQ: NV.${stage.minLevel}`}
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-white leading-snug truncate">
                          {stage.subTitle}
                        </h5>

                        <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                          {stage.description}
                        </p>

                        <div className="pt-1 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-accent font-bold">{stage.statBonusText}</span>
                          {isCurrent && (
                            <span className="text-primary font-black uppercase">¡FORMA ACTUAL!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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

          {/* TAB 5: Dificultad & Estilo de Vida */}
          {selectedTab === 'difficulty' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Difficulty Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-400 text-xl">gavel</span>
                  <h4 className="text-white text-base font-black uppercase tracking-wider font-display">
                    Nivel de Rigor del Sistema (Dificultad)
                  </h4>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Define el castigo de HP y multas al caer en malos hábitos o retrasar tus misiones.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'casual',
                      name: 'Casual / Iniciación',
                      badge: 'Rango E - C',
                      color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400',
                      desc: 'Penalizaciones leves (50% daño HP). Ideal para construir hábitos con calma y sin frustración.',
                      icon: 'spa',
                    },
                    {
                      id: 'hunter',
                      name: 'Cazador Canónico',
                      badge: 'Rango B - A',
                      color: 'border-primary/50 bg-primary/10 text-primary',
                      desc: 'Castigo estándar (100% daño HP y multas). La experiencia balanceada de Solo Leveling.',
                      icon: 'swords',
                    },
                    {
                      id: 'monarch',
                      name: 'Monarca Hardcore',
                      badge: 'Rango S',
                      color: 'border-red-600/60 bg-red-950/30 text-red-400',
                      desc: 'Castigo severo (150% daño HP). Zona de Castigo inmediata si rompes más de 2 pactos.',
                      icon: 'skull',
                    },
                  ].map((diff) => (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => {
                        sound.playBeep(520, 0.04);
                        setSelectedDifficulty(diff.id as any);
                      }}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all ${
                        selectedDifficulty === diff.id
                          ? `${diff.color} ring-2 ring-white/20 shadow-lg scale-[1.02]`
                          : 'bg-surface-card border-white/10 hover:border-white/20 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="material-symbols-outlined text-2xl">{diff.icon}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 uppercase">
                          {diff.badge}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-black text-sm text-white uppercase">{diff.name}</h5>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{diff.desc}</p>
                      </div>
                      <div className="text-[10px] font-mono font-bold pt-1 text-slate-400">
                        {selectedDifficulty === diff.id ? '✓ ACTIVO' : 'Seleccionar'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lifestyle Archetype Section */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                  <h4 className="text-white text-base font-black uppercase tracking-wider font-display">
                    Arquetipo de Vida (Objetivo Principal)
                  </h4>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Adapta las misiones y bonificaciones al área de tu vida que más deseas potenciar hoy.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'guardian',
                      name: 'Guardián (Salud, Nutrición & Fitness)',
                      icon: 'fitness_center',
                      focus: 'Fuerza (STR) & Vitalidad (VIT)',
                      desc: 'Prioriza entrenamiento, cero refrescos, hidratación, comida limpia y descanso reparador.',
                      accent: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
                    },
                    {
                      id: 'scholar',
                      name: 'Erudito (Estudio, Intelecto & Lectura)',
                      icon: 'auto_stories',
                      focus: 'Inteligencia (INT) & Sabiduría (WIS)',
                      desc: 'Prioriza lectura diaria, sesiones de estudio profundo Pomodoro, idiomas y cero distracción digital.',
                      accent: 'text-blue-400 border-blue-500/40 bg-blue-950/20',
                    },
                    {
                      id: 'shadow',
                      name: 'Asesino de Sombras (Disciplina & Foco)',
                      icon: 'bolt',
                      focus: 'Agilidad (AGI) & Carisma (CHA)',
                      desc: 'Prioriza levantarse temprano, ejecutar tareas clave del trabajo o proyectos y cero procrastinación.',
                      accent: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
                    },
                    {
                      id: 'monarch',
                      name: 'Monarca (Híbrido Integral)',
                      icon: 'military_tech',
                      focus: 'Balance en todos los atributos',
                      desc: 'El camino de Jin-Woo: desarrollo integral y simultáneo de cuerpo, mente, productividad y salud.',
                      accent: 'text-purple-400 border-purple-500/40 bg-purple-950/20',
                    },
                  ].map((arch) => (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => {
                        sound.playBeep(560, 0.04);
                        setSelectedArchetype(arch.id as any);
                      }}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-2.5 transition-all ${
                        selectedArchetype === arch.id
                          ? `${arch.accent} ring-2 ring-white/20 shadow-lg scale-[1.01]`
                          : 'bg-surface-card border-white/10 hover:border-white/20 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">
                          <span className="material-symbols-outlined">{arch.icon}</span>
                        </div>
                        <div>
                          <h5 className="font-black text-sm text-white">{arch.name}</h5>
                          <span className="text-[10px] font-mono text-slate-400 font-bold block">{arch.focus}</span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">{arch.desc}</p>
                      <div className="text-[10px] font-mono font-bold text-slate-400 pt-1">
                        {selectedArchetype === arch.id ? '✓ SELECCIONADO' : 'Elegir Arquetipo'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-5 border-t border-white/10 bg-surface-dark/95 backdrop-blur-md flex justify-between items-center gap-3 sticky bottom-0 z-20 shrink-0">
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-slate-300 transition-all active:scale-95"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="min-h-[44px] px-5 sm:px-6 py-2.5 rounded-xl bg-primary hover:bg-accent text-xs font-black uppercase tracking-wider text-white system-glow flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/30"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>Guardar Aspecto</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HunterProfileModal;
