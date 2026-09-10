import { sound } from './sound';
import { triggerCombatText } from '../components/FloatingTextOverlay';
export { triggerCombatText };

/**
 * Triggers physical mobile vibration if supported
 */
export function triggerHaptic(pattern: number | number[] = [20, 30, 20]) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
}

/**
 * Applies physical screen shake animation to the game root container
 */
export function triggerScreenShake(intensity: 'light' | 'medium' | 'heavy' = 'medium') {
  if (typeof document === 'undefined') return;

  const root = document.getElementById('game-viewport') || document.body;
  root.classList.remove('screen-shake');
  // force reflow
  void root.offsetWidth;
  root.classList.add('screen-shake');

  const duration = intensity === 'heavy' ? 350 : intensity === 'medium' ? 280 : 180;
  setTimeout(() => {
    root.classList.remove('screen-shake');
  }, duration);
}

/**
 * Complete Game Impact Suite: Screen shake + Sound + Haptic + Floating Number
 */
export function triggerGameImpact(
  type: 'damage' | 'boss_hit' | 'level_up' | 'loot' | 'pact_infraction' | 'arise',
  text?: string,
  coords?: { x: number; y: number }
) {
  switch (type) {
    case 'pact_infraction':
    case 'damage':
      triggerScreenShake('heavy');
      triggerHaptic([40, 60, 40]);
      sound.playImpactBoom();
      if (text) triggerCombatText(text, 'damage', coords);
      break;

    case 'boss_hit':
      triggerScreenShake('medium');
      triggerHaptic([25, 45]);
      sound.playImpactBoom();
      if (text) triggerCombatText(text, 'critical', coords);
      break;

    case 'level_up':
      triggerScreenShake('medium');
      triggerHaptic([30, 50, 80]);
      if (text) triggerCombatText(text, 'stat', coords);
      break;

    case 'arise':
      triggerScreenShake('heavy');
      triggerHaptic([50, 70, 90]);
      sound.playAwakening();
      if (text) triggerCombatText(text, 'arise', coords);
      break;

    case 'loot':
      triggerHaptic([15, 25]);
      sound.playChestBurst();
      if (text) triggerCombatText(text, 'gold', coords);
      break;
  }
}
