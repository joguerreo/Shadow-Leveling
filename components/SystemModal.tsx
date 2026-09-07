import React from 'react';

export interface SystemModalData {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  type: 'level_up' | 'quest_reward' | 'loot_drop' | 'penalty_warning' | 'info';
  rewards?: {
    xp?: number;
    gold?: number;
    essenceStones?: number;
    statPoints?: number;
    itemName?: string;
  };
  onClose: () => void;
}

const SystemModal: React.FC<SystemModalData> = ({
  isOpen,
  title,
  subtitle,
  type,
  rewards,
  onClose,
}) => {
  if (!isOpen) return null;

  const isPenalty = type === 'penalty_warning';
  const isLevelUp = type === 'level_up';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Holographic Window */}
      <div 
        className={`relative w-full max-w-lg rounded-2xl border-2 p-8 shadow-2xl overflow-hidden transition-all duration-300 transform scale-100 ${
          isPenalty 
            ? 'bg-[#150a0a] border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]' 
            : isLevelUp
            ? 'bg-[#080d1a] border-primary shadow-[0_0_50px_rgba(77,106,255,0.5)]'
            : 'bg-surface-dark border-primary/40 shadow-[0_0_35px_rgba(77,106,255,0.3)]'
        }`}
      >
        {/* Animated ambient beam */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* System Header Tag */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-lg ${isPenalty ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
              {isPenalty ? 'warning' : isLevelUp ? 'military_tech' : 'notifications_active'}
            </span>
            <span className={`text-[11px] font-black tracking-[0.3em] uppercase ${isPenalty ? 'text-red-400' : 'text-primary'}`}>
              [ SYSTEM NOTIFICATION ]
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">ID: SOV-{Math.floor(1000 + Math.random() * 9000)}</span>
        </div>

        {/* Title Content */}
        <div className="text-center space-y-2 mb-6">
          <h3 className={`text-2xl md:text-3xl font-black uppercase tracking-tight italic ${
            isPenalty ? 'text-red-500' : 'text-white text-glow'
          }`}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-slate-400 text-sm font-light leading-relaxed max-w-sm mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Rewards Box */}
        {rewards && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center">
              Recompensas Acreditadas
            </span>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {rewards.xp !== undefined && (
                <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-xl">add_circle</span>
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-none">Experiencia</span>
                    <span className="text-white font-black text-sm">+{rewards.xp} XP</span>
                  </div>
                </div>
              )}
              {rewards.gold !== undefined && (
                <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <span className="material-symbols-outlined text-yellow-500 text-xl">monetization_on</span>
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-none">Gold Credits</span>
                    <span className="text-white font-black text-sm">+{rewards.gold.toLocaleString()} G</span>
                  </div>
                </div>
              )}
              {rewards.essenceStones !== undefined && (
                <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg border border-accent/20">
                  <span className="material-symbols-outlined text-accent text-xl">diamond</span>
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-none">Essence Stones</span>
                    <span className="text-white font-black text-sm">+{rewards.essenceStones}</span>
                  </div>
                </div>
              )}
              {rewards.statPoints !== undefined && (
                <div className="flex items-center gap-2 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <span className="material-symbols-outlined text-emerald-400 text-xl">star</span>
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-none">Puntos de Atributo</span>
                    <span className="text-emerald-400 font-black text-sm">+{rewards.statPoints} Pts</span>
                  </div>
                </div>
              )}
            </div>

            {rewards.itemName && (
              <div className="mt-3 p-3 bg-gradient-to-r from-purple-900/30 to-primary/20 rounded-lg border border-purple-500/30 flex items-center justify-between">
                <span className="text-xs text-slate-300">Objeto Drop:</span>
                <span className="text-xs font-black text-purple-300 uppercase italic">{rewards.itemName}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`w-full py-3.5 rounded-xl font-black uppercase text-xs tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] ${
            isPenalty
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
              : 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white system-glow'
          }`}
        >
          {isPenalty ? 'Aceptar Castigo del Sistema' : 'Aceptar y Reclamar'}
        </button>
      </div>
    </div>
  );
};

export default SystemModal;
