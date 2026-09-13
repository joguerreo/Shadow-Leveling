import { Player, Rank } from '../types';

export function calculateCombatPower(player: Player): number {
  if (!player) return 0;
  let power = 0;

  // Base power from level
  power += (player.level || 1) * 1250;

  // Power from attributes with safe fallbacks
  const attrs = player.attributes || ({} as any);
  const str = attrs.str?.value ?? 10;
  const int = attrs.int?.value ?? 10;
  const vit = attrs.vit?.value ?? 10;
  const agi = attrs.agi?.value ?? 10;
  const wis = attrs.wis?.value ?? 10;
  const cha = attrs.cha?.value ?? 10;

  const baseAttrSum = str + int + vit + agi + wis + cha;
  power += baseAttrSum * 450;

  // Power from habits & completed tasks
  const equipment = Object.values(player.equipped || {});
  equipment.forEach((item) => {
    if (item && item.stats) {
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
  if (Array.isArray(player.titlesUnlocked) && player.titlesUnlocked.length > 0) {
    power += player.titlesUnlocked.length * 2000;
  }

  // Streak bonus
  power += (player.streakDays || 0) * 500;

  return Math.round(power);
}

export const calculateDisciplineScore = calculateCombatPower;

export function getRankFromLevel(level: number): Rank {
  if (level >= 80) return Rank.NATIONAL;
  if (level >= 60) return Rank.S;
  if (level >= 45) return Rank.A;
  if (level >= 30) return Rank.B;
  if (level >= 18) return Rank.C;
  if (level >= 8) return Rank.D;
  return Rank.E;
}

export function getMasteryLabelFromRank(rank: Rank | string): string {
  switch (rank) {
    case Rank.NATIONAL:
    case 'NATIONAL':
      return 'Nivel Trascendente';
    case Rank.S:
    case 'S-RANK':
      return 'Nivel Maestro';
    case Rank.A:
    case 'A-RANK':
      return 'Nivel Élite';
    case Rank.B:
    case 'B-RANK':
      return 'Nivel Avanzado';
    case Rank.C:
    case 'C-RANK':
      return 'Nivel Consistente';
    case Rank.D:
    case 'D-RANK':
      return 'Nivel Básico';
    case Rank.E:
    case 'E-RANK':
    default:
      return 'Nivel Iniciante';
  }
}

export function getTitleFromLevel(level: number): string {
  if (level >= 80) return "Maestro de Disciplina Trascendente";
  if (level >= 60) return "Especialista de Alto Rendimiento";
  if (level >= 45) return "Líder de Hábitos Élite";
  if (level >= 30) return "Estratega Consistente";
  if (level >= 18) return "Practicante Disciplinado";
  if (level >= 8) return "Constructor de Hábitos";
  return "Iniciante en Formación";
}

export function getEffectiveAttributes(player: Player) {
  const attrs = player?.attributes || ({} as any);
  const result = {
    str: attrs.str?.value ?? 10,
    int: attrs.int?.value ?? 10,
    vit: attrs.vit?.value ?? 10,
    agi: attrs.agi?.value ?? 10,
    wis: attrs.wis?.value ?? 10,
    cha: attrs.cha?.value ?? 10,
  };

  const equipped = Object.values(player?.equipped || {});
  equipped.forEach((item) => {
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
