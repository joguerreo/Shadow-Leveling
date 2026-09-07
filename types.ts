export enum Rank {
  E = 'E-RANK',
  D = 'D-RANK',
  C = 'C-RANK',
  B = 'B-RANK',
  A = 'A-RANK',
  S = 'S-RANK',
  NATIONAL = 'NATIONAL-RANK',
}

export type QuestCategory = 'fitness' | 'intellect' | 'discipline' | 'habit' | 'mindfulness' | 'special';

export type ItemRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export type ItemSlot = 'head' | 'chest' | 'pants' | 'feet' | 'gloves' | 'weapon' | 'accessory' | 'consumable';

export interface Attribute {
  name: string;
  code: string;
  value: number;
  icon: string;
  color: string;
  bonusText: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  rank: Rank;
  category: QuestCategory;
  rewards: {
    xp: number;
    gold: number;
    essenceStones?: number;
    statPoints?: number;
  };
  completed: boolean;
  isDaily: boolean;
  targetCount?: number;
  currentCount?: number;
  unit?: string;
  manaCost?: number;
  aiGenerated?: boolean;
  systemMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  slot: ItemSlot;
  icon: string;
  priceGold: number;
  priceEssence?: number;
  stats: {
    STR?: number;
    INT?: number;
    VIT?: number;
    AGI?: number;
    WIS?: number;
    CHA?: number;
  };
  effect?: string;
  consumableType?: 'xp' | 'gold' | 'stat_point' | 'essence';
  consumableValue?: number;
}

export interface EquippedItems {
  head: Item | null;
  chest: Item | null;
  pants: Item | null;
  feet: Item | null;
  gloves: Item | null;
  weapon: Item | null;
  accessory: Item | null;
}

export interface DungeonTask {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
}

export interface Dungeon {
  id: string;
  title: string;
  description: string;
  rank: Rank;
  icon: string;
  type: 'focus_timer' | 'fitness_raid' | 'study_trial';
  durationMinutes: number;
  tasks?: DungeonTask[];
  rewards: {
    xp: number;
    gold: number;
    essenceStones: number;
    itemDrop?: Item;
    titleUnlock?: string;
  };
  completed: boolean;
  lastCompletedAt?: string;
}

export interface ShopItem extends Item {
  stock?: number;
  featured?: boolean;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'level_up' | 'quest' | 'dungeon' | 'shop' | 'penalty' | 'stat' | 'system';
}

export interface PenaltyQuest {
  active: boolean;
  title: string;
  description: string;
  timeRemainingMinutes: number;
  requiredExercises: { name: string; count: number; completed: number }[];
  penaltyDescription: string;
}

export interface ShadowSoldier {
  id: string;
  name: string;
  title: string;
  rank: Rank;
  icon: string;
  level: number;
  combatPower: number;
  bonusDescription: string;
  unlocked: boolean;
  unlockCondition: string;
  expeditionId?: string | null;
}

export interface ShadowExpedition {
  id: string;
  title: string;
  gateRank: Rank;
  durationMinutes: number;
  assignedShadowId: string | null;
  startedAt: string | null;
  rewards: {
    xp: number;
    gold: number;
    essenceStones: number;
  };
  status: 'idle' | 'in_progress' | 'completed';
}

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  deepWorkMinutes: number;
  workoutReps: number;
  questsCompleted: number;
  xpEarned: number;
}

export interface HunterSkill {
  id: string;
  name: string;
  title: string;
  type: 'active' | 'passive' | 'buff';
  description: string;
  level: number;
  maxLevel: number;
  icon: string;
  effect: string;
  unlocked: boolean;
  unlockLevel: number;
  costEssence: number;
}

export interface HunterAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'combat' | 'habits' | 'dungeons' | 'shadows';
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  rewards: {
    xp: number;
    gold: number;
    essenceStones: number;
    titleReward?: string;
  };
}

export interface WorldBoss {
  id: string;
  name: string;
  title: string;
  rank: Rank;
  icon: string;
  maxHp: number;
  currentHp: number;
  level: number;
  damageLog: { hunter: string; damage: number; timestamp: string }[];
  rewards: {
    xp: number;
    gold: number;
    essenceStones: number;
    exclusiveItem?: Item;
    titleUnlock?: string;
  };
  defeated: boolean;
}

export interface HunterSagaMilestone {
  day: number;
  title: string;
  description: string;
  requirement: string;
  targetAmount: number;
  currentAmount: number;
  unit: string;
  completed: boolean;
  claimed: boolean;
  reward: {
    xp: number;
    gold: number;
    essenceStones: number;
    statPoints?: number;
    titleReward?: string;
    itemReward?: Item;
  };
}

export interface HunterSaga {
  id: string;
  title: string;
  codeName: string;
  subtitle: string;
  description: string;
  lore: string;
  rankRequirement: Rank;
  durationDays: number;
  currentDay: number;
  category: 'physical' | 'intellect' | 'discipline' | 'mastery';
  bannerColor: string;
  icon: string;
  active: boolean;
  completed: boolean;
  startedAt?: string;
  milestones: HunterSagaMilestone[];
  finalReward: {
    xp: number;
    gold: number;
    essenceStones: number;
    exclusiveTitle: string;
    exclusiveItem: Item;
  };
}

export interface WeeklyAuditReport {
  id: string;
  date: string;
  hunterRating: 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'E';
  consistencyScore: number; // 0 - 100
  dominantStat: string;
  laggingStat: string;
  completedQuestsCount: number;
  totalXpGained: number;
  aiDiagnosticTitle: string;
  aiAnalysis: string;
  aiRecommendations: string[];
  recommendedFocusCategory: QuestCategory;
  hunterAssociationSeal: string;
}

export interface MirrorShadow {
  id: string;
  name: string;
  title: string;
  level: number;
  combatPower: number;
  maxHp: number;
  currentHp: number;
  yesterdayScore: number;
  todayScore: number;
  streakToBeat: number;
  defeated: boolean;
  rewards: {
    xp: number;
    gold: number;
    essenceStones: number;
    statPoints: number;
  };
}

export interface Player {
  name: string;
  title: string;
  level: number;
  xp: number;
  maxXp: number;
  mp?: number;
  maxMp?: number;
  rank: Rank;
  gold: number;
  essenceStones: number;
  statPoints: number;
  skillPoints?: number;
  streakDays: number;
  lastActiveDate: string;
  soundEnabled: boolean;
  attributes: {
    str: Attribute;
    int: Attribute;
    vit: Attribute;
    agi: Attribute;
    wis: Attribute;
    cha: Attribute;
  };
  equipped: EquippedItems;
  inventory: Item[];
  titlesUnlocked: string[];
  shadowArmy?: ShadowSoldier[];
  activityHistory?: ActivityDay[];
  skills?: HunterSkill[];
  achievements?: HunterAchievement[];
  equippedTitle?: string;
  avatarId?: string;
  avatarFrame?: string;
  hunterClass?: string;
  activeSagas?: string[];
  sagasProgress?: Record<string, number>;
  latestAudit?: WeeklyAuditReport;
}
