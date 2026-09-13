export interface AvatarMeta {
  id: string;
  name: string;
  subTitle: string;
  hunterClass: 'Operador' | 'Enfoque' | 'Estratega' | 'Resistencia' | 'Disciplina' | 'Vanguardia' | 'Sincronía';
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
    name: 'Operador Espectral',
    subTitle: 'Unidad de Enfoque Profundo',
    hunterClass: 'Operador',
    minRank: 'E-RANK',
    description: 'Especialista en concentración ininterrumpida y ejecución táctica de hábitos de alto impacto.',
    primaryColor: '#4d6aff',
    accentColor: '#8b5cf6',
    badge: 'ESPECTRAL',
  },
  {
    id: 'igris-knight',
    name: 'Vanguardia Carmesí',
    subTitle: 'Protocolo de Resistencia',
    hunterClass: 'Resistencia',
    minRank: 'E-RANK',
    description: 'Armadura de titanio y visor espectral. Máxima disciplina física y fortaleza inquebrantable.',
    primaryColor: '#ef4444',
    accentColor: '#991b1b',
    badge: 'VANGUARDIA',
  },
  {
    id: 'beru-ant',
    name: 'Centinela Ápice',
    subTitle: 'Sobrecarga de Productividad',
    hunterClass: 'Disciplina',
    minRank: 'C-RANK',
    description: 'Velocidad de ejecución máxima con bio-circuitos avanzados de aceleración cognitiva.',
    primaryColor: '#a855f7',
    accentColor: '#c084fc',
    badge: 'ÁPICE',
  },
  {
    id: 'cha-assassin',
    name: 'Sincronía Áurea',
    subTitle: 'Precisión y Enfoque Quirúrgico',
    hunterClass: 'Enfoque',
    minRank: 'D-RANK',
    description: 'Claridad mental absoluta y ejecución limpia de objetivos diarios con mínimo desgaste energético.',
    primaryColor: '#eab308',
    accentColor: '#fef08a',
    badge: 'PRECISIÓN',
  },
  {
    id: 'choi-pyro',
    name: 'Ignición Cuántica',
    subTitle: 'Impulso y Cadencia Vital',
    hunterClass: 'Estratega',
    minRank: 'C-RANK',
    description: 'Energía sostenida de alta intensidad para completar bloques de trabajo exigentes.',
    primaryColor: '#f97316',
    accentColor: '#ef4444',
    badge: 'IGNICIÓN',
  },
  {
    id: 'beast-monarch',
    name: 'Protocolo Furia',
    subTitle: 'Resistencia Biométrica Extrema',
    hunterClass: 'Resistencia',
    minRank: 'B-RANK',
    description: 'Rendimiento fisiológico superior diseñado para superar límites de esfuerzo y constancia.',
    primaryColor: '#f59e0b',
    accentColor: '#78716c',
    badge: 'BIOMÉTRICO',
  },
  {
    id: 'frost-monarch',
    name: 'Cero Absoluto',
    subTitle: 'Calma y Control Térmico',
    hunterClass: 'Enfoque',
    minRank: 'A-RANK',
    description: 'Temperatura emocional estable para mantener la compostura frente a situaciones de alta tensión.',
    primaryColor: '#06b6d4',
    accentColor: '#38bdf8',
    badge: 'CALMA',
  },
  {
    id: 'kaisel-dragon',
    name: 'Vuelo Cuántico',
    subTitle: 'Navegador Espacial',
    hunterClass: 'Estratega',
    minRank: 'B-RANK',
    description: 'Visión estratégica de largo alcance para planificar metas semanales y proyectos maestros.',
    primaryColor: '#6366f1',
    accentColor: '#4338ca',
    badge: 'ESTRATEGIA',
  },
  {
    id: 'void-necromancer',
    name: 'Núcleo del Vacío',
    subTitle: 'Aislamiento de Distracciones',
    hunterClass: 'Disciplina',
    minRank: 'A-RANK',
    description: 'Cráneo espectral con capucha azabache y fuego fatuo en las cuencas de los ojos.',
    primaryColor: '#3b82f6',
    accentColor: '#1d4ed8',
    badge: 'ESPECTRO',
  },
  {
    id: 'awakened-novice',
    name: 'Iniciado de Enfoque',
    subTitle: 'Primer Nivel de Calibración',
    hunterClass: 'Operador',
    minRank: 'E-RANK',
    description: 'El punto de partida. Voluntad inquebrantable para crear disciplina paso a paso.',
    primaryColor: '#64748b',
    accentColor: '#38bdf8',
    badge: 'ORIGEN',
  },
  {
    id: 'light-healer',
    name: 'Protocolo de Recuperación',
    subTitle: 'Restauración y Descanso Óptimo',
    hunterClass: 'Sincronía',
    minRank: 'B-RANK',
    description: 'Balance circadiano, regeneración mental y pausas estratégicas de alto rendimiento.',
    primaryColor: '#22c55e',
    accentColor: '#86efac',
    badge: 'BALANCE',
  },
  {
    id: 'tank-iron',
    name: 'Fortaleza Blindada',
    subTitle: 'Barrera Anti-Distracciones',
    hunterClass: 'Resistencia',
    minRank: 'D-RANK',
    description: 'Escudo inquebrantable frente a la procrastinación y los impulsos reactivos.',
    primaryColor: '#64748b',
    accentColor: '#475569',
    badge: 'DEFENSA',
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
