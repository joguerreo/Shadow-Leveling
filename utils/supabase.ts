import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { 
  Player, 
  Quest, 
  Dungeon, 
  ShadowExpedition, 
  HunterSkill, 
  HunterAchievement, 
  WorldBoss, 
  HunterSaga 
} from '../types';
import { calculateCombatPower } from './calculator';

// Supabase Environment Setup
// Safe environment access in Vite/Client
function cleanSupabaseUrl(url: string | undefined): string {
  if (!url) return '';
  let clean = url.trim().replace(/^["']|["']$/g, '');
  // Strip trailing slashes, /rest/v1, /rest, /auth/v1, or /v1 accidentally pasted
  clean = clean.replace(/\/(rest|auth|graphql)(\/v\d+)?\/?$/i, '');
  clean = clean.replace(/\/+$/, '');
  return clean;
}

function cleanSupabaseKey(key: string | undefined): string {
  if (!key) return '';
  return key.trim().replace(/^["']|["']$/g, '');
}

const rawSupabaseUrl: string = ((import.meta as any).env?.VITE_SUPABASE_URL || '') as string;
const rawSupabaseAnonKey: string = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '') as string;

export const supabaseUrl = cleanSupabaseUrl(rawSupabaseUrl);
export const supabaseAnonKey = cleanSupabaseKey(rawSupabaseAnonKey);

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key') &&
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))
);

// Graceful client fallback: will be null if credentials aren't inserted yet
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

function formatAuthError(err: any): string {
  const msg = err?.message || String(err || '');
  if (msg.toLowerCase().includes('invalid path specified in request url')) {
    return 'URL de Supabase mal configurada. Asegúrate de que VITE_SUPABASE_URL sea solo "https://tu-proyecto.supabase.co" sin "/rest/v1" ni barras adicionales.';
  }
  if (msg.toLowerCase().includes('user already registered')) {
    return 'Este correo ya está registrado. Intenta iniciar sesión con tu contraseña.';
  }
  if (msg.toLowerCase().includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos. Verifica tus datos de cazador.';
  }
  return msg || 'Error de autenticación';
}

// User session listener
export function onHunterAuthStateChange(callback: (user: User | null) => void) {
  if (!supabase) {
    callback(null);
    return () => {};
  }

  supabase.auth.getUser().then(({ data }) => {
    callback(data.user || null);
  }).catch(() => {
    callback(null);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });

  return () => {
    subscription.unsubscribe();
  };
}

// Sign in with Email and Password
export async function signInWithEmail(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  if (!supabase) {
    return { 
      user: null, 
      error: 'Supabase no está conectado todavía. Puedes utilizar el Modo Offline o verificar tus variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.' 
    };
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim(), 
      password 
    });
    if (error) return { user: null, error: formatAuthError(error) };
    return { user: data.user, error: null };
  } catch (err: any) {
    return { user: null, error: formatAuthError(err) };
  }
}

// Sign up with Email and Password
export async function signUpWithEmail(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  if (!supabase) {
    return { 
      user: null, 
      error: 'Supabase no está conectado todavía. Puedes utilizar el Modo Offline o verificar tus variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.' 
    };
  }
  try {
    const { data, error } = await supabase.auth.signUp({ 
      email: email.trim(), 
      password 
    });
    if (error) return { user: null, error: formatAuthError(error) };
    return { user: data.user, error: null };
  } catch (err: any) {
    return { user: null, error: formatAuthError(err) };
  }
}

// Sign out
export async function signOutHunter(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

// ==========================================
// Database Synchronization with Supabase
// ==========================================

export interface ExtraGameModules {
  skills?: HunterSkill[];
  dungeons?: Dungeon[];
  expeditions?: ShadowExpedition[];
  achievements?: HunterAchievement[];
  bosses?: WorldBoss[];
  sagas?: HunterSaga[];
}

export interface LoadedHunterData {
  player: Partial<Player>;
  skills?: HunterSkill[];
  dungeons?: Dungeon[];
  expeditions?: ShadowExpedition[];
  achievements?: HunterAchievement[];
  bosses?: WorldBoss[];
  sagas?: HunterSaga[];
}

export async function syncHunterProfile(
  userId: string, 
  player: Player,
  extraModules?: ExtraGameModules
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const cp = calculateCombatPower(player);

    const fullPayload: any = {
      id: userId,
      name: player.name,
      rank: player.rank,
      title: player.title,
      level: player.level,
      xp: player.xp,
      max_xp: player.maxXp,
      gold: player.gold,
      essence_stones: player.essenceStones,
      stat_points: player.statPoints,
      mp: player.mp || 100,
      max_mp: player.maxMp || 100,
      combat_power: cp,
      streak_days: player.streakDays,
      avatar_id: player.avatarId,
      avatar_frame: player.avatarFrame,
      hunter_class: player.hunterClass || 'Monarca',
      last_active_date: player.lastActiveDate || new Date().toISOString().split('T')[0],
      sound_enabled: player.soundEnabled ?? true,
      attributes: player.attributes,
      inventory: player.inventory || [],
      equipped: player.equipped || {},
      titles_unlocked: player.titlesUnlocked || ['The Weakest Hunter'],
      equipped_title: player.equippedTitle || player.title || 'The Weakest Hunter',
      shadow_army: player.shadowArmy || [],
      activity_history: player.activityHistory || [],
      skills: extraModules?.skills || player.skills || [],
      dungeons: extraModules?.dungeons || [],
      expeditions: extraModules?.expeditions || [],
      achievements: extraModules?.achievements || player.achievements || [],
      bosses: extraModules?.bosses || [],
      sagas: extraModules?.sagas || [],
      latest_audit: player.latestAudit || null,
      game_data: {
        inventory: player.inventory || [],
        equipped: player.equipped || {},
        titlesUnlocked: player.titlesUnlocked || ['The Weakest Hunter'],
        equippedTitle: player.equippedTitle || player.title || 'The Weakest Hunter',
        hunterClass: player.hunterClass || 'Monarca',
        shadowArmy: player.shadowArmy || [],
        activityHistory: player.activityHistory || [],
        skills: extraModules?.skills || player.skills || [],
        dungeons: extraModules?.dungeons || [],
        expeditions: extraModules?.expeditions || [],
        achievements: extraModules?.achievements || player.achievements || [],
        bosses: extraModules?.bosses || [],
        sagas: extraModules?.sagas || [],
        latestAudit: player.latestAudit || null,
      },
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('hunters').upsert(fullPayload);

    if (error) {
      console.warn('Supabase extended upsert warning, retrying with core columns:', error.message);
      // Resilient fallback if table has not run the latest migration yet
      const fallbackPayload: any = {
        id: userId,
        name: player.name,
        rank: player.rank,
        title: player.title,
        level: player.level,
        xp: player.xp,
        max_xp: player.maxXp,
        gold: player.gold,
        essence_stones: player.essenceStones,
        stat_points: player.statPoints,
        mp: player.mp || 100,
        max_mp: player.maxMp || 100,
        combat_power: cp,
        streak_days: player.streakDays,
        avatar_id: player.avatarId,
        avatar_frame: player.avatarFrame,
        attributes: player.attributes,
        updated_at: new Date().toISOString(),
      };
      const { error: fallbackError } = await supabase.from('hunters').upsert(fallbackPayload);
      if (fallbackError) {
        console.error('Fallback sync failed:', fallbackError);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error('Failed to sync profile to Supabase', err);
    return false;
  }
}

export async function loadHunterProfile(userId: string): Promise<LoadedHunterData | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('hunters')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;

    const gData = data.game_data || {};

    const player: Partial<Player> = {
      name: data.name,
      rank: data.rank,
      title: data.title,
      level: Number(data.level) || 1,
      xp: Number(data.xp) || 0,
      maxXp: Number(data.max_xp) || 1000,
      gold: Number(data.gold) || 0,
      essenceStones: Number(data.essence_stones) || 0,
      statPoints: Number(data.stat_points) || 0,
      mp: Number(data.mp) || 100,
      maxMp: Number(data.max_mp) || 100,
      streakDays: Number(data.streak_days) || 1,
      avatarId: data.avatar_id || 'monarch-shadow',
      avatarFrame: data.avatar_frame || 'frame-e',
      attributes: data.attributes || undefined,
      hunterClass: data.hunter_class || gData.hunterClass || 'Monarca',
      lastActiveDate: data.last_active_date || gData.lastActiveDate || undefined,
      soundEnabled: data.sound_enabled ?? gData.soundEnabled ?? true,
      inventory: data.inventory || gData.inventory || undefined,
      equipped: data.equipped || gData.equipped || undefined,
      titlesUnlocked: data.titles_unlocked || gData.titlesUnlocked || undefined,
      equippedTitle: data.equipped_title || gData.equippedTitle || undefined,
      shadowArmy: data.shadow_army || gData.shadowArmy || undefined,
      activityHistory: data.activity_history || gData.activityHistory || undefined,
      latestAudit: data.latest_audit || gData.latestAudit || undefined,
    };

    return {
      player,
      skills: data.skills || gData.skills || undefined,
      dungeons: data.dungeons || gData.dungeons || undefined,
      expeditions: data.expeditions || gData.expeditions || undefined,
      achievements: data.achievements || gData.achievements || undefined,
      bosses: data.bosses || gData.bosses || undefined,
      sagas: data.sagas || gData.sagas || undefined,
    };
  } catch (err) {
    console.error('Failed to load profile from Supabase', err);
    return null;
  }
}

export async function syncQuestsToSupabase(userId: string, quests: Quest[]): Promise<boolean> {
  if (!supabase) return false;
  try {
    const questRecords = quests.map((q) => ({
      id: q.id,
      user_id: userId,
      title: q.title,
      description: q.description || '',
      category: q.category || 'habit',
      rank: q.rank || 'E',
      target_count: q.targetCount || 1,
      current_count: q.currentCount || 0,
      unit: q.unit || 'veces',
      attribute_reward: (q as any).attributeReward || 'STR',
      is_daily: Boolean(q.isDaily),
      completed: Boolean(q.completed),
      rewards: q.rewards || { xp: 100, gold: 50 },
      completed_at: q.completedAt || null,
      created_at: q.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('quests').upsert(questRecords);
    if (error) {
      console.warn('Supabase quests sync warning:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to sync quests to Supabase', err);
    return false;
  }
}

export async function deleteQuestFromSupabase(userId: string, questId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('quests')
      .delete()
      .eq('id', questId)
      .eq('user_id', userId);
    return !error;
  } catch (err) {
    console.error('Failed to delete quest from Supabase', err);
    return false;
  }
}

export async function loadQuestsFromSupabase(userId: string): Promise<Quest[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .eq('user_id', userId);

    if (error || !data || data.length === 0) return null;

    return data.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description || '',
      category: d.category || 'habit',
      rank: d.rank || 'E',
      targetCount: d.target_count || 1,
      currentCount: d.current_count || 0,
      unit: d.unit || 'veces',
      attributeReward: d.attribute_reward || 'STR',
      isDaily: Boolean(d.is_daily),
      completed: Boolean(d.completed),
      rewards: d.rewards || { xp: 100, gold: 50 },
      completedAt: d.completed_at || undefined,
      createdAt: d.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Failed to load quests from Supabase', err);
    return null;
  }
}

export async function syncCompleteGameState(
  userId: string,
  state: {
    player: Player;
    quests: Quest[];
    dungeons: Dungeon[];
    expeditions: ShadowExpedition[];
    skills: HunterSkill[];
    achievements: HunterAchievement[];
    bosses: WorldBoss[];
    sagas: HunterSaga[];
  }
): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return { success: false, message: 'Supabase no está configurado.' };
  }
  try {
    const profileSaved = await syncHunterProfile(userId, state.player, {
      skills: state.skills,
      dungeons: state.dungeons,
      expeditions: state.expeditions,
      achievements: state.achievements,
      bosses: state.bosses,
      sagas: state.sagas,
    });
    const questsSaved = await syncQuestsToSupabase(userId, state.quests);

    if (profileSaved && questsSaved) {
      return { success: true, message: 'El 100% de los elementos del Sistema han sido sincronizados con la Base de Datos.' };
    } else if (profileSaved) {
      return { success: true, message: 'Perfil, equipo e inventario sincronizados en Supabase.' };
    } else {
      return { success: false, message: 'No se pudo completar la sincronización en Supabase.' };
    }
  } catch (err: any) {
    return { success: false, message: err.message || 'Error de conexión con Supabase.' };
  }
}


