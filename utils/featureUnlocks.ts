export interface FeatureUnlockRule {
  id: string;
  page: 'dashboard' | 'dungeons' | 'inventory' | 'shop' | 'shadows' | 'skills' | 'bosses' | 'analytics';
  name: string;
  minLevel: number;
  icon: string;
  category: string;
  description: string;
}

export const FEATURE_UNLOCKS: FeatureUnlockRule[] = [
  {
    id: 'dashboard',
    page: 'dashboard',
    name: 'Estado & Misiones',
    minLevel: 1,
    icon: 'person',
    category: 'Básico',
    description: 'Acceso inmediato a misiones diarias, atributos y pactos prohibidos.',
  },
  {
    id: 'inventory',
    page: 'inventory',
    name: 'Mochila & Inventario',
    minLevel: 1,
    icon: 'inventory_2',
    category: 'Básico',
    description: 'Gestión de equipamiento, reliquias y títulos adquiridos.',
  },
  {
    id: 'analytics',
    page: 'analytics',
    name: 'Auditoría & Analítica',
    minLevel: 1,
    icon: 'insights',
    category: 'Básico',
    description: 'Registro de consistencia, estadísticas históricas y gráficos de progreso.',
  },
  {
    id: 'shop',
    page: 'shop',
    name: 'Tienda & Premios Reales',
    minLevel: 3,
    icon: 'storefront',
    category: 'Recompensas',
    description: 'Canjea tu oro por artefactos del juego o por recompensas tangibles de la vida real.',
  },
  {
    id: 'dungeons',
    page: 'dungeons',
    name: 'Mazmorras de Concentración',
    minLevel: 5,
    icon: 'hourglass_top',
    category: 'Desafíos',
    description: 'Incursiones de enfoque Pomodoro y mazmorras personalizadas con botín garantizado.',
  },
  {
    id: 'skills',
    page: 'skills',
    name: 'Árbol de Habilidades Rúnicas',
    minLevel: 7,
    icon: 'psychology',
    category: 'Poder',
    description: 'Asimila runas mágicas y habilidades pasivas invirtiendo Piedras de Esencia.',
  },
  {
    id: 'shadows',
    page: 'shadows',
    name: 'Ejército de Sombras (ARISE)',
    minLevel: 10,
    icon: 'groups',
    category: 'Monarca',
    description: 'Extrae sombras de tus misiones completadas y envíalas a expediciones automáticas.',
  },
  {
    id: 'bosses',
    page: 'bosses',
    name: 'Jefes Mundiales de Calamidad',
    minLevel: 15,
    icon: 'swords',
    category: 'Raids',
    description: 'Batallas a escala épica contra calamidades del Sistema con recompensas legendarias.',
  },
];

export function isFeatureUnlocked(page: string, playerLevel: number): boolean {
  const rule = FEATURE_UNLOCKS.find((f) => f.page === page);
  if (!rule) return true;
  return playerLevel >= rule.minLevel;
}

export function getFeatureUnlockRule(page: string): FeatureUnlockRule | undefined {
  return FEATURE_UNLOCKS.find((f) => f.page === page);
}
