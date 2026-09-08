-- ==============================================================================
-- SISTEMA: SHADOW LEVELING - ESQUEMA DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Copia y pega este script en el SQL Editor de tu proyecto en https://supabase.com
-- para crear o actualizar las tablas con persistencia completa del 100% de los elementos
-- del juego con Row Level Security (RLS).

-- 1. TABLA: HUNTERS (Perfil del Cazador, Atributos, Inventario, Equipamiento y Sistemas)
CREATE TABLE IF NOT EXISTS public.hunters (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Sung Jin-Woo',
  rank TEXT NOT NULL DEFAULT 'E',
  title TEXT NOT NULL DEFAULT 'El Cazador Más Débil',
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  max_xp INTEGER NOT NULL DEFAULT 1000,
  gold INTEGER NOT NULL DEFAULT 100,
  essence_stones INTEGER NOT NULL DEFAULT 0,
  stat_points INTEGER NOT NULL DEFAULT 0,
  mp INTEGER NOT NULL DEFAULT 100,
  max_mp INTEGER NOT NULL DEFAULT 100,
  combat_power INTEGER NOT NULL DEFAULT 350,
  streak_days INTEGER NOT NULL DEFAULT 1,
  avatar_id TEXT DEFAULT 'monarch-shadow',
  avatar_frame TEXT DEFAULT 'frame-e',
  hunter_class TEXT DEFAULT 'Monarca',
  last_active_date TEXT,
  sound_enabled BOOLEAN DEFAULT true,
  attributes JSONB DEFAULT '{"str": {"name": "Fuerza", "code": "STR", "value": 10}, "int": {"name": "Inteligencia", "code": "INT", "value": 10}, "vit": {"name": "Vitalidad", "code": "VIT", "value": 10}, "agi": {"name": "Agilidad", "code": "AGI", "value": 10}, "wis": {"name": "Sabiduría", "code": "WIS", "value": 10}, "cha": {"name": "Carisma", "code": "CHA", "value": 10}}'::jsonb,
  inventory JSONB DEFAULT '[]'::jsonb,
  equipped JSONB DEFAULT '{"head": null, "chest": null, "pants": null, "feet": null, "gloves": null, "weapon": null, "accessory": null}'::jsonb,
  titles_unlocked JSONB DEFAULT '["The Weakest Hunter"]'::jsonb,
  equipped_title TEXT DEFAULT 'The Weakest Hunter',
  skills JSONB DEFAULT '[]'::jsonb,
  dungeons JSONB DEFAULT '[]'::jsonb,
  shadow_army JSONB DEFAULT '[]'::jsonb,
  expeditions JSONB DEFAULT '[]'::jsonb,
  activity_history JSONB DEFAULT '[]'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  bosses JSONB DEFAULT '[]'::jsonb,
  sagas JSONB DEFAULT '[]'::jsonb,
  latest_audit JSONB,
  game_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MIGRACIÓN SEGURA: Añadir columnas si la tabla 'hunters' ya existía previamente
ALTER TABLE public.hunters ADD COLUMN IF NOT EXISTS inventory JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hunters ADD COLUMN IF NOT EXISTS equipped JSONB DEFAULT '{"head": null, "chest": null, "pants": null, "feet": null, "gloves": null, "weapon": null, "accessory": null}'::jsonb;
ALTER TABLE public.hunters ADD COLUMN IF NOT EXISTS titles_unlocked JSONB DEFAULT '["The Weakest Hunter"]'::jsonb;
ALTER TABLE public.hunters ADD COLUMN IF NOT EXISTS equipped_title TEXT DEFAULT 'The Weakest Hunter';
ALTER TABLE public.hunters ADD COLUMN IF NOT EXISTS hunter_class TEXT DEFAULT 'Monarca';
ALTER TABLE public.hunters ADD COLUMN IF NOT EXISTS last_active_date TEXT;
ALTER TABLE public.hunters ADD COLUMN IF NOT EXISTS sound_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.hunters ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hunters ADD COLUMN IF NOT EXISTS dungeons JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hunters ADD COLUMN IF NOT EXISTS shadow_army JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hunters ADD COLUMN IF NOT EXISTS expeditions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hunters ADD COLUMN IF NOT EXISTS activity_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hunters ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hunters ADD COLUMN IF NOT EXISTS bosses JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hunters ADD COLUMN IF NOT EXISTS sagas JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.hunters ADD COLUMN IF NOT EXISTS latest_audit JSONB;
ALTER TABLE public.hunters ADD COLUMN IF NOT EXISTS game_data JSONB DEFAULT '{}'::jsonb;

-- Habilitar RLS en hunters
ALTER TABLE public.hunters ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'hunters' AND policyname = 'Los cazadores pueden ver su propio perfil') THEN
    CREATE POLICY "Los cazadores pueden ver su propio perfil" ON public.hunters FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'hunters' AND policyname = 'Los cazadores pueden insertar o modificar su propio perfil') THEN
    CREATE POLICY "Los cazadores pueden insertar o modificar su propio perfil" ON public.hunters FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
END $$;


-- 2. TABLA: QUESTS (Misiones Diarias, Hábitos y Desafíos de Cazador)
CREATE TABLE IF NOT EXISTS public.quests (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'habit',
  rank TEXT DEFAULT 'E',
  target_count INTEGER DEFAULT 1,
  current_count INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'veces',
  attribute_reward TEXT DEFAULT 'STR',
  is_daily BOOLEAN DEFAULT TRUE,
  completed BOOLEAN DEFAULT FALSE,
  rewards JSONB DEFAULT '{"xp": 100, "gold": 50, "essence": 1}'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, user_id)
);

-- MIGRACIÓN SEGURA PARA QUESTS
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS rank TEXT DEFAULT 'E';
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS attribute_reward TEXT DEFAULT 'STR';
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Habilitar RLS en quests
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quests' AND policyname = 'Los cazadores pueden ver sus propias misiones') THEN
    CREATE POLICY "Los cazadores pueden ver sus propias misiones" ON public.quests FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quests' AND policyname = 'Los cazadores pueden insertar o modificar sus misiones') THEN
    CREATE POLICY "Los cazadores pueden insertar o modificar sus misiones" ON public.quests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- 3. TRIGGER AUTOMÁTICO AL CREAR USUARIO EN AUTH
CREATE OR REPLACE FUNCTION public.handle_new_hunter()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.hunters (id, name, rank, title)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Sung Jin-Woo'),
    'E',
    'El Cazador Más Débil'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_hunter();

