import { Player, Rank } from '../types';

export function calculateCombatPower(player: Player): number {
  let power = 0;

  // Base power from level
  power += player.level * 1250;

  // Power from attributes
  const { str, int, vit, agi, wis, cha } = player.attributes;
  const baseAttrSum = str.value + int.value + vit.value + agi.value + wis.value + cha.value;
  power += baseAttrSum * 450;

  // Power from equipped items
  const equipment = Object.values(player.equipped);
  equipment.forEach((item) => {
    if (item) {
      // Rarity multiplier
      let rarityMultiplier = 1;
      if (item.rarity === 'Rare') rarityMultiplier = 1.5;
      if (item.rarity === 'Epic') rarityMultiplier = 2.5;
      if (item.rarity === 'Legendary') rarityMultiplier = 5;
      if (item.rarity === 'Mythic') rarityMultiplier = 10;

      let itemStatsTotal = 0;
      Object.values(item.stats).forEach((statVal: unknown) => {
        if (typeof statVal === 'number') itemStatsTotal += statVal;
      });

      power += (itemStatsTotal * 600) * rarityMultiplier;
    }
  });

  // Title bonus
  if (player.titlesUnlocked.length > 0) {
    power += player.titlesUnlocked.length * 2000;
  }

  // Streak bonus
  power += (player.streakDays || 0) * 500;

  return Math.round(power);
}

export function getRankFromLevel(level: number): Rank {
  if (level >= 80) return Rank.NATIONAL;
  if (level >= 60) return Rank.S;
  if (level >= 45) return Rank.A;
  if (level >= 30) return Rank.B;
  if (level >= 18) return Rank.C;
  if (level >= 8) return Rank.D;
  return Rank.E;
}

export function getTitleFromLevel(level: number): string {
  if (level >= 80) return "The Shadow Monarch";
  if (level >= 60) return "S-Rank National Vanguard";
  if (level >= 45) return "Lord of the Abyssal Gate";
  if (level >= 30) return "The High Commander";
  if (level >= 18) return "The Aspiring Shadow";
  if (level >= 8) return "Awakened Novice Hunter";
  return "The Weakest Hunter";
}

export function getEffectiveAttributes(player: Player) {
  const result = {
    str: player.attributes.str.value,
    int: player.attributes.int.value,
    vit: player.attributes.vit.value,
    agi: player.attributes.agi.value,
    wis: player.attributes.wis.value,
    cha: player.attributes.cha.value,
  };

  Object.values(player.equipped).forEach((item) => {
    if (item && item.stats) {
      if (item.stats.STR) result.str += item.stats.STR;
      if (item.stats.INT) result.int += item.stats.INT;
      if (item.stats.VIT) result.vit += item.stats.VIT;
      if (item.stats.AGI) result.agi += item.stats.AGI;
      if (item.stats.WIS) result.wis += item.stats.WIS;
      if (item.stats.CHA) result.cha += item.stats.CHA;
    }
  });

  return result;
}
