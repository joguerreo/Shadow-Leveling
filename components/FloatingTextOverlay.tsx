import React, { useState, useEffect } from 'react';

export interface FloatingTextItem {
  id: string;
  text: string;
  type: 'xp' | 'gold' | 'essence' | 'damage' | 'heal' | 'stat' | 'critical' | 'arise';
  x: number;
  y: number;
}

// Global dispatcher helper so any button or handler in the app can trigger floating text
export function triggerCombatText(
  text: string,
  type: FloatingTextItem['type'] = 'xp',
  coords?: { x: number; y: number }
) {
  if (typeof window === 'undefined') return;

  // Fallback coords: middle-top of screen if not provided by click event
  const defaultX = window.innerWidth / 2 + (Math.random() * 80 - 40);
  const defaultY = window.innerHeight * 0.38 + (Math.random() * 60 - 30);

  const event = new CustomEvent('spawn_combat_text', {
    detail: {
      id: `float_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      text,
      type,
      x: coords?.x ?? defaultX,
      y: coords?.y ?? defaultY,
    },
  });
  window.dispatchEvent(event);
}

export const FloatingTextOverlay: React.FC = () => {
  const [items, setItems] = useState<FloatingTextItem[]>([]);

  useEffect(() => {
    const handleSpawn = (e: Event) => {
      const customEvent = e as CustomEvent<FloatingTextItem>;
      if (!customEvent.detail) return;

      const newItem = customEvent.detail;
      setItems((prev) => [...prev.slice(-15), newItem]);

      // Remove item after animation completes (1.4s)
      setTimeout(() => {
        setItems((prev) => prev.filter((it) => it.id !== newItem.id));
      }, 1400);
    };

    window.addEventListener('spawn_combat_text', handleSpawn);
    return () => window.removeEventListener('spawn_combat_text', handleSpawn);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {items.map((it) => {
        let colorClass = 'text-primary drop-shadow-[0_0_8px_rgba(77,106,255,0.8)]';
        let prefix = '';

        switch (it.type) {
          case 'xp':
            colorClass = 'text-[#60a5fa] drop-shadow-[0_0_10px_rgba(96,165,250,0.9)]';
            break;
          case 'gold':
            colorClass = 'text-[#fbbf24] drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]';
            prefix = '🟡 ';
            break;
          case 'essence':
            colorClass = 'text-[#2dd4bf] drop-shadow-[0_0_10px_rgba(45,212,191,0.9)]';
            prefix = '💎 ';
            break;
          case 'damage':
            colorClass = 'text-[#ef4444] font-black text-xl drop-shadow-[0_0_12px_rgba(239,68,68,1)]';
            prefix = '💥 ';
            break;
          case 'heal':
            colorClass = 'text-[#10b981] drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]';
            prefix = '💚 ';
            break;
          case 'stat':
            colorClass = 'text-[#c084fc] drop-shadow-[0_0_10px_rgba(192,132,252,0.9)]';
            prefix = '⚡ ';
            break;
          case 'critical':
            colorClass = 'text-[#f43f5e] font-black text-2xl tracking-widest drop-shadow-[0_0_16px_rgba(244,63,94,1)]';
            prefix = '⚡ CRITICAL: ';
            break;
          case 'arise':
            colorClass = 'text-[#a855f7] font-black text-2xl tracking-[0.25em] drop-shadow-[0_0_20px_rgba(168,85,247,1)]';
            prefix = '👑 ';
            break;
        }

        return (
          <div
            key={it.id}
            style={{ left: `${it.x}px`, top: `${it.y}px` }}
            className={`fixed font-mono font-black select-none pointer-events-none text-base sm:text-lg animate-floating-combat ${colorClass}`}
          >
            {prefix}{it.text}
          </div>
        );
      })}
    </div>
  );
};

export default FloatingTextOverlay;
