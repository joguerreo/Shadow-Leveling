import { Player, Rank, ForbiddenPact } from '../types';
import { INITIAL_PLAYER, INITIAL_SHADOW_ARMY, INITIAL_ACTIVITY_HISTORY, INITIAL_FORBIDDEN_PACTS } from '../constants';

/**
 * Ensures player data is 100% structurally complete and valid,
 * preventing any undefined attribute or equipment crashes during render.
 */
export function sanitizePlayerData(raw: any): Player {
  if (!raw || typeof raw !== 'object') {
    return { ...INITIAL_PLAYER };
  }

  const baseAttrs = INITIAL_PLAYER.attributes;
  
  let rawAttrs = raw.attributes;
  if (typeof rawAttrs === 'string') {
    try {
      rawAttrs = JSON.parse(rawAttrs);
    } catch {
      rawAttrs = {};
    }
  }
  rawAttrs = rawAttrs && typeof rawAttrs === 'object' ? rawAttrs : {};

  const cleanAttr = (key: keyof typeof baseAttrs) => {
    const upperKey = key.toUpperCase();
    const rawVal = rawAttrs[key] !== undefined ? rawAttrs[key] : rawAttrs[upperKey];
    const base = baseAttrs[key];

    let numVal = base.value;
    if (typeof rawVal === 'number' && !isNaN(rawVal)) {
      numVal = rawVal;
    } else if (typeof rawVal === 'string' && !isNaN(Number(rawVal))) {
      numVal = Number(rawVal);
    } else if (typeof rawVal?.value === 'number' && !isNaN(rawVal.value)) {
      numVal = rawVal.value;
    } else if (typeof rawVal?.value === 'string' && !isNaN(Number(rawVal.value))) {
      numVal = Number(rawVal.value);
    }

    return {
      name: (typeof rawVal === 'object' && rawVal?.name) || base.name,
      code: (typeof rawVal === 'object' && rawVal?.code) || base.code,
      value: Math.max(1, Math.round(numVal)),
      icon: (typeof rawVal === 'object' && rawVal?.icon) || base.icon,
      color: (typeof rawVal === 'object' && rawVal?.color) || base.color,
      bonusText: (typeof rawVal === 'object' && rawVal?.bonusText) || base.bonusText,
    };
  };

  const attributes = {
    str: cleanAttr('str'),
    int: cleanAttr('int'),
    vit: cleanAttr('vit'),
    agi: cleanAttr('agi'),
    wis: cleanAttr('wis'),
    cha: cleanAttr('cha'),
  };

  const equipped = {
    head: raw.equipped?.head || null,
    chest: raw.equipped?.chest || null,
    pants: raw.equipped?.pants || null,
    feet: raw.equipped?.feet || null,
    gloves: raw.equipped?.gloves || null,
    weapon: raw.equipped?.weapon || null,
    accessory: raw.equipped?.accessory || null,
  };

  const titlesUnlocked = Array.isArray(raw.titlesUnlocked) && raw.titlesUnlocked.length > 0
    ? raw.titlesUnlocked
    : (Array.isArray(raw.titles_unlocked) && raw.titles_unlocked.length > 0 ? raw.titles_unlocked : ['The Weakest Hunter']);

  return {
    ...INITIAL_PLAYER,
    ...raw,
    name: (raw.name || 'Sung Jin-Woo').trim(),
    rank: (Object.values(Rank).includes(raw.rank) ? raw.rank : Rank.E) as Rank,
    title: raw.title || 'The Weakest Hunter',
    level: Math.max(1, Number(raw.level) || 1),
    xp: Math.max(0, Number(raw.xp) || 0),
    maxXp: Math.max(100, Number(raw.maxXp || raw.max_xp) || 1000),
    gold: Math.max(0, Number(raw.gold) || 0),
    essenceStones: Math.max(0, Number(raw.essenceStones || raw.essence_stones) || 0),
    statPoints: Math.max(0, Number(raw.statPoints || raw.stat_points) || 0),
    hp: Math.min(
      Math.max(50, Number(raw.maxHp || raw.max_hp) || 100),
      Math.max(0, Number(raw.hp !== undefined ? raw.hp : (raw.maxHp || raw.max_hp || 100)))
    ),
    maxHp: Math.max(50, Number(raw.maxHp || raw.max_hp) || 100),
    mp: Math.max(0, Number(raw.mp) || 300),
    maxMp: Math.max(100, Number(raw.maxMp || raw.max_mp) || 300),
    gameDifficulty: (['casual', 'hunter', 'monarch'].includes(raw.gameDifficulty || raw.game_difficulty)
      ? (raw.gameDifficulty || raw.game_difficulty)
      : 'hunter') as any,
    lifestyleArchetype: (['guardian', 'scholar', 'shadow', 'monarch'].includes(raw.lifestyleArchetype || raw.lifestyle_archetype)
      ? (raw.lifestyleArchetype || raw.lifestyle_archetype)
      : 'monarch') as any,
    forbiddenPacts: (() => {
      const baseList: ForbiddenPact[] = Array.isArray(raw.forbiddenPacts) && raw.forbiddenPacts.length > 0
        ? raw.forbiddenPacts
        : (Array.isArray(raw.forbidden_pacts) && raw.forbidden_pacts.length > 0 ? raw.forbidden_pacts : INITIAL_FORBIDDEN_PACTS);
      const merged = [...baseList];
      for (const initPact of INITIAL_FORBIDDEN_PACTS) {
        if (!merged.some((p) => p.id === initPact.id)) {
          merged.push(initPact);
        }
      }
      return merged;
    })(),
    streakDays: Math.max(0, Number(raw.streakDays || raw.streak_days) || 0),
    soundEnabled: raw.soundEnabled ?? raw.sound_enabled ?? true,
    avatarId: raw.avatarId || raw.avatar_id || 'monarch-shadow',
    avatarFrame: raw.avatarFrame || raw.avatar_frame || 'frame-e',
    hunterClass: raw.hunterClass || raw.hunter_class || 'Monarca',
    lastActiveDate: raw.lastActiveDate || raw.last_active_date || new Date().toISOString().split('T')[0],
    attributes,
    equipped,
    inventory: Array.isArray(raw.inventory) ? raw.inventory : [],
    titlesUnlocked,
    equippedTitle: raw.equippedTitle || raw.equipped_title || raw.title || 'The Weakest Hunter',
    shadowArmy: Array.isArray(raw.shadowArmy) && raw.shadowArmy.length > 0 
      ? raw.shadowArmy 
      : (Array.isArray(raw.shadow_army) && raw.shadow_army.length > 0 ? raw.shadow_army : INITIAL_SHADOW_ARMY),
    activityHistory: Array.isArray(raw.activityHistory) && raw.activityHistory.length > 0 
      ? raw.activityHistory 
      : (Array.isArray(raw.activity_history) && raw.activity_history.length > 0 ? raw.activity_history : INITIAL_ACTIVITY_HISTORY),
    latestAudit: raw.latestAudit || raw.latest_audit || undefined,
  };
}
