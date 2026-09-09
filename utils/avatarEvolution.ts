import { Player, Rank } from '../types';
import { AVATAR_CATALOG, FRAME_CATALOG } from '../components/avatars/avatarCatalog';

export interface EvolutionStage {
  tier: number;
  minLevel: number;
  requiredRank: Rank;
  title: string;
  subTitle: string;
  avatarId: string;
  frameId: string;
  description: string;
  auraEffect: string;
  statBonusText: string;
  color: string;
}

export const EVOLUTION_STAGES: EvolutionStage[] = [
  {
    tier: 1,
    minLevel: 1,
    requiredRank: Rank.E,
    title: 'Fase I: El Despertar del Novato',
    subTitle: 'El Cazador Más Débil de la Humanidad',
    avatarId: 'awakened-novice',
    frameId: 'frame-e',
    description: 'Tus primeros pasos tras sobrevivir a la Doble Mazmorra. Vendajes de novato, daga básica y una voluntad inquebrantable.',
    auraEffect: 'Resonancia de Maná Primaria (Gris Ceniza)',
    statBonusText: '+0% Bonus de Aura',
    color: '#64748b',
  },
  {
    tier: 2,
    minLevel: 10,
    requiredRank: Rank.D,
    title: 'Fase II: Cazador de Vanguardia',
    subTitle: 'Muro de Acero Templado',
    avatarId: 'tank-iron',
    frameId: 'frame-d',
    description: 'Armadura pesada forjada en incursiones tempranas. Tu cuerpo ha desarrollado resistencia sobrehumana contra las bestias mágicas.',
    auraEffect: 'Coraza de Acero Resonante (Gris Metálico)',
    statBonusText: '+3% Resistencia de Maná',
    color: '#94a3b8',
  },
  {
    tier: 3,
    minLevel: 20,
    requiredRank: Rank.C,
    title: 'Fase III: Piromante de Ignición',
    subTitle: 'Canalizador de Llamas de Maná',
    avatarId: 'choi-pyro',
    frameId: 'frame-c',
    description: 'Despertar de runas de fuego interno. Tus hábitos se convierten en combustible puro para arrasar con la procrastinación.',
    auraEffect: 'Fulguraciones de Fuego Incandescente (Ámbar Dorado)',
    statBonusText: '+5% Multiplicador de XP',
    color: '#f97316',
  },
  {
    tier: 4,
    minLevel: 30,
    requiredRank: Rank.B,
    title: 'Fase IV: Caballero Carmesí',
    subTitle: 'Legionario de la Muerte Inmortal',
    avatarId: 'igris-knight',
    frameId: 'frame-b',
    description: 'Comandante de espadas gemelas espectrales y yelmo de obsidiana con penacho escarlata. El Sistema te reconoce como guerrero de élite.',
    auraEffect: 'Espíritu de Venganza Carmesí (Rojo Sangre)',
    statBonusText: '+8% Poder de Combate',
    color: '#ef4444',
  },
  {
    tier: 5,
    minLevel: 40,
    requiredRank: Rank.A,
    title: 'Fase V: Soberano de la Escarcha',
    subTitle: 'Heraldo del Abismo Glacial',
    avatarId: 'frost-monarch',
    frameId: 'frame-a',
    description: 'Corona de escarcha perpetua y runas de congelación mental. Dominio absoluto del enfoque profundo y la disciplina fría.',
    auraEffect: 'Vórtice Glacial Polar (Cian Resplandeciente)',
    statBonusText: '+12% Eficiencia de Maná (MP)',
    color: '#06b6d4',
  },
  {
    tier: 6,
    minLevel: 50,
    requiredRank: Rank.S,
    title: 'Fase VI: Monarca de las Sombras',
    subTitle: 'Soberano Supremo del Ejército de la Oscuridad',
    avatarId: 'monarch-shadow',
    frameId: 'frame-monarch',
    description: 'La apoteosis final. Mirada de ojos celestes penetrantes, capa de oscuridad cósmica y comando absoluto sobre la legión infinita de sombras.',
    auraEffect: 'Aura Primordial del Monarca de las Sombras (Azul Real & Púrpura)',
    statBonusText: '+20% Poder de Combate Total & Autoridad del Monarca',
    color: '#4d6aff',
  },
];

/**
 * Obtiene la etapa evolutiva correspondiente a un nivel
 */
export function getEvolutionStageForLevel(level: number): EvolutionStage {
  for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
    if (level >= EVOLUTION_STAGES[i].minLevel) {
      return EVOLUTION_STAGES[i];
    }
  }
  return EVOLUTION_STAGES[0];
}

/**
 * Resuelve el aspecto actual del jugador considerando si tiene activa
 * la Evolución Automática del Avatar o selección manual.
 */
export function resolvePlayerAvatar(player: Player) {
  const currentStage = getEvolutionStageForLevel(player.level || 1);
  const nextStage = EVOLUTION_STAGES.find((s) => s.minLevel > (player.level || 1));
  const levelsUntilNext = nextStage ? Math.max(0, nextStage.minLevel - (player.level || 1)) : 0;

  // Por defecto, si autoEvolveAvatar no está deshabilitado explícitamente (es undefined o true)
  const isAuto = player.autoEvolveAvatar !== false;

  const resolvedAvatarId = isAuto ? currentStage.avatarId : (player.avatarId || currentStage.avatarId);
  const resolvedFrameId = isAuto ? currentStage.frameId : (player.avatarFrame || currentStage.frameId);

  return {
    avatarId: resolvedAvatarId,
    frameId: resolvedFrameId,
    currentStage,
    nextStage,
    levelsUntilNext,
    isAuto,
    allStages: EVOLUTION_STAGES,
  };
}
