import React from 'react';
import { sound } from '../utils/sound';

interface BottomNavProps {
  current: string;
  onNavigate: (page: 'dashboard' | 'dungeons' | 'inventory' | 'shop' | 'shadows' | 'skills' | 'bosses' | 'analytics') => void;
  unallocatedPoints?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ current, onNavigate, unallocatedPoints = 0 }) => {
  const navItems: { id: 'dashboard' | 'dungeons' | 'inventory' | 'shop' | 'shadows' | 'skills' | 'bosses' | 'analytics'; icon: string; label: string; badge?: number }[] = [
    { id: 'dashboard', icon: 'person', label: 'Estado', badge: unallocatedPoints },
    { id: 'dungeons', icon: 'hourglass_top', label: 'Mazmorras' },
    { id: 'inventory', icon: 'inventory_2', label: 'Mochila' },
    { id: 'shop', icon: 'storefront', label: 'Mercado' },
    { id: 'shadows', icon: 'groups', label: 'Sombras' },
    { id: 'skills', icon: 'psychology', label: 'Skills' },
    { id: 'bosses', icon: 'swords', label: 'Jefes' },
    { id: 'analytics', icon: 'insights', label: 'Analítica' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0b0c10]/95 backdrop-blur-2xl border-t border-white/10 z-50 flex items-center overflow-x-auto no-scrollbar px-1">
      {navItems.map((item) => {
        const isActive = current === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              sound.playBeep(520, 0.04);
              onNavigate(item.id);
            }}
            className={`flex-1 min-w-[54px] flex flex-col items-center justify-center py-1 relative transition-all ${
              isActive ? 'text-primary' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className={`relative px-2 py-0.5 rounded-xl transition-all ${isActive ? 'bg-primary/15' : ''}`}>
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              {!!item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 size-3.5 bg-emerald-500 text-black text-[8px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-[8px] font-black uppercase tracking-tight mt-0.5 whitespace-nowrap ${isActive ? 'text-primary font-bold' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
