import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Player, Quest } from '../types';
import { calculateCombatPower } from './calculator';

// Supabase Environment Setup
// Safe environment access in Vite/Client
const supabaseUrl: string = ((import.meta as any).env?.VITE_SUPABASE_URL || '') as string;
const supabaseAnonKey: string = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '') as string;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
);

// Graceful client fallback: will be null if credentials aren't inserted yet
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// User session listener
export function onHunterAuthStateChange(callback: (user: User | null) => void) {
  if (!supabase) {
    callback(null);
    return () => {};
  }

  supabase.auth.getUser().then(({ data }) => {
    callback(data.user || null);
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
  if (!supabase) return { user: null, error: 'Supabase no está configurado aún. Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Vercel.' };
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: error.message };
    return { user: data.user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Error al iniciar sesión' };
  }
}

// Sign up with Email and Password
export async function signUpWithEmail(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  if (!supabase) return { user: null, error: 'Supabase no está configurado aún. Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Vercel.' };
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { user: null, error: error.message };
    return { user: data.user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Error al registrar cazador' };
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

export async function syncHunterProfile(userId: string, player: Player): Promise<boolean> {
  if (!supabase) return false;
  try {
    const cp = calculateCombatPower(player);
    const { error } = await supabase
      .from('hunters')
      .upsert({
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
        mp: player.mp,
        max_mp: player.maxMp,
        combat_power: cp,
        streak_days: player.streakDays,
        avatar_id: player.avatarId,
        avatar_frame: player.avatarFrame,
        attributes: player.attributes,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('Supabase hunter sync error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to sync profile to Supabase', err);
    return false;
  }
}

export async function loadHunterProfile(userId: string): Promise<Partial<Player> | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('hunters')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      name: data.name,
      rank: data.rank,
      title: data.title,
      level: Number(data.level),
      xp: Number(data.xp),
      maxXp: Number(data.max_xp),
      gold: Number(data.gold),
      essenceStones: Number(data.essence_stones),
      statPoints: Number(data.stat_points),
      mp: Number(data.mp),
      maxMp: Number(data.max_mp),
      streakDays: Number(data.streak_days),
      avatarId: data.avatar_id,
      avatarFrame: data.avatar_frame,
      attributes: data.attributes || undefined,
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
      is_daily: Boolean(q.isDaily),
      completed: Boolean(q.completed),
      rewards: q.rewards,
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
      isDaily: Boolean(d.is_daily),
      completed: Boolean(d.completed),
      rewards: d.rewards || { xp: 100, gold: 50 },
      createdAt: d.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Failed to load quests from Supabase', err);
    return null;
  }
}

