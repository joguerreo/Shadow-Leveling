import React, { useMemo } from 'react';

interface ManaEmbersProps {
  isCritical?: boolean;
}

export const ManaEmbers: React.FC<ManaEmbersProps> = ({ isCritical = false }) => {
  // Generate stable particle parameters
  const embers = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: `${(i * 7.14 + (i % 3) * 2.5) % 100}%`,
      bottom: `${(i * 6) % 25}%`,
      size: `${2.5 + (i % 3)}px`,
      duration: `${4.5 + (i % 5) * 1.2}s`,
      delay: `${(i * 0.45) % 4}s`,
      colorVariant: isCritical ? 'crimson' : i % 4 === 0 ? 'gold' : 'mana',
    }));
  }, [isCritical]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {embers.map((ember) => (
        <span
          key={ember.id}
          className={`mana-ember ${ember.colorVariant === 'crimson' ? 'crimson' : ember.colorVariant === 'gold' ? 'gold' : ''}`}
          style={{
            left: ember.left,
            bottom: ember.bottom,
            width: ember.size,
            height: ember.size,
            animationDuration: ember.duration,
            animationDelay: ember.delay,
          }}
        />
      ))}
    </div>
  );
};
