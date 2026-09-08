-- ==============================================================================
-- SISTEMA: SHADOW LEVELING - ESQUEMA DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Copia y pega este script en el SQL Editor de tu proyecto en https://supabase.com
-- para crear las tablas con Row Level Security (RLS) que protegen los datos de cada cazador.

-- 1. TABLA: HUNTERS (Perfil del Jugador y Atributos)
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
  attributes JSONB DEFAULT '{"strength": 10, "agility": 10, "intelligence": 10, "vitality": 10, "perception": 10}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS en hunters
ALTER TABLE public.hunters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los cazadores pueden ver su propio perfil" 
ON public.hunters FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Los cazadores pueden insertar o modificar su propio perfil" 
ON public.hunters FOR ALL 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);


-- 2. TABLA: QUESTS (Misiones Diarias y Hábitos)
CREATE TABLE IF NOT EXISTS public.quests (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'habit',
  target_count INTEGER DEFAULT 1,
  current_count INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'veces',
  attribute_reward TEXT DEFAULT 'STR',
  is_daily BOOLEAN DEFAULT TRUE,
  completed BOOLEAN DEFAULT FALSE,
  rewards JSONB DEFAULT '{"xp": 100, "gold": 50, "essence": 1}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, user_id)
);

-- Habilitar RLS en quests
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los cazadores pueden ver sus propias misiones" 
ON public.quests FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Los cazadores pueden insertar o modificar sus misiones" 
ON public.quests FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);


-- 3. TRIGGER AUTOMÁTICO AL CREAR USUARIO EN AUTH
-- Crea automáticamente el perfil inicial del cazador cuando alguien se registra
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
