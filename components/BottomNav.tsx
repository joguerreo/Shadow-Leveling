import React from 'react';
import { sound } from '../utils/sound';
import { isFeatureUnlocked, getFeatureUnlockRule } from '../utils/featureUnlocks';
import { triggerHaptic } from '../utils/gameFx';

interface BottomNavProps {
  current: string;
  onNavigate: (page: 'dashboard' | 'dungeons' | 'inventory' | 'shop' | 'shadows' | 'skills' | 'bosses' | 'analytics') => void;
  unallocatedPoints?: number;
  playerLevel?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ current, onNavigate, unallocatedPoints = 0, playerLevel = 1 }) => {
  const navItems: { id: 'dashboard' | 'dungeons' | 'inventory' | 'shop' | 'shadows' | 'skills' | 'bosses' | 'analytics'; icon: string; label: string; badge?: number }[] = [
    { id: 'dashboard', icon: 'person', label: 'Estado', badge: unallocatedPoints },
    { id: 'dungeons', icon: 'hourglass_top', label: 'Mazmorras' },
    { id: 'inventory', icon: 'inventory_2', label: 'Mochila' },
    { id: 'shop', icon: 'storefront', label: 'Mercado' },
    { id: 'shadows', icon: 'groups', label: 'Sombras' },
    { id: 'skills', icon: 'psychology', label: 'Skills' },
    { id: 'bosses', icon: 'swords', label: 'Jefes' },
    { id: 'analytics', icon: 'insights', label: 'Stats' },
  ];

  const handleItemClick = (id: 'dashboard' | 'dungeons' | 'inventory' | 'shop' | 'shadows' | 'skills' | 'bosses' | 'analytics') => {
    triggerHaptic('tap');
    const unlocked = isFeatureUnlocked(id, playerLevel);
    if (!unlocked) {
      const rule = getFeatureUnlockRule(id);
      sound.playBeep(220, 0.15, 'sawtooth');
      alert(`[ ACCESO RESTRINGIDO POR EL SISTEMA ]\n\nRequiere alcanzar el Nivel ${rule?.minLevel || '?'} para acceder a «${rule?.name || id}».\nActualmente tu nivel es ${playerLevel}. ¡Sigue completando misiones para desbloquear esta dimensión!`);
      return;
    }
    sound.playBeep(520, 0.04);
    onNavigate(id);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 select-none">
      {/* Top Holographic Energy Beam */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 shadow-[0_0_8px_#00f0ff]" />

      {/* Main Command Dock Housing */}
      <div className="h-16 bg-[#080a11]/95 backdrop-blur-2xl border-t border-cyan-500/20 flex items-center overflow-x-auto no-scrollbar px-1 shadow-[0_-10px_25px_rgba(0,0,0,0.85)]">
        {navItems.map((item) => {
          const isActive = current === item.id;
          const unlocked = isFeatureUnlocked(item.id, playerLevel);
          const rule = getFeatureUnlockRule(item.id);

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`flex-1 min-w-[56px] h-full flex flex-col items-center justify-center relative transition-all active:scale-90 active:translate-y-0.5 touch-manipulation ${
                !unlocked ? 'opacity-40' : isActive ? 'text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              {/* Active High-Energy Underglow Indicator */}
              {isActive && (
                <span className="absolute top-0 inset-x-2 h-[2px] bg-cyan-400 shadow-[0_0_10px_#00f0ff]" />
              )}

              <div
                className={`relative px-2.5 py-1 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-b from-cyan-500/25 to-blue-600/10 border border-cyan-400/40 shadow-[0_0_14px_rgba(0,240,255,0.3)]'
                    : 'bg-transparent'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] transition-transform ${
                    isActive ? 'scale-110 drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]' : ''
                  }`}
                >
                  {!unlocked ? 'lock' : item.icon}
                </span>

                {/* Gacha Red Notification Dot (Pending Points/Alerts) */}
                {unlocked && !!item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex size-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-3.5 bg-rose-600 text-white text-[8px] font-mono font-black items-center justify-center border border-rose-950">
                      {item.badge}
                    </span>
                  </span>
                )}

                {!unlocked && rule && (
                  <span className="absolute -top-1 -right-2 px-1 bg-amber-500 text-black text-[7px] font-black rounded font-mono shadow-sm">
                    L{rule.minLevel}
                  </span>
                )}
              </div>

              <span
                className={`text-[8.5px] font-mono uppercase tracking-wider mt-0.5 whitespace-nowrap transition-colors ${
                  isActive ? 'text-cyan-300 font-black' : 'text-slate-500 font-semibold'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
