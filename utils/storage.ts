import { Player, Quest, Dungeon, SystemLog, ShadowExpedition, HunterSkill, HunterAchievement, WorldBoss, HunterSaga } from '../types';
import {
  INITIAL_PLAYER,
  INITIAL_QUESTS,
  INITIAL_DUNGEONS,
  INITIAL_SHADOW_EXPEDITIONS,
  INITIAL_SHADOW_ARMY,
  INITIAL_ACTIVITY_HISTORY,
  INITIAL_SKILLS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_WORLD_BOSSES,
  INITIAL_SAGAS,
} from '../constants';

const STORAGE_KEYS = {
  PLAYER: 'shadow_system_player_v2',
  QUESTS: 'shadow_system_quests_v2',
  DUNGEONS: 'shadow_system_dungeons_v2',
  AWAKENED: 'shadow_system_awakened_v2',
  LOGS: 'shadow_system_logs_v2',
  EXPEDITIONS: 'shadow_system_expeditions_v2',
  SKILLS: 'shadow_system_skills_v2',
  ACHIEVEMENTS: 'shadow_system_achievements_v2',
  BOSSES: 'shadow_system_bosses_v2',
  SAGAS: 'shadow_system_sagas_v2',
};

export function loadStoredPlayer(): Player {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYER);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all schema fields exist
      return {
        ...INITIAL_PLAYER,
        ...parsed,
        equipped: {
          ...INITIAL_PLAYER.equipped,
          ...(parsed.equipped || {})
        },
        attributes: {
          ...INITIAL_PLAYER.attributes,
          ...(parsed.attributes || {})
        },
        shadowArmy: parsed.shadowArmy && parsed.shadowArmy.length > 0 ? parsed.shadowArmy : INITIAL_SHADOW_ARMY,
        activityHistory: parsed.activityHistory && parsed.activityHistory.length > 0 ? parsed.activityHistory : INITIAL_ACTIVITY_HISTORY,
        titlesUnlocked: parsed.titlesUnlocked && parsed.titlesUnlocked.length > 0 ? parsed.titlesUnlocked : INITIAL_PLAYER.titlesUnlocked,
      };
    }
  } catch (e) {
    console.error('Failed to load player from localStorage', e);
  }
  return {
    ...INITIAL_PLAYER,
    shadowArmy: INITIAL_SHADOW_ARMY,
    activityHistory: INITIAL_ACTIVITY_HISTORY,
  };
}

export function saveStoredPlayer(player: Player): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(player));
  } catch (e) {
    console.error('Failed to save player', e);
  }
}

export function loadStoredSkills(): HunterSkill[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SKILLS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load skills', e);
  }
  return INITIAL_SKILLS;
}

export function saveStoredSkills(skills: HunterSkill[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
  } catch (e) {
    console.error('Failed to save skills', e);
  }
}

export function loadStoredAchievements(): HunterAchievement[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load achievements', e);
  }
  return INITIAL_ACHIEVEMENTS;
}

export function saveStoredAchievements(achievements: HunterAchievement[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (e) {
    console.error('Failed to save achievements', e);
  }
}

export function loadStoredWorldBosses(): WorldBoss[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.BOSSES);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load bosses', e);
  }
  return INITIAL_WORLD_BOSSES;
}

export function saveStoredWorldBosses(bosses: WorldBoss[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BOSSES, JSON.stringify(bosses));
  } catch (e) {
    console.error('Failed to save bosses', e);
  }
}

export function loadStoredExpeditions(): ShadowExpedition[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPEDITIONS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load expeditions', e);
  }
  return INITIAL_SHADOW_EXPEDITIONS;
}

export function saveStoredExpeditions(expeditions: ShadowExpedition[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPEDITIONS, JSON.stringify(expeditions));
  } catch (e) {
    console.error('Failed to save expeditions', e);
  }
}

export function loadStoredSagas(): HunterSaga[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SAGAS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load sagas', e);
  }
  return INITIAL_SAGAS;
}

export function saveStoredSagas(sagas: HunterSaga[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SAGAS, JSON.stringify(sagas));
  } catch (e) {
    console.error('Failed to save sagas', e);
  }
}

export function exportBackupJSON(
  player: Player,
  quests: Quest[],
  dungeons: Dungeon[],
  expeditions: ShadowExpedition[],
  skills: HunterSkill[],
  achievements: HunterAchievement[],
  bosses: WorldBoss[],
  logs: SystemLog[]
) {
  const backupData = {
    version: '2.5',
    exportDate: new Date().toISOString(),
    player,
    quests,
    dungeons,
    expeditions,
    skills,
    achievements,
    bosses,
    logs,
  };
  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shadow_leveling_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackupJSON(
  jsonString: string,
  onSuccess: (data: {
    player: Player;
    quests: Quest[];
    dungeons: Dungeon[];
    expeditions: ShadowExpedition[];
    skills: HunterSkill[];
    achievements: HunterAchievement[];
    bosses: WorldBoss[];
    logs: SystemLog[];
  }) => void,
  onError: (err: string) => void
) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.player || !parsed.quests) {
      throw new Error('Formato de copia de seguridad no válido.');
    }
    saveStoredPlayer(parsed.player);
    saveStoredQuests(parsed.quests);
    if (parsed.dungeons) saveStoredDungeons(parsed.dungeons);
    if (parsed.expeditions) saveStoredExpeditions(parsed.expeditions);
    if (parsed.skills) saveStoredSkills(parsed.skills);
    if (parsed.achievements) saveStoredAchievements(parsed.achievements);
    if (parsed.bosses) saveStoredWorldBosses(parsed.bosses);
    if (parsed.logs) saveSystemLogs(parsed.logs);
    saveIsAwakened(true);

    onSuccess({
      player: parsed.player,
      quests: parsed.quests,
      dungeons: parsed.dungeons || INITIAL_DUNGEONS,
      expeditions: parsed.expeditions || INITIAL_SHADOW_EXPEDITIONS,
      skills: parsed.skills || INITIAL_SKILLS,
      achievements: parsed.achievements || INITIAL_ACHIEVEMENTS,
      bosses: parsed.bosses || INITIAL_WORLD_BOSSES,
      logs: parsed.logs || [],
    });
  } catch (e: any) {
    onError(e.message || 'Error al procesar el archivo JSON.');
  }
}

export function loadStoredQuests(): Quest[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.QUESTS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load quests', e);
  }
  return INITIAL_QUESTS;
}

export function saveStoredQuests(quests: Quest[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
  } catch (e) {
    console.error('Failed to save quests', e);
  }
}

export function loadStoredDungeons(): Dungeon[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DUNGEONS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load dungeons', e);
  }
  return INITIAL_DUNGEONS;
}

export function saveStoredDungeons(dungeons: Dungeon[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DUNGEONS, JSON.stringify(dungeons));
  } catch (e) {
    console.error('Failed to save dungeons', e);
  }
}

export function loadIsAwakened(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.AWAKENED);
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load awakened state', e);
  }
  return false;
}

export function saveIsAwakened(awakened: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AWAKENED, JSON.stringify(awakened));
  } catch (e) {
    console.error('Failed to save awakened state', e);
  }
}

export function loadSystemLogs(): SystemLog[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load logs', e);
  }
  return [
    {
      id: 'log_1',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: 'Sistema inicializado. Cazador sincronizado con la matriz del Monarca.',
      type: 'stat'
    }
  ];
}

export function saveSystemLogs(logs: SystemLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save logs', e);
  }
}

export function checkDailyReset(
  player: Player,
  quests: Quest[],
  onReset: (updatedPlayer: Player, updatedQuests: Quest[]) => void
) {
  const todayStr = new Date().toISOString().split('T')[0];
  if (player.lastActiveDate !== todayStr) {
    // A new day has begun!
    const allDailiesCompleted = quests
      .filter((q) => q.isDaily)
      .every((q) => q.completed);

    const prevDate = new Date(player.lastActiveDate);
    const currDate = new Date(todayStr);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));

    let newStreak = player.streakDays;
    if (allDailiesCompleted && diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }

    // Reset daily quests
    const resetQuests = quests.map((q) => {
      if (q.isDaily) {
        return {
          ...q,
          completed: false,
          currentCount: 0,
        };
      }
      return q;
    });

    const updatedPlayer: Player = {
      ...player,
      streakDays: newStreak,
      lastActiveDate: todayStr,
    };

    saveStoredPlayer(updatedPlayer);
    saveStoredQuests(resetQuests);
    onReset(updatedPlayer, resetQuests);
  }
}
