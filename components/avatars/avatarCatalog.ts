export interface AvatarMeta {
  id: string;
  name: string;
  subTitle: string;
  hunterClass: 'Monarca' | 'Sombra' | 'Asesino' | 'Mago' | 'Caballero' | 'Bestia' | 'Sanador';
  minRank: 'E-RANK' | 'D-RANK' | 'C-RANK' | 'B-RANK' | 'A-RANK' | 'S-RANK' | 'NATIONAL-RANK';
  description: string;
  primaryColor: string;
  accentColor: string;
  badge: string;
}

export interface FrameMeta {
  id: string;
  name: string;
  rankReq: string;
  borderColor: string;
  glowColor: string;
  description: string;
}

export const AVATAR_CATALOG: AvatarMeta[] = [
  {
    id: 'monarch-shadow',
    name: 'Monarca de las Sombras',
    subTitle: 'Sung Jin-Woo',
    hunterClass: 'Monarca',
    minRank: 'E-RANK',
    description: 'El soberano del ejército de sombras, con mirada de maná celeste y aura de oscuridad eterna.',
    primaryColor: '#4d6aff',
    accentColor: '#8b5cf6',
    badge: 'MONARCA',
  },
  {
    id: 'igris-knight',
    name: 'Igris el Sanguinario',
    subTitle: 'Caballero Carmesí de la Muerte',
    hunterClass: 'Caballero',
    minRank: 'E-RANK',
    description: 'Yelmo de obsidiana con penacho escarlata ondeante y visor de fuego espectral.',
    primaryColor: '#ef4444',
    accentColor: '#991b1b',
    badge: 'LEGIONARIO',
  },
  {
    id: 'beru-ant',
    name: 'Beru, Rey de la Isla',
    subTitle: 'Comandante del Enjambre',
    hunterClass: 'Sombra',
    minRank: 'C-RANK',
    description: 'Exoesqueleto carmesí y púrpura con antenas afiladas y ojos fulgurantes de devorador.',
    primaryColor: '#a855f7',
    accentColor: '#c084fc',
    badge: 'GENERAL',
  },
  {
    id: 'cha-assassin',
    name: 'Cha Hae-In',
    subTitle: 'Maestra de la Espada Radiante',
    hunterClass: 'Asesino',
    minRank: 'D-RANK',
    description: 'Cazadora de Rango S de cabellera dorada, precisión de esgrima y aura de luz dorada.',
    primaryColor: '#eab308',
    accentColor: '#fef08a',
    badge: 'RANGO S',
  },
  {
    id: 'choi-pyro',
    name: 'Choi Jong-In',
    subTitle: 'El Soldado Máximo',
    hunterClass: 'Mago',
    minRank: 'C-RANK',
    description: 'Líder del Gremio Cazadores, maestro de las llamas incandescentes y runas de ignición.',
    primaryColor: '#f97316',
    accentColor: '#ef4444',
    badge: 'PIROMANTE',
  },
  {
    id: 'beast-monarch',
    name: 'Baek Yoon-Ho',
    subTitle: 'Tigre Blanco Despertado',
    hunterClass: 'Bestia',
    minRank: 'B-RANK',
    description: 'Fuerza animal desatada con garras de bestia, mirada ambarina salvaje y melena plateada.',
    primaryColor: '#f59e0b',
    accentColor: '#78716c',
    badge: 'METAMORFO',
  },
  {
    id: 'frost-monarch',
    name: 'Soberano de la Escarcha',
    subTitle: 'Espíritu de las Ventiscas',
    hunterClass: 'Mago',
    minRank: 'A-RANK',
    description: 'Corona de hielo perpetuo, mirada gélida ártica y runas glaciales del abismo blanco.',
    primaryColor: '#06b6d4',
    accentColor: '#38bdf8',
    badge: 'SOBERANO',
  },
  {
    id: 'kaisel-dragon',
    name: 'Kaisel el Wyvern',
    subTitle: 'Montura del Rey de las Sombras',
    hunterClass: 'Sombra',
    minRank: 'B-RANK',
    description: 'Dragón esquelético envuelto en vapores nocturnos con cuernos afilados y ojos de zafiro.',
    primaryColor: '#6366f1',
    accentColor: '#4338ca',
    badge: 'MONTURA',
  },
  {
    id: 'void-necromancer',
    name: 'Nigromante del Vacío',
    subTitle: 'Heraldo del Juicio Final',
    hunterClass: 'Monarca',
    minRank: 'A-RANK',
    description: 'Cráneo espectral con capucha azabache y fuego fatuo en las cuencas de los ojos.',
    primaryColor: '#3b82f6',
    accentColor: '#1d4ed8',
    badge: 'ESPECTRO',
  },
  {
    id: 'awakened-novice',
    name: 'El Cazador Más Débil',
    subTitle: 'El Despertar en la Doble Mazmorra',
    hunterClass: 'Asesino',
    minRank: 'E-RANK',
    description: 'El origen de todo. Jin-Woo novato con vendajes, voluntad inquebrantable y daga de novato.',
    primaryColor: '#64748b',
    accentColor: '#38bdf8',
    badge: 'ORIGEN',
  },
  {
    id: 'light-healer',
    name: 'Min Byung-Gyu',
    subTitle: 'Apóstol de la Luz Sagrada',
    hunterClass: 'Sanador',
    minRank: 'B-RANK',
    description: 'Corona de luz aureolada, mirada de compasión y barrera de bendición divina.',
    primaryColor: '#22c55e',
    accentColor: '#86efac',
    badge: 'SANADOR',
  },
  {
    id: 'tank-iron',
    name: 'Iron el Escudero',
    subTitle: 'Muro Infranqueable de las Sombras',
    hunterClass: 'Caballero',
    minRank: 'D-RANK',
    description: 'Armadura pesada de placas de sombra con cuernos de ariete y escudo de guerra.',
    primaryColor: '#64748b',
    accentColor: '#475569',
    badge: 'DEFENSOR',
  },
];

export const FRAME_CATALOG: FrameMeta[] = [
  {
    id: 'frame-e',
    name: 'Marco de Bronce (Rango E)',
    rankReq: 'E-RANK',
    borderColor: '#78716c',
    glowColor: 'rgba(120, 113, 108, 0.4)',
    description: 'Borde metálico rústico de cazador principiante.',
  },
  {
    id: 'frame-d',
    name: 'Marco de Acero (Rango D)',
    rankReq: 'D-RANK',
    borderColor: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    description: 'Acero pulido de las mazmorras de incursión.',
  },
  {
    id: 'frame-c',
    name: 'Marco Dorado (Rango C)',
    rankReq: 'C-RANK',
    borderColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.5)',
    description: 'Oro templado con remaches de maná reforzado.',
  },
  {
    id: 'frame-b',
    name: 'Marco de Zafiro (Rango B)',
    rankReq: 'B-RANK',
    borderColor: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.6)',
    description: 'Gemas de zafiro con destellos de maná puro.',
  },
  {
    id: 'frame-a',
    name: 'Marco Carmesí (Rango A)',
    rankReq: 'A-RANK',
    borderColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.7)',
    description: 'Rubí de combate de la élite de cazadores.',
  },
  {
    id: 'frame-s',
    name: 'Obsidiana & Amatista (Rango S)',
    rankReq: 'S-RANK',
    borderColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.8)',
    description: 'Poder de calamidad reservado para cazadores de Rango S.',
  },
  {
    id: 'frame-monarch',
    name: 'Corona del Monarca de las Sombras',
    rankReq: 'NATIONAL-RANK',
    borderColor: '#4d6aff',
    glowColor: 'rgba(77, 106, 255, 0.95)',
    description: 'Aura mística viviente con llamas de maná oscuro y destellos celestes.',
  },
];
