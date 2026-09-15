import * as THREE from 'three';

// Map quest / pact category to material symbol icon name
export const QUEST_CATEGORY_ICONS: Record<string, string> = {
  fitness: 'fitness_center',
  physical: 'fitness_center',
  intellect: 'psychology',
  discipline: 'swords',
  focus: 'center_focus_strong',
  habit: 'self_improvement',
  mindfulness: 'spa',
  vitality: 'local_fire_department',
  daily: 'task_alt',
  special: 'stars',
  // Fallbacks
  default: 'track_changes',
};

export const PACT_CATEGORY_ICONS: Record<string, string> = {
  nutrition: 'no_food',
  health: 'healing',
  discipline: 'lock',
  mind: 'mindfulness',
  // Fallbacks
  default: 'shield',
};

// Fallback Unicode symbols if canvas icon font takes a moment to load
const CATEGORY_FALLBACK_SYMBOLS: Record<string, string> = {
  fitness_center: '⚡',
  psychology: '🧠',
  swords: '⚔',
  center_focus_strong: '🎯',
  self_improvement: '✦',
  spa: '✿',
  local_fire_department: '🔥',
  task_alt: '✓',
  stars: '★',
  no_food: '⛔',
  healing: '❤',
  lock: '🔒',
  mindfulness: '👁',
  shield: '🛡',
  default: '◆',
};

const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates a high-definition circular sprite texture with the category icon
 */
export function createCategoryIconSprite(
  iconName: string,
  colorHex: string = '#38bdf8',
  size: number = 256
): THREE.Sprite {
  const cacheKey = `${iconName}_${colorHex}_${size}`;
  let texture = textureCache.get(cacheKey);

  if (!texture) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.clearRect(0, 0, size, size);

      const center = size / 2;
      const radius = size * 0.42;

      // Subtle translucent dark halo disc
      const gradient = ctx.createRadialGradient(center, center, radius * 0.2, center, center, radius);
      gradient.addColorStop(0, 'rgba(10, 16, 28, 0.95)');
      gradient.addColorStop(0.7, 'rgba(10, 16, 28, 0.85)');
      gradient.addColorStop(1, 'rgba(10, 16, 28, 0)');

      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Outer delicate neon rim
      ctx.beginPath();
      ctx.arc(center, center, radius * 0.82, 0, Math.PI * 2);
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = size * 0.035;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Draw Icon (Material Symbols Outlined)
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = colorHex;
      ctx.shadowBlur = size * 0.12;

      // Try Material Symbols Outlined font
      const fontSize = Math.round(size * 0.42);
      ctx.font = `${fontSize}px "Material Symbols Outlined", sans-serif`;

      // Test if material symbols rendered or if we should use unicode fallback
      const textMetrics = ctx.measureText(iconName);
      if (textMetrics.width > fontSize * 1.8) {
        // Font might not be parsed yet into canvas; fallback symbol
        const fallback = CATEGORY_FALLBACK_SYMBOLS[iconName] || CATEGORY_FALLBACK_SYMBOLS.default;
        ctx.font = `bold ${Math.round(size * 0.46)}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(fallback, center, center + size * 0.02);
      } else {
        ctx.fillText(iconName, center, center + size * 0.02);
      }
    }

    texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    textureCache.set(cacheKey, texture);
  }

  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.95,
    depthTest: false,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  return sprite;
}
